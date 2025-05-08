const { google } = require('googleapis');
const path = require('path');

function criarAutenticacaoGoogle() {
    return new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../config/service-account.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
}

function getGoogleSheetsClient() {
    const auth = criarAutenticacaoGoogle();
    return google.sheets({ version: 'v4', auth });
}

module.exports = getGoogleSheetsClient;
