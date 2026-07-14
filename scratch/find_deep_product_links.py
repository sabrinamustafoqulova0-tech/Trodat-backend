import requests
from bs4 import BeautifulSoup
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    url = "https://trodat-russia.ru/catalog/printy/tekstovye-shtampy/"
    print(f"Fetching: {url}")
    res = requests.get(url, headers=headers)
    
    soup = BeautifulSoup(res.text, 'html.parser')
    links = []
    
    for a in soup.find_all('a'):
        href = a.get('href')
        text = a.get_text(strip=True)
        if href:
            full_href = urllib.parse.urljoin(url, href)
            links.append((text, full_href))
            
    print(f"Total links: {len(links)}")
    for idx, (text, l) in enumerate(links[:80]):
        print(f"{idx+1}: {l} (Text: {text[:40]})")

if __name__ == '__main__':
    test()
