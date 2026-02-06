/**
 * Seed D1 Database using JSON import approach
 * This creates a simpler SQL file with batch inserts
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

// Read books.json
const booksPath = join(process.cwd(), 'example', 'books.json');
const books: Book[] = JSON.parse(readFileSync(booksPath, 'utf-8'));

// Escape SQL strings - handle quotes and backslashes
const escapeSql = (str: string) => {
    return str
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/'/g, "''");     // Escape single quotes
};

// Generate SQL with smaller batches
let sql = `-- Database Seed Script - Books Only
-- Generated for Cloudflare D1
-- Total books: ${books.length}

`;

// Insert books one by one to avoid issues with large batches
books.forEach((book, index) => {
    const title = escapeSql(book.title);
    const author = escapeSql(book.author);
    const publisher = escapeSql(book.publisher);
    const description = escapeSql(book.description);
    const cover = escapeSql(book.cover);

    sql += `-- Book ${index + 1}: ${book.title}\n`;
    sql += `INSERT OR IGNORE INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) VALUES (\n`;
    sql += `  '${book.id}',\n`;
    sql += `  ${book.selectionYear},\n`;
    sql += `  '${book.status}',\n`;
    sql += `  '${title}',\n`;
    sql += `  '${author}',\n`;
    sql += `  '${publisher}',\n`;
    sql += `  '${book.publishYear}',\n`;
    sql += `  '${description}',\n`;
    sql += `  '${cover}'\n`;
    sql += `);\n\n`;
});

// Write to file
const outputPath = join(process.cwd(), 'scripts', 'seed-books.sql');
writeFileSync(outputPath, sql, 'utf-8');

console.log(`✅ Books seed SQL file generated!`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📚 Total books: ${books.length}`);
console.log(`\nNext step:`);
console.log(`npx wrangler d1 execute library-db --local --file=./scripts/seed-books.sql`);
