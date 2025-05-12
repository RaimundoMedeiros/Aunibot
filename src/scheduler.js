const schedule = require('node-schedule');
const { getCurrentDayAndTime } = require('./utils');
const { carregarEscalaLocal } = require('./scaleService');
const { comandoCronos } = require('./commands');

const WHATSAPP_GROUP_ID = process.env.WHATSAPP_GROUP_ID; // ID do grupo do WhatsApp
const SCHEDULE_NOTI = process.env.SCHEDULE_NOTI; // Cronograma para notificação do bolsista
const SCHEDULE_CRON = process.env.SCHEDULE_CRON; // Cronograma para buscar agendamentos

/**
 * Obtém a data do próximo sábado a partir da escala.
 * 
 * @param {Object} escala - Objeto contendo a escala, onde as chaves são datas e os valores são os nomes dos bolsistas.
 * @returns {string} - A data do próximo sábado no formato `DD-MM`.
 */
function obterProximoSabado(escala) {
    return Object.keys(escala)[0];
}

/**
 * Obtém o ID do WhatsApp de um bolsista com base no nome.
 * 
 * @param {string} nomeBolsista - Nome do bolsista.
 * @returns {string|undefined} - O ID do WhatsApp do bolsista no formato `@c.us`, ou `undefined` se não encontrado.
 */
function obterIdMenção(nomeBolsista) {
    return process.env[nomeBolsista.toUpperCase()];
}

/**
 * Cria uma mensagem de convocação mencionando o bolsista.
 * 
 * @param {string} idUsuario - ID do WhatsApp do bolsista no formato `@c.us`.
 * @param {string} dataEscala - Data da escala no formato `DD-MM`.
 * @returns {string} - Mensagem de convocação formatada.
 */
function criarMensagemConvocacao(idUsuario, dataEscala) {
    const mencao = `@${idUsuario.split('@')[0]}`;
    return `📢 Atenção! ${mencao}, você está convocado para a escala do próximo sábado (${dataEscala}).`;
}

/**
 * Notifica o bolsista responsável pela escala do próximo sábado.
 * 
 * @param {Object} client - O cliente do WhatsApp (instância do `whatsapp-web.js`).
 * 
 * @description
 * Esta função é executada como parte de uma tarefa agendada. Ela:
 * - Obtém a escala local.
 * - Determina o próximo sábado e o bolsista responsável.
 * - Envia uma mensagem ao grupo mencionando o bolsista.
 */
async function notificarBolsista(client) {
    const { day, time } = getCurrentDayAndTime();
    console.log(`⏰ Executando tarefa agendada: ${day} às ${time}`);

    // Carrega a escala local
    const escala = carregarEscalaLocal();
    const proximoSabado = obterProximoSabado(escala.escala);
    const bolsista = escala.escala[proximoSabado];

    if (!bolsista) {
        console.log('⚠️ Nenhum bolsista encontrado para o próximo sábado.');
        return;
    }

    // Obtém o ID do bolsista e do grupo
    const idUsuario = obterIdMenção(bolsista);

    if (!idUsuario || !WHATSAPP_GROUP_ID) {
        console.log(`⚠️ ID não encontrado para o bolsista ${bolsista} ou grupo.`);
        return;
    }

    // Cria a mensagem de convocação
    const mensagem = criarMensagemConvocacao(idUsuario, proximoSabado);

    try {
        // Envia a mensagem ao grupo mencionando o bolsista
        await client.sendMessage(WHATSAPP_GROUP_ID, mensagem, {
            mentions: [idUsuario]
        });
        console.log(`✅ Mensagem enviada ao grupo mencionando ${idUsuario}: ${mensagem}`);
    } catch (erro) {
        console.error('❌ Erro ao enviar mensagem ao grupo:', erro);
    }
}

/**
 * Configura os agendamentos do bot.
 * 
 * @param {Object} client - O cliente do WhatsApp (instância do `whatsapp-web.js`).
 * 
 * @description
 * Configura uma tarefa agendada para notificar o bolsista responsável pela escala do próximo sábado.
 * O agendamento é configurado para ser executado toda quinta-feira às 15h.
 * 
 * Aciona o comandoCronos para buscar os agendamentos do próximo sábado todas as sextas-feiras às 18h. 
 */
function setupSchedules(client) {
    console.log('⏰ Configurando agendamentos...');

    schedule.scheduleJob(SCHEDULE_NOTI, () => notificarBolsista(client));

    schedule.scheduleJob(SCHEDULE_CRON, () => comandoCronos({ from: WHATSAPP_GROUP_ID }, client));

    console.log('✅ Agendamentos configurados com sucesso!');
}

module.exports = setupSchedules;
