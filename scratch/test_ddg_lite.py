import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; e-commerce-bot) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Origin': 'https://lite.duckduckgo.com',
    'Referer': 'https://lite.duckduckgo.com/'
}

def test():
    url = "https://lite.duckduckgo.com/lite/"
    data = {
        'q': 'Trodat Printy 4911 stamp image'
    }
    
    print(f"POSTing to: {url}")
    res = requests.post(url, data=data, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    
    links = []
    # Search results are inside <td> elements or tables
    for a in soup.find_all('a', class_='result-link'):
        href = a.get('href')
        if href:
            links.append(href)
            
    print(f"Found {len(links)} links:")
    for idx, link in enumerate(links[:15]):
        print(f"{idx+1}: {link}")

if __name__ == '__main__':
    test()
