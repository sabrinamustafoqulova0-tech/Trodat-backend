import requests
from bs4 import BeautifulSoup
import json
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
}

def test():
    query = "Trodat 4911 stamp"
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}"
    print(f"Searching: {url}")
    
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    
    # Check if there are iusc tags
    iusc_tags = soup.find_all(class_='iusc')
    print(f"Found {len(iusc_tags)} iusc tags")
    
    for idx, tag in enumerate(iusc_tags[:15]):
        try:
            m_attr = tag.get('m')
            if m_attr:
                m_data = json.loads(m_attr)
                img_url = m_data.get('murl')
                title = m_data.get('t')
                desc = m_data.get('desc')
                print(f"\n{idx+1}: {img_url}")
                print(f"   Title: {title}")
                print(f"   Desc: {desc}")
        except Exception as e:
            print(f"Error parsing tag {idx}: {e}")

if __name__ == '__main__':
    test()
