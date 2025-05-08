const client = require('./client');
const qrcode = require('qrcode-terminal');
const handleMessage = require('./commands');
const setupSchedules = require('./scheduler');

/**
 * Exibe os grupos disponíveis no console.
 * @param {Array<Object>} grupos - Lista de grupos do WhatsApp.
 */
function exibirGrupos(grupos) {
    console.log('📋 Grupos disponíveis:');
    grupos.forEach(grupo => {
        console.log(`- Nome: ${grupo.name}, ID: ${grupo.id._serialized}`);
    });
}

/**
 * Gera e exibe o QR Code para autenticação no WhatsApp.
 * @param {string} qr - Código QR gerado pelo client.
 */
function exibirQrCode(qr) {
    qrcode.generate(qr, { small: true });
}

/**
 * Trata erros ao processar mensagens.
 * @param {Error} erro - O erro ocorrido.
 * @param {Object} mensagem - A mensagem que causou o erro.
 */
function tratarErroMensagem(erro, mensagem) {
    console.error('❌ Erro ao processar mensagem:', erro);
    if (mensagem.reply) mensagem.reply('❌ Ocorreu um erro interno.');
}

// Evento disparado quando o client está pronto
client.once('ready', async () => {
    console.log(`✅ Aunibot pronto às ${new Date().toLocaleTimeString()}`);

    setupSchedules(client); // Configura os agendamentos automáticos

    // Obtém todos os chats e filtra apenas os grupos
    const chats = await client.getChats();
    const grupos = chats.filter(chat => chat.isGroup);

    exibirGrupos(grupos); // Exibe os grupos no console
});

client.on('qr', exibirQrCode); // Evento para exibir o QR Code no terminal

// Evento para processar mensagens recebidas
client.on('message', async (mensagem) => {
    try {
        const idRemetente = mensagem.author || mensagem.from; // ID do remetente
        const nomeRemetente = mensagem.notifyName || (mensagem.sender && mensagem.sender.pushname) || 'Desconhecido'; // Nome do remetente

        console.log(`📩 Mensagem recebida de: ${nomeRemetente} (ID: ${idRemetente})`);

        await handleMessage(mensagem); // Processa a mensagem recebida
    } catch (erro) {
        tratarErroMensagem(erro, mensagem);
    }
});

// Evento disparado quando o client é desconectado
client.on('disconnected', (motivo) => {
    console.log('❌ Cliente desconectado:', motivo);
});

client.initialize(); // Inicializa o client do WhatsApp
 