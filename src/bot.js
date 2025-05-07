const client = require('./client');
const qrcode = require('qrcode-terminal');
const handleMessage = require('./commands');
const setupSchedules = require('./scheduler'); // Importa o arquivo de agendamentos

client.once('ready', () => {
    console.log(`✅ Aunibot pronto às ${new Date().toLocaleTimeString()}`);

    // Configurar os agendamentos
    setupSchedules(client);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('message', async (msg) => {
    try {
        const senderId = msg.author || msg.from; 
        const senderName = msg.notifyName || (msg.sender && msg.sender.pushname) || "Desconhecido"; 

        console.log(`📩 Mensagem recebida de: ${senderName} (ID: ${senderId})`);

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
