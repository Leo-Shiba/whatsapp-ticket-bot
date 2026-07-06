// Autoria Leo-Shiba GitHub
const menu = require('../core/menu');

module.exports = {
  nome: 'painel',
  aliases: ['menu', 'ticket'],
  descricao: 'Envia o painel de tickets neste grupo (define este grupo como grupo de vendas)',
  apenasDono: true,
  async executar({ sock, jid, isGroup, db }) {
    if (!isGroup) {
      await sock.sendMessage(jid, { text: '⚙️ Use *!painel* dentro do grupo de vendas — é ele que fica registrado como grupo do painel.' });
      return;
    }
    await menu.enviarPainel(sock, jid, db);
  },
};
