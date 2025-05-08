const client = require('./client');
const qrcode = require('qrcode-terminal');
const handleMessage = require('./commands');
const setupSchedules = require('./scheduler');

function exibirGrupos(grupos) {
    console.log('📋 Grupos disponíveis:');
    grupos.forEach(grupo => {
        console.log(`- Nome: ${grupo.name}, ID: ${grupo.id._serialized}`);
    });
}

function exibirQrCode(qr) {
    qrcode.generate(qr, { small: true });
}

function tratarErroMensagem(erro, mensagem) {
    console.error('❌ Erro ao processar mensagem:', erro);
    if (mensagem.reply) mensagem.reply('❌ Ocorreu um erro interno.');
}

client.once('ready', async () => {
    console.log(`✅ Aunibot pronto às ${new Date().toLocaleTimeString()}`);

    setupSchedules(client);

    const chats = await client.getChats();
    const grupos = chats.filter(chat => chat.isGroup);

    exibirGrupos(grupos);
});

client.on('qr', exibirQrCode);

client.on('message', async (mensagem) => {
    try {
        const idRemetente = mensagem.author || mensagem.from;
        const nomeRemetente = mensagem.notifyName || (mensagem.sender && mensagem.sender.pushname) || 'Desconhecido';

        console.log(`📩 Mensagem recebida de: ${nomeRemetente} (ID: ${idRemetente})`);

        await handleMessage(mensagem);
    } catch (erro) {
        tratarErroMensagem(erro, mensagem);
    }
});

client.on('disconnected', (motivo) => {
    console.log('❌ Cliente desconectado:', motivo);
});

client.initialize();
