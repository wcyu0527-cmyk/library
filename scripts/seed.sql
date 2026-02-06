/**
 * Database Seed Script
 * 
 * 這個腳本用於將 books.json 和 users.txt 的資料導入 D1 資料庫
 * 
 * 使用方式：
 * 1. 首先創建 D1 資料庫：wrangler d1 create library-db
 * 2. 複製資料庫 ID 到 wrangler.jsonc
 * 3. 執行 schema：wrangler d1 execute library-db --local --file=./schema.sql
 * 4. 執行此腳本：wrangler d1 execute library-db --local --file=./scripts/seed.sql
 */

-- 清空現有資料（如有需要）
-- DELETE FROM borrowings;
-- DELETE FROM users;
-- DELETE FROM books;

-- 匯入書籍資料
-- 注意：這裡需要手動將 books.json 轉換為 SQL INSERT 語句
-- 或使用 API endpoint 批次匯入

-- 匯入使用者資料
INSERT OR IGNORE INTO users (unit, username, password, role) VALUES
('施工室', 'tcb033235', 'tra033235', 'user'),
('養路室', 'tcb033234', 'tra033234', 'user'),
('產業室', 'tcb033236', 'tra033236', 'user'),
('職安室', 'tcb033290', 'tra033290', 'user'),
('政風室', 'tcb033290', 'tra033290', 'user'),
('總務室', 'tcb033233', 'tra033233', 'user'),
('苗工所', 'tcb033457', 'tra033457', 'user'),
('甲工所', 'tcb032667', 'tra033267', 'user'),
('彰工所', 'tcb032238', 'tra032238', 'user'),
('人事室', 'tcb033292', 'tra033292', 'admin');
