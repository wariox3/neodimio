export function isSafeReturnUrl(url: string | null): boolean {
  if (!url) return false;
  if (!url.startsWith('/')) return false;
  if (url.startsWith('//')) return false;
  if (/[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) return false;
  return true;
}
