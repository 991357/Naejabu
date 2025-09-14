
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new Database(dbPath);

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  english_name TEXT,
  hanja_name TEXT,
  birthdate TEXT,
  hobby TEXT,
  specialty TEXT,
  motto TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

const createResumesTable = `
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  deadline TEXT NOT NULL,
  deleted INTEGER DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
`;

const createResumeQuestionsTable = `
CREATE TABLE IF NOT EXISTS resume_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resume_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
);
`;

const createEmailVerificationsTable = `
CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
`;

db.exec(createUsersTable);
db.exec(createResumesTable);
db.exec(createResumeQuestionsTable);
db.exec(createEmailVerificationsTable);

console.log('Database initialized successfully.');

db.close();
