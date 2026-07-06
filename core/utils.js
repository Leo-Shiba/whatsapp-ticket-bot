// Autoria Leo-Shiba GitHub
function extrairMencionado(msg) {
  const mencoes = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mencoes.length) return mencoes[0];
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (quoted) return quoted;
  return null;
}

function jidParaNumero(jid) { return jid.split('@')[0].replace(/[.:]\d+$/, ''); }

function formatarHora(ts) { return new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Belem' }); }

async function reagir(sock, msg, emoji) {
  await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }).catch(() => {});
}

function extrairTexto(msg) {
  return msg.message?.conversation ||
         msg.message?.extendedTextMessage?.text ||
         msg.message?.imageMessage?.caption ||
         msg.message?.videoMessage?.caption ||
         msg.message?.documentMessage?.caption || '';
}

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
function numeroEmoji(n) { return EMOJIS[n - 1] || `*${n}.*`; }

module.exports = { extrairMencionado, jidParaNumero, formatarHora, reagir, extrairTexto, numeroEmoji };
