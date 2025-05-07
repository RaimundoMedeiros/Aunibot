const schedule = require('node-schedule');
const { getCurrentDayAndTime } = require('./utils');
const { loadLocalScale } = require('./scaleService');
const bolsistasIds = require('../config/bolsistas_ids.json');

/**
 * Configura os agendamentos do bot.
 * @param {Object} client - O cliente do WhatsApp (whatsapp-web.js).
 */
function setupSchedules(client) {
    console.log('⏰ Configurando agendamentos...');

    schedule.scheduleJob('0 15 * * 4', async () => {
        const { day, time } = getCurrentDayAndTime();
        console.log(`⏰ Executando tarefa agendada: ${day} às ${time}`);

        const escala = loadLocalScale();
        const proximoSabado = Object.keys(escala.escala)[0];
        const bolsista = escala.escala[proximoSabado];

        if (bolsista) {
            const id = bolsistasIds[bolsista];
            const grupoId = bolsistasIds.grupoId;

            if (id && grupoId) {
                const mensagem = `📢 Atenção! @${id.split('@')[0]}, você está convocado para a escala do próximo sábado (${proximoSabado}).`;

                await client.sendMessage(grupoId, mensagem, {
                    mentions: [id]
                });

                console.log(`✅ Mensagem enviada para o grupo mencionando ${id}: ${mensagem}`);
            } else {
                console.log(`⚠️ ID não encontrado para o bolsista ${bolsista} ou grupo.`);
            }
        } else {
            console.log('⚠️ Nenhum bolsista encontrado para o próximo sábado.');
        }
    });

    console.log('✅ Agendamentos configurados com sucesso!');
}

module.exports = setupSchedules;