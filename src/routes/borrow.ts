import { Hono } from 'hono'

type Bindings = {
    DB: D1Database
}

const borrow = new Hono<{ Bindings: Bindings }>()

// POST /api/borrow - 提交借閱申請
borrow.post('/', async (c) => {
    try {
        const body = await c.req.json()
        const { bookId, unit, subUnit, borrowerName, employeeId } = body

        // 驗證必填欄位
        if (!bookId || !unit || !borrowerName || !employeeId) {
            return c.json({ error: '缺少必填欄位' }, 400)
        }

        // 檢查書籍是否存在且可借閱
        const book = await c.env.DB.prepare(
            'SELECT * FROM books WHERE id = ?'
        ).bind(bookId).first()

        if (!book) {
            return c.json({ error: '找不到該書籍' }, 404)
        }

        if (book.status === 'borrowed') {
            return c.json({ error: '該書籍已被借出' }, 400)
        }

        // 檢查是否已申請借閱此書
        const existingRequest = await c.env.DB.prepare(
            `SELECT COUNT(*) as count FROM borrowings 
       WHERE book_id = ? AND status = 'pending'`
        ).bind(bookId).first<{ count: number }>()

        if (existingRequest && existingRequest.count > 0) {
            return c.json({ error: '此書籍已有待審核的借閱申請' }, 400)
        }

        // 檢查該使用者目前借閱及申請中數量
        const { results: activeLoans } = await c.env.DB.prepare(
            `SELECT COUNT(*) as count FROM borrowings 
       WHERE employee_id = ? AND status IN ('pending', 'borrowed')`
        ).bind(employeeId).all()

        if (activeLoans && activeLoans[0] && (activeLoans[0] as any).count >= 3) {
            return c.json({ error: '每人最多可同時借閱/申請3本書籍' }, 400)
        }

        // 計算借閱日期和到期日期
        const borrowDate = new Date().toISOString().split('T')[0]
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // 建立借閱申請記錄 (pending 狀態，等待管理員審核)
        await c.env.DB.prepare(
            `INSERT INTO borrowings (book_id, unit, sub_unit, borrower_name, employee_id, borrow_date, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
        ).bind(bookId, unit, subUnit || null, borrowerName, employeeId, borrowDate, dueDate).run()

        // 注意：不更新書籍狀態，等管理員審核通過後才更新

        return c.json({
            success: true,
            message: '借閱申請已送出，請等待管理員審核',
            borrowDate,
            dueDate
        })
    } catch (error) {
        console.error('Borrow error:', error)
        return c.json({ error: '借閱處理失敗' }, 500)
    }
})

// GET /api/borrow/employee/:employeeId - 取得使用者借閱記錄
borrow.get('/employee/:employeeId', async (c) => {
    const employeeId = c.req.param('employeeId')
    try {
        const { results } = await c.env.DB.prepare(
            `SELECT b.*, bk.title, bk.author, bk.cover 
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.employee_id = ?
       ORDER BY b.created_at DESC`
        ).bind(employeeId).all()

        // 分類：待審核、目前借閱、歷史借閱
        const pending = results?.filter((r: any) => r.status === 'pending') || []
        const active = results?.filter((r: any) => r.status === 'borrowed' || r.status === 'extended' || r.status === 'overdue') || []
        const history = results?.filter((r: any) => r.status === 'returned' || r.status === 'rejected') || []

        return c.json({ pending, active, history })
    } catch (error) {
        console.error('Error fetching borrowings:', error)
        return c.json({ error: '無法取得借閱記錄' }, 500)
    }
})

// PUT /api/borrow/:id/return - 歸還書籍
borrow.put('/:id/return', async (c) => {
    const id = c.req.param('id')
    try {
        // 取得借閱記錄
        const borrowing = await c.env.DB.prepare(
            'SELECT * FROM borrowings WHERE id = ?'
        ).bind(id).first<{ book_id: string, status: string }>()

        if (!borrowing) {
            return c.json({ error: '找不到該借閱記錄' }, 404)
        }

        if (borrowing.status === 'returned') {
            return c.json({ error: '該書籍已歸還' }, 400)
        }

        const returnDate = new Date().toISOString().split('T')[0]

        // 更新借閱記錄
        await c.env.DB.prepare(
            `UPDATE borrowings SET status = 'returned', return_date = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(returnDate, id).run()

        // 更新書籍狀態
        await c.env.DB.prepare(
            `UPDATE books SET status = 'available', updated_at = datetime('now') WHERE id = ?`
        ).bind(borrowing.book_id).run()

        return c.json({ success: true, message: '歸還成功' })
    } catch (error) {
        console.error('Return error:', error)
        return c.json({ error: '歸還處理失敗' }, 500)
    }
})

// PUT /api/borrow/:id/extend - 續借書籍
borrow.put('/:id/extend', async (c) => {
    const id = c.req.param('id')
    try {
        const borrowing = await c.env.DB.prepare(
            'SELECT * FROM borrowings WHERE id = ?'
        ).bind(id).first<{ status: string, due_date: string }>()

        if (!borrowing) {
            return c.json({ error: '找不到該借閱記錄' }, 404)
        }

        if (borrowing.status === 'returned') {
            return c.json({ error: '該書籍已歸還，無法續借' }, 400)
        }

        if (borrowing.status === 'extended') {
            return c.json({ error: '該書籍已續借過，無法再次續借' }, 400)
        }

        // 延長30天
        const currentDue = new Date(borrowing.due_date)
        const newDue = new Date(currentDue.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        await c.env.DB.prepare(
            `UPDATE borrowings SET status = 'extended', due_date = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(newDue, id).run()

        return c.json({ success: true, message: '續借成功', newDueDate: newDue })
    } catch (error) {
        console.error('Extend error:', error)
        return c.json({ error: '續借處理失敗' }, 500)
    }
})

export default borrow
