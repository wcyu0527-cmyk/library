import { Hono } from 'hono'

type Bindings = {
    DB: D1Database
}

const books = new Hono<{ Bindings: Bindings }>()

// GET /api/books - 取得所有書籍
books.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM books ORDER BY selection_year DESC, id'
        ).all()
        return c.json(results)
    } catch (error) {
        console.error('Error fetching books:', error)
        return c.json({ error: '無法取得書籍資料' }, 500)
    }
})

// GET /api/books/year/:year - 依年度取得書籍
books.get('/year/:year', async (c) => {
    const year = parseInt(c.req.param('year'))
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM books WHERE selection_year = ? ORDER BY id'
        ).bind(year).all()
        return c.json(results)
    } catch (error) {
        console.error('Error fetching books by year:', error)
        return c.json({ error: '無法取得書籍資料' }, 500)
    }
})

// GET /api/books/latest - 取得最新年度及其書籍
books.get('/latest', async (c) => {
    try {
        // 取得最新年度
        const yearResult = await c.env.DB.prepare(
            'SELECT MAX(selection_year) as latest_year FROM books'
        ).first<{ latest_year: number }>()

        const latestYear = yearResult?.latest_year || 114

        // 取得該年度書籍
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM books WHERE selection_year = ? ORDER BY id'
        ).bind(latestYear).all()

        return c.json({
            latestYear,
            books: results
        })
    } catch (error) {
        console.error('Error fetching latest books:', error)
        return c.json({ error: '無法取得書籍資料' }, 500)
    }
})

// GET /api/books/historical - 取得歷年書籍（非最新年度）
books.get('/historical', async (c) => {
    try {
        // 取得最新年度
        const yearResult = await c.env.DB.prepare(
            'SELECT MAX(selection_year) as latest_year FROM books'
        ).first<{ latest_year: number }>()

        const latestYear = yearResult?.latest_year || 114

        // 取得非最新年度的書籍
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM books WHERE selection_year < ? ORDER BY selection_year DESC, id'
        ).bind(latestYear).all()

        return c.json(results)
    } catch (error) {
        console.error('Error fetching historical books:', error)
        return c.json({ error: '無法取得書籍資料' }, 500)
    }
})

// GET /api/books/:id - 取得單本書籍
books.get('/:id', async (c) => {
    const id = c.req.param('id')
    try {
        const result = await c.env.DB.prepare(
            'SELECT * FROM books WHERE id = ?'
        ).bind(id).first()

        if (!result) {
            return c.json({ error: '找不到該書籍' }, 404)
        }
        return c.json(result)
    } catch (error) {
        console.error('Error fetching book:', error)
        return c.json({ error: '無法取得書籍資料' }, 500)
    }
})

// GET /api/books/search - 搜尋書籍
books.get('/search/:query', async (c) => {
    const query = c.req.param('query')
    try {
        const searchTerm = `%${query}%`
        const { results } = await c.env.DB.prepare(
            `SELECT * FROM books 
       WHERE title LIKE ? OR author LIKE ? OR publisher LIKE ?
       ORDER BY selection_year DESC, id`
        ).bind(searchTerm, searchTerm, searchTerm).all()
        return c.json(results)
    } catch (error) {
        console.error('Error searching books:', error)
        return c.json({ error: '搜尋失敗' }, 500)
    }
})

export default books
