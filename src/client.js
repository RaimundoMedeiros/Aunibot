const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

// Configura o client do WhatsApp com autenticação local
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'Aunibot', // Identificador único para o client
        dataPath: path.join(__dirname, '../.auth') // Caminho para armazenar dados de autenticação
    }),
    puppeteer: {
        headless: true, // Executa o navegador em modo headless
        executablePath: '/usr/bin/chromium', // Caminho para o navegador Chromium
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Argumentos para o Puppeteer
    }
});

module.exports = client;
