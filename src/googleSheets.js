const { google } = require('googleapis');
const path = require('path');

function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../config/service-account.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
}

module.exports = getGoogleSheetsClient;
