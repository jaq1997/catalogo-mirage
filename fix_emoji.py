import os

html_files = ["index.html", "bape.html", "nike.html", "adidas.html", "supreme.html", "carhartt.html"]

for file in html_files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the region button text
    content = content.replace('>🇧🇷 Brasil</button>', '>🌎 Brasil (R$)</button>')
    content = content.replace('>🇪🇺 Europa</button>', '>🌍 Europa (€)</button>')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML emoji fix completed.")
