import { Hono } from 'hono'

type Bindings = {
    DB: D1Database
}

const admin = new Hono<{ Bindings: Bindings }>()

// ===== Borrowing Management =====

// GET /api/admin/borrowings/stats - Dashboard statistics
admin.get('/borrowings/stats', async (c) => {
    try {
        const pending = await c.env.DB.prepare(
            "SELECT COUNT(*) as count FROM borrowings WHERE status = 'pending'"
        ).first<{ count: number }>()

        const borrowed = await c.env.DB.prepare(
            "SELECT COUNT(*) as count FROM borrowings WHERE status = 'borrowed'"
        ).first<{ count: number }>()

        const returned = await c.env.DB.prepare(
            "SELECT COUNT(*) as count FROM borrowings WHERE status = 'returned'"
        ).first<{ count: number }>()

        const overdue = await c.env.DB.prepare(
            "SELECT COUNT(*) as count FROM borrowings WHERE status = 'borrowed' AND due_date < date('now')"
        ).first<{ count: number }>()

        return c.json({
            pending: pending?.count || 0,
            borrowed: borrowed?.count || 0,
            returned: returned?.count || 0,
            overdue: overdue?.count || 0
        })
    } catch (error) {
        console.error('Stats error:', error)
        return c.json({ error: '無法取得統計資料' }, 500)
    }
})

// GET /api/admin/borrowings - List borrowings by status
admin.get('/borrowings', async (c) => {
    try {
        const status = c.req.query('status') || 'pending'

        let query = `
            SELECT b.*, bk.title as book_title, bk.author as book_author,
                   u.unit, u.username
            FROM borrowings b
            LEFT JOIN books bk ON b.book_id = bk.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.status = ?
            ORDER BY b.created_at DESC
        `

        const borrowings = await c.env.DB.prepare(query).bind(status).all()
        return c.json(borrowings.results || [])
    } catch (error) {
        console.error('Borrowings error:', error)
        return c.json({ error: '無法取得借閱資料' }, 500)
    }
})

// POST /api/admin/borrowings/:id/approve - Approve borrowing
admin.post('/borrowings/:id/approve', async (c) => {
    try {
        const id = c.req.param('id')

        // Update borrowing status
        await c.env.DB.prepare(
            "UPDATE borrowings SET status = 'borrowed', updated_at = datetime('now') WHERE id = ?"
        ).bind(id).run()

        // Get book_id to update book status
        const borrowing = await c.env.DB.prepare(
            'SELECT book_id FROM borrowings WHERE id = ?'
        ).bind(id).first<{ book_id: string }>()

        if (borrowing) {
            await c.env.DB.prepare(
                "UPDATE books SET status = 'borrowed', updated_at = datetime('now') WHERE id = ?"
            ).bind(borrowing.book_id).run()
        }

        return c.json({ success: true })
    } catch (error) {
        console.error('Approve error:', error)
        return c.json({ error: '操作失敗' }, 500)
    }
})

// POST /api/admin/borrowings/:id/reject - Reject borrowing
admin.post('/borrowings/:id/reject', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.json().catch(() => ({}))
        const reason = body.reason || ''

        await c.env.DB.prepare(
            "UPDATE borrowings SET status = 'rejected', reject_reason = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(reason, id).run()

        return c.json({ success: true })
    } catch (error) {
        console.error('Reject error:', error)
        return c.json({ error: '操作失敗' }, 500)
    }
})

// POST /api/admin/borrowings/:id/return - Mark as returned
admin.post('/borrowings/:id/return', async (c) => {
    try {
        const id = c.req.param('id')

        // Update borrowing status
        await c.env.DB.prepare(
            "UPDATE borrowings SET status = 'returned', return_date = date('now'), updated_at = datetime('now') WHERE id = ?"
        ).bind(id).run()

        // Get book_id to update book status
        const borrowing = await c.env.DB.prepare(
            'SELECT book_id FROM borrowings WHERE id = ?'
        ).bind(id).first<{ book_id: string }>()

        if (borrowing) {
            await c.env.DB.prepare(
                "UPDATE books SET status = 'available', updated_at = datetime('now') WHERE id = ?"
            ).bind(borrowing.book_id).run()
        }

        return c.json({ success: true })
    } catch (error) {
        console.error('Return error:', error)
        return c.json({ error: '操作失敗' }, 500)
    }
})

