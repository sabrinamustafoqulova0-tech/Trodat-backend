import requests
import re
import urllib.parse
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def test():
    query = "Trodat Printy 4911 stamp"
    
    # Step 1: Get VQD token
    url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
    print(f"Fetching VQD token from: {url}")
    res = requests.get(url, headers=headers)
    
    # Try finding VQD token in response
    vqd_match = re.search(r'vqd=([^&\'"]+)', res.text)
    if not vqd_match:
        print("VQD not found in first regex, trying alternative...")
        vqd_match = re.search(r'vqd\s*=\s*[\'"]([^\'"]+)[\'"]', res.text)
        
    if not vqd_match:
        print("VQD token not found. Response starts with:")
        print(res.text[:1000])
        return
        
    vqd = vqd_match.group(1)
    print(f"VQD token found: {vqd}")
    
    # Step 2: Query the image API
    image_url = f"https://duckduckgo.com/i.js?q={urllib.parse.quote(query)}&o=json&vqd={vqd}&f=,,,"
    print(f"Querying image API: {image_url}")
    img_res = requests.get(image_url, headers=headers)
    
    try:
        data = img_res.json()
        results = data.get('results', [])
        print(f"Found {len(results)} image results:")
        for idx, r in enumerate(results[:5]):
            print(f"{idx + 1}. {r.get('image')} (Title: {r.get('title')})")
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        print("Response body snapshot:")
        print(img_res.text[:1000])

if __name__ == '__main__':
    test()
