const admins = require('../config/admin_numbers.json');

function obterSaudacao() {
    const horaAtual = new Date().getHours();
    if (horaAtual >= 5 && horaAtual < 12) return "Prezada(o), Bom dia!\n\n";
    if (horaAtual >= 12 && horaAtual < 18) return "Prezada(o), Boa tarde!\n\n";
    return "Prezada(o), Boa noite!\n\n";
}

function formatarEscala(escala) {
    const saudacao = obterSaudacao();
    const header = "🌟 ESCALA DE SÁBADOS\n===========================\n DATA     | BOLSISTA\n----------|----------------\n";
    const body = Object.entries(escala)
        .map(([data, nome]) => `${data.padEnd(9, ' ')} | ${nome.padEnd(16, ' ')}`)
        .join('\n');
    const footer = "===========================";
    return `${saudacao}${header}${body}\n${footer}`;
}

/**
 * Verifica se o remetente é um administrador.
 * @param {string} sender - O número do remetente.
 * @returns {boolean} - Retorna true se for admin, false caso contrário.
 */
function isAdmin(sender) {
    return admins.includes(sender);
}

/**
 * Retorna o dia da semana e a hora atual.
 * @returns {Object} - Um objeto contendo o dia da semana e a hora atual.
 */
function getCurrentDayAndTime() {
    const now = new Date();
    const daysOfWeek = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const day = daysOfWeek[now.getDay()];
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { day, time };
}

module.exports = {
    obterSaudacao,
    formatarEscala,
    isAdmin,
    getCurrentDayAndTime
};
