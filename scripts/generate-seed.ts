/**
 * Generate SQL seed file from books.json and users.txt
 * 
 * This script reads the example data files and generates a complete SQL seed file
 * that can be executed against the D1 database.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Book {
    id: string;
    selectionYear: number;
    status: string;
    title: string;
    author: string;
    publisher: string;
    publishYear: string;
    description: string;
    cover: string;
}

interface User {
    unit: string;
    subUnit?: string;
    username: string;
    password: string;
    role: 'user' | 'admin';
}

// Read books.json
const booksPath = join(process.cwd(), 'example', 'books.json');
const books: Book[] = JSON.parse(readFileSync(booksPath, 'utf-8'));

// Read and parse users.txt
const usersPath = join(process.cwd(), 'example', 'users.txt');
const usersContent = readFileSync(usersPath, 'utf-8');
const users: User[] = [];

const lines = usersContent.split('\n');
let isAdmin = false;

for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and headers
    if (!trimmed || trimmed.startsWith('#') || trimmed.includes('單位, 帳號')) {
        if (trimmed.includes('#管理者')) {
            isAdmin = true;
        }
        continue;
    }

    // Parse user data
    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length >= 3) {
        users.push({
            unit: parts[0],
            username: parts[1],
            password: parts[2],
            role: isAdmin ? 'admin' : 'user'
        });
    }
}

// Generate SQL
let sql = `-- Database Seed Script
-- Generated automatically from example/books.json and example/users.txt
-- Generated at: ${new Date().toISOString()}

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM borrowings;
-- DELETE FROM users;
-- DELETE FROM books;

-- ============================================
-- Insert Users
-- ============================================

`;

// Generate user INSERT statements
users.forEach((user, index) => {
    const isLast = index === users.length - 1;
    sql += `INSERT INTO users (unit, username, password, role) VALUES ('${user.unit}', '${user.username}', '${user.password}', '${user.role}')${isLast ? ';' : ';'}\n`;
});

sql += `\n-- ============================================
-- Insert Books
-- ============================================

`;

// Generate book INSERT statements
books.forEach((book, index) => {
    const isLast = index === books.length - 1;

    // Escape single quotes in text fields
    const escapeSql = (str: string) => str.replace(/'/g, "''");

    const title = escapeSql(book.title);
    const author = escapeSql(book.author);
    const publisher = escapeSql(book.publisher);
    const description = escapeSql(book.description);
    const cover = escapeSql(book.cover);

    sql += `INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('${book.id}', ${book.selectionYear}, '${book.status}', '${title}', '${author}', '${publisher}', '${book.publishYear}', '${description}', '${cover}')${isLast ? ';' : ';'}\n`;
});

sql += `\n-- Seed completed successfully!\n`;

// Write to file
const outputPath = join(process.cwd(), 'scripts', 'seed-data.sql');
writeFileSync(outputPath, sql, 'utf-8');

console.log(`✅ Seed SQL file generated successfully!`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Stats:`);
console.log(`   - Users: ${users.length}`);
console.log(`   - Books: ${books.length}`);
console.log(`\nNext steps:`);
console.log(`1. Create schema: npx wrangler d1 execute library-db --local --file=./schema.sql`);
console.log(`2. Seed data: npx wrangler d1 execute library-db --local --file=./scripts/seed-data.sql`);
console.log(`3. For remote: Replace --local with --remote`);
