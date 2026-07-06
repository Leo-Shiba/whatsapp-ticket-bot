// Autoria Leo-Shiba GitHub
const { numeroEmoji } = require('../core/utils');

module.exports = {
  nome: 'opcoes',
  aliases: ['listaropcoes'],
  descricao: 'Lista as opções configuradas no painel',
  apenasDono: true,
  apenasPV: true,
  async executar({ sock, jid, db }) {
    const opcoes = db.listarOpcoes();
    if (!opcoes.length) {
      await sock.sendMessage(jid, { text: '📭 Nenhuma opção configurada. Use *!addopcao Nome | Descrição*.' });
      return;
    }
    let texto = '📋 *Opções do painel:*\n\n';
    opcoes.forEach((o, i) => {
      texto += `${numeroEmoji(i + 1)} *${o.nome}*${o.descricao ? ` — ${o.descricao}` : ''}\n`;
    });
    await sock.sendMessage(jid, { text: texto });
  },
};
