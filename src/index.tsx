import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { getCookie } from 'hono/cookie'
import books from './routes/books'
import borrow from './routes/borrow'
import auth from './routes/auth'
import admin from './routes/admin'

type Bindings = {
    DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// API Routes
app.route('/api/books', books)
app.route('/api/borrow', borrow)
app.route('/api/auth', auth)
app.route('/api/admin', admin)

// Serve static files
app.use('/static/*', serveStatic())

// Login page route
app.get('/login', async (c) => {
    // If already logged in, redirect to main page
    const userId = getCookie(c, 'user_id')
    if (userId) {
        return c.redirect('/')
    }

    // Serve login page HTML
    return c.html(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登入 - 臺中工務段人事室專書閱讀區</title>
    <meta name="description" content="臺中工務段人事室專書閱讀區 - 登入系統">
    <link rel="stylesheet" href="/static/login.css?v=2">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <div class="login-container">
        <div class="bg-decoration">
            <div class="book-spine book-spine-1"></div>
            <div class="book-spine book-spine-2"></div>
            <div class="book-spine book-spine-3"></div>
            <div class="book-spine book-spine-4"></div>
            <div class="book-spine book-spine-5"></div>
            
            <div class="login-header">
                <div class="logo-container">
                    <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        <line x1="10" y1="8" x2="16" y2="8"></line>
                        <line x1="10" y1="12" x2="16" y2="12"></line>
                        <line x1="10" y1="16" x2="14" y2="16"></line>
                    </svg>
                </div>
                <h1 class="login-title">專書閱讀區</h1>
                <p class="login-subtitle">臺中工務段人事室</p>
            </div>
        </div>
        
        <div class="login-card">
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <label for="username" class="form-label">
                        <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        帳號
                    </label>
                    <input type="text" id="username" name="username" class="form-input" placeholder="請輸入您的帳號" required autocomplete="username" autofocus>
                </div>
                <div class="form-group">
                    <label for="password" class="form-label">
                        <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        密碼
                    </label>
                    <input type="password" id="password" name="password" class="form-input" placeholder="請輸入您的密碼" required autocomplete="current-password">
                </div>
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="rememberMe" name="rememberMe">
                        <span class="checkbox-text">記住我</span>
                    </label>
                </div>
                <div id="errorMessage" class="error-message" style="display: none;"></div>
                <button type="submit" class="btn-login" id="loginButton">
                    <span class="btn-text">登入</span>
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                </button>
            </form>
            <div class="login-footer">
                <p class="footer-text">
                    <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    請使用您的員工帳號登入系統
                </p>
                <div class="copyright">
                    <p>&copy; 2026 臺中工務段人事室 - 專書閱讀推廣計畫</p>
                </div>
            </div>
        </div>
    </div>
    <script src="/static/login.js"></script>
</body>
</html>`)
})

// Main page - serve the HTML (requires authentication)
app.get('/', async (c) => {
    // Check authentication
    const userId = getCookie(c, 'user_id')
    if (!userId) {
        return c.redirect('/login')
    }

    // Verify user exists in database
    try {
        const user = await c.env.DB.prepare(
            'SELECT id, unit, username, role FROM users WHERE id = ?'
        ).bind(userId).first()

        if (!user) {
            // Invalid session, redirect to login
            return c.redirect('/login')
        }
    } catch (e) {
        console.error('Error verifying user:', e)
        return c.redirect('/login')
    }
    // Get latest year
    let latestYear = 114
    try {
        const yearResult = await c.env.DB.prepare(
            'SELECT MAX(selection_year) as latest_year FROM books'
        ).first<{ latest_year: number }>()
        latestYear = yearResult?.latest_year || 114
    } catch (e) {
        console.error('Error getting latest year:', e)
    }

    return c.html(`
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>臺中工務段人事室專書閱讀區</title>
    <meta name="description" content="臺中工務段人事室專書閱讀區 - 年度選書、歷年書目、借閱管理系統">
    <link rel="stylesheet" href="/static/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <header class="header">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="header-title">臺中工務段人事室專書閱讀區</h1>
                    <p class="header-description">
                        為落實終身學習理念，提升閱讀風氣，配合「公務人員專書閱讀推廣活動計畫」，持續購置國家文官學院年度選書書目，俾提供同仁借閱暨辦理讀書心得分享、專書導讀，增強終身學習動能。
                    </p>
                </div>
                <div class="header-right">
                    <div class="user-info" id="userInfo">
                        <div class="user-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div class="user-details">
                            <div class="user-unit" id="userUnit">載入中...</div>
                            <div class="user-role" id="userRole"></div>
                    </div>
                    <a href="/admin" class="btn-admin" id="adminBtn" style="display: none;" title="後台管理">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        後台管理
                    </a>
                    <button class="btn-logout" id="logoutBtn" title="登出">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        登出
                    </button>
                </div>
            </div>
        </header>

        <!-- Tab Navigation -->
        <nav class="tab-nav">
            <button class="tab-btn active" data-tab="annual-selection">${latestYear}年度選書</button>
            <button class="tab-btn" data-tab="historical-books">歷年書目</button>
            <button class="tab-btn" data-tab="my-borrowing">我的借閱</button>
        </nav>

        <!-- Tab Content -->
        <div class="tab-content-wrapper">
            <!-- Annual Selection Tab -->
            <div id="annual-selection" class="tab-content active">
                <div class="books-list">
                    <div class="loading-state" style="text-align: center; padding: 3rem;">
                        <p>正在載入書籍資料...</p>
                    </div>
                </div>
            </div>

            <!-- Historical Books Tab -->
            <div id="historical-books" class="tab-content">
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="輸入書名、作者或關鍵字">
                    <button class="btn-search">🔍 搜尋</button>
                </div>

                <div class="view-toggle">
                    <button class="view-btn active" data-view="grid" title="網格視圖">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                        </svg>
                        網格
                    </button>
                    <button class="view-btn" data-view="list" title="列表視圖">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <rect x="3" y="4" width="2" height="4"></rect>
                            <rect x="3" y="10" width="2" height="4"></rect>
                            <rect x="3" y="16" width="2" height="4"></rect>
                        </svg>
                        列表
                    </button>
                </div>

                <div class="books-grid">
                    <!-- Books will be loaded dynamically -->
                </div>
            </div>

            <!-- My Borrowing Tab -->
            <div id="my-borrowing" class="tab-content">
                <div class="borrowing-info">
                    <h3>借閱規則說明</h3>
                    <ol>
                        <li>借閱書籍的借閱期為<strong>30天</strong>。</li>
                        <li>點選書籍的「我要借閱」，選擇您想要的借閱日期與歸還日期，並填寫借閱單位及姓名。</li>
                        <li>每人每次可借閱<strong>3本</strong>書籍，歸還後可再借閱。</li>
                        <li>到期前7日，以電子郵件方式通知您歸還，逾期則停權30日。</li>
                    </ol>
                </div>

                <div class="borrowing-records">
                    <h3>目前借閱紀錄 - 共 <span class="highlight" id="active-count">0</span> 筆</h3>
                    <div id="active-borrowings">
                        <p style="text-align: center; color: #6c757d;">請輸入員工代號查詢借閱記錄</p>
                    </div>
                </div>

                <div class="borrowing-history">
                    <h3>歷史借閱紀錄 - 共 <span class="highlight" id="history-count">0</span> 筆</h3>
                    <div id="history-borrowings">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>序號</th>
                                    <th>書名</th>
                                    <th>借閱日期</th>
                                    <th>歸還日期</th>
                                </tr>
                            </thead>
                            <tbody id="history-table-body">
                                <tr>
                                    <td colspan="4" style="text-align: center; color: #6c757d;">尚無歷史借閱記錄</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Borrow Modal -->
    <div id="borrowModal" class="modal">
        <div class="modal-overlay"></div>
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">📚 書籍借閱申請</h2>
                <button class="modal-close" aria-label="關閉">&times;</button>
            </div>

            <div class="modal-body">
                <div class="book-preview">
                    <div class="book-preview-cover">
                        <img id="modalBookCover" src="" alt="書籍封面">
                    </div>
                    <div class="book-preview-info">
                        <h3 id="modalBookTitle">書名</h3>
                        <p id="modalBookAuthor">作者</p>
                    </div>
                </div>

                <form id="borrowForm" class="borrow-form">
                    <input type="hidden" id="borrowBookId" name="bookId">
                    
                    <div class="form-group">
                        <label for="borrowUnit" class="form-label">
                            <span class="label-text">單位</span>
                            <span class="label-required">*</span>
                        </label>
                        <select id="borrowUnit" name="unit" class="form-input" required>
                            <option value="">請選擇單位</option>
                            <option value="段長室">段長室</option>
                            <option value="施工室">施工室</option>
                            <option value="養路室">養路室</option>
                            <option value="產業室">產業室</option>
                            <option value="職安室">職安室</option>
                            <option value="政風室">政風室</option>
                            <option value="人事室">人事室</option>
                            <option value="總務室">總務室</option>
                            <option value="苗工所">苗工所</option>
                            <option value="甲工所">甲工所</option>
                            <option value="彰工所">彰工所</option>
                        </select>
                    </div>

                    <div class="form-group" id="subUnitGroup" style="display: none;">
                        <label for="borrowSubUnit" class="form-label">
                            <span class="label-text">道班名稱</span>
                            <span class="label-required">*</span>
                        </label>
                        <input type="text" id="borrowSubUnit" name="subUnit" class="form-input" placeholder="請輸入道班名稱">
                    </div>

                    <div class="form-group">
                        <label for="borrowName" class="form-label">
                            <span class="label-text">姓名</span>
                            <span class="label-required">*</span>
                        </label>
                        <input type="text" id="borrowName" name="name" class="form-input" placeholder="請輸入您的姓名" required>
                    </div>

                    <div class="form-group">
                        <label for="borrowEmployeeId" class="form-label">
                            <span class="label-text">員工代號</span>
                            <span class="label-required">*</span>
                        </label>
                        <input type="text" id="borrowEmployeeId" name="employeeId" class="form-input" placeholder="請輸入您的員工代號" required>
                    </div>

                    <div class="form-info">
                        <p>📌 借閱期限為 <strong>30天</strong>，請於期限內歸還</p>
                        <p>📌 每人每次最多可借閱 <strong>3本</strong> 書籍</p>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-modal-cancel">取消</button>
                        <button type="submit" class="btn-modal-submit">申請借閱</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="/static/app.js"></script>
</body>
</html>
  `)
})



// Admin page route - requires admin role
app.get('/admin', async (c) => {
    // Check authentication
    const userId = getCookie(c, 'user_id')
    if (!userId) {
        return c.redirect('/login')
    }

    // Verify user is admin
    try {
        const user = await c.env.DB.prepare(
            'SELECT id, username, role, unit FROM users WHERE id = ?'
        ).bind(userId).first<{ id: number, username: string, role: string, unit: string }>()

        if (!user || user.role !== 'admin') {
            return c.redirect('/')
        }

        return c.html(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>後台管理 - 臺中工務段人事室專書閱讀區</title>
    <meta name="description" content="臺中工務段人事室專書閱讀區 - 後台管理系統">
    <link rel="stylesheet" href="/static/admin.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h1 class="sidebar-title">後台管理</h1>
                <p class="sidebar-subtitle">臺中工務段人事室</p>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active" data-section="borrowing">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    借閱管理
                </a>
                <a href="#" class="nav-item" data-section="books">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    書本管理
                </a>
                <a href="#" class="nav-item" data-section="reports">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    報表管理
                </a>
            </nav>
            <div class="sidebar-footer">
                <!-- Back link moved to header -->
            </div>
        </aside>

        <!-- Main Content -->
        <main class="admin-main">
            <!-- Header -->
            <header class="admin-header">
                <div class="header-left">
                    <h2 class="page-title" id="pageTitle">借閱管理</h2>
                </div>
                <div class="header-right">
                    <a href="/" class="back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        返回
                    </a>
                    <div class="user-info">
                        <span class="user-name">${user.unit}</span>
                        <span class="user-role">管理員</span>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <div class="admin-content">
                <!-- Borrowing Management Section -->
                <section id="borrowing-section" class="content-section active">
                    <!-- Dashboard -->
                    <div class="dashboard-cards">
                        <div class="stat-card pending">
                            <div class="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div class="stat-info">
                                <span class="stat-value" id="pendingCount">-</span>
                                <span class="stat-label">待審核</span>
                            </div>
                        </div>
                        <div class="stat-card borrowed">
                            <div class="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                            </div>
                            <div class="stat-info">
                                <span class="stat-value" id="borrowedCount">-</span>
                                <span class="stat-label">已借出</span>
                            </div>
                        </div>
                        <div class="stat-card returned">
                            <div class="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div class="stat-info">
                                <span class="stat-value" id="returnedCount">-</span>
                                <span class="stat-label">已歸還</span>
                            </div>
                        </div>
                        <div class="stat-card overdue">
                            <div class="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div class="stat-info">
                                <span class="stat-value" id="overdueCount">-</span>
                                <span class="stat-label">逾期</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div class="content-tabs">
                        <button class="tab-btn active" data-status="pending">待審核</button>
                        <button class="tab-btn" data-status="borrowed">已借出</button>
                        <button class="tab-btn" data-status="returned">已歸還</button>
                    </div>

                    <!-- Borrowing List -->
                    <div class="table-container">
                        <table class="data-table" id="borrowingTable">
                            <thead>
                                <tr>
                                    <th>書名</th>
                                    <th>借閱者</th>
                                    <th>單位</th>
                                    <th>申請日期</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="borrowingTableBody">
                                <tr>
                                    <td colspan="5" class="loading-cell">載入中...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Books Management Section -->
                <section id="books-section" class="content-section">
                    <div class="section-header">
                        <button class="btn-primary" id="addBookBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            新增書本
                        </button>
                        <div class="search-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input type="text" id="bookSearchInput" placeholder="搜尋書本...">
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="data-table" id="booksTable">
                            <thead>
                                <tr>
                                    <th style="width: 60px;">封面</th>
                                    <th>書名</th>
                                    <th>作者</th>
                                    <th>出版社</th>
                                    <th>年度</th>
                                    <th style="width: 120px;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="booksTableBody">
                                <tr>
                                    <td colspan="6" class="loading-cell">載入中...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Reports Management Section -->
                <section id="reports-section" class="content-section">
                    <div class="report-filters">
                        <div class="filter-group">
                            <label>起始日期</label>
                            <input type="date" id="reportFromDate">
                        </div>
                        <div class="filter-group">
                            <label>結束日期</label>
                            <input type="date" id="reportToDate">
                        </div>
                        <div class="filter-group">
                            <label>單位篩選</label>
                            <select id="reportUnitFilter">
                                <option value="">全部單位</option>
                            </select>
                        </div>
                        <div class="filter-actions">
                            <button class="btn-primary" id="queryReportBtn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                查詢
                            </button>
                            <button class="btn-secondary" id="exportReportBtn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                匯出 CSV
                            </button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="data-table" id="reportTable">
                            <thead>
                                <tr>
                                    <th>書名</th>
                                    <th>借閱者</th>
                                    <th>單位</th>
                                    <th>借閱日期</th>
                                    <th>歸還日期</th>
                                    <th>狀態</th>
                                </tr>
                            </thead>
                            <tbody id="reportTableBody">
                                <tr>
                                    <td colspan="6" class="empty-cell">請選擇日期區間並點擊查詢</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <!-- Book Modal -->
    <div class="modal" id="bookModal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="bookModalTitle">新增書本</h3>
                <button class="modal-close" id="closeBookModal">&times;</button>
            </div>
            <form id="bookForm">
                <input type="hidden" id="bookId">
                <div class="form-group">
                    <label for="bookTitle">書名 *</label>
                    <input type="text" id="bookTitle" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="bookAuthor">作者 *</label>
                        <input type="text" id="bookAuthor" required>
                    </div>
                    <div class="form-group">
                        <label for="bookPublisher">出版社 *</label>
                        <input type="text" id="bookPublisher" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="bookYear">出版年</label>
                        <input type="number" id="bookYear" min="1900" max="2100">
                    </div>
                    <div class="form-group">
                        <label for="bookSelectionYear">選書年度 *</label>
                        <input type="number" id="bookSelectionYear" required min="100" max="200" value="114">
                    </div>
                </div>
                <div class="form-group">
                    <label for="bookCoverUrl">封面圖片 URL</label>
                    <input type="text" id="bookCoverUrl" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label for="bookDescription">簡介</label>
                    <textarea id="bookDescription" rows="4"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-cancel" id="cancelBookBtn">取消</button>
                    <button type="submit" class="btn-submit">儲存</button>
                </div>
            </form>
        </div>
    </div>

    <script src="/static/admin.js"></script>
</body>
</html>`)
    } catch (e) {
        console.error('Error loading admin page:', e)
        return c.redirect('/')
    }
})

export default app
