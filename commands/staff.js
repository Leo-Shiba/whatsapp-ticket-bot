// Autoria Leo-Shiba GitHub
const { extrairMencionado, jidParaNumero } = require('../core/utils');

module.exports = {
  nome: 'staff',
  aliases: ['atendentes'],
  descricao: 'Gerencia atendentes: !staff (lista) | !staff add <número> | !staff remover <número>',
  apenasDono: true,
  apenasPV: true,
  async executar({ sock, msg, jid, args, db }) {
    const acao = args[0]?.toLowerCase();

    if (acao === 'add' || acao === 'remover' || acao === 'del') {
      // No PV não existe menção — aceita o número digitado (com DDI)
      let alvo = extrairMencionado(msg);
      if (!alvo) {
        const numero = (args[1] || '').replace(/\D/g, '');
        if (numero.length >= 10) alvo = `${numero}@s.whatsapp.net`;
      }
      if (!alvo) {
        await sock.sendMessage(jid, { text: '⚙️ Informe o número com DDI: *!staff add 5511999999999*' });
        return;
      }
      if (acao === 'add') {
        db.addStaff(alvo);
        await sock.sendMessage(jid, { text: `✅ @${jidParaNumero(alvo)} agora é atendente — será adicionado aos grupos de ticket criados.`, mentions: [alvo] });
      } else {
        db.delStaff(alvo);
        await sock.sendMessage(jid, { text: `✅ @${jidParaNumero(alvo)} removido da equipe de atendimento.`, mentions: [alvo] });
      }
      return;
    }

    const staff = db.listarStaff();
    if (!staff.length) {
      await sock.sendMessage(jid, { text: '📭 Nenhum atendente cadastrado. Use *!staff add 5511999999999*.' });
      return;
    }
    let texto = `👥 *Atendentes (${staff.length}):*\n\n`;
    const mentions = staff.map(s => s.jid);
    for (const s of staff) texto += `• @${jidParaNumero(s.jid)}\n`;
    await sock.sendMessage(jid, { text: texto, mentions });
  },
};
