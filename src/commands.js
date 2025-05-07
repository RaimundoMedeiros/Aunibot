const { sincronizarPlanilha, adiarEscalaPlanilha, loadLocalScale, checkoutEscala } = require('./scaleService');
const { formatarEscala, isAdmin } = require('./utils');

/**
 * Middleware para comandos restritos a administradores.
 * @param {Function} command - A função do comando a ser executado.
 * @returns {Function} - Uma função que verifica permissões antes de executar o comando.
 */
function adminOnly(command) {
    return async (msg) => {
        const sender = msg.from;
        if (!isAdmin(sender)) {
            await msg.reply('❌ Você não tem permissão para isso.');
            return;
        }
        await command(msg);
    };
}

async function handleMessage(msg) {
    const content = msg.body.trim();

    if (content === '!escala') {
        const dados = loadLocalScale();
        await msg.reply(formatarEscala(dados.escala));
    }

    else if (content === '!atualizar') {
        await adminOnly(async (msg) => {
            const updated = await sincronizarPlanilha();
            await msg.reply(updated ? '✅ Escala atualizada!' : '❌ Erro ao atualizar.');
        })(msg);
    }

    else if (content === '!adiar') {
        await adminOnly(async (msg) => {
            const novaEscala = await adiarEscalaPlanilha();
            await msg.reply(novaEscala ? `✅ Escala adiada!\n\n${formatarEscala(novaEscala.escala)}` : '❌ Erro ao adiar a escala.');
        })(msg);
    }

    else if (content === '!checkout') {
        await adminOnly(async (msg) => {
            const success = await checkoutEscala(); 
            if (success) {
                const updated = await sincronizarPlanilha(); 
                await msg.reply(updated ? '✅ Escala atualizada e sincronizada com sucesso!' : '✅ Escala atualizada, mas houve um erro ao sincronizar.');
            } else {
                await msg.reply('❌ Erro ao atualizar a escala.');
            }
        })(msg);
    }
}

module.exports = handleMessage;
