# Aunibot

Aunibot é um chatbot para WhatsApp desenvolvido para facilitar a organização das escalas dos bolsistas do Setor IV/UFRN aos sábados. Ele automatiza tarefas administrativas, integra-se ao Google Sheets e ao sistema Cronos, e mantém o grupo sempre informado sobre as responsabilidades e agendamentos.

---

## ✨ Funcionalidades

- **Exibição da Escala Atual (`!escala`)**
  - Mostra a escala dos próximos sábados e os bolsistas responsáveis.

- **Atualização da Escala (`!atualizar`)**
  - Sincroniza a escala local com a planilha do Google Sheets, garantindo que todos tenham acesso à versão mais recente.

- **Adiamento da Escala (`!adiar`)**
  - Adia a escala em uma semana, ajustando automaticamente as datas e atualizando a planilha.

- **Checkout da Escala (`!checkout`)**
  - Remove o primeiro item da escala (sábado mais próximo) e reorganiza os dados, mantendo a ordem correta.

- **Consulta de Agendamentos no Cronos (`!cronos`)**
  - Busca e exibe os agendamentos do próximo sábado no sistema Cronos, mostrando interessado, motivo, data e sala.

- **Notificação Automática**
  - Toda quinta-feira às 15h, notifica no grupo o bolsista responsável pelo próximo sábado, mencionando-o diretamente.

- **Execução Automática do `!cronos`**
  - Toda sexta-feira às 18h, executa automaticamente o comando `!cronos` e compartilha os agendamentos do sábado no grupo.

- **Controle de Permissões**
  - Apenas administradores definidos na variável `ADMIN_NUMBERS` do `.env` podem executar comandos restritos.

---

## 🚀 Instalação e Uso

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/seu-usuario/aunibot.git
   cd aunibot
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   ```

4. **Adicione as credenciais do Google Sheets:**
   - Coloque o arquivo `service-account.json` na pasta `config/`.

5. **Execute o bot:**
   ```sh
   npm start
   ```

6. **Faça a autenticação no WhatsApp:**
   - O QR Code será exibido no terminal na primeira execução. Escaneie com o WhatsApp para autenticar.

---

## 🗂 Estrutura do Projeto

```
Aunibot/
├── config/
│   ├── bolsistas.json
│   └── service-account.json
├── src/
│   ├── bot.js
│   ├── client.js
│   ├── commands.js
│   ├── googleSheets.js
│   ├── scheduler.js
│   ├── scheduleScraper.js
│   └── ...
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Requisitos

- Node.js >= 16
- Chromium instalado (ajuste o caminho em `src/client.js` se necessário)
- Conta de serviço do Google com acesso à planilha
- Permissões de administrador no grupo do WhatsApp

---

## 📝 Observações

- O bot utiliza autenticação local para o WhatsApp Web. O QR Code será exibido no terminal na primeira execução.
- Os comandos restritos só podem ser executados por administradores definidos em `ADMIN_NUMBERS` no `.env`.
- O bot envia notificações automáticas conforme os agendamentos configurados.
- Os IDs dos bolsistas devem ser definidos no `.env` usando o nome em maiúsculas, por exemplo: `JOAO=5511999999999@c.us`.

---
## 📄 Licença

MIT

---

Desenvolvido para facilitar a rotina dos bolsistas do Setor IV/UFRN.