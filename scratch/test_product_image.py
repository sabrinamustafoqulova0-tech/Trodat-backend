import requests
from bs4 import BeautifulSoup
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    url = "https://trodat-russia.ru/catalog/printy/tekstovye-shtampy/4911/"
    print(f"Fetching product page: {url}")
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    images = []
    
    # Let's inspect all img tags on the product detail page
    for img in soup.find_all('img'):
        src = img.get('src')
        alt = img.get('alt', '')
        title = img.get('title', '')
        cls = img.get('class', [])
        
        if src:
            full_src = urllib.parse.urljoin(url, src)
            images.append((full_src, alt, title, cls))
            
    print(f"Total images found: {len(images)}")
    for idx, (img_url, alt, title, cls) in enumerate(images):
        if 'upload' in img_url:
            print(f"\n{idx+1}: {img_url}")
            print(f"   Alt: {alt}")
            print(f"   Title: {title}")
            print(f"   Class: {cls}")

if __name__ == '__main__':
    test()