// ===== Book Management =====

// GET /api/admin/books - List all books
admin.get('/books', async (c) => {
    try {
        const books = await c.env.DB.prepare(
            `SELECT id, title, author, publisher, publish_year, selection_year, 
                    cover as cover_url, description, status
             FROM books ORDER BY selection_year DESC, title ASC`
        ).all()
        return c.json(books.results || [])
    } catch (error) {
        console.error('Books error:', error)
        return c.json({ error: '無法取得書籍資料' }, 500)
    }
})

// POST /api/admin/books - Create new book
admin.post('/books', async (c) => {
    try {
        const body = await c.req.json()
        const { title, author, publisher, publish_year, selection_year, cover_url, description } = body

        if (!title || !author || !publisher || !selection_year) {
            return c.json({ error: '請填寫必要欄位' }, 400)
        }

        // Generate unique ID
        const id = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        await c.env.DB.prepare(
            `INSERT INTO books (id, title, author, publisher, publish_year, selection_year, cover, description, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`
        ).bind(id, title, author, publisher, publish_year, selection_year, cover_url, description).run()

        return c.json({ success: true, id })
    } catch (error) {
        console.error('Create book error:', error)
        return c.json({ error: '新增失敗' }, 500)
    }
})

// PUT /api/admin/books/:id - Update book
admin.put('/books/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.json()
        const { title, author, publisher, publish_year, selection_year, cover_url, description } = body

        if (!title || !author || !publisher || !selection_year) {
            return c.json({ error: '請填寫必要欄位' }, 400)
        }

        await c.env.DB.prepare(
            `UPDATE books SET title = ?, author = ?, publisher = ?, publish_year = ?, 
             selection_year = ?, cover = ?, description = ?, updated_at = datetime('now')
             WHERE id = ?`
        ).bind(title, author, publisher, publish_year, selection_year, cover_url, description, id).run()

        return c.json({ success: true })
    } catch (error) {
        console.error('Update book error:', error)
        return c.json({ error: '更新失敗' }, 500)
    }
})

// DELETE /api/admin/books/:id - Delete book
admin.delete('/books/:id', async (c) => {
    try {
        const id = c.req.param('id')

        // Check if book has active borrowings
        const activeBorrowings = await c.env.DB.prepare(
            "SELECT COUNT(*) as count FROM borrowings WHERE book_id = ? AND status IN ('pending', 'borrowed')"
        ).bind(id).first<{ count: number }>()

        if (activeBorrowings && activeBorrowings.count > 0) {
            return c.json({ error: '此書籍尚有借閱紀錄，無法刪除' }, 400)
        }

        await c.env.DB.prepare('DELETE FROM books WHERE id = ?').bind(id).run()

        return c.json({ success: true })
    } catch (error) {
        console.error('Delete book error:', error)
        return c.json({ error: '刪除失敗' }, 500)
    }
})

// ===== Report Management =====

// GET /api/admin/units - Get all units for filter
admin.get('/units', async (c) => {
    try {
        const units = await c.env.DB.prepare(
            'SELECT DISTINCT unit FROM users ORDER BY unit'
        ).all()
        return c.json(units.results?.map(u => u.unit) || [])
    } catch (error) {
        console.error('Units error:', error)
        return c.json({ error: '無法取得單位資料' }, 500)
    }
})

// GET /api/admin/reports - Query borrowing records
admin.get('/reports', async (c) => {
    try {
        const fromDate = c.req.query('from')
        const toDate = c.req.query('to')
        const unit = c.req.query('unit')

        if (!fromDate || !toDate) {
            return c.json({ error: '請選擇日期區間' }, 400)
        }

        let query = `
            SELECT b.*, bk.title as book_title, bk.author as book_author,
                   u.unit, u.username
            FROM borrowings b
            LEFT JOIN books bk ON b.book_id = bk.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.borrow_date >= ? AND b.borrow_date <= ?
        `
        const params: string[] = [fromDate, toDate]

        if (unit) {
            query += ' AND u.unit = ?'
            params.push(unit)
        }

        query += ' ORDER BY b.borrow_date DESC'

        const records = await c.env.DB.prepare(query).bind(...params).all()
        return c.json(records.results || [])
    } catch (error) {
        console.error('Reports error:', error)
        return c.json({ error: '查詢失敗' }, 500)
    }
})

