/**
 * Seed D1 Database using wrangler commands
 * This script executes SQL statements in batches
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
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
    username: string;
    password: string;
    role: 'user' | 'admin';
}

// Helper function to escape SQL strings
const escapeSql = (str: string) => str.replace(/'/g, "''").replace(/\\/g, '\\\\');

// Helper function to execute SQL command
const executeSQL = (sql: string, description: string) => {
    try {
        console.log(`\n📝 ${description}...`);
        const command = `npx wrangler d1 execute library-db --local --command="${sql.replace(/"/g, '\\"')}"`;
        execSync(command, { stdio: 'inherit', cwd: process.cwd() });
        console.log(`✅ ${description} completed`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error);
        return false;
    }
};

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

    if (!trimmed || trimmed.startsWith('#') || trimmed.includes('單位, 帳號')) {
        if (trimmed.includes('#管理者')) {
            isAdmin = true;
        }
        continue;
    }

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

console.log('🚀 Starting database seed...');
console.log(`📊 Found ${users.length} users and ${books.length} books`);

// Seed users
console.log('\n👥 Seeding users...');
for (const user of users) {
    const sql = `INSERT OR IGNORE INTO users (unit, username, password, role) VALUES ('${escapeSql(user.unit)}', '${user.username}', '${user.password}', '${user.role}')`;
    executeSQL(sql, `Adding user: ${user.username}`);
}

// Seed books in batches
console.log('\n📚 Seeding books...');
for (const book of books) {
    const sql = `INSERT OR IGNORE INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) VALUES ('${book.id}', ${book.selectionYear}, '${book.status}', '${escapeSql(book.title)}', '${escapeSql(book.author)}', '${escapeSql(book.publisher)}', '${book.publishYear}', '${escapeSql(book.description)}', '${escapeSql(book.cover)}')`;
    executeSQL(sql, `Adding book: ${book.title}`);
}

console.log('\n✨ Database seeding completed!');
console.log(`\n📈 Summary:`);
console.log(`   - Users seeded: ${users.length}`);
console.log(`   - Books seeded: ${books.length}`);
