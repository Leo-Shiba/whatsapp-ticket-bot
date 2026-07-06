// Autoria Leo-Shiba GitHub
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { reagir, extrairTexto } = require('./utils');

const comandos = new Map();
const _adminCache = new Map();
const ADMB_TTL = 60_000;

function invalidarCacheAdmin(j) { _adminCache.delete(j); }
setInterval(() => {
  const limite = Date.now() - ADMB_TTL;
  for (const [k, v] of _adminCache) {
    if (v.ts < limite) _adminCache.delete(k);
  }
}, ADMB_TTL);

async function getAdmins(sock, jid) {
  const cache = _adminCache.get(jid);
  if (cache && Date.now() - cache.ts < ADMB_TTL) return cache.admins;
  const meta = await sock.groupMetadata(jid).catch(() => null);
  const admins = meta?.participants.filter(p => p.admin).map(p => p.id) || [];
  _adminCache.set(jid, { admins, ts: Date.now() });
  return admins;
}

function carregarComandos() {
  comandos.clear();
  const dir = path.join(__dirname, '..', 'commands');
  for (const arquivo of fs.readdirSync(dir)) {
    if (!arquivo.endsWith('.js') || arquivo.startsWith('_')) continue;
    delete require.cache[require.resolve(path.join(dir, arquivo))];
    const cmd = require(path.join(dir, arquivo));
    if (!cmd?.nome || typeof cmd.executar !== 'function') continue;
    comandos.set(cmd.nome.toLowerCase(), cmd);
    for (const alias of cmd.aliases || []) comandos.set(alias.toLowerCase(), cmd);
  }
}

function listar() { return [...new Set(comandos.values())]; }

async function tratarComando({ sock, msg, db }) {
  const jid = msg.key.remoteJid;
  const isGroup = jid?.endsWith('@g.us');
  const texto = extrairTexto(msg);
  if (!texto.startsWith(config.prefixo)) return false;

  const partes = texto.slice(config.prefixo.length).trim().split(/\s+/);
  const nome = partes.shift()?.toLowerCase();
  const args = partes;
  const textoArgs = texto.slice(config.prefixo.length).replace(/^\S+/, '').replace(/^\s/, '');
  const cmd = comandos.get(nome);
  const autor = msg.key.participant || msg.key.remoteJid;
  if (!cmd) return false;

  if (!isGroup && !cmd.permitirPV) return true;

  let temPermissao = true;
  if (cmd.apenasAdmin && isGroup) {
    const admins = await getAdmins(sock, jid);
    temPermissao = admins.includes(autor);
  }
  if (!temPermissao) { await reagir(sock, msg, '❌'); return true; }

  try {
    await cmd.executar({ sock, msg, jid, autor, isGroup, args, textoArgs, db, nomeCmd: nome, comandos: listar });
  } catch (err) {
    await sock.sendMessage(jid, { text: '❌ Erro: ' + err.message }).catch(() => {});
  }
  return true;
}

module.exports = { carregarComandos, tratarComando, listar, invalidarCacheAdmin, getAdmins };
