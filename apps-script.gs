// ── Reva Birthday RSVP – Google Apps Script ──────────────────────────────
// Paste this into Extensions → Apps Script in your Google Sheet
// Then: Deploy → New Deployment → Web App → Execute as: Me → Anyone: Anyone
// Copy the Web App URL and paste it into script.js (SHEET_URL variable)

const SHEET_NAME = 'Sheet1'; // Change if your sheet tab has a different name

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data  = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.name      || '',
      data.attend    || '',
      data.shirt     || '',
      data.pant      || '',
      data.hero      || '',
      data.notes     || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles browser preflight (CORS OPTIONS request)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
