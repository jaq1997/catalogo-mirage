import os
import re

html_files = ["index.html", "bape.html", "nike.html", "adidas.html", "supreme.html", "carhartt.html"]

for file in html_files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract nav-links block
    nav_links_match = re.search(r'(<ul class="nav-links">.*?</ul>)', content, re.DOTALL)
    if nav_links_match:
        ul_content = nav_links_match.group(1)
        
        # Replace nav-links with search in <nav>
        search_nav = '''<div class="nav-search">
    <input type="text" class="nav-search-input" placeholder="Pesquisar produtos (nome, marca, tipo)..." oninput="handleSearch(this.value)">
  </div>'''
        content = content.replace(ul_content, search_nav)
        
        # Add brand-bar after <nav>
        ul_brand = ul_content.replace('class="nav-links"', 'class="brand-links"')
        brand_bar = f'''<div class="brand-bar">
  {ul_brand}
</div>'''
        content = content.replace('</nav>', f'</nav>\n{brand_bar}')
    
    # Remove old search-wrap block if it exists
    content = re.sub(r'<div class="search-wrap">\s*<input[^>]+>\s*</div>', '', content, flags=re.DOTALL)
    
    # For sub-pages, remove promo-strip
    if file != "index.html":
        content = re.sub(r'<div class="promo-strip">.*?<div class="filter-section">', '<div class="filter-section">', content, flags=re.DOTALL)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML processing completed.")
