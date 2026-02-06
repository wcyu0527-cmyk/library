import requests
from bs4 import BeautifulSoup
import json
import os
import time
from urllib.parse import urljoin
import urllib3
import re

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def scrape_book_info(url, selection_year):
    """Scrape book information from NACS website"""
    try:
        print(f"正在抓取: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, timeout=15, verify=False, headers=headers)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract book information
        book_data = {
            "id": f"{selection_year}-{url.split('s=')[-1]}",
            "selectionYear": selection_year,
            "status": "available"
        }
        
        # Find title (h3 tag)
        title_elem = soup.find('h3')
        if title_elem:
            book_data["title"] = title_elem.get_text(strip=True)
        
        # Get all text content
        content = soup.find(class_='CCMS_Content_Page') or soup.body
        full_text = content.get_text() if content else ""
        
        # Extract author
        author_match = re.search(r'作者\s*/\s*(.+?)(?:\n|出版社)', full_text)
        if author_match:
            book_data["author"] = author_match.group(1).strip()
        
        # Extract publisher
        publisher_match = re.search(r'出版社\s*/\s*(.+?)(?:\n|出版日期)', full_text)
        if publisher_match:
            book_data["publisher"] = publisher_match.group(1).strip()
        
        # Extract publish year
        date_match = re.search(r'出版日期\s*/\s*(.+?)(?:\n)', full_text)
        if date_match:
            book_data["publishYear"] = date_match.group(1).strip()
        
        # Extract description (text after publish date)
        desc_match = re.search(r'出版日期\s*/\s*.+?\n(.+?)(?:上版日期|$)', full_text, re.DOTALL)
        if desc_match:
            description = desc_match.group(1).strip()
            # Clean up the description
            description = re.sub(r'\s+', ' ', description)
            description = description.replace('  ', '\n\n')
            book_data["description"] = description
        
        # Find cover image
        img_elem = soup.find('img', src=re.compile(r'Upload.*\.(jpg|png|jpeg)', re.I))
        if img_elem and img_elem.get('src'):
            img_url = urljoin(url, img_elem['src'])
            book_data["coverUrl"] = img_url
            
            # Download image
            img_ext = img_url.split('.')[-1].split('@')[0]
            img_filename = f"book_{selection_year}_{url.split('s=')[-1]}.{img_ext}"
            img_path = os.path.join('images', img_filename)
            
            try:
                img_response = requests.get(img_url, timeout=10, verify=False)
                if img_response.status_code == 200 and len(img_response.content) > 5000:
                    os.makedirs('images', exist_ok=True)
                    with open(img_path, 'wb') as f:
                        f.write(img_response.content)
                    book_data["cover"] = img_path
                    print(f"  ✓ 下載封面: {img_filename} ({len(img_response.content)} bytes)")
                else:
                    print(f"  ✗ 封面太小或下載失敗")
                    book_data["cover"] = "images/placeholder.jpg"
            except Exception as e:
                print(f"  ✗ 封面下載失敗: {e}")
                book_data["cover"] = "images/placeholder.jpg"
        else:
            book_data["cover"] = "images/placeholder.jpg"
        
        # Set defaults if missing
        if "title" not in book_data:
            book_data["title"] = f"書籍 {url.split('s=')[-1]}"
        if "author" not in book_data:
            book_data["author"] = "未知作者"
        if "publisher" not in book_data:
            book_data["publisher"] = "未知出版社"
        if "publishYear" not in book_data:
            book_data["publishYear"] = str(selection_year + 1911)
        if "description" not in book_data:
            book_data["description"] = "暫無簡介"
        
        print(f"  ✓ 成功: {book_data['title']} / {book_data['author']}")
        return book_data
        
    except Exception as e:
        print(f"  ✗ 錯誤: {e}")
        return None

def main():
    # Read booklist.txt
    with open('book/list.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    books = []
    current_year = None
    
    for line in lines:
        line = line.strip()
        
        # Parse year headers
        if line.startswith('# 114年度'):
            current_year = 114
            print(f"\n=== 開始處理 {current_year} 年度選書 ===")
        elif line.startswith('# 113年度'):
            current_year = 113
            print(f"\n=== 開始處理 {current_year} 年度選書 ===")
        elif line.startswith('http') and current_year:
            # Scrape book
            book_data = scrape_book_info(line, current_year)
            if book_data:
                books.append(book_data)
            time.sleep(2)  # Be polite to the server
    
    # Save to books.json
    with open('books.json', 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=4)
    
    print(f"\n=== 完成！共匯入 {len(books)} 本書 ===")
    print(f"114年度: {len([b for b in books if b['selectionYear'] == 114])} 本")
    print(f"113年度: {len([b for b in books if b['selectionYear'] == 113])} 本")

if __name__ == "__main__":
    main()
