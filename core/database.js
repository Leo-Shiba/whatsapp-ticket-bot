// Autoria Leo-Shiba GitHub
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'bot.db');

let SQL, db;

function init() {
  return require('sql.js')().then(SqlJs => {
    SQL = SqlJs;
    if (fs.existsSync(dbPath)) {
      db = new SQL.Database(fs.readFileSync(dbPath));
    } else {
      db = new SQL.Database();
    }
    db.run(`
      CREATE TABLE IF NOT EXISTS config (
        chave TEXT PRIMARY KEY,
        valor TEXT
      );
      CREATE TABLE IF NOT EXISTS opcoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS pool_grupos (
        jid TEXT PRIMARY KEY,
        nome TEXT DEFAULT '',
        ocupado INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jid_cliente TEXT NOT NULL,
        jid_grupo TEXT NOT NULL,
        opcao TEXT NOT NULL,
        status TEXT DEFAULT 'aberto',
        aberto_em INTEGER NOT NULL,
        fechado_em INTEGER
      );
      CREATE TABLE IF NOT EXISTS staff (
        jid TEXT PRIMARY KEY
      );
    `);
    save();
  });
}

function save() {
  if (!db) return;
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function run(sql, params = []) { db.run(sql, params); save(); }

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : undefined;
  stmt.free();
  return row;
}

function all(sql, params = []) {
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

// ---------- Config (chave/valor) ----------
function getConfig(chave) {
  const row = get('SELECT valor FROM config WHERE chave = ?', [chave]);
  return row ? row.valor : null;
}
function setConfig(chave, valor) {
  run('INSERT INTO config (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor', [chave, valor]);
}

// ---------- Opções do painel ----------
function listarOpcoes() { return all('SELECT * FROM opcoes ORDER BY id'); }
function addOpcao(nome, descricao = '') { run('INSERT INTO opcoes (nome, descricao) VALUES (?, ?)', [nome, descricao]); }
function delOpcaoPorPosicao(pos) {
  const opcoes = listarOpcoes();
  const alvo = opcoes[pos - 1];
  if (!alvo) return null;
  run('DELETE FROM opcoes WHERE id = ?', [alvo.id]);
  return alvo;
}
function getOpcaoPorPosicao(pos) {
  const opcoes = listarOpcoes();
  return opcoes[pos - 1] || null;
}

// ---------- Pool de grupos de ticket ----------
function listarPool() { return all('SELECT * FROM pool_grupos ORDER BY nome'); }
function addPoolGrupo(jid, nome) {
  run('INSERT INTO pool_grupos (jid, nome, ocupado) VALUES (?, ?, 0) ON CONFLICT(jid) DO UPDATE SET nome = excluded.nome', [jid, nome]);
}
function delPoolGrupo(jid) { run('DELETE FROM pool_grupos WHERE jid = ?', [jid]); }
function getGrupoLivre() { return get('SELECT * FROM pool_grupos WHERE ocupado = 0 ORDER BY nome LIMIT 1'); }
function getPoolGrupo(jid) { return get('SELECT * FROM pool_grupos WHERE jid = ?', [jid]); }
function setOcupado(jid, ocupado) { run('UPDATE pool_grupos SET ocupado = ? WHERE jid = ?', [ocupado ? 1 : 0, jid]); }
function contarPool() { return all('SELECT jid FROM pool_grupos').length; }

// ---------- Tickets ----------
function criarTicket(jidCliente, jidGrupo, opcao) {
  run('INSERT INTO tickets (jid_cliente, jid_grupo, opcao, status, aberto_em) VALUES (?, ?, ?, ?, ?)',
    [jidCliente, jidGrupo, opcao, 'aberto', Date.now()]);
  const row = get('SELECT last_insert_rowid() AS id');
  return row.id;
}
function getTicketAbertoPorCliente(jidCliente) {
  return get("SELECT * FROM tickets WHERE jid_cliente = ? AND status = 'aberto'", [jidCliente]);
}
function getTicketAbertoPorGrupo(jidGrupo) {
  return get("SELECT * FROM tickets WHERE jid_grupo = ? AND status = 'aberto'", [jidGrupo]);
}
function listarTicketsAbertos() { return all("SELECT * FROM tickets WHERE status = 'aberto' ORDER BY aberto_em"); }
function fecharTicket(id) {
  run("UPDATE tickets SET status = 'fechado', fechado_em = ? WHERE id = ?", [Date.now(), id]);
}

// ---------- Staff (atendentes) ----------
function listarStaff() { return all('SELECT jid FROM staff'); }
function addStaff(jid) { run('INSERT OR IGNORE INTO staff (jid) VALUES (?)', [jid]); }
function delStaff(jid) { run('DELETE FROM staff WHERE jid = ?', [jid]); }

module.exports = {
  init, run, get, all,
  getConfig, setConfig,
  listarOpcoes, addOpcao, delOpcaoPorPosicao, getOpcaoPorPosicao,
  listarPool, addPoolGrupo, delPoolGrupo, getGrupoLivre, getPoolGrupo, setOcupado, contarPool,
  criarTicket, getTicketAbertoPorCliente, getTicketAbertoPorGrupo, listarTicketsAbertos, fecharTicket,
  listarStaff, addStaff, delStaff,
};
