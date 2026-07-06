// Autoria Leo-Shiba GitHub
const menu = require('../core/menu');

module.exports = {
  nome: 'painel',
  aliases: ['menu', 'ticket'],
  descricao: 'Envia o painel de tickets neste grupo (define este grupo como grupo de vendas)',
  apenasAdmin: true,
  async executar({ sock, jid, db }) {
    await menu.enviarPainel(sock, jid, db);
  },
};
