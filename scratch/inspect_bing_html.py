import requests
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    query = "Trodat Printy 4911"
    url = f"https://www.bing.com/images/search?q={requests.utils.quote(query)}"
    res = requests.get(url, headers=headers)
    
    with open("C:/Users/User/Desktop/Project/react/scratch/bing_raw.html", "w", encoding="utf-8") as f:
        f.write(res.text)
        
    print(f"HTML size: {len(res.text)} bytes")
    
    # Find all urls matching http or https
    urls = re.findall(r'https?://[^\s"\'>]+', res.text)
    print(f"Found {len(urls)} total URLs:")
    for idx, u in enumerate(urls[:30]):
        print(f"{idx+1}: {u[:120]}")

if __name__ == '__main__':
    test()
