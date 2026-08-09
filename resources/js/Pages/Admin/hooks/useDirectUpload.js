import { useCallback, useRef, useState } from 'react';

const CONCURRENCY = 4;

const csrfToken = () =>
  decodeURIComponent(
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] ?? '',
  );

const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.message ?? `Request failed (${res.status})`);
  }

  return res.json();
};

/** Read intrinsic dimensions so the server never has to decode the image. */
const readDimensions = (file) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: null, height: null });
    };
    img.src = url;
  });

const putToS3 = (file, upload, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', upload.url, true);

    for (const [header, value] of Object.entries(upload.headers ?? {})) {
      xhr.setRequestHeader(header, value);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`S3 rejected the upload (${xhr.status})`));
    xhr.onerror = () =>
      reject(new Error('Network error. Check the bucket CORS rules.'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));

    xhr.send(file);
  });

/**
 * Uploads files straight from the browser to S3 with presigned URLs, then asks
 * the app to queue them into the media library. PHP never sees the bytes.
 *
 * Returns per-file progress keyed by file name.
 */
const useDirectUpload = ({ albumId, collection }) => {
  const [progress, setProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const cancelled = useRef(false);

  const setFileState = useCallback((name, patch) => {
    setProgress((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    setError(null);
  }, []);

  const upload = useCallback(
    async (files) => {
      if (files.length === 0) {
        return { uploaded: 0, failed: [] };
      }

      cancelled.current = false;
      setIsUploading(true);
      setError(null);
      setProgress(
        Object.fromEntries(
          files.map((file) => [file.name, { percent: 0, status: 'pending' }]),
        ),
      );

      try {
        const { uploads } = await postJson(
          `/admin/albums/${albumId}/uploads/sign`,
          {
            files: files.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
            })),
          },
        );

        const completed = [];
        const failed = [];
        const queue = files.map((file, index) => ({
          file,
          upload: uploads[index],
        }));

        // ponytail: hand-rolled promise pool. A dependency for 12 lines is not worth it.
        const worker = async () => {
          while (queue.length > 0 && !cancelled.current) {
            const { file, upload: signed } = queue.shift();

            setFileState(file.name, { status: 'uploading' });

            try {
              const [dimensions] = await Promise.all([
                readDimensions(file),
                putToS3(file, signed, (percent) =>
                  setFileState(file.name, { percent }),
                ),
              ]);

              completed.push({
                key: signed.key,
                name: file.name,
                width: dimensions.width,
                height: dimensions.height,
              });
              setFileState(file.name, { percent: 100, status: 'done' });
            } catch (e) {
              failed.push(file.name);
              setFileState(file.name, { status: 'failed', error: e.message });
            }
          }
        };

        await Promise.all(
          Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker),
        );

        if (completed.length > 0) {
          await postJson(`/admin/albums/${albumId}/uploads/complete`, {
            collection,
            files: completed,
          });
        }

        return { uploaded: completed.length, failed };
      } catch (e) {
        setError(e.message);
        return { uploaded: 0, failed: files.map((file) => file.name) };
      } finally {
        setIsUploading(false);
      }
    },
    [albumId, collection, setFileState],
  );

  const cancel = useCallback(() => {
    cancelled.current = true;
  }, []);

  return { upload, cancel, reset, progress, isUploading, error };
};

export default useDirectUpload;
