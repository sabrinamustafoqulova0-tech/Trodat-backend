import requests
from bs4 import BeautifulSoup
import json
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1'
}

def test():
    session = requests.Session()
    session.headers.update(headers)
    
    # Visit main Bing page to get cookies
    print("Visiting Bing main page...")
    res = session.get("https://www.bing.com/")
    print(f"Main page status: {res.status_code}")
    
    # Now query Bing Images
    query = "Trodat 4911"
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2&first=1"
    print(f"Querying Bing Images: {url}")
    
    res = session.get(url)
    print(f"Images page status: {res.status_code}")
    
    soup = BeautifulSoup(res.text, 'html.parser')
    iusc_tags = soup.find_all(class_='iusc')
    print(f"Found {len(iusc_tags)} iusc tags")
    
    for idx, tag in enumerate(iusc_tags[:5]):
        try:
            m_attr = tag.get('m')
            if m_attr:
                m_data = json.loads(m_attr)
                img_url = m_data.get('murl')
                title = m_data.get('t')
                print(f"{idx+1}: {img_url} ({title})")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == '__main__':
    test()
