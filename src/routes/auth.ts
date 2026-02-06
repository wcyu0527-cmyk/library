import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'

type Bindings = {
    DB: D1Database
}

const auth = new Hono<{ Bindings: Bindings }>()

// POST /api/auth/login - 使用者登入
auth.post('/login', async (c) => {
    try {
        const body = await c.req.json()
        const { username, password } = body

        if (!username || !password) {
            return c.json({ error: '請輸入帳號和密碼' }, 400)
        }

        const user = await c.env.DB.prepare(
            'SELECT id, unit, username, role FROM users WHERE username = ? AND password = ?'
        ).bind(username, password).first()

        if (!user) {
            return c.json({ error: '帳號或密碼錯誤' }, 401)
        }

        // 設定 cookie (簡易認證，生產環境應使用 JWT)
        setCookie(c, 'user_id', String(user.id), {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return c.json({
            success: true,
            user: {
                id: user.id,
                unit: user.unit,
                username: user.username,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        return c.json({ error: '登入失敗' }, 500)
    }
})

// POST /api/auth/logout - 登出
auth.post('/logout', async (c) => {
    deleteCookie(c, 'user_id')
    return c.json({ success: true, message: '登出成功' })
})

// GET /api/auth/me - 取得目前使用者資訊
auth.get('/me', async (c) => {
    try {
        const userId = getCookie(c, 'user_id')

        if (!userId) {
            return c.json({ authenticated: false }, 401)
        }

        const user = await c.env.DB.prepare(
            'SELECT id, unit, username, role FROM users WHERE id = ?'
        ).bind(userId).first()

        if (!user) {
            deleteCookie(c, 'user_id')
            return c.json({ authenticated: false }, 401)
        }

        return c.json({
            authenticated: true,
            user
        })
    } catch (error) {
        console.error('Auth check error:', error)
        return c.json({ authenticated: false }, 500)
    }
})

export default auth
