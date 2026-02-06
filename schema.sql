-- Library Management System Database Schema
-- For Cloudflare D1

-- 書籍表：儲存所有書籍資訊
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  selection_year INTEGER NOT NULL,
  status TEXT DEFAULT 'available' CHECK(status IN ('available', 'borrowed', 'unavailable')),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publish_year TEXT,
  description TEXT,
  cover TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 使用者表：使用者帳號
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit TEXT NOT NULL,
  sub_unit TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- 借閱記錄表
CREATE TABLE IF NOT EXISTS borrowings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  user_id INTEGER,
  unit TEXT NOT NULL,
  sub_unit TEXT,
  borrower_name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  borrow_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'returned', 'overdue', 'extended')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_books_selection_year ON books(selection_year);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_user_id ON borrowings(user_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_employee_id ON borrowings(employee_id);
