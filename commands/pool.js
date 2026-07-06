// Autoria Leo-Shiba GitHub
module.exports = {
  nome: 'pool',
  descricao: 'Gerencia o pool de grupos de ticket: !pool (lista) | !pool add (registra o grupo atual) | !pool remover',
  apenasAdmin: true,
  async executar({ sock, jid, args, db }) {
    const acao = args[0]?.toLowerCase();

    if (acao === 'add') {
      const meta = await sock.groupMetadata(jid).catch(() => null);
      db.addPoolGrupo(jid, meta?.subject || jid);
      await sock.sendMessage(jid, { text: `✅ Grupo *${meta?.subject || jid}* registrado no pool de tickets.\n⚠️ Lembre de me deixar como *admin* aqui para eu poder adicionar/remover clientes.` });
      return;
    }

    if (acao === 'remover' || acao === 'del') {
      if (!db.getPoolGrupo(jid)) {
        await sock.sendMessage(jid, { text: '❌ Este grupo não está no pool.' });
        return;
      }
      db.delPoolGrupo(jid);
      await sock.sendMessage(jid, { text: '✅ Grupo removido do pool de tickets.' });
      return;
    }

    const pool = db.listarPool();
    if (!pool.length) {
      await sock.sendMessage(jid, { text: '📭 Pool vazio. Entre em cada grupo de ticket e use *!pool add* — ou deixe que eu crie grupos automaticamente quando o primeiro ticket abrir.' });
      return;
    }
    let texto = `🗂️ *Pool de grupos de ticket (${pool.length}):*\n\n`;
    for (const g of pool) {
      texto += `${g.ocupado ? '🔴 Ocupado' : '🟢 Livre'} — ${g.nome}\n`;
    }
    await sock.sendMessage(jid, { text: texto });
  },
};
