const fs = require('fs');
const path = require('path');
const getGoogleSheetsClient = require('./googleSheets');

const BOLSISTAS_FILE = path.join(__dirname, '../config/bolsistas.json');
const spreadsheet = require('../config/spreadsheet.json');

function loadLocalScale() {
    return JSON.parse(fs.readFileSync(BOLSISTAS_FILE, 'utf-8'));
}

async function sincronizarPlanilha() {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: spreadsheet.RANGE
        });

        const escalaAtualizada = { escala: {} };
        if (response.data.values) {
            response.data.values.forEach(([data, nome]) => {
                if (data && nome && /^\d{1,2}-\d{1,2}$/.test(data.trim())) {
                    escalaAtualizada.escala[data.trim()] = nome.trim();
                }
            });
        }

        fs.writeFileSync(BOLSISTAS_FILE, JSON.stringify(escalaAtualizada, null, 2));
        return escalaAtualizada;
    } catch (err) {
        console.error('❌ Erro ao sincronizar a planilha:', err);
        return null;
    }
}

async function adiarEscalaPlanilha() {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: spreadsheet.RANGE
        });

        const novaEscala = response.data.values.map(([data, nome]) => {
            const [dia, mes] = data.split('-').map(Number);
            const dataAtual = new Date(new Date().getFullYear(), mes - 1, dia);
            dataAtual.setDate(dataAtual.getDate() + 7);
            const novaData = dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }).replace('/', '-');
            return [novaData, nome];
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: spreadsheet.RANGE,
            valueInputOption: 'RAW',
            requestBody: { values: novaEscala }
        });

        return await sincronizarPlanilha();
    } catch (err) {
        console.error('❌ Erro ao adiar a escala:', err);
        return null;
    }
}

module.exports = {
    loadLocalScale,
    sincronizarPlanilha,
    adiarEscalaPlanilha
};
