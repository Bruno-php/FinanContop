import * as SQLite from "expo-sqlite";

// Conexão com o banco local
export const db = SQLite.openDatabaseSync("financontop.db");

// Inicialização da Tabela 'despesas'
export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS despesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      valor REAL NOT NULL,
      categoria TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL
    );
  `);
}
