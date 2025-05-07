const schedule = require('node-schedule');
const { getCurrentDayAndTime } = require('./utils');
const { loadLocalScale } = require('./scaleService');
const bolsistasIds = require('../config/bolsistas_ids.json'); // Importa os IDs dos bolsistas

/**
 * Configura os agendamentos do bot.
 * @param {Object} client - O cliente do WhatsApp (whatsapp-web.js).
 */
function setupSchedules(client) {
    console.log('⏰ Configurando agendamentos...');

    // Agendar mensagem toda quinta-feira às 9h
    schedule.scheduleJob('0 9 * * 4', async () => {
        const { day, time } = getCurrentDayAndTime();
        console.log(`⏰ Executando tarefa agendada: ${day} às ${time}`);

        const escala = loadLocalScale();
        const proximoSabado = Object.keys(escala.escala)[0]; // Obtém a data do próximo sábado
        const bolsista = escala.escala[proximoSabado]; // Nome do bolsista responsável

        if (bolsista) {
            const id = bolsistasIds[bolsista]; // Obtém o ID do bolsista pelo nome
            if (id) {
                const mensagem = `📢 Atenção! ${bolsista}, você está convocado para a escala do próximo sábado (${proximoSabado}).`;
                await client.sendMessage(id, mensagem); // Envia a mensagem diretamente para o bolsista
                console.log(`✅ Mensagem enviada para ${id}: ${mensagem}`);
            } else {
                console.log(`⚠️ ID não encontrado para o bolsista ${bolsista}.`);
            }
        } else {
            console.log('⚠️ Nenhum bolsista encontrado para o próximo sábado.');
        }
    });

    console.log('✅ Agendamentos configurados com sucesso!');
}

module.exports = setupSchedules;