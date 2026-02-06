// Book Library Main Functionality
document.addEventListener('DOMContentLoaded', function () {
    let allBooks = [];
    let latestYear = 0;

    // Initialization
    loadBooks();

    // 1. Load Data from JSON
    async function loadBooks() {
        try {
            const response = await fetch('books.json');
            if (!response.ok) throw new Error('無法讀取書籍資料');
            allBooks = await response.json();

            // Find the latest selection year
            latestYear = Math.max(...allBooks.map(b => b.selectionYear));

            // Update Tab Label
            const annualTabBtn = document.querySelector('.tab-btn[data-tab="annual-selection"]');
            if (annualTabBtn) annualTabBtn.textContent = `${latestYear}年度選書`;

            renderAll();
            initEventListeners();
            console.log(`✓ 成功載入 ${allBooks.length} 本書籍，最新年度：${latestYear}`);
        } catch (error) {
            console.error('✕ 載入書籍失敗:', error);
            showNotification('載入失敗', '無法讀取書籍資料庫，請檢查 books.json', 'error');
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

        const annualBooks = allBooks.filter(b => b.selectionYear === latestYear);

        container.innerHTML = annualBooks.map((book, index) => `
            <div class="book-item" data-id="${book.id}">
                <div class="book-number">${index + 1}</div>
                <div class="book-cover">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="book-info">
                    <h3 class="book-title">書名：${book.title}</h3>
                    <p class="book-meta">作者：<span>${book.author}</span></p>
                    <p class="book-meta">出版社：<span>${book.publisher}</span></p>
                    <p class="book-meta">出版日期：<span>${book.publishYear}</span></p>
                    <button class="btn-borrow" data-id="${book.id}">我要借閱</button>
                </div>
                <div class="book-description">
                    <h4>內容簡介</h4>
                    <p>${book.description.replace(/\n/g, '</p><p>')}</p>
                </div>
            </div>
        `).join('');
    }

    // Render Historical Books (Other Years)
    function renderHistoricalBooks(filteredBooks = null) {
        const container = document.querySelector('.books-grid');
        if (!container) return;

        const displayBooks = filteredBooks || allBooks.filter(b => b.selectionYear < latestYear);

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
                    <img src="${book.cover}" alt="${book.title}" onerror="this.src='images/placeholder.jpg'">
                    <div class="book-badge">${book.selectionYear}年度</div>
                </div>
                <div class="book-card-info">
                    <h4>書名：${book.title}</h4>
                    <p>作者：${book.author}</p>
                    <p>出版社：${book.publisher}</p>
                    <p>出版年：${book.publishYear}</p>
                    <button class="${book.status === 'unavailable' ? 'btn-borrow-disabled' : 'btn-borrow'}" 
                            data-id="${book.id}" ${book.status === 'unavailable' ? 'disabled' : ''}>
                        ${book.status === 'unavailable' ? '已借出' : '我要借閱'}
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
                const filtered = allBooks.filter(b =>
                    b.selectionYear < latestYear && (
                        b.title.toLowerCase().includes(term) ||
                        b.author.toLowerCase().includes(term) ||
                        b.publisher.toLowerCase().includes(term)
                    )
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

                // Update active button
                viewButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Toggle grid class
                if (view === 'list') {
                    booksGrid.classList.add('list-view');
                } else {
                    booksGrid.classList.remove('list-view');
                }
            });
        });

        // Delegate Borrow Button Clicks
        document.body.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-borrow')) {
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

        // Renew & Return (Demo logic stays the same)
        initDemoFeatures();
    }

    // 4. Modal Logic
    function openBorrowModal(book) {
        const modal = document.getElementById('borrowModal');
        document.getElementById('modalBookCover').src = book.cover;
        document.getElementById('modalBookTitle').textContent = book.title;
        document.getElementById('modalBookAuthor').textContent = `作者：${book.author}`;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Handle Sub-Unit Logic
        const unitSelect = document.getElementById('borrowUnit');
        const subUnitGroup = document.getElementById('subUnitGroup');
        const subUnitInput = document.getElementById('borrowSubUnit');

        unitSelect.onchange = function () {
            const needsSubUnit = ['苗工所', '甲工所', '彰工所'].includes(this.value);
            subUnitGroup.style.display = needsSubUnit ? 'block' : 'none';
            subUnitInput.required = needsSubUnit;
        };

        setTimeout(() => unitSelect.focus(), 300);
    }

    function closeBorrowModal() {
        const modal = document.getElementById('borrowModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('borrowForm').reset();
        document.getElementById('subUnitGroup').style.display = 'none';
    }

    function handleBorrowSubmit(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('.btn-modal-submit');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = '處理中...';
        submitBtn.disabled = true;

        // Simulate Success
        setTimeout(() => {
            showNotification('借閱成功', '您的申請已送出，請至「我的借閱」查看。', 'success');
            closeBorrowModal();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1000);
    }

    // 5. Demo Features (Existing logic preserved)
    function initDemoFeatures() {
        const renewButtons = document.querySelectorAll('.btn-extend');
        renewButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                if (confirm('確定要續借此書籍嗎？')) {
                    this.textContent = '已續借';
                    this.style.background = '#6c757d';
                    this.disabled = true;
                }
            });
        });

        const returnButtons = document.querySelectorAll('.btn-return');
        returnButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                alert('請將書籍歸還至人事室。');
            });
        });
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

