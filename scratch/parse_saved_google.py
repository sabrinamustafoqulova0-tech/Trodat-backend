from bs4 import BeautifulSoup

def parse():
    with open("C:/Users/User/Desktop/Project/react/scratch/google_raw.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = BeautifulSoup(html, 'html.parser')
    img_tags = soup.find_all('img')
    print(f"Total img tags: {len(img_tags)}")
    for idx, img in enumerate(img_tags[:15]):
        print(f"Tag {idx+1}:")
        for attr, val in img.attrs.items():
            print(f"  {attr}: {val[:100]}")

if __name__ == '__main__':
    parse()
