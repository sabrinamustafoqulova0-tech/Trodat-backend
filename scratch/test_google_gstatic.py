import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    query = "Trodat Printy 4911 stamp"
    url = f"https://www.google.com/search?q={requests.utils.quote(query)}&tbm=isch"
    print(f"Searching: {url}")
    
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    
    images = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and src.startswith('http'):
            images.append(src)
            
    print(f"Found {len(images)} images (including gstatic):")
    for idx, img in enumerate(images[:10]):
        print(f"{idx+1}: {img}")

if __name__ == '__main__':
    test()
