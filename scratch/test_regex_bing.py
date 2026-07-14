import requests
import re
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def test():
    query = "Trodat Printy 4911"
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}"
    print(f"Querying Bing: {url}")
    
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    
    # Extract all strings matching HTTP URLs with image extensions
    raw_urls = re.findall(r'https?://[^\s"\'>]+?\.(?:jpg|png|jpeg|webp)', res.text, re.IGNORECASE)
    
    # Filter and clean URLs
    filtered = []
    excluded_domains = [
        'bing.com', 'bing.net', 'microsoft.com', 'yimg.com', 'doubleclick', 'google', 
        'facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'wikipedia', 
        'pinterest', 'yahoo', 'live.com', 'office.com', 'skype', 'msn.com', 'gstatic.com'
    ]
    
    for u in raw_urls:
        # Unescape backslashes if present
        u_clean = u.replace('\\/', '/').replace('\\', '')
        # Simple domain filter
        if not any(dom in u_clean.lower() for dom in excluded_domains):
            if u_clean not in filtered:
                filtered.append(u_clean)
                
    print(f"Found {len(filtered)} filtered URLs:")
    for idx, u in enumerate(filtered[:20]):
        print(f"{idx+1}: {u}")

if __name__ == '__main__':
    test()
