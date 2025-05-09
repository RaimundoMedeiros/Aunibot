const puppeteer = require('puppeteer');

/**
 * Realiza o login na página.
 * 
 * @param {puppeteer.Page} page - Instância da página do Puppeteer.
 */
async function realizarLogin(page) {
    await page.goto(process.env.LOGIN_URL);
    await page.type('#loginForm\\:usuario', process.env.LOGIN_USUARIO);
    await page.type('#loginForm\\:senha', process.env.LOGIN_SENHA);
    await page.click('.button_login');
    await page.waitForSelector('#mensagem', { timeout: 10000 });
    console.log('✅ Login realizado com sucesso!');
}

/**
 * Seleciona o prédio e o período na página de agendamentos.
 * 
 * @param {puppeteer.Page} page - Instância da página do Puppeteer.
 */
async function selecionarPredioEPeriodo(page) {
    await page.select('#pesquisarAgendamentoForm\\:predio', process.env.PREDIO_ID);
    await page.select('#pesquisarAgendamentoForm\\:periodo', process.env.PERIODO_ID);
}

/**
 * Seleciona uma data no calendário.
 * 
 * @param {puppeteer.Page} page - Instância da página do Puppeteer.
 * @param {string} seletorBotao - Seletor do botão para abrir o calendário.
 * @param {number} dia - Dia do mês a ser selecionado.
 */
async function selecionarData(page, seletorBotao, dia) {
    await page.click(seletorBotao); // Botão para abrir o calendário
    await page.waitForSelector('td.rich-calendar-cell');
    await page.evaluate((dia) => {
        const cells = document.querySelectorAll('td.rich-calendar-cell');
        cells.forEach(cell => {
            const cellDay = cell.innerText.trim();
            if (cellDay === String(dia)) {
                cell.click(); // Clica no dia correspondente
            }
        });
    }, dia);
}

/**
 * Aguarda o carregamento da tabela de agendamentos.
 * 
 * @param {puppeteer.Page} page - Instância da página do Puppeteer.
 */
async function aguardarTabela(page) {
    await Promise.all([
        page.click('#pesquisarAgendamentoForm\\:consultar'),
        page.waitForFunction(() => {
            const tbody = document.querySelector('#pesquisarAgendamentoForm\\:agendamentoTablePesquisa\\:tb');
            return tbody && tbody.innerText.trim().length > 0;
        }, { timeout: 10000 }) // Timeout ajustável
    ]);
}

/**
 * Extrai os dados da tabela de agendamentos.
 * 
 * @param {puppeteer.Page} page - Instância da página do Puppeteer.
 * @returns {Array<Object>} - Lista de agendamentos.
 */
async function extrairDadosTabela(page) {
    return await page.evaluate(() => {
        const rows = document.querySelectorAll('tr.rich-tablerow, tr.rich-table-firstrow');
        const data = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td.rich-table-cell');
            if (cells.length >= 4) { // Verifica se tem pelo menos 4 colunas
                const interessado = cells[0].innerText.trim();
                const motivo = cells[1].innerText.trim();
                const dataAgendamento = cells[2].innerText.trim();
                const sala = cells[3].innerText.trim();

                if (motivo) { // Ignora linhas com "motivo" vazio
                    data.push({ interessado, motivo, data: dataAgendamento, sala });
                }
            }
        });

        return data;
    });
}

/**
 * Busca os agendamentos do próximo sábado em uma página de agendamentos.
 * 
 * @param {number} tentativas - Número de tentativas restantes.
 * @returns {Promise<Array<Object>>} - Uma lista de agendamentos contendo interessado, motivo, data e sala.
 */
async function buscarAgendamentos(tentativas = 5) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Realiza o login
        await realizarLogin(page);

        // Acesse a página de agendamentos
        await page.goto(process.env.AGENDAMENTOS_URL);
        console.log('🌐 Página de agendamentos acessada.');

        // Encontre o próximo sábado
        const proximoSabado = new Date();
        proximoSabado.setDate(proximoSabado.getDate() + (6 - proximoSabado.getDay()));
        console.log('📅 Próximo sábado:', proximoSabado.toLocaleDateString('pt-BR'));

        // Seleciona o prédio e o período
        await selecionarPredioEPeriodo(page);

        // Seleciona a data inicial e final
        await selecionarData(page, '#pesquisarAgendamentoForm\\:dataInicialPopupButton', proximoSabado.getDate());
        await selecionarData(page, '#pesquisarAgendamentoForm\\:dataFinalPopupButton', proximoSabado.getDate());

        // Aguarda o carregamento da tabela
        await aguardarTabela(page);

        // Extrai os dados da tabela
        const agendamentos = await extrairDadosTabela(page);

        if (agendamentos.length === 0) {
            console.log(`⚠️ Nenhum agendamento encontrado. Tentativas restantes: ${tentativas - 1}`);
            if (tentativas > 1) {
                // Fecha o navegador antes de tentar novamente
                await browser.close();
                return buscarAgendamentos(tentativas - 1); // Tenta novamente
            } else {
                console.log('⚠️ Nenhum agendamento encontrado após 5 tentativas. Prosseguindo...');
            }
        } else {
            console.log('✅ Dados extraídos com sucesso:', agendamentos);
        }

        return agendamentos;
    } catch (erro) {
        console.error('❌ Erro ao buscar agendamentos:', erro);
        return [];
    } finally {
        await browser.close();
    }
}

module.exports = buscarAgendamentos;