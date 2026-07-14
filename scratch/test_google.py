import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
}

def test():
    query = "Trodat Printy 4911 stamp"
    url = f"https://www.google.com/search?q={requests.utils.quote(query)}&tbm=isch"
    print(f"Searching Google Images: {url}")
    
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    
    images = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and src.startswith('http') and not 'gstatic.com' in src:
            images.append(src)
            
    print(f"Found {len(images)} images in Google mobile scrape:")
    for idx, img in enumerate(images[:10]):
        print(f"{idx+1}: {img}")

if __name__ == '__main__':
    test()
