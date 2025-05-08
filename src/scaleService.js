const fs = require('fs');
const path = require('path');
const getGoogleSheetsClient = require('./googleSheets');
const spreadsheet = require('../config/spreadsheet.json');

const BOLSISTAS_FILE = path.join(__dirname, '../config/bolsistas.json');

/**
 * Carrega a escala local armazenada no arquivo JSON.
 * 
 * @returns {Object} - Objeto contendo a escala local.
 */
function carregarEscalaLocal() {
    return JSON.parse(fs.readFileSync(BOLSISTAS_FILE, 'utf-8'));
}

/**
 * Salva a escala local no arquivo JSON.
 * 
 * @param {Object} escala - Objeto contendo a escala a ser salva.
 * @returns {boolean} - Retorna `true` se a escala foi salva com sucesso, caso contrário `false`.
 */
function salvarEscalaLocal(escala) {
    try {
        fs.writeFileSync(BOLSISTAS_FILE, JSON.stringify(escala, null, 2));
        return true;
    } catch (erro) {
        console.error('❌ Erro ao salvar a escala local:', erro);
        return false;
    }
}

/**
 * Transforma os dados obtidos da planilha em um formato de escala.
 * 
 * @param {Array<Array<string>>} dados - Dados da planilha no formato de matriz (linhas e colunas).
 * @returns {Object} - Objeto contendo a escala formatada.
 */
function transformarDadosParaEscala(dados) {
    const escala = { escala: {} };
    dados.forEach(([data, nome]) => {
        if (data && nome && /^\d{1,2}-\d{1,2}$/.test(data.trim())) {
            escala.escala[data.trim()] = nome.trim();
        } else {
            console.warn(`⚠️ Dados ignorados: [${data}, ${nome}]`);
        }
    });
    return escala;
}

/**
 * Obtém os dados da planilha do Google Sheets.
 * 
 * @returns {Promise<Array<Array<string>>>} - Uma matriz contendo os dados da planilha.
 */
async function obterDadosPlanilha() {
    try {
        const sheets = getGoogleSheetsClient();
        const resposta = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: spreadsheet.RANGE
        });
        return resposta.data.values || [];
    } catch (erro) {
        console.error('❌ Erro ao obter os dados da planilha:', erro);
        return null;
    }
}

/**
 * Atualiza os dados da planilha do Google Sheets.
 * 
 * @param {Array<Array<string>>} valores - Dados a serem atualizados na planilha.
 * @returns {Promise<boolean>} - Retorna `true` se os dados foram atualizados com sucesso, caso contrário `false`.
 */
async function atualizarDadosPlanilha(valores) {
    try {
        const sheets = getGoogleSheetsClient();
        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: spreadsheet.RANGE,
            valueInputOption: 'RAW',
            requestBody: { values: valores }
        });
        return true;
    } catch (erro) {
        console.error('❌ Erro ao atualizar a planilha:', erro);
        return false;
    }
}

/**
 * Sincroniza os dados da planilha com a escala local.
 * 
 * @returns {Promise<Object|null>} - Retorna o objeto da escala atualizada ou `null` em caso de erro.
 */
async function sincronizarPlanilha() {
    const dados = await obterDadosPlanilha();
    if (!dados || dados.length === 0) {
        console.error('❌ Nenhum dado encontrado na planilha.');
        return null;
    }
    const escalaAtualizada = transformarDadosParaEscala(dados);
    return salvarEscalaLocal(escalaAtualizada) ? escalaAtualizada : null;
}

/**
 * Soma sete dias a uma data no formato `DD-MM`.
 * 
 * @param {string} dataStr - Data no formato `DD-MM`.
 * @returns {string} - Nova data no formato `DD-MM`, com sete dias adicionados.
 */
function somarSeteDias(dataStr) {
    const [dia, mes] = dataStr.split('-').map(Number);
    const data = new Date(new Date().getFullYear(), mes - 1, dia);
    data.setDate(data.getDate() + 7);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }).replace('/', '-');
}

/**
 * Adia a escala em uma semana e atualiza a planilha.
 * 
 * @returns {Promise<Object|null>} - Retorna o objeto da nova escala ou `null` em caso de erro.
 */
async function adiarEscalaPlanilha() {
    const dados = await obterDadosPlanilha();
    if (!dados) return null;

    const novaEscala = dados.map(([data, nome]) => [somarSeteDias(data), nome]);
    return await atualizarDadosPlanilha(novaEscala) ? await sincronizarPlanilha() : null;
}

/**
 * Remove o primeiro item da escala e reorganiza os dados na planilha.
 * 
 * @returns {Promise<boolean>} - Retorna `true` se a operação foi bem-sucedida, caso contrário `false`.
 */
async function checkoutEscala() {
    const dados = await obterDadosPlanilha();
    if (!dados || dados.length < 2) {
        console.error('❌ Dados insuficientes para reorganizar a escala.');
        return false;
    }

    const novaEscala = dados.slice(1);
    const atualizado = await atualizarDadosPlanilha(novaEscala);
    if (!atualizado) return false;

    const sheets = getGoogleSheetsClient();
    const ultimaLinha = dados.length + 1;
    const rangeParaLimpar = `A${ultimaLinha}:B${ultimaLinha}`;

    try {
        await sheets.spreadsheets.values.clear({
            spreadsheetId: spreadsheet.SPREADSHEET_ID,
            range: rangeParaLimpar
        });
        console.log(`✅ Última linha (linha ${ultimaLinha}) limpa.`);
    } catch (erro) {
        console.warn('⚠️ Não foi possível limpar a última linha:', erro);
    }

    return true;
}

module.exports = {
    carregarEscalaLocal,
    sincronizarPlanilha,
    adiarEscalaPlanilha,
    checkoutEscala
};
