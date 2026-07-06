// Autoria Leo-Shiba GitHub
const fs = require('fs');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { imagemPath } = require('../core/menu');

module.exports = {
  nome: 'setimagem',
  descricao: 'Define a imagem do painel — responda a uma imagem com !setimagem',
  apenasAdmin: true,
  async executar({ sock, msg, jid }) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const ehImagemDireta = !!msg.message?.imageMessage;

    if (!ehImagemDireta && !quoted?.imageMessage) {
      await sock.sendMessage(jid, { text: '🖼️ Responda a uma *imagem* com !setimagem (ou envie a imagem com !setimagem na legenda).' });
      return;
    }

    const alvo = ehImagemDireta
      ? msg
      : { key: { remoteJid: jid, id: ctx.stanzaId, participant: ctx.participant }, message: quoted };

    const buffer = await downloadMediaMessage(alvo, 'buffer', {}, {
      reuploadRequest: sock.updateMediaMessage,
    });
    fs.writeFileSync(imagemPath, buffer);
    await sock.sendMessage(jid, { text: '✅ Imagem do painel salva! Use *!painel* para reenviar.' });
  },
};
