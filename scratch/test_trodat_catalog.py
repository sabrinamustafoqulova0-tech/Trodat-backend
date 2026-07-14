import requests
from bs4 import BeautifulSoup
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    url = "https://trodat-russia.ru/catalog/printy/"
    print(f"Fetching Printy page: {url}")
    
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    images = []
    
    # We want to find images of products
    # Often, products are in a list, each having an image.
    for img in soup.find_all('img'):
        src = img.get('src')
        alt = img.get('alt', '')
        if src:
            full_src = urllib.parse.urljoin(url, src)
            images.append((alt, full_src))
            
    print(f"Found {len(images)} images:")
    for idx, (alt, img_url) in enumerate(images):
        # Only print images that are in upload (usually products)
        if 'upload' in img_url:
            print(f"{idx+1}: {img_url} (Alt/Title: {alt})")

if __name__ == '__main__':
    test()
