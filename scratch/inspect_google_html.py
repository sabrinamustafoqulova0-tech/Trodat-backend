import requests
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
}

def test():
    query = "Trodat Printy 4911 stamp"
    url = f"https://www.google.com/search?q={requests.utils.quote(query)}&tbm=isch"
    res = requests.get(url, headers=headers)
    
    # Save raw html to check
    with open("C:/Users/User/Desktop/Project/react/scratch/google_raw.html", "w", encoding="utf-8") as f:
        f.write(res.text)
        
    print(f"HTML size: {len(res.text)} bytes")
    
    # Find all urls matching images
    urls = re.findall(r'https?://[^\s"\'>]+?\.(?:jpg|png|jpeg)', res.text, re.IGNORECASE)
    print(f"Found {len(urls)} matching URLs:")
    for idx, u in enumerate(urls[:20]):
        print(f"{idx+1}: {u}")

if __name__ == '__main__':
    test()
