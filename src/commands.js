const {
    sincronizarPlanilha,
    adiarEscalaPlanilha,
    carregarEscalaLocal,
    checkoutEscala
} = require('./scaleService');
const { formatarEscala, isAdmin } = require('./utils');

function restritoAAdmin(acao) {
    return async (mensagem) => {
        if (!isAdmin(mensagem.from)) {
            await mensagem.reply('❌ Você não tem permissão para isso.');
            return;
        }
        await acao(mensagem);
    };
}

async function comandoEscala(mensagem) {
    const dados = carregarEscalaLocal();
    await mensagem.reply(formatarEscala(dados.escala));
}

async function comandoAtualizar(mensagem) {
    const atualizado = await sincronizarPlanilha();
    const resposta = atualizado ? '✅ Escala atualizada!' : '❌ Erro ao atualizar.';
    await mensagem.reply(resposta);
}

async function comandoAdiar(mensagem) {
    const novaEscala = await adiarEscalaPlanilha();
    const resposta = novaEscala
        ? `✅ Escala adiada!

${formatarEscala(novaEscala.escala)}`
        : '❌ Erro ao adiar a escala.';
    await mensagem.reply(resposta);
}

async function comandoCheckout(mensagem) {
    const sucesso = await checkoutEscala();
    if (!sucesso) {
        await mensagem.reply('❌ Erro ao atualizar a escala.');
        return;
    }

    const atualizado = await sincronizarPlanilha();
    const resposta = atualizado
        ? '✅ Escala atualizada e sincronizada com sucesso!'
        : '✅ Escala atualizada, mas houve um erro ao sincronizar.';
    await mensagem.reply(resposta);
}

async function handleMessage(mensagem) {
    const comando = mensagem.body.trim();

    const comandos = {
        '!escala': comandoEscala,
        '!atualizar': restritoAAdmin(comandoAtualizar),
        '!adiar': restritoAAdmin(comandoAdiar),
        '!checkout': restritoAAdmin(comandoCheckout)
    };

    if (comandos[comando]) {
        await comandos[comando](mensagem);
    }
}

module.exports = handleMessage;
