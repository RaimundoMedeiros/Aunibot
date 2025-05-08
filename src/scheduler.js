const schedule = require('node-schedule');
const { getCurrentDayAndTime } = require('./utils');
const { carregarEscalaLocal } = require('./scaleService');
const bolsistasIds = require('../config/bolsistas_ids.json');

function obterProximoSabado(escala) {
    return Object.keys(escala)[0];
}

function obterIdMenção(nomeBolsista) {
    return bolsistasIds[nomeBolsista];
}

function criarMensagemConvocacao(idUsuario, dataEscala) {
    const mencao = `@${idUsuario.split('@')[0]}`;
    return `📢 Atenção! ${mencao}, você está convocado para a escala do próximo sábado (${dataEscala}).`;
}

async function notificarBolsista(client) {
    const { day, time } = getCurrentDayAndTime();
    console.log(`⏰ Executando tarefa agendada: ${day} às ${time}`);

    const escala = carregarEscalaLocal();
    const proximoSabado = obterProximoSabado(escala.escala);
    const bolsista = escala.escala[proximoSabado];

    if (!bolsista) {
        console.log('⚠️ Nenhum bolsista encontrado para o próximo sábado.');
        return;
    }

    const idUsuario = obterIdMenção(bolsista);
    const idGrupo = bolsistasIds.grupoId;

    if (!idUsuario || !idGrupo) {
        console.log(`⚠️ ID não encontrado para o bolsista ${bolsista} ou grupo.`);
        return;
    }

    const mensagem = criarMensagemConvocacao(idUsuario, proximoSabado);

    try {
        await client.sendMessage(idGrupo, mensagem, {
            mentions: [idUsuario]
        });
        console.log(`✅ Mensagem enviada ao grupo mencionando ${idUsuario}: ${mensagem}`);
    } catch (erro) {
        console.error('❌ Erro ao enviar mensagem ao grupo:', erro);
    }
}

function setupSchedules(client) {
    console.log('⏰ Configurando agendamentos...');

    schedule.scheduleJob('0 15 * * 4', () => notificarBolsista(client));

    console.log('✅ Agendamentos configurados com sucesso!');
}

module.exports = setupSchedules;
