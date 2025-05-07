const client = require('./client');
const qrcode = require('qrcode-terminal');
const handleMessage = require('./commands');

client.once('ready', () => {
    console.log(`✅ Aunibot pronto às ${new Date().toLocaleTimeString()}`);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('message', async (msg) => {
    try {
        await handleMessage(msg);
    } catch (err) {
        console.error('❌ Erro ao processar mensagem:', err);
        await msg.reply('❌ Ocorreu um erro interno.');
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ Cliente desconectado:', reason);
});

client.initialize();
