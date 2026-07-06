// Autoria Leo-Shiba GitHub
module.exports = {
  nome: 'ping',
  descricao: 'Verifica se o bot está online',
  permitirPV: true,
  async executar({ sock, jid }) {
    const inicio = Date.now();
    await sock.sendMessage(jid, { text: `🏓 Pong! ${Date.now() - inicio}ms` });
  },
};
