/**
 * Persist a sort choice for server-sorted pages. The controller reads this
 * cookie when the URL has no ?sort=, so the first render is already in the
 * viewer's order. Plain (unencrypted) cookie: see encryptCookies() in bootstrap/app.php.
 */
const rememberSort = (name, value) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
};

export default rememberSort;
