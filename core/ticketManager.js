// Autoria Leo-Shiba GitHub
// Abertura e fechamento de tickets usando o pool de grupos.
// Fluxo: pega grupo livre do pool → se não houver, cria um novo via groupCreate
// → adiciona o cliente (ou manda convite no PV se a privacidade bloquear).
const config = require('../config');
const { jidParaNumero, formatarHora } = require('./utils');

let _abrindo = false; // trava simples contra duas aberturas simultâneas pegarem o mesmo grupo

async function garantirGrupo(sock, db) {
  const livre = db.getGrupoLivre();
  if (livre) return { jid: livre.jid, nome: livre.nome, criado: false };

  // Pool lotado — cria um grupo novo com os atendentes
  const num = db.contarPool() + 1;
  const nome = `🎫 Ticket-${String(num).padStart(config.padTicket, '0')}`;
  const staff = db.listarStaff().map(s => s.jid);
  const meta = await sock.groupCreate(nome, staff);
  db.addPoolGrupo(meta.id, nome);

  // Promove os atendentes a admin para poderem gerenciar o ticket
  if (staff.length) {
    await sock.groupParticipantsUpdate(meta.id, staff, 'promote').catch(() => {});
  }
  return { jid: meta.id, nome, criado: true };
}

async function abrirTicket({ sock, db, cliente, opcao }) {
  const jaAberto = db.getTicketAbertoPorCliente(cliente);
  if (jaAberto) return { erro: 'ja_aberto', ticket: jaAberto };

  if (_abrindo) return { erro: 'ocupado' };
  _abrindo = true;
  try {
    const grupo = await garantirGrupo(sock, db);
    db.setOcupado(grupo.jid, 1);
    const ticketId = db.criarTicket(cliente, grupo.jid, opcao.nome);
    const numCliente = jidParaNumero(cliente);

    // Tenta adicionar o cliente direto; se a privacidade dele bloquear, manda o convite no PV
    let convite = null;
    let adicionado = false;
    try {
      const res = await sock.groupParticipantsUpdate(grupo.jid, [cliente], 'add');
      adicionado = String(res?.[0]?.status) === '200';
    } catch {}

    if (!adicionado) {
      try {
        const code = await sock.groupInviteCode(grupo.jid);
        convite = `https://chat.whatsapp.com/${code}`;
      } catch {}
    }

    // Avisa o cliente no PV
    let textoPV = `🎫 *Seu ticket #${ticketId} foi aberto!*\n📂 Categoria: *${opcao.nome}*\n\n`;
    textoPV += adicionado
      ? 'Você foi adicionado ao grupo de atendimento. Nossa equipe já vai te responder por lá!'
      : (convite
          ? `Não consegui te adicionar automaticamente (configuração de privacidade). Entre no grupo de atendimento por este link:\n${convite}`
          : 'Nossa equipe entrará em contato em breve.');
    await sock.sendMessage(cliente, { text: textoPV }).catch(() => {});

    // Mensagem de abertura no grupo do ticket
    const staff = db.listarStaff().map(s => s.jid);
    await sock.sendMessage(grupo.jid, {
      text: `🎫 *TICKET #${ticketId} ABERTO*\n\n` +
            `📂 Categoria: *${opcao.nome}*\n` +
            `👤 Cliente: @${numCliente}\n` +
            `🕐 Aberto em: ${formatarHora(Date.now())}\n\n` +
            `Equipe, alguém assume este atendimento?\n_Use !fechar quando o atendimento terminar._`,
      mentions: [cliente, ...staff],
    }).catch(() => {});

    return { ticketId, grupo, adicionado, convite };
  } finally {
    _abrindo = false;
  }
}

async function fecharTicket({ sock, db, jidGrupo }) {
  const ticket = db.getTicketAbertoPorGrupo(jidGrupo);
  if (!ticket) return { erro: 'sem_ticket' };

  db.fecharTicket(ticket.id);

  // Remove o cliente do grupo e devolve o grupo ao pool
  await sock.groupParticipantsUpdate(jidGrupo, [ticket.jid_cliente], 'remove').catch(() => {});
  db.setOcupado(jidGrupo, 0);

  await sock.sendMessage(jidGrupo, {
    text: `✅ *Ticket #${ticket.id} fechado.*\nGrupo liberado para o próximo atendimento.`,
  }).catch(() => {});

  // Avisa o cliente
  await sock.sendMessage(ticket.jid_cliente, {
    text: `✅ Seu ticket *#${ticket.id}* (${ticket.opcao}) foi encerrado.\nObrigado pelo contato! Se precisar, abra um novo ticket no grupo.`,
  }).catch(() => {});

  return { ticket };
}

module.exports = { abrirTicket, fecharTicket };
