const {
    sincronizarPlanilha,
    adiarEscalaPlanilha,
    carregarEscalaLocal,
    checkoutEscala
} = require('./scaleService');
const { formatarEscala, isAdmin } = require('./utils');

/**
 * Middleware para comandos restritos a administradores.
 * @param {Function} acao - A função do comando a ser executado.
 * @returns {Function} - Uma função que verifica permissões antes de executar o comando.
 */
function restritoAAdmin(acao) {
    return async (mensagem) => {
        if (!isAdmin(mensagem.from)) {
            await mensagem.reply('❌ Você não tem permissão para isso.');
            return;
        }
        await acao(mensagem);
    };
}

/**
 * Processa o comando `!escala` e exibe a escala atual.
 * @param {Object} mensagem - A mensagem recebida.
 */
async function comandoEscala(mensagem) {
    const dados = carregarEscalaLocal();
    await mensagem.reply(formatarEscala(dados.escala));
}

/**
 * Processa o comando `!atualizar` e sincroniza a escala com a planilha.
 * @param {Object} mensagem - A mensagem recebida.
 */
async function comandoAtualizar(mensagem) {
    const atualizado = await sincronizarPlanilha();
    const resposta = atualizado ? '✅ Escala atualizada!' : '❌ Erro ao atualizar.';
    await mensagem.reply(resposta);
}

/**
 * Processa o comando `!adiar` e adia a escala em uma semana.
 * @param {Object} mensagem - A mensagem recebida.
 */
async function comandoAdiar(mensagem) {
    const novaEscala = await adiarEscalaPlanilha();
    const resposta = novaEscala
        ? `✅ Escala adiada!\n\n${formatarEscala(novaEscala.escala)}`
        : '❌ Erro ao adiar a escala.';
    await mensagem.reply(resposta);
}

/**
 * Processa o comando `!checkout` e reorganiza a escala.
 * @param {Object} mensagem - A mensagem recebida.
 */
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

/**
 * Processa as mensagens recebidas e executa os comandos correspondentes.
 * @param {Object} mensagem - A mensagem recebida.
 */
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
