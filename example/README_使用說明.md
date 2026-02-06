# 臺中工務段人事室專書閱讀區 - 使用說明

## 如何開啟網頁

由於瀏覽器安全性限制，**不能直接雙擊 index.html 開啟**。請使用以下任一方法：

### 方法 1：使用 VS Code Live Server（推薦）

1. 在 VS Code 中安裝 "Live Server" 擴充功能
2. 在 VS Code 中開啟 `index.html`
3. 點擊右下角的 "Go Live" 按鈕
4. 瀏覽器會自動開啟 `http://localhost:5500/index.html`

### 方法 2：使用 Python 簡易伺服器

在專案資料夾中執行：
```powershell
python -m http.server 8000
```
然後在瀏覽器開啟：`http://localhost:8000`

### 方法 3：上傳到網頁伺服器

將整個資料夾上傳到您的網頁伺服器即可正常使用。

---

## 如何更新書籍

### 每年更新年度選書

1. 編輯 `book/list.txt`，加入新年度的書籍 URL
2. 執行爬蟲腳本：
   ```powershell
   python scrape_books.py
   ```
3. 系統會自動：
   - 抓取新書資料
   - 將最新年度設為「年度選書」
   - 將舊年度移至「歷年書目」

### 手動編輯書籍

直接編輯 `books.json` 檔案即可。

---

## 檔案說明

- `index.html` - 主網頁
- `script.js` - 網頁邏輯
- `styles.css` - 樣式表
- `books.json` - 書籍資料庫
- `book/list.txt` - 書籍 URL 清單
- `scrape_books.py` - 書籍爬蟲腳本
