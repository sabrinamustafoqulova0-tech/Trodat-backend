import requests
from bs4 import BeautifulSoup
import json
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
}

def test(query):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}"
    print(f"Searching: {url}")
    
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    images = []
    
    for tag in soup.find_all(class_='iusc'):
        try:
            m_attr = tag.get('m')
            if m_attr:
                m_data = json.loads(m_attr)
                img_url = m_data.get('murl')
                if img_url:
                    images.append(img_url)
        except Exception as e:
            continue
            
    print(f"Found {len(images)} images")
    for idx, img in enumerate(images[:5]):
        print(f"{idx+1}: {img}")
    return images

if __name__ == '__main__':
    test("Trodat Printy 4911")
