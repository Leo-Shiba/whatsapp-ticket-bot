// Autoria Leo-Shiba GitHub
const CAMPOS = { titulo: 'painel_titulo', descricao: 'painel_descricao', rodape: 'painel_rodape' };

module.exports = {
  nome: 'setpainel',
  descricao: 'Edita o painel: !setpainel titulo <texto> | descricao <texto> | rodape <texto>',
  apenasDono: true,
  apenasPV: true,
  async executar({ sock, jid, args, textoArgs, db }) {
    const campo = args[0]?.toLowerCase();
    const valor = textoArgs.replace(/^\S+\s*/, '').trim();
    if (!CAMPOS[campo] || !valor) {
      await sock.sendMessage(jid, { text: '⚙️ Uso: *!setpainel titulo|descricao|rodape <texto>*' });
      return;
    }
    db.setConfig(CAMPOS[campo], valor);
    await sock.sendMessage(jid, { text: `✅ ${campo} do painel atualizado! Use *!painel* para reenviar.` });
  },
};
