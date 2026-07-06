// Autoria Leo-Shiba GitHub
module.exports = {
  nome: 'addopcao',
  aliases: ['addmenu'],
  descricao: 'Adiciona uma opção ao painel: !addopcao Nome | Descrição opcional',
  apenasAdmin: true,
  async executar({ sock, jid, textoArgs, db }) {
    const [nome, descricao = ''] = textoArgs.split('|').map(s => s.trim());
    if (!nome) {
      await sock.sendMessage(jid, { text: '⚙️ Uso: *!addopcao Nome | Descrição opcional*\nEx: !addopcao Suporte | Problemas com pedidos' });
      return;
    }
    db.addOpcao(nome, descricao);
    const total = db.listarOpcoes().length;
    await sock.sendMessage(jid, { text: `✅ Opção *${nome}* adicionada (nº ${total}). Use *!painel* para reenviar o menu.` });
  },
};
