// Autoria Leo-Shiba GitHub
const { jidParaNumero, formatarHora } = require('../core/utils');

module.exports = {
  nome: 'tickets',
  descricao: 'Lista os tickets abertos',
  apenasDono: true,
  apenasPV: true,
  async executar({ sock, jid, db }) {
    const abertos = db.listarTicketsAbertos();
    if (!abertos.length) {
      await sock.sendMessage(jid, { text: '📭 Nenhum ticket aberto no momento.' });
      return;
    }
    let texto = `🎫 *Tickets abertos (${abertos.length}):*\n\n`;
    for (const t of abertos) {
      const grupo = db.getPoolGrupo(t.jid_grupo);
      texto += `*#${t.id}* — ${t.opcao}\n👤 +${jidParaNumero(t.jid_cliente)}\n🗂️ ${grupo?.nome || t.jid_grupo}\n🕐 ${formatarHora(t.aberto_em)}\n\n`;
    }
    await sock.sendMessage(jid, { text: texto });
  },
};
