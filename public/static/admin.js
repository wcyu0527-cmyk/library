/**
 * Admin Panel JavaScript
 * Handles borrowing management, book management, and report generation
 */

document.addEventListener('DOMContentLoaded', function () {
    // State
    let currentSection = 'borrowing';
    let currentBorrowingStatus = 'pending';
    let allBooks = [];
    let reportData = [];

    // DOM Elements
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');
    const borrowingTabs = document.querySelectorAll('.content-tabs .tab-btn');

    // Initialize
    init();

    function init() {
        setupNavigation();
        setupBorrowingTabs();
        setupBookManagement();
        setupReportManagement();
        loadDashboardStats();
        loadBorrowings('pending');
        setDefaultDateRange();
        loadUnits();
    }

    // ===== Navigation =====
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                switchSection(section);
            });
        });
    }

    function switchSection(section) {
        currentSection = section;

        // Update nav items
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Update sections
        contentSections.forEach(sec => {
            sec.classList.toggle('active', sec.id === `${section}-section`);
        });

        // Update page title
        const titles = {
            'borrowing': '借閱管理',
            'books': '書本管理',
            'reports': '報表管理'
        };
        pageTitle.textContent = titles[section] || '後台管理';

        // Load data for section
        if (section === 'books') {
            loadBooks();
        } else if (section === 'reports') {
            // Reports will load on query
        }
    }

    // ===== Borrowing Management =====
    function setupBorrowingTabs() {
        borrowingTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const status = tab.dataset.status;
                currentBorrowingStatus = status;

                borrowingTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                loadBorrowings(status);
            });
        });
    }

    async function loadDashboardStats() {
        try {
            const response = await fetch('/api/admin/borrowings/stats');
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('pendingCount').textContent = stats.pending || 0;
                document.getElementById('borrowedCount').textContent = stats.borrowed || 0;
                document.getElementById('returnedCount').textContent = stats.returned || 0;
                document.getElementById('overdueCount').textContent = stats.overdue || 0;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async function loadBorrowings(status) {
        const tbody = document.getElementById('borrowingTableBody');
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">載入中...</td></tr>';

        try {
            const response = await fetch(`/api/admin/borrowings?status=${status}`);
            if (response.ok) {
                const borrowings = await response.json();
                renderBorrowings(borrowings, status);
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">載入失敗</td></tr>';
            }
        } catch (error) {
            console.error('Error loading borrowings:', error);
            tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">載入失敗</td></tr>';
        }
    }

    function renderBorrowings(borrowings, status) {
        const tbody = document.getElementById('borrowingTableBody');

        if (borrowings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">沒有資料</td></tr>';
            return;
        }

        tbody.innerHTML = borrowings.map(b => {
            let actions = '';
            if (status === 'pending') {
                actions = `
                    <button class="btn-approve" onclick="approveBorrowing(${b.id})">同意</button>
                    <button class="btn-reject" onclick="rejectBorrowing(${b.id})">退回</button>
                `;
            } else if (status === 'borrowed') {
                actions = `
                    <button class="btn-return" onclick="returnBorrowing(${b.id})">歸還</button>
                `;
            } else {
                actions = '-';
            }

            return `
                <tr>
                    <td>${escapeHtml(b.book_title)}</td>
                    <td>${escapeHtml(b.borrower_name || b.username)}</td>
                    <td>${escapeHtml(b.unit)}</td>
                    <td>${formatDate(b.borrow_date || b.created_at)}</td>
                    <td>${actions}</td>
                </tr>
            `;
        }).join('');
    }

    // Borrowing Actions (global functions for onclick)
    window.approveBorrowing = async function (id) {
        if (!confirm('確定要同意此借閱申請？')) return;

        try {
            const response = await fetch(`/api/admin/borrowings/${id}/approve`, {
                method: 'POST'
            });
            if (response.ok) {
                loadBorrowings(currentBorrowingStatus);
                loadDashboardStats();
            } else {
                alert('操作失敗');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('操作失敗');
        }
    };

    window.rejectBorrowing = async function (id) {
        const reason = prompt('請輸入退回原因（可選）：');
        if (reason === null) return;

        try {
            const response = await fetch(`/api/admin/borrowings/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (response.ok) {
                loadBorrowings(currentBorrowingStatus);
                loadDashboardStats();
            } else {
                alert('操作失敗');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('操作失敗');
        }
    };

    window.returnBorrowing = async function (id) {
        if (!confirm('確定要標記此書籍已歸還？')) return;

        try {
            const response = await fetch(`/api/admin/borrowings/${id}/return`, {
                method: 'POST'
            });
            if (response.ok) {
                loadBorrowings(currentBorrowingStatus);
                loadDashboardStats();
            } else {
                alert('操作失敗');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('操作失敗');
        }
    };

    // ===== Book Management =====
    function setupBookManagement() {
        const addBtn = document.getElementById('addBookBtn');
        const modal = document.getElementById('bookModal');
        const closeBtn = document.getElementById('closeBookModal');
        const cancelBtn = document.getElementById('cancelBookBtn');
        const form = document.getElementById('bookForm');
        const searchInput = document.getElementById('bookSearchInput');

        addBtn.addEventListener('click', () => openBookModal());
        closeBtn.addEventListener('click', () => closeBookModal());
        cancelBtn.addEventListener('click', () => closeBookModal());
        modal.querySelector('.modal-overlay').addEventListener('click', () => closeBookModal());

        form.addEventListener('submit', handleBookSubmit);

        searchInput.addEventListener('input', (e) => {
            filterBooks(e.target.value);
        });
    }

    async function loadBooks() {
        const tbody = document.getElementById('booksTableBody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">載入中...</td></tr>';

        try {
            const response = await fetch('/api/admin/books');
            if (response.ok) {
                allBooks = await response.json();
                renderBooks(allBooks);
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">載入失敗</td></tr>';
            }
        } catch (error) {
            console.error('Error loading books:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">載入失敗</td></tr>';
        }
    }

    function renderBooks(books) {
        const tbody = document.getElementById('booksTableBody');

        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">沒有書籍資料</td></tr>';
            return;
        }

        tbody.innerHTML = books.map(book => `
            <tr>
                <td>
                    <img src="${book.cover_url || '/static/images/default-cover.png'}" 
                         alt="${escapeHtml(book.title)}" 
                         class="book-cover-thumb"
                         onerror="this.src='/static/images/default-cover.png'">
                </td>
                <td>${escapeHtml(book.title)}</td>
                <td>${escapeHtml(book.author)}</td>
                <td>${escapeHtml(book.publisher)}</td>
                <td>${book.selection_year}年度</td>
                <td>
                    <button class="btn-edit" onclick="editBook(${book.id})">編輯</button>
                    <button class="btn-delete" onclick="deleteBook(${book.id})">刪除</button>
                </td>
            </tr>
        `).join('');
    }

    function filterBooks(query) {
        const filtered = allBooks.filter(book =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.publisher.toLowerCase().includes(query.toLowerCase())
        );
        renderBooks(filtered);
    }

    function openBookModal(book = null) {
        const modal = document.getElementById('bookModal');
        const title = document.getElementById('bookModalTitle');
        const form = document.getElementById('bookForm');

        form.reset();

        if (book) {
            title.textContent = '編輯書本';
            document.getElementById('bookId').value = book.id;
            document.getElementById('bookTitle').value = book.title;
            document.getElementById('bookAuthor').value = book.author;
            document.getElementById('bookPublisher').value = book.publisher;
            document.getElementById('bookYear').value = book.publish_year || '';
            document.getElementById('bookSelectionYear').value = book.selection_year;
            document.getElementById('bookCoverUrl').value = book.cover_url || '';
            document.getElementById('bookDescription').value = book.description || '';
        } else {
            title.textContent = '新增書本';
            document.getElementById('bookId').value = '';
        }

        modal.classList.add('active');
    }

    function closeBookModal() {
        document.getElementById('bookModal').classList.remove('active');
    }

    async function handleBookSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('bookId').value;
        const bookData = {
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            publisher: document.getElementById('bookPublisher').value,
            publish_year: document.getElementById('bookYear').value || null,
            selection_year: parseInt(document.getElementById('bookSelectionYear').value),
            cover_url: document.getElementById('bookCoverUrl').value || null,
            description: document.getElementById('bookDescription').value || null
        };

        try {
            const url = id ? `/api/admin/books/${id}` : '/api/admin/books';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });

            if (response.ok) {
                closeBookModal();
                loadBooks();
            } else {
                const error = await response.json();
                alert(error.error || '儲存失敗');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('儲存失敗');
        }
    }

    window.editBook = function (id) {
        const book = allBooks.find(b => b.id === id);
        if (book) {
            openBookModal(book);
        }
    };

    window.deleteBook = async function (id) {
        if (!confirm('確定要刪除此書籍？此操作無法復原。')) return;

        try {
            const response = await fetch(`/api/admin/books/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadBooks();
            } else {
                alert('刪除失敗');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('刪除失敗');
        }
    };

    // ===== Report Management =====
    function setupReportManagement() {
        const queryBtn = document.getElementById('queryReportBtn');
        const exportBtn = document.getElementById('exportReportBtn');

        queryBtn.addEventListener('click', queryReport);
        exportBtn.addEventListener('click', exportReport);
    }

    function setDefaultDateRange() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        document.getElementById('reportFromDate').value = formatDateForInput(firstDayOfMonth);
        document.getElementById('reportToDate').value = formatDateForInput(today);
    }

    async function loadUnits() {
        try {
            const response = await fetch('/api/admin/units');
            if (response.ok) {
                const units = await response.json();
                const select = document.getElementById('reportUnitFilter');
                units.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading units:', error);
        }
    }

    async function queryReport() {
        const fromDate = document.getElementById('reportFromDate').value;
        const toDate = document.getElementById('reportToDate').value;
        const unit = document.getElementById('reportUnitFilter').value;

        if (!fromDate || !toDate) {
            alert('請選擇日期區間');
            return;
        }

        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">查詢中...</td></tr>';

        try {
            let url = `/api/admin/reports?from=${fromDate}&to=${toDate}`;
            if (unit) url += `&unit=${encodeURIComponent(unit)}`;

            const response = await fetch(url);
            if (response.ok) {
                reportData = await response.json();
                renderReport(reportData);
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">查詢失敗</td></tr>';
            }
        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">查詢失敗</td></tr>';
        }
    }

    function renderReport(data) {
        const tbody = document.getElementById('reportTableBody');

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">沒有符合條件的資料</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(record => {
            const statusClass = getStatusClass(record.status);
            const statusText = getStatusText(record.status);

            return `
                <tr>
                    <td>${escapeHtml(record.book_title)}</td>
                    <td>${escapeHtml(record.borrower_name || record.username)}</td>
                    <td>${escapeHtml(record.unit)}</td>
                    <td>${formatDate(record.borrow_date)}</td>
                    <td>${record.return_date ? formatDate(record.return_date) : '-'}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
    }

    function exportReport() {
        if (reportData.length === 0) {
            alert('請先查詢資料');
            return;
        }

        // Create CSV content
        const headers = ['書名', '借閱者', '單位', '借閱日期', '歸還日期', '狀態'];
        const rows = reportData.map(record => [
            record.book_title,
            record.borrower_name || record.username,
            record.unit,
            formatDate(record.borrow_date),
            record.return_date ? formatDate(record.return_date) : '',
            getStatusText(record.status)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Add BOM for Excel compatibility
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `借閱報表_${document.getElementById('reportFromDate').value}_${document.getElementById('reportToDate').value}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    }

    // ===== Utility Functions =====
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const year = date.getFullYear() - 1911; // Convert to ROC year
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    function formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    function getStatusClass(status) {
        const classes = {
            'pending': 'pending',
            'borrowed': 'borrowed',
            'returned': 'returned',
            'rejected': 'rejected',
            'overdue': 'overdue'
        };
        return classes[status] || '';
    }

    function getStatusText(status) {
        const texts = {
            'pending': '待審核',
            'borrowed': '已借出',
            'returned': '已歸還',
            'rejected': '已退回',
            'overdue': '逾期'
        };
        return texts[status] || status;
    }
});
