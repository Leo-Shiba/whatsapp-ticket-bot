// Autoria Leo-Shiba GitHub
// Identidade do dono do bot, à prova de LID.
// O WhatsApp migrou usuários para LIDs (@lid) — o mesmo usuário pode aparecer
// como 123@lid numa mensagem e 5511999@s.whatsapp.net em outra. Em vez de
// pedir o número (que pode nunca bater com o LID), o dono se registra uma
// única vez com um código secreto (!dono <código> no PV), e aqui guardamos
// TODAS as identidades que vierem na mensagem dele (lid + número).
const crypto = require('crypto');

function normalizarJid(jid) {
  if (!jid) return null;
  return jid.replace(/:\d+(?=@)/, ''); // remove sufixo de dispositivo (ex: :12)
}

// Todas as identidades possíveis do remetente de uma mensagem
function identidadesDoRemetente(msg) {
  const k = msg.key || {};
  const ehGrupo = k.remoteJid?.endsWith('@g.us');
  const brutas = [
    k.participant, k.participantPn, k.participantLid,
    k.senderPn, k.senderLid,
    ehGrupo ? null : k.remoteJid,
  ];
  const set = new Set();
  for (const j of brutas) {
    const n = normalizarJid(j);
    if (n && n.includes('@')) set.add(n);
  }
  return [...set];
}

function getDonoJids(db) {
  try { return JSON.parse(db.getConfig('dono_jids') || '[]'); }
  catch { return []; }
}

function temDono(db) { return getDonoJids(db).length > 0; }

function ehDono(msg, db) {
  const dono = getDonoJids(db);
  if (!dono.length) return false;
  return identidadesDoRemetente(msg).some(j => dono.includes(j));
}

// Registra (ou atualiza) o dono com todas as identidades da mensagem atual.
// Retorna as identidades salvas.
function registrarDono(msg, db) {
  const atuais = new Set(getDonoJids(db));
  for (const j of identidadesDoRemetente(msg)) atuais.add(j);
  const lista = [...atuais];
  db.setConfig('dono_jids', JSON.stringify(lista));
  return lista;
}

// Código de vínculo: gerado no primeiro boot, impresso nos logs.
function getOuCriarCodigo(db) {
  let codigo = db.getConfig('codigo_dono');
  if (!codigo) {
    codigo = crypto.randomBytes(4).toString('hex').toUpperCase(); // ex: 3F9A1C7B
    db.setConfig('codigo_dono', codigo);
  }
  return codigo;
}

function validarCodigo(db, tentativa) {
  const codigo = db.getConfig('codigo_dono');
  if (!codigo || !tentativa) return false;
  const a = Buffer.from(String(tentativa).trim().toUpperCase());
  const b = Buffer.from(codigo);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { normalizarJid, identidadesDoRemetente, getDonoJids, temDono, ehDono, registrarDono, getOuCriarCodigo, validarCodigo };
