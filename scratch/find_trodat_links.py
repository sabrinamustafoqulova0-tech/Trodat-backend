import requests
from bs4 import BeautifulSoup
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    url = "https://trodat-russia.ru/"
    print(f"Fetching: {url}")
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    links = set()
    
    for a in soup.find_all('a'):
        href = a.get('href')
        if href:
            full_href = urllib.parse.urljoin(url, href)
            if 'catalog' in full_href or 'product' in full_href:
                links.add(full_href)
                
    print(f"Found {len(links)} links:")
    for idx, l in enumerate(sorted(links)):
        print(f"{idx+1}: {l}")

if __name__ == '__main__':
    test()
