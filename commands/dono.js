// Autoria Leo-Shiba GitHub
const dono = require('../core/dono');

module.exports = {
  nome: 'dono',
  descricao: 'Registra o dono do bot: !dono <código> (no privado; o código aparece nos logs do bot)',
  permitirPV: true,
  async executar({ sock, msg, jid, isGroup, args, db }) {
    // Nunca processa em grupo — o código é secreto
    if (isGroup) {
      await sock.sendMessage(jid, { text: '🔒 Este comando só funciona no meu *privado*.' });
      return;
    }

    if (dono.ehDono(msg, db)) {
      // Dono mandou de novo (ex: pelo outro aparelho) — atualiza identidades
      const lista = dono.registrarDono(msg, db);
      await sock.sendMessage(jid, { text: `✅ Você já é o dono. Identidades registradas: ${lista.length}.` });
      return;
    }

    if (dono.temDono(db)) {
      await sock.sendMessage(jid, { text: '❌ Este bot já tem dono registrado.' });
      return;
    }

    if (!dono.validarCodigo(db, args[0])) {
      await sock.sendMessage(jid, { text: '❌ Código inválido. O código aparece nos *logs do bot* ao iniciar. Uso: *!dono <código>*' });
      return;
    }

    const lista = dono.registrarDono(msg, db);
    db.setConfig('codigo_dono', ''); // código queimado após o uso
    await sock.sendMessage(jid, {
      text: `👑 *Você agora é o dono do bot!*\n\nIdentidades registradas: ${lista.length} (número + LID).\nOs comandos de configuração só funcionam aqui no privado, apenas para você.\n\nUse *!ajuda* para ver os comandos.`,
    });
    console.log(`[dono] Dono registrado com ${lista.length} identidade(s).`);
  },
};
