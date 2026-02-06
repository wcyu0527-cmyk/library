import json

# Read the current books.json
with open('books.json', 'r', encoding='utf-8') as f:
    books = json.load(f)

# Update all books to use coverUrl as cover
for book in books:
    if 'coverUrl' in book:
        # Remove trailing space and use as cover
        book['cover'] = book['coverUrl'].strip()
        del book['coverUrl']

# Save back to books.json
with open('books.json', 'w', encoding='utf-8') as f:
    json.dump(books, f, ensure_ascii=False, indent=4)

print(f"Updated {len(books)} books to use online cover images")
