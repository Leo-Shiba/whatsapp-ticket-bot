// Autoria Leo-Shiba GitHub
const tickets = require('../core/ticketManager');

module.exports = {
  nome: 'fechar',
  aliases: ['encerrar', 'close'],
  descricao: 'Fecha o ticket deste grupo e o devolve ao pool',
  apenasAdmin: true,
  async executar({ sock, jid, db }) {
    const r = await tickets.fecharTicket({ sock, db, jidGrupo: jid });
    if (r.erro === 'sem_ticket') {
      await sock.sendMessage(jid, { text: '❌ Não há ticket aberto neste grupo.' });
    }
  },
};
