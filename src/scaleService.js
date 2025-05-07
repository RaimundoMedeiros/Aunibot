const fs = require('fs');
const path = require('path');
const getGoogleSheetsClient = require('./googleSheets');
const spreadsheet = require('../config/spreadsheet.json');

const BOLSISTAS_FILE = path.join(__dirname, '../config/bolsistas.json');

function loadLocalScale() {
    return JSON.parse(fs.readFileSync(BOLSISTAS_FILE, 'utf-8'));
}

async function sincronizarPlanilha() {
    try {
        const dados = await obterDadosPlanilha();
        if (!dados || dados.length === 0) {
            console.error('❌ Nenhum dado encontrado na planilha para sincronizar.');
            return null;
        }

        console.log('📋 Dados obtidos da planilha:', dados);

        const escalaAtualizada = { escala: {} };
        dados.forEach(([data, nome]) => {
            if (data && nome && /^\d{1,2}-\d{1,2}$/.test(data.trim())) {
                escalaAtualizada.escala[data.trim()] = nome.trim();
            } else {
                console.warn(`⚠️ Dados ignorados: [${data}, ${nome}]`);
            }
        });

        console.log('📋 Escala atualizada antes de salvar:', escalaAtualizada);

        try {
            fs.writeFileSync(BOLSISTAS_FILE, JSON.stringify(escalaAtualizada, null, 2));
            console.log('✅ Arquivo JSON atualizado com sucesso:', BOLSISTAS_FILE);

            const conteudoAtualizado = JSON.parse(fs.readFileSync(BOLSISTAS_FILE, 'utf-8'));
            console.log('📂 Conteúdo do arquivo após atualização:', conteudoAtualizado);
        } catch (err) {
            console.error('❌ Erro ao salvar o arquivo JSON:', err);
            return null;
        }

        return escalaAtualizada;
    } catch (err) {
        console.error('❌ Erro ao sincronizar a planilha:', err);
        return null;
    }
}

async function obterDadosPlanilha() {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: spreadsheet.RANGE
        });

        return response.data.values || [];
    } catch (err) {
        console.error('❌ Erro ao obter os dados da planilha:', err);
        return null;
    }
}

async function atualizarDadosPlanilha(novosDados) {
    try {
        const sheets = getGoogleSheetsClient();
        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: spreadsheet.RANGE,
            valueInputOption: 'RAW',
            requestBody: { values: novosDados }
        });

        console.log('✅ Dados da planilha atualizados com sucesso!');
        return true;
    } catch (err) {
        console.error('❌ Erro ao atualizar os dados da planilha:', err);
        return false;
    }
}

async function adiarEscalaPlanilha() {
    try {
        const dados = await obterDadosPlanilha();
        if (!dados) return null;

        const novaEscala = dados.map(([data, nome]) => {
            const [dia, mes] = data.split('-').map(Number);
            const dataAtual = new Date(new Date().getFullYear(), mes - 1, dia);
            dataAtual.setDate(dataAtual.getDate() + 7);
            const novaData = dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }).replace('/', '-');
            return [novaData, nome];
        });

        const atualizado = await atualizarDadosPlanilha(novaEscala);
        return atualizado ? await sincronizarPlanilha() : null;
    } catch (err) {
        console.error('❌ Erro ao adiar a escala:', err);
        return null;
    }
}

async function checkoutEscala() {
    try {
        const dados = await obterDadosPlanilha();
        if (!dados || dados.length === 0) {
            console.error('❌ Nenhum dado encontrado na planilha.');
            return false;
        }

        if (dados.length < 2) {
            console.error('❌ Não há linhas suficientes para reorganizar a escala.');
            return false;
        }

        console.log('📋 Dados antes do checkout:', dados);


        const novaEscala = dados.slice(1);

        console.log('📋 Nova escala após remoção da primeira linha:', novaEscala);

        const atualizado = await atualizarDadosPlanilha(novaEscala);

        if (atualizado) {
            console.log('✅ Escala reorganizada com sucesso!');

            const sheets = getGoogleSheetsClient();
            const ultimaLinha = dados.length + 1; /
            const rangeParaLimpar = `A${ultimaLinha}:B${ultimaLinha}`;
            await sheets.spreadsheets.values.clear({
                spreadsheetId: spreadsheet.SPREADSHEET_ID,
                range: rangeParaLimpar
            });

            console.log(`✅ Última linha (linha ${ultimaLinha}) removida da planilha.`);
        }

        return atualizado;
    } catch (err) {
        console.error('❌ Erro ao reorganizar a escala:', err);
        return false;
    }
}

module.exports = {
    loadLocalScale,
    sincronizarPlanilha,
    adiarEscalaPlanilha,
    checkoutEscala
};
