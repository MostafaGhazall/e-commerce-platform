const ALLOWED_PROTOCOLS = ["http:", "https:", "data:", "ipfs:", "ar:", "ftp:"] as const;

/**
 * Quick front-end check – returns true only if the URL is syntactically
 * valid *and* starts with one of the whitelisted protocols.
 */
export function isAllowedImageUrl(url: string): boolean {
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(url).protocol as typeof ALLOWED_PROTOCOLS[number]);
  } catch {
    return false;        // new URL() throws on garbage input
  }
}
