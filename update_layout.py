import os
import re
import sys

html_files = ["bape.html", "nike.html", "adidas.html", "supreme.html", "carhartt.html"]

with open("index.html", "r", encoding="utf-8") as f:
    idx_content = f.read()

start_idx = idx_content.find('<nav>')
end_idx = idx_content.find('<div class="hero"', start_idx)
if end_idx == -1:
    end_idx = idx_content.find('<div class="filter-section"', start_idx)

if start_idx == -1 or end_idx == -1:
    print("Error: Could not find header block in index.html")
    sys.exit(1)

new_header = idx_content[int(start_idx):int(end_idx)].strip()  # type: ignore

for file in html_files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    c_start = content.find('<nav>')
    c_end = content.find('<div class="hero"', c_start)
    if c_end == -1:
        c_end = content.find('<div class="filter-section"', c_start)
    
    if c_start != -1 and c_end != -1:
        content = content[:int(c_start)] + new_header + '\n' + content[int(c_end):]  # type: ignore
    
    # For sub-pages, remove promo-strip if exists
    content = re.sub(r'<div class="promo-strip">.*?<div class="filter-section">', '<div class="filter-section">', content, flags=re.DOTALL)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML processing completed.")
