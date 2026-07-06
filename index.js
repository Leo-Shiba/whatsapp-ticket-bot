// Autoria Leo-Shiba GitHub
const RUIDO = ["Bad MAC", "Failed to decrypt", "Closing session", "MessageCounterError"];
function filtrarStream(stream) {
  const original = stream.write.bind(stream);
  stream.write = (chunk, encoding, cb) => {
    if (RUIDO.some(r => String(chunk).includes(r))) {
      if (typeof encoding === "function") encoding();
      else if (typeof cb === "function") cb();
      return true;
    }
    return original(chunk, encoding, cb);
  };
}
filtrarStream(process.stdout);
filtrarStream(process.stderr);

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const qrTerminal = require("qrcode-terminal");
const fs = require("fs");
const pino = require("pino");
const db = require("./core/database");
const handler = require("./core/commandHandler");
const menu = require("./core/menu");
const tickets = require("./core/ticketManager");
const { extrairTexto } = require("./core/utils");

async function salvarQR(qrData) {
  qrTerminal.generate(qrData, { small: true });
  console.log("[QR] Escaneie o código acima no WhatsApp → Aparelhos conectados → Conectar aparelho");
  try {
    const png = await QRCode.toBuffer(qrData, { type: "png", width: 512, margin: 2 });
    fs.writeFileSync("./data/qrcode.png", png);
  } catch (e) { console.error("[QR]", e.message); }
}

let _dbIniciado = false;
let _iniciando = false;
let _timerReconexao = null;
let _baileysVersion = null;
let _falhas428 = 0;
let _falhas440 = 0;

function agendarReconexao(ms) {
  if (_timerReconexao) return;
  _timerReconexao = setTimeout(() => { _timerReconexao = null; iniciar(); }, ms);
}

async function iniciar() {
  if (_iniciando) return;
  _iniciando = true;

  try {
    if (!_dbIniciado) {
      await db.init();
      _dbIniciado = true;
      handler.carregarComandos();
    }

    const { state, saveCreds } = await useMultiFileAuthState("./data/auth");

    if (!_baileysVersion) {
      const { version } = await fetchLatestBaileysVersion();
      _baileysVersion = version;
    }

    const sock = makeWASocket({
      version: _baileysVersion,
      auth: state,
      logger: pino({ level: "silent" }),
      keepAliveIntervalMs: 25_000,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) await salvarQR(qr);

      if (connection === "open") {
        _iniciando = false;
        _falhas428 = 0;
        _falhas440 = 0;
        console.log("Conectado ao WhatsApp!");
      }

      if (connection === "close") {
        _iniciando = false;
        const code = lastDisconnect?.error?.output?.statusCode;
        const errMsg = lastDisconnect?.error?.message || "";
        console.log("[conexao] Fechada:", code, errMsg);

        if (code === DisconnectReason.connectionReplaced || code === 440) {
          _falhas440++;
          if (_falhas440 >= 3) {
            console.log("[conexao] 3 conflitos 440 seguidos — possível sessão duplicada. Encerrando para evitar bloqueio.");
            process.exit(0);
          }
          const espera440 = 30_000 * _falhas440;
          console.log(`[conexao] Conflito (440, tentativa ${_falhas440}/3) — aguardando ${espera440 / 1000}s...`);
          agendarReconexao(espera440);
        } else if (code === 428) {
          _falhas428++;
          const espera = Math.min(30_000 * _falhas428, 300_000);
          console.log(`[conexao] Servidor encerrou (428, tentativa ${_falhas428}) — aguardando ${espera / 1000}s...`);
          agendarReconexao(espera);
        } else if ([DisconnectReason.loggedOut, 403].includes(code)) {
          console.log("[conexao] Deslogado — delete data/auth e reinicie.");
        } else {
          console.log("[conexao] Reconectando em 5s...");
          agendarReconexao(5_000);
        }
      }
    });

    sock.ev.on("group-participants.update", ({ id }) => {
      handler.invalidarCacheAdmin(id);
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        try {
          // 1) Comandos (!painel, !fechar, !addopcao...)
          const foiComando = await handler.tratarComando({ sock, msg, db });
          if (foiComando) continue;

          // 2) Resposta numerada ao painel → abre ticket
          const texto = extrairTexto(msg);
          const opcao = menu.extrairEscolha(msg, texto, db);
          if (opcao) {
            const cliente = msg.key.participant || msg.key.remoteJid;
            const r = await tickets.abrirTicket({ sock, db, cliente, opcao });

            if (r.erro === 'ja_aberto') {
              await sock.sendMessage(msg.key.remoteJid, {
                text: `⚠️ Você já tem o ticket *#${r.ticket.id}* aberto. Finalize-o antes de abrir outro.`,
              }, { quoted: msg }).catch(() => {});
            } else if (r.erro === 'ocupado') {
              await sock.sendMessage(msg.key.remoteJid, {
                text: '⏳ Estou abrindo outro ticket agora, tente novamente em alguns segundos.',
              }, { quoted: msg }).catch(() => {});
            } else {
              await sock.sendMessage(msg.key.remoteJid, {
                text: `🎫 Ticket *#${r.ticketId}* (${opcao.nome}) aberto! Verifique seu privado. 📩`,
              }, { quoted: msg }).catch(() => {});
            }
          }
        } catch (e) {
          console.error("[mensagem]", e);
        }
      }
    });

  } catch (e) {
    console.error("[iniciar] Erro:", e.message);
    _iniciando = false;
    agendarReconexao(10_000);
  }
}

iniciar();
