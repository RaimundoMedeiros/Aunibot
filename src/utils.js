const admins = require('../config/admin_numbers.json');

function obterSaudacao() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Prezada(o), Bom dia!\n\n';
    if (hora >= 12 && hora < 18) return 'Prezada(o), Boa tarde!\n\n';
    return 'Prezada(o), Boa noite!\n\n';
}

function formatarEscala(escala) {
    const saudacao = obterSaudacao();
    const cabecalho = '🌟 ESCALA DE SÁBADOS\n===========================\n DATA     | BOLSISTA\n----------|----------------\n';
    const corpo = Object.entries(escala)
        .map(([data, nome]) => `${data.padEnd(9)} | ${nome.padEnd(16)}`)
        .join('\n');
    const rodape = '===========================';

    return `${saudacao}${cabecalho}${corpo}\n${rodape}`;
}

function isAdmin(numero) {
    return admins.includes(numero);
}

function getCurrentDayAndTime() {
    const agora = new Date();
    const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const dia = diasDaSemana[agora.getDay()];
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return { day: dia, time: hora };
}

module.exports = {
    obterSaudacao,
    formatarEscala,
    isAdmin,
    getCurrentDayAndTime
};
