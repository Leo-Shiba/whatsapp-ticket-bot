<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:CC4500,100:FF8C00&height=220&section=header&text=Ticket-Bot&fontSize=85&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Sistema%20de%20Tickets%20para%20WhatsApp&descAlignY=62&descSize=22&descColor=ffffffcc" width="100%"/>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1000&color=FF8C00&center=true&vCenter=true&width=600&lines=Sistema+de+tickets+estilo+Discord+🎫;Painel+com+menu+numerado+no+grupo+📋;Pool+de+grupos+%2B+criação+automática+🗂️;Feito+para+rodar+24h+em+host+☁️)](https://git.io/typing-svg)

<br/>

[![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-FF6B00?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/Leo-Shiba/whatsapp-ticket-bot)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-6.7.9-FF8C00?style=for-the-badge&logoColor=white)](https://github.com/WhiskeySockets/Baileys)
[![Host](https://img.shields.io/badge/Host-VPS%20%7C%20Cloud-1a1a1a?style=for-the-badge&logo=icloud&logoColor=FF6B00)](https://github.com/Leo-Shiba/whatsapp-ticket-bot)
[![Licença](https://img.shields.io/badge/Licença-MIT-FF6B00?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](./LICENSE)

<br/>

[![Stars](https://img.shields.io/github/stars/Leo-Shiba/whatsapp-ticket-bot?style=social)](https://github.com/Leo-Shiba/whatsapp-ticket-bot/stargazers)
[![Forks](https://img.shields.io/github/forks/Leo-Shiba/whatsapp-ticket-bot?style=social)](https://github.com/Leo-Shiba/whatsapp-ticket-bot/network)

<br/>

> 🎫 **Sistema de tickets para grupos de vendas no WhatsApp, inspirado nos bots de ticket do Discord.**
> Painel com imagem e menu numerado, pool de grupos de atendimento e criação automática.
> Feito para rodar 24h em host (VPS / cloud) — banco de dados grátis, sem mensalidade extra.

<br/>

[📥 Instalação](#-instalação) · [🧠 Como funciona](#-como-funciona) · [⚙️ Configuração](#️-configuração-inicial) · [🎛️ Comandos](#️-comandos) · [🔧 Problemas](#-solução-de-problemas) · [📁 Estrutura](#-estrutura-do-projeto)

</div>

---

## ✨ O que o bot faz

<table>
<tr>
<td align="center" width="25%">

### 🎫 Tickets
Abertura por menu numerado
1 ticket por cliente
Aviso automático no privado

</td>
<td align="center" width="25%">

### 🖼️ Painel
Imagem + texto estilo embed
Título, descrição e rodapé
Tudo editável por comando

</td>
<td align="center" width="25%">

### 🗂️ Pool de Grupos
Grupos de ticket prontos
Cria novos quando lota
Libera ao fechar o ticket

</td>
<td align="center" width="25%">

### 👥 Equipe
Atendentes cadastrados
Adicionados em cada ticket
Promovidos a admin

</td>
</tr>
</table>

---

## 🧠 Como funciona

```
Cliente responde "1" no painel do grupo de vendas
                    │
                    ▼
   Bot pega um grupo 🟢 livre do pool de tickets
   (se o pool lotar → cria um grupo novo sozinho)
                    │
                    ▼
   Adiciona o cliente + notifica os atendentes
   (privacidade bloqueou? → envia o convite no PV)
                    │
                    ▼
   Atendimento acontece no grupo do ticket
                    │
                    ▼
   !fechar → remove o cliente e devolve o grupo ao pool 🟢
```

> [!NOTE]
> **Por que menu numerado e não botões?** O WhatsApp parou de renderizar botões e listas
> interativas de bots em contas normais. O menu numerado é o padrão confiável dos bots
> de vendas — funciona em qualquer aparelho e sem risco de banimento.

---

## 📥 Instalação

### Pré-requisitos

<div align="center">

| ✅ | Requisito |
|:--:|:--|
| ☁️ | Host com **Node.js 20+** (VPS, SquareCloud, etc.) ou PC |
| 💾 | Pasta `data/` persistente (sessão + banco de dados) |
| 🌐 | Conexão com internet |

</div>

---

![PASSO 1](https://img.shields.io/badge/PASSO-1-FF6B00?style=flat-square&logoColor=white)

### Clonar o projeto

```bash
git clone https://github.com/Leo-Shiba/whatsapp-ticket-bot.git && cd whatsapp-ticket-bot
```

---

![PASSO 2](https://img.shields.io/badge/PASSO-2-CC4500?style=flat-square&logoColor=white)

### Instalar as dependências

```bash
npm install
```

> ⏳ Pode demorar alguns minutos na primeira vez.

---

![PASSO 3](https://img.shields.io/badge/PASSO-3-FF6B00?style=flat-square&logoColor=white)

### Iniciar o bot e escanear o QR Code

```bash
npm start
```

Um **QR Code** aparecerá no terminal (também salvo em `data/qrcode.png`). Para conectar:

```
WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho
```

> [!TIP]
> ✅ Quando aparecer **"Conectado ao WhatsApp!"** o bot está online e pronto!

---

## ⚙️ Configuração inicial

No **grupo de vendas**, como admin, monte o painel uma única vez:

```bash
!addopcao Suporte | Problemas com pedidos
!addopcao Compras | Quero comprar um produto
!addopcao Parcerias | Proposta de parceria
!setpainel titulo 🎫 CENTRAL DE ATENDIMENTO
!setpainel descricao Escolha uma opção abaixo para falar com a equipe:
!staff add @atendente1
!staff add @atendente2
!painel
```

Para definir a **imagem do painel**: responda a uma imagem com `!setimagem`.

> [!IMPORTANT]
> **Pool de grupos (recomendado):** crie os grupos de ticket manualmente
> (ex: `🎫 Ticket-01` até `🎫 Ticket-10`), adicione o bot como **admin** em cada um
> e use `!pool add` dentro de cada grupo. Se não criar nenhum, o bot cria grupos
> sozinho quando os tickets abrirem.

---

## 🎛️ Comandos

> Todos os comandos usam o prefixo `!`.

### 🔐 Painel e Menu (admins)

<div align="center">

| Comando | Descrição |
|:--|:--|
| `!painel` | Envia o painel neste grupo (define o grupo de vendas) |
| `!setpainel titulo <texto>` | Edita o título do painel |
| `!setpainel descricao <texto>` | Edita a descrição do painel |
| `!setpainel rodape <texto>` | Edita o rodapé do painel |
| `!setimagem` | Define a imagem do painel (respondendo a uma imagem) |
| `!addopcao Nome \| Descrição` | Adiciona opção ao menu |
| `!delopcao <nº>` | Remove opção do menu |
| `!opcoes` | Lista as opções configuradas |

</div>

### 🎫 Tickets e Equipe (admins)

<div align="center">

| Comando | Alias | Descrição |
|:--|:--|:--|
| `!fechar` | `!close` | Fecha o ticket do grupo atual e o devolve ao pool |
| `!tickets` | — | Lista os tickets abertos |
| `!staff add @pessoa` | — | Cadastra atendente |
| `!staff remover @pessoa` | — | Remove atendente |
| `!pool` | — | Lista os grupos do pool e o status 🟢/🔴 |
| `!pool add` | — | Registra o grupo atual no pool |
| `!pool remover` | — | Tira o grupo atual do pool |

</div>

### 🌐 Comandos Públicos

<div align="center">

| Comando | Alias | Descrição |
|:--|:--|:--|
| `!ajuda` | `!help` | Lista todos os comandos |
| `!ping` | — | Latência do bot |

</div>

---

## 🔧 Solução de problemas

<details>
<summary><b>❓ QR Code não aparece ou expirou</b></summary>

```bash
rm -rf data/auth && npm start
```
</details>

<details>
<summary><b>❓ Bot não consegue adicionar o cliente ao grupo</b></summary>

É a configuração de privacidade do cliente. O bot já trata isso sozinho:
envia o **link de convite no privado** da pessoa automaticamente.
</details>

<details>
<summary><b>❓ Bot não adiciona/remove ninguém nos grupos do pool</b></summary>

O bot precisa ser **admin** em cada grupo registrado com `!pool add`.
Nos grupos que ele mesmo cria, isso já é automático.
</details>

<details>
<summary><b>❓ Cliente respondeu o número e nada aconteceu</b></summary>

Verifique se o painel foi enviado com `!painel` **no grupo certo** (isso registra
o grupo de vendas) e se existem opções cadastradas (`!opcoes`).
</details>

<details>
<summary><b>❓ Bot parou de responder</b></summary>

O launcher reinicia sozinho na maioria dos casos. Se persistir:

```bash
npm start
```
</details>

---

## 🧱 Estrutura do projeto

```
whatsapp-ticket-bot/
│
├── 📄 index.js              # Núcleo: conexão, eventos, abertura de tickets
├── 📄 launcher.js           # Inicializador com keep-alive e trava de instância
├── 📄 config.js             # Configurações gerais
│
├── 📂 core/
│   ├── commandHandler.js    # Carrega e processa comandos
│   ├── database.js          # Banco SQLite (opções, tickets, pool, staff)
│   ├── menu.js              # Monta o painel e interpreta a resposta numerada
│   ├── ticketManager.js     # Abre/fecha tickets e gerencia o pool
│   └── utils.js             # Funções utilitárias
│
├── 📂 commands/             # Um arquivo por comando
│   ├── painel.js
│   ├── fechar.js
│   ├── addopcao.js
│   └── ...
│
└── 📂 data/                 # Sessão, banco e imagem do painel (criado ao rodar)
```

---

## 📦 Dependências

<div align="center">

| Pacote | Uso |
|:--|:--|
| [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys) | Conexão com WhatsApp Web |
| [`pino`](https://getpino.io) | Logger |
| [`qrcode-terminal`](https://github.com/gtanner/qrcode-terminal) | QR Code no terminal |
| [`sql.js`](https://github.com/sql-js/sql.js) | Banco de dados local (grátis, sem servidor) |

</div>

---

## 📝 Licença

Distribuído sob a licença **MIT** — use, modifique e distribua à vontade.

---

<div align="center">

Feito com 🧡 por **[Leo-Shiba](https://github.com/Leo-Shiba)**

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Leo--Shiba-1a1a1a?style=for-the-badge&logo=github&logoColor=FF6B00)](https://github.com/Leo-Shiba)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:CC4500,100:FF8C00&height=120&section=footer" width="100%"/>

</div>
