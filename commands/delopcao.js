// Autoria Leo-Shiba GitHub
module.exports = {
  nome: 'delopcao',
  aliases: ['delmenu'],
  descricao: 'Remove uma opção do painel pelo número: !delopcao 2',
  apenasAdmin: true,
  async executar({ sock, jid, args, db }) {
    const pos = parseInt(args[0], 10);
    if (!pos) {
      await sock.sendMessage(jid, { text: '⚙️ Uso: *!delopcao <número>* — veja os números com !opcoes' });
      return;
    }
    const removida = db.delOpcaoPorPosicao(pos);
    if (!removida) {
      await sock.sendMessage(jid, { text: `❌ Opção nº ${pos} não existe.` });
      return;
    }
    await sock.sendMessage(jid, { text: `✅ Opção *${removida.nome}* removida. Use *!painel* para reenviar o menu.` });
  },
};