// ===== Database Seeding (Keep existing endpoints) =====

// POST /api/admin/seed-books - 從 JSON 匯入書籍資料
admin.post('/seed-books', async (c) => {
    try {
        const books = await c.req.json()

        if (!Array.isArray(books)) {
            return c.json({ error: '資料格式錯誤，需要是陣列' }, 400)
        }

        let imported = 0
        let skipped = 0

        for (const book of books) {
            try {
                await c.env.DB.prepare(
                    `INSERT OR IGNORE INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    book.id,
                    book.selectionYear || book.selection_year,
                    book.status || 'available',
                    book.title,
                    book.author,
                    book.publisher,
                    book.publishYear || book.publish_year,
                    book.description,
                    book.cover
                ).run()
                imported++
            } catch (e) {
                console.error(`Error importing book ${book.id}:`, e)
                skipped++
            }
        }

        return c.json({
            success: true,
            message: `成功匯入 ${imported} 本書籍，跳過 ${skipped} 本`
        })
    } catch (error) {
        console.error('Seed error:', error)
        return c.json({ error: '匯入失敗' }, 500)
    }
})

// POST /api/admin/seed-users - 初始化使用者資料
admin.post('/seed-users', async (c) => {
    try {
        const users = [
            { unit: '施工室', username: 'tcb033235', password: 'tra033235', role: 'user' },
            { unit: '養路室', username: 'tcb033234', password: 'tra033234', role: 'user' },
            { unit: '產業室', username: 'tcb033236', password: 'tra033236', role: 'user' },
            { unit: '職安室', username: 'tcb033290', password: 'tra033290', role: 'user' },
            { unit: '政風室', username: 'tcb033290', password: 'tra033290', role: 'user' },
            { unit: '總務室', username: 'tcb033233', password: 'tra033233', role: 'user' },
            { unit: '苗工所', username: 'tcb033457', password: 'tra033457', role: 'user' },
            { unit: '甲工所', username: 'tcb032667', password: 'tra033267', role: 'user' },
            { unit: '彰工所', username: 'tcb032238', password: 'tra032238', role: 'user' },
            { unit: '人事室', username: 'tcb033292', password: 'tra033292', role: 'admin' }
        ]

        let imported = 0

        for (const user of users) {
            try {
                await c.env.DB.prepare(
                    `INSERT OR IGNORE INTO users (unit, username, password, role)
           VALUES (?, ?, ?, ?)`
                ).bind(user.unit, user.username, user.password, user.role).run()
                imported++
            } catch (e) {
                console.error(`Error importing user ${user.username}:`, e)
            }
        }

        return c.json({ success: true, message: `成功匯入 ${imported} 位使用者` })
    } catch (error) {
        console.error('Seed users error:', error)
        return c.json({ error: '匯入失敗' }, 500)
    }
})

// POST /api/admin/init-db - 初始化資料庫表格
admin.post('/init-db', async (c) => {
    try {
        // Create books table
        await c.env.DB.prepare(`
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
      )
    `).run()

        // Create users table
        await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit TEXT NOT NULL,
        sub_unit TEXT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run()

        // Create borrowings table with pending status
        await c.env.DB.prepare(`
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
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'borrowed', 'returned', 'rejected', 'overdue', 'extended')),
        reject_reason TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (book_id) REFERENCES books(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run()

        // Create indexes
        await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_books_selection_year ON books(selection_year)`).run()
        await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)`).run()
        await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id)`).run()
        await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status)`).run()

        return c.json({ success: true, message: '資料庫初始化完成' })
    } catch (error) {
        console.error('Init DB error:', error)
        return c.json({ error: '資料庫初始化失敗: ' + String(error) }, 500)
    }
})

// GET /api/admin/stats - 取得統計資料
admin.get('/stats', async (c) => {
    try {
        const booksCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM books').first<{ count: number }>()
        const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>()
        const activeLoans = await c.env.DB.prepare("SELECT COUNT(*) as count FROM borrowings WHERE status = 'borrowed'").first<{ count: number }>()

        return c.json({
            books: booksCount?.count || 0,
            users: usersCount?.count || 0,
            activeLoans: activeLoans?.count || 0
        })
    } catch (error) {
        console.error('Stats error:', error)
        return c.json({ error: '無法取得統計資料' }, 500)
    }
})

export default admin

