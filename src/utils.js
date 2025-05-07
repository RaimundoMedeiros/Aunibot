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

module.exports = {
    obterSaudacao,
    formatarEscala
};
