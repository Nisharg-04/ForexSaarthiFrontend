/**
 * Utility function to set Google Translate language directly via cookie
 * @param lang - Language code (e.g., 'hi', 'gu', 'ta', etc.)
 */
export function setLanguage(lang: string): void {
  const translateCookie = `googtrans=/en/${lang}`;

  // Set cookie with path and domain
  document.cookie = `${translateCookie};path=/`;
  document.cookie = `${translateCookie};domain=${window.location.hostname};path=/`;

  // Force page reload to apply translation
  window.location.reload();
}

/**
 * Get current language from Google Translate cookie
 * @returns Language code or 'en' as default
 */
export function getCurrentLanguage(): string {
  const cookies = document.cookie.split(';');
  const googtransCookie = cookies.find(cookie =>
    cookie.trim().startsWith('googtrans=')
  );

  if (googtransCookie) {
    const value = googtransCookie.split('=')[1];
    const parts = value.split('/');
    return parts.length >= 3 ? parts[2] : 'en';
  }

  return 'en';
}

/**
 * Clear Google Translate cookie and reset to English
 */
export function resetLanguage(): void {
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
  window.location.reload();
}