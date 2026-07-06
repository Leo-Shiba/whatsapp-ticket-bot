// Autoria Leo-Shiba GitHub
// Monta e envia o painel de atendimento (o "embed" do WhatsApp):
// imagem + legenda formatada com opções numeradas.
const fs = require('fs');
const path = require('path');
const { numeroEmoji } = require('./utils');

const imagemPath = path.join(__dirname, '../data/painel.jpg');

function montarLegenda(db) {
  const titulo = db.getConfig('painel_titulo') || '🎫 CENTRAL DE ATENDIMENTO';
  const descricao = db.getConfig('painel_descricao') || 'Escolha uma opção abaixo para abrir seu ticket:';
  const rodape = db.getConfig('painel_rodape') || '_Responda esta mensagem com o número da opção desejada._';
  const opcoes = db.listarOpcoes();

  let legenda = `*${titulo}*\n\n${descricao}\n\n`;
  if (!opcoes.length) {
    legenda += '_Nenhuma opção configurada ainda. Use !addopcao para adicionar._\n';
  } else {
    for (let i = 0; i < opcoes.length; i++) {
      legenda += `${numeroEmoji(i + 1)} - *${opcoes[i].nome}*`;
      if (opcoes[i].descricao) legenda += `\n      ${opcoes[i].descricao}`;
      legenda += '\n';
    }
  }
  legenda += `\n${rodape}`;
  return legenda;
}

async function enviarPainel(sock, jid, db) {
  const legenda = montarLegenda(db);
  let enviada;
  if (fs.existsSync(imagemPath)) {
    enviada = await sock.sendMessage(jid, { image: fs.readFileSync(imagemPath), caption: legenda });
  } else {
    enviada = await sock.sendMessage(jid, { text: legenda });
  }
  // Guarda onde e qual mensagem é o painel, para reconhecer as respostas
  db.setConfig('grupo_vendas', jid);
  if (enviada?.key?.id) db.setConfig('painel_msgid', enviada.key.id);
  return enviada;
}

// Verifica se a mensagem é uma escolha de opção do painel.
// Aceita: número puro no grupo do painel, OU resposta (reply) à mensagem do painel com um número.
function extrairEscolha(msg, texto, db) {
  const jid = msg.key.remoteJid;
  const grupoVendas = db.getConfig('grupo_vendas');
  if (!grupoVendas || jid !== grupoVendas) return null;

  const numero = texto.trim().match(/^(\d{1,2})$/)?.[1];
  if (!numero) return null;

  const pos = parseInt(numero, 10);
  const opcao = db.getOpcaoPorPosicao(pos);
  if (!opcao) return null;

  const respondendoA = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
  const painelMsgId = db.getConfig('painel_msgid');
  const ehReplyAoPainel = respondendoA && painelMsgId && respondendoA === painelMsgId;

  // Número puro sempre vale no grupo do painel; reply ao painel também
  if (ehReplyAoPainel || !respondendoA) return opcao;
  return null;
}

module.exports = { montarLegenda, enviarPainel, extrairEscolha, imagemPath };
