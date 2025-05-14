const {
    sincronizarPlanilha,
    adiarEscalaPlanilha,
    carregarEscalaLocal,
    checkoutEscala
} = require('./scaleService');
const { formatarEscala, isAdmin } = require('./utils');
const buscarAgendamentos = require('./scheduleScraper');

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
 * Processa o comando `!cronos` para buscar os agendamentos do próximo sábado.
 * 
 * @param {Object} mensagem - A mensagem recebida.
 * @param {Object} client - O client do WhatsApp.
 */
async function comandoCronos(mensagem, client) {
    const agendamentos = await buscarAgendamentos();

    const destino = mensagem.from;

    if (agendamentos === null) {
        await client.sendMessage(destino, '❌ Ocorreu um erro ao buscar os agendamentos. Tente novamente mais tarde.');
        return;
    }

    if (agendamentos.length > 0) {
        // Formata a resposta com as colunas: interessado, motivo, data e sala
        const resposta = agendamentos.map(a =>
            `👤 Interessado: ${a.interessado}\n📄 Motivo: ${a.motivo}\n📅 Data: ${a.data} \n🏢 Sala: ${a.sala}`
        ).join('\n\n');

        await client.sendMessage(destino, `📅 Agendamentos para o próximo sábado:\n\n${resposta}`);
    } else {
        await client.sendMessage(destino, '⚠️ Nenhum agendamento encontrado para o próximo sábado.');
    }
}

/**
 * Processa as mensagens recebidas e executa os comandos correspondentes.
 * @param {Object} mensagem - A mensagem recebida.
 * @param {Object} client - O client do WhatsApp.
 */
async function handleMessage(mensagem, client) {
    const comando = mensagem.body.trim();

    const comandos = {
        '!escala': comandoEscala,
        '!atualizar': restritoAAdmin(comandoAtualizar),
        '!adiar': restritoAAdmin(comandoAdiar),
        '!checkout': restritoAAdmin(comandoCheckout),
        '!cronos': restritoAAdmin((mensagem) => comandoCronos(mensagem, client))
    };

    if (comandos[comando]) {
        await comandos[comando](mensagem);
    }
}

module.exports = {
    comandoCronos,
    handleMessage
}
