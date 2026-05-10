import exifr from 'exifr';

const getCsrfToken = () =>
  decodeURIComponent(
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] ?? '',
  );

const readImageDimensions = (file) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });

const readDateTaken = async (file) => {
  try {
    const exif = await exifr.parse(file, ['DateTimeOriginal']);
    const date = exif?.DateTimeOriginal;
    if (date instanceof Date) {
      return Math.floor(date.getTime() / 1000);
    }
  } catch {
    // exif may be missing or unreadable; treat as not present
  }
  return null;
};

const uploadOne = async (file, albumId, signal) => {
  const csrf = getCsrfToken();

  const [{ width, height }, dateTaken] = await Promise.all([
    readImageDimensions(file),
    readDateTaken(file),
  ]);

  const signRes = await fetch(`/admin/albums/${albumId}/previews/sign`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrf,
    },
    body: JSON.stringify({
      filename: file.name,
      mime_type: file.type,
      size: file.size,
    }),
  });

  if (!signRes.ok) {
    throw new Error(`Sign failed for ${file.name} (${signRes.status})`);
  }

  const { key, url, headers } = await signRes.json();

  const putRes = await fetch(url, {
    method: 'PUT',
    signal,
    headers,
    body: file,
  });

  if (!putRes.ok) {
    throw new Error(`S3 upload failed for ${file.name} (${putRes.status})`);
  }

  const registerRes = await fetch(
    `/admin/albums/${albumId}/previews/register`,
    {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrf,
      },
      body: JSON.stringify({
        key,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
        width,
        height,
        date_taken: dateTaken,
      }),
    },
  );

  if (!registerRes.ok) {
    throw new Error(`Register failed for ${file.name} (${registerRes.status})`);
  }
};

export const uploadPreviewsDirect = async (
  files,
  albumId,
  { concurrency = 5, onProgress, signal } = {},
) => {
  let completed = 0;
  const failures = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < files.length) {
      const index = cursor++;
      const file = files[index];
      try {
        await uploadOne(file, albumId, signal);
      } catch (error) {
        failures.push({ file: file.name, error: error.message });
      } finally {
        completed += 1;
        onProgress?.({
          completed,
          total: files.length,
          failures: failures.length,
        });
      }
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    () => worker(),
  );

  await Promise.all(workers);

  return { completed, total: files.length, failures };
};
