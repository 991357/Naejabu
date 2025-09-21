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
  nickname TEXT UNIQUE,
  is_admin INTEGER DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'mentee',
  english_name TEXT,
  hanja_name TEXT,
  birthdate TEXT,
  hobby TEXT,
  specialty TEXT,
  motto TEXT,
  is_temp_password INTEGER DEFAULT 0,
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
  char_limit INTEGER NOT NULL DEFAULT 1000,
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

const createPostsTable = `
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- 'inquiry', 'suggestion', 'general' 등
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_pinned INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const createCommentsTable = `
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const createMentorApplicationsTable = `
CREATE TABLE IF NOT EXISTS mentor_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const createMentoringRequestsTable = `
CREATE TABLE IF NOT EXISTS mentoring_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    mentee_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'canceled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const createMentoringFeedbackTable = `
CREATE TABLE IF NOT EXISTS mentoring_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    mentor_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES mentoring_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
`;

db.exec(createUsersTable);
db.exec(createResumesTable);
db.exec(createResumeQuestionsTable);
db.exec(createEmailVerificationsTable);
db.exec(createPostsTable);
db.exec(createCommentsTable);
db.exec(createMentorApplicationsTable);
db.exec(createMentoringRequestsTable);
db.exec(createMentoringFeedbackTable);
db.exec(createNotificationsTable);

// Add columns to users table if they don't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN nickname TEXT");
} catch (e) {
  if (!e.message.includes('duplicate column name')) console.error('DB Schema Alter Error (nickname):', e.message);
}
try {
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nickname ON users (nickname)");
} catch (e) {
    console.error('DB Schema Create Index Error (nickname):', e.message);
}
try {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
} catch (e) {
  if (!e.message.includes('duplicate column name')) console.error('DB Schema Alter Error (is_admin):', e.message);
}
try {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'mentee'");
} catch (e) {
  if (!e.message.includes('duplicate column name')) console.error('DB Schema Alter Error (role):', e.message);
}

try {
  db.exec("ALTER TABLE posts ADD COLUMN is_pinned INTEGER DEFAULT 0");
} catch (e) {
  if (!e.message.includes('duplicate column name')) console.error('DB Schema Alter Error (is_pinned):', e.message);
}

try {
  db.exec("ALTER TABLE resume_questions ADD COLUMN char_limit INTEGER NOT NULL DEFAULT 1000");
} catch (e) {
  if (!e.message.includes('duplicate column name')) console.error('DB Schema Alter Error (char_limit):', e.message);
}

// Grant admin rights and mentor role to the 'admin' user
try {
    db.exec("UPDATE users SET is_admin = 1, role = 'mentor' WHERE email = 'admin'");
} catch (e) {
    console.error('DB Admin Grant Error:', e.message);
}

// Seed initial posts if the table is empty
try {
    const count = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
    if (count === 0) {
        const insert = db.prepare('INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)');
        const adminUserId = 1; // Assuming admin user has id = 1

        insert.run(adminUserId, '[공지] 내자부 서비스 정식 오픈 안내', '안녕하세요, 내자부입니다. 드디어 저희 서비스가 정식으로 오픈되었습니다. 많은 관심과 사랑 부탁드립니다. 이용 중 불편한 점이나 개선사항은 언제든지 문의/건의 게시판을 통해 알려주세요.', 'notice');
        insert.run(adminUserId, '[필독] 자유게시판 이용 규칙 안내', '모두가 즐겁게 소통하는 공간을 위해, 자유게시판 이용 시 다음 규칙을 지켜주세요. 1. 비방, 욕설, 차별적인 발언 금지. 2. ...', 'general');
        insert.run(adminUserId, '[채용] 백엔드 개발자(신입/경력) 모집', '내자부와 함께 성장할 열정적인 백엔드 개발자를 찾습니다. 저희는 Next.js와 TypeScript, SQLite를 사용하여 서비스를 개발하고 있습니다. 자세한 내용은 아래를 참고해주세요.', 'jobs');
        insert.run(adminUserId, '[문의] 닉네임 변경은 어디서 하나요?', '안녕하세요, 닉네임을 바꾸고 싶은데 어디서 해야할지 모르겠습니다. 답변 부탁드립니다.', 'inquiry');
        
        console.log('Seeded initial posts.');
    }
} catch (e) {
    console.error('DB Seeding Error:', e.message);
}

console.log('Database initialized successfully.');

db.close();