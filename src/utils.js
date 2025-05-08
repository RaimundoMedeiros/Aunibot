/**
 * Retorna uma saudação com base no horário atual.
 * 
 * @returns {string} - Saudação apropriada (Bom dia, Boa tarde, Boa noite).
 */
function obterSaudacao() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Prezada(o), Bom dia!\n\n';
    if (hora >= 12 && hora < 18) return 'Prezada(o), Boa tarde!\n\n';
    return 'Prezada(o), Boa noite!\n\n';
}

/**
 * Formata a escala em uma string legível para exibição.
 * 
 * @param {Object} escala - Objeto contendo a escala, onde as chaves são datas e os valores são os nomes dos bolsistas.
 * @returns {string} - Escala formatada como uma tabela legível.
 */
function formatarEscala(escala) {
    const saudacao = obterSaudacao();
    const cabecalho = '🌟 ESCALA DE SÁBADOS\n===========================\n DATA     | BOLSISTA\n----------|----------------\n';
    const corpo = Object.entries(escala)
        .map(([data, nome]) => `${data.padEnd(9)} | ${nome.padEnd(16)}`)
        .join('\n');
    const rodape = '===========================';

    return `${saudacao}${cabecalho}${corpo}\n${rodape}`;
}

/**
 * Verifica se o número fornecido pertence a um administrador.
 * 
 * @param {string} numero - Número do remetente no formato internacional (ex.: `5511912345678`).
 * @returns {boolean} - Retorna `true` se o número for de um administrador, caso contrário `false`.
 */
function isAdmin(numero) {
    const adminNumbers = process.env.ADMIN_NUMBERS.split(',');
    return adminNumbers.includes(numero);
}

/**
 * Obtém o dia da semana e o horário atual.
 * 
 * @returns {Object} - Um objeto contendo o dia da semana (`day`) e o horário atual (`time`).
 * 
 * @property {string} day - Dia da semana em português (ex.: "segunda-feira").
 * @property {string} time - Horário atual no formato `HH:mm`.
 */
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
