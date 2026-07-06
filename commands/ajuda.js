// Autoria Leo-Shiba GitHub
const config = require('../config');

module.exports = {
  nome: 'ajuda',
  aliases: ['help', 'comandos'],
  descricao: 'Lista os comandos disponíveis',
  async executar({ sock, jid, comandos }) {
    let texto = '🤖 *TICKET BOT — Comandos:*\n\n';
    for (const cmd of comandos()) {
      texto += `*${config.prefixo}${cmd.nome}*${cmd.apenasAdmin ? ' 👑' : ''}\n_${cmd.descricao}_\n\n`;
    }
    texto += '👑 = apenas admins do grupo';
    await sock.sendMessage(jid, { text: texto });
  },
};
