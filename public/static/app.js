// Library App - Client-Side JavaScript
document.addEventListener('DOMContentLoaded', function () {
    let allBooks = [];
    let latestBooks = [];
    let historicalBooks = [];
    let latestYear = 114;
    let currentUser = null;

    // Check authentication and load user info
    checkAuth();

    // Initialization
    loadBooks();

    // 1. Load Data from API
    async function loadBooks() {
        try {
            // Load latest year books
            const latestResponse = await fetch('/api/books/latest');
            if (!latestResponse.ok) throw new Error('無法讀取年度選書');
            const latestData = await latestResponse.json();
            latestYear = latestData.latestYear;
            latestBooks = latestData.books;

            // Load historical books
            const historicalResponse = await fetch('/api/books/historical');
            if (!historicalResponse.ok) throw new Error('無法讀取歷年書目');
            historicalBooks = await historicalResponse.json();

            // Combine all books
            allBooks = [...latestBooks, ...historicalBooks];

            renderAll();
            initEventListeners();
            console.log(`✓ 成功載入 ${allBooks.length} 本書籍，最新年度：${latestYear}`);
        } catch (error) {
            console.error('✕ 載入書籍失敗:', error);
            showNotification('載入失敗', '無法讀取書籍資料庫，請稍後再試', 'error');
        }
    }

    // Check authentication status
    async function checkAuth() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            const data = await response.json();

            if (!data.authenticated) {
                // Not authenticated, redirect to login
                window.location.href = '/login';
                return;
            }

            // Store user info
            currentUser = data.user;

            // Display user info
            displayUserInfo(currentUser);

            // Setup logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = '/login';
        }
    }

    // Display user information in header
    function displayUserInfo(user) {
        const userUnitEl = document.getElementById('userUnit');
        const userRoleEl = document.getElementById('userRole');
        const adminBtn = document.getElementById('adminBtn');

        if (userUnitEl) {
            userUnitEl.textContent = user.unit || '未知單位';
        }

        if (userRoleEl) {
            const roleText = user.role === 'admin' ? '管理員' : '一般使用者';
            userRoleEl.textContent = roleText;
            userRoleEl.className = `user-role ${user.role}`;
        }

        // Show admin button only for admin users
        if (adminBtn) {
            if (user.role === 'admin') {
                adminBtn.style.display = 'flex';
            } else {
                adminBtn.style.display = 'none';
            }
        }
    }

    // Handle logout
    async function handleLogout() {
        if (!confirm('確定要登出嗎？')) {
            return;
        }

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Clear session storage
                sessionStorage.clear();

                // Redirect to login
                window.location.href = '/login';
            } else {
                showNotification('登出失敗', '請稍後再試', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('登出失敗', '連線錯誤', 'error');
        }
    }

    // 2. Rendering Logic
    function renderAll() {
        renderAnnualSelection();
        renderHistoricalBooks();
    }

    // Render Annual Selection (Latest Year)
    function renderAnnualSelection() {
        const container = document.querySelector('#annual-selection .books-list');
        if (!container) return;

        if (latestBooks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <p style="font-size: 3rem; margin-bottom: 1rem;">📚</p>
                    <p>目前沒有年度選書</p>
                </div>
            `;
            return;
        }

        container.innerHTML = latestBooks.map((book, index) => `
            <div class="book-item" data-id="${book.id}">
                <div class="book-number">${index + 1}</div>
                <div class="book-cover">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.src='/static/placeholder.jpg'">
                </div>
                <div class="book-info">
                    <h3 class="book-title">書名：${book.title}</h3>
                    <p class="book-meta">作者：<span>${book.author}</span></p>
                    <p class="book-meta">出版社：<span>${book.publisher}</span></p>
                    <p class="book-meta">出版日期：<span>${book.publish_year || book.publishYear}</span></p>
                    <button class="btn-borrow" data-id="${book.id}" ${book.status === 'borrowed' ? 'disabled' : ''}>
                        ${book.status === 'borrowed' ? '已借出' : '我要借閱'}
                    </button>
                </div>
                <div class="book-description">
                    <h4>內容簡介</h4>
                    <p>${(book.description || '').replace(/\n/g, '</p><p>')}</p>
                </div>
            </div>
        `).join('');
    }

    // Render Historical Books
    function renderHistoricalBooks(filteredBooks = null) {
        const container = document.querySelector('.books-grid');
        if (!container) return;

        const displayBooks = filteredBooks || historicalBooks;

        if (displayBooks.length === 0) {
            container.innerHTML = `
                <div class="no-results-message" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p style="font-size: 3rem; margin-bottom: 1rem;">📚</p>
                    <p>目前沒有書籍記錄</p>
                </div>
            `;
            return;
        }

        container.innerHTML = displayBooks.map(book => `
            <div class="book-card" data-id="${book.id}">
                <div class="book-card-cover">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.src='/static/placeholder.jpg'">
                    <div class="book-badge">${book.selection_year || book.selectionYear}年度</div>
                </div>
                <div class="book-card-info">
                    <h4>書名：${book.title}</h4>
                    <p>作者：${book.author}</p>
                    <p>出版社：${book.publisher}</p>
                    <p>出版年：${book.publish_year || book.publishYear}</p>
                    <button class="${book.status === 'borrowed' ? 'btn-borrow-disabled' : 'btn-borrow'}" 
                            data-id="${book.id}" ${book.status === 'borrowed' ? 'disabled' : ''}>
                        ${book.status === 'borrowed' ? '已借出' : '我要借閱'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 3. Event Listeners
    function initEventListeners() {
        // Tab Switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Search Implementation
        const searchInput = document.getElementById('search-input');
        const searchButton = document.querySelector('.btn-search');

        if (searchButton && searchInput) {
            const handleSearch = () => {
                const term = searchInput.value.trim().toLowerCase();
                if (!term) {
                    renderHistoricalBooks();
                    return;
                }
                const filtered = historicalBooks.filter(b =>
                    b.title.toLowerCase().includes(term) ||
                    b.author.toLowerCase().includes(term) ||
                    b.publisher.toLowerCase().includes(term)
                );
                renderHistoricalBooks(filtered);
            };

            searchButton.addEventListener('click', handleSearch);
            searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
        }

        // View Toggle (Grid/List)
        const viewButtons = document.querySelectorAll('.view-btn');
        const booksGrid = document.querySelector('.books-grid');

        viewButtons.forEach(button => {
            button.addEventListener('click', function () {
                const view = this.getAttribute('data-view');
                viewButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                if (view === 'list') {
                    booksGrid.classList.add('list-view');
                } else {
                    booksGrid.classList.remove('list-view');
                }
            });
        });

        // Delegate Borrow Button Clicks
        document.body.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-borrow') && !e.target.disabled) {
                const bookId = e.target.getAttribute('data-id');
                const book = allBooks.find(b => b.id === bookId);
                if (book) openBorrowModal(book);
            }
        });

        // Modal Close Events
        const modal = document.getElementById('borrowModal');
        if (modal) {
            const closeElements = modal.querySelectorAll('.modal-close, .btn-modal-cancel, .modal-overlay');
            closeElements.forEach(el => el.addEventListener('click', closeBorrowModal));

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) closeBorrowModal();
            });
        }

        // Form Submission
        const borrowForm = document.getElementById('borrowForm');
        if (borrowForm) {
            borrowForm.addEventListener('submit', handleBorrowSubmit);
        }

        // Sub-Unit Toggle
        const unitSelect = document.getElementById('borrowUnit');
        const subUnitGroup = document.getElementById('subUnitGroup');
        const subUnitInput = document.getElementById('borrowSubUnit');

        if (unitSelect) {
            unitSelect.addEventListener('change', function () {
                const needsSubUnit = ['苗工所', '甲工所', '彰工所'].includes(this.value);
                subUnitGroup.style.display = needsSubUnit ? 'block' : 'none';
                subUnitInput.required = needsSubUnit;
            });
        }
    }

    // 4. Modal Logic
    function openBorrowModal(book) {
        const modal = document.getElementById('borrowModal');
        document.getElementById('modalBookCover').src = book.cover;
        document.getElementById('modalBookTitle').textContent = book.title;
        document.getElementById('modalBookAuthor').textContent = `作者：${book.author}`;
        document.getElementById('borrowBookId').value = book.id;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => document.getElementById('borrowUnit').focus(), 300);
    }

    function closeBorrowModal() {
        const modal = document.getElementById('borrowModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('borrowForm').reset();
        document.getElementById('subUnitGroup').style.display = 'none';
    }

    async function handleBorrowSubmit(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('.btn-modal-submit');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = '處理中...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(e.target);
            const response = await fetch('/api/borrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: formData.get('bookId'),
                    unit: formData.get('unit'),
                    subUnit: formData.get('subUnit') || null,
                    borrowerName: formData.get('name'),
                    employeeId: formData.get('employeeId')
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '借閱失敗');
            }

            showNotification('借閱成功', '您的申請已送出，請至「我的借閱」查看。', 'success');
            closeBorrowModal();

            // Update book status in local data
            const bookId = formData.get('bookId');
            const book = allBooks.find(b => b.id === bookId);
            if (book) {
                book.status = 'borrowed';
                renderAll();
            }
        } catch (error) {
            showNotification('借閱失敗', error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Notification System
    function showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);

        const close = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };

        notification.querySelector('.notification-close').addEventListener('click', close);
        setTimeout(close, 5000);
    }
});
