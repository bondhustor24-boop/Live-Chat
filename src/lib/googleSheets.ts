/**
 * Google Sheets Integration Helper
 * Allows direct and asynchronous syncing with Google Apps Script Webhooks.
 */

export async function syncToGoogleSheetDirect(url?: string, payload?: any): Promise<boolean> {
  if (!url || !url.startsWith('http') || !payload) return false;
  try {
    // Note: Google Apps Script Webhooks typically require mode 'no-cors' from browser
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.warn('Direct Google Sheet Sync error:', err);
    return false;
  }
}
