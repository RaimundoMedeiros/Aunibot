const { google } = require('googleapis');
const path = require('path');

/**
 * Cria uma instância de autenticação para acessar a API do Google Sheets.
 * 
 * @returns {google.auth.GoogleAuth} - Objeto de autenticação configurado.
 * 
 * @description
 * Esta função utiliza as credenciais armazenadas no arquivo `service-account.json`
 * para autenticar o acesso à API do Google Sheets. O escopo configurado permite
 * leitura e escrita em planilhas.
 */
function criarAutenticacaoGoogle() {
    return new google.auth.GoogleAuth({
        keyFile: path.resolve(process.env.GOOGLE_KEY_FILE),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
}

/**
 * Cria e retorna um client para interagir com a API do Google Sheets.
 * 
 * @returns {google.sheets_v4.Sheets} - Client da API do Google Sheets.
 * 
 * @description
 * Este client é usado para realizar operações na API do Google Sheets, como
 * leitura, escrita e atualização de dados em planilhas. Ele utiliza a autenticação
 * gerada pela função `criarAutenticacaoGoogle`.
 */
function getGoogleSheetsClient() {
    const auth = criarAutenticacaoGoogle();
    return google.sheets({ version: 'v4', auth });
}

module.exports = getGoogleSheetsClient;
