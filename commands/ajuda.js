// Autoria Leo-Shiba GitHub
const config = require('../config');

module.exports = {
  nome: 'ajuda',
  aliases: ['help', 'comandos'],
  descricao: 'Lista os comandos disponíveis',
  async executar({ sock, jid, comandos }) {
    let texto = '🤖 *TICKET BOT — Comandos:*\n\n';
    for (const cmd of comandos()) {
      const tag = cmd.apenasDono ? ' 👑' : (cmd.apenasAdmin ? ' 🛡️' : '');
      texto += `*${config.prefixo}${cmd.nome}*${tag}\n_${cmd.descricao}_\n\n`;
    }
    texto += '👑 = apenas o dono do bot · 🛡️ = admins do grupo';
    await sock.sendMessage(jid, { text: texto });
  },
};
