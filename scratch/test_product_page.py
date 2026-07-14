import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
}

def test():
    url = "https://trodat-russia.ru/product/4911-so-standartnym-slovom/"
    print(f"Fetching: {url}")
    
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    
    images = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src:
            images.append(src)
            
    print(f"Found {len(images)} images on the page:")
    for idx, img in enumerate(images):
        print(f"{idx+1}: {img}")

if __name__ == '__main__':
    test()
