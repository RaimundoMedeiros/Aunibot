// Importação de dependências
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');


const CONFIG_DIR = path.join(__dirname, '../config');
const BOLSISTAS_FILE = path.join(CONFIG_DIR, 'bolsistas.json');
const configs = {
    bolsistas: require(BOLSISTAS_FILE),
    spreadsheet: require(path.join(CONFIG_DIR, 'spreadsheet.json')),
    admins: require(path.join(CONFIG_DIR, 'admin_numbers.json'))
};

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'Aunibot',
        dataPath: path.join(__dirname, '../.auth')
    }),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});


function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(CONFIG_DIR, 'service-account.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    return google.sheets({ version: 'v4', auth });
}


async function sincronizarPlanilha() {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: configs.spreadsheet.SPREADSHEET_ID,
            range: configs.spreadsheet.RANGE
        });

        const escalaAtualizada = { escala: {} };

        if (response.data.values && response.data.values.length > 0) {
            response.data.values.forEach(([data, nome]) => {
                if (data && nome && /^\d{1,2}-\d{1,2}$/.test(data.trim())) {
                    escalaAtualizada.escala[data.trim()] = nome.trim();
                }
            });
        }

        fs.writeFileSync(BOLSISTAS_FILE, JSON.stringify(escalaAtualizada, null, 2));
        configs.bolsistas = escalaAtualizada;

        console.log('✅ Planilha sincronizada com sucesso.');
        return true;
    } catch (err) {
        console.error('❌ Erro ao sincronizar a planilha:', err);
        return false;
    }
}

async function adiarEscalaPlanilha() {
    try {
        const sheets = getGoogleSheetsClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: configs.spreadsheet.SPREADSHEET_ID,
            range: configs.spreadsheet.RANGE
        });

        if (!response.data.values || response.data.values.length === 0) {
            console.error('❌ Nenhum dado encontrado na planilha.');
            return false;
        }

        const novaEscala = response.data.values.map(([data, nome]) => {
            if (!data || !nome) return [data, nome]; 

            const [dia, mes] = data.split('-').map(Number);
            const dataAtual = new Date(new Date().getFullYear(), mes - 1, dia);

            dataAtual.setDate(dataAtual.getDate() + 7);

            const novaData = dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }).replace('/', '-');

            return [novaData, nome];
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: configs.spreadsheet.SPREADSHEET_ID,
            range: configs.spreadsheet.RANGE,
            valueInputOption: 'RAW',
            requestBody: {
                values: novaEscala
            }
        });

        console.log('✅ Escala adiada em uma semana na planilha.');
        return true;
    } catch (err) {
        console.error('❌ Erro ao adiar a escala na planilha:', err);
        return false;
    }
}


function obterSaudacao() {
    const horaAtual = new Date().getHours();
    if (horaAtual >= 5 && horaAtual < 12) return "Prezada(o), Bom dia!\n\n";
    if (horaAtual >= 12 && horaAtual < 18) return "Prezada(o), Boa tarde!\n\n";
    return "Prezada(o), Boa noite!\n\n";
}


function formatarEscala() {
    const saudacao = obterSaudacao();
    const header = "🌟 ESCALA DE SÁBADOS\n===========================\n DATA     | BOLSISTA\n----------|----------------\n";
    const body = Object.entries(configs.bolsistas.escala)
        .map(([data, nome]) => `${data.padEnd(9, ' ')} | ${nome.padEnd(16, ' ')}`)
        .join('\n');
    const footer = "===========================";
    return `${saudacao}${header}${body}\n${footer}`;
}


client.once('ready', () => {
    console.log(`✅ Aunibot ativo às ${new Date().toLocaleTimeString()}`);
});


client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});


client.on('message', async (msg) => {
    try {
        console.log(`📩 Mensagem recebida de: ${msg.from}`);

        // Comando !sabados
        if (msg.body === '!sabados') {
            await msg.reply(formatarEscala());
            return;
        }

        if (msg.body === '!atualizar') {
            if (!configs.admins.includes(msg.from)) {
                await msg.reply('❌ Você não tem permissão para executar este comando.');
                return;
            }
            const success = await sincronizarPlanilha();
            await msg.reply(success ? '✅ Escala atualizada!' : '❌ Falha na atualização.');
            return;
        }

        if (msg.body === '!adiar') {
            if (!configs.admins.includes(msg.from)) {
                await msg.reply('❌ Você não tem permissão para executar este comando.');
                return;
            }
            const success = await adiarEscalaPlanilha();
            await msg.reply(success ? '✅ Escala adiada em uma semana!' : '❌ Falha ao adiar a escala.');
            return;
        }


    } catch (err) {
        console.error('❌ Erro ao processar mensagem:', err);
        await msg.reply('❌ Ocorreu um erro ao processar sua solicitação.');
    }
});


client.on('disconnected', (reason) => {
    console.log('❌ Cliente desconectado:', reason);
});


client.initialize();

