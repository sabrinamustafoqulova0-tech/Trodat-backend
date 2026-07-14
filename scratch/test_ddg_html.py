import requests
from bs4 import BeautifulSoup
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    query = 'site:pechati-m.ru "4911"'
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    print(f"Fetching DDG HTML: {url}")
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    links = []
    for a in soup.find_all('a', class_='result__url'):
        href = a.get('href')
        if href:
            links.append(href.strip())
            
    print(f"Found {len(links)} links:")
    for idx, l in enumerate(links[:10]):
        print(f"{idx+1}: {l}")

if __name__ == '__main__':
    test()
