const admins = require('../config/admin_numbers.json');
const { sincronizarPlanilha, adiarEscalaPlanilha, loadLocalScale } = require('./scaleService');
const { formatarEscala } = require('./utils');

async function handleMessage(msg) {
    const sender = msg.from;
    const content = msg.body.trim();

    if (content === '!sabados') {
        const dados = loadLocalScale();
        await msg.reply(formatarEscala(dados.escala));
    }

    else if (content === '!atualizar') {
        if (!admins.includes(sender)) {
            await msg.reply('❌ Você não tem permissão para isso.');
            return;
        }
        const updated = await sincronizarPlanilha();
        await msg.reply(updated ? '✅ Escala atualizada!' : '❌ Erro ao atualizar.');
    }

    else if (content === '!adiar') {
        if (!admins.includes(sender)) {
            await msg.reply('❌ Você não tem permissão para isso.');
            return;
        }
        const novaEscala = await adiarEscalaPlanilha();
        await msg.reply(novaEscala ? `✅ Escala adiada!\n\n${formatarEscala(novaEscala.escala)}` : '❌ Erro ao adiar a escala.');
    }
}

module.exports = handleMessage;
