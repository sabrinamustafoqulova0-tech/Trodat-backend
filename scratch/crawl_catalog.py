import requests
from bs4 import BeautifulSoup
import urllib.parse
import re
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def crawl():
    start_urls = [
        "https://trodat-russia.ru/catalog/",
        "https://trodat-russia.ru/catalog/classic/",
        "https://trodat-russia.ru/catalog/ideal/",
        "https://trodat-russia.ru/catalog/mobilnye-shtampy/",
        "https://trodat-russia.ru/catalog/printy/",
        "https://trodat-russia.ru/catalog/professional/"
    ]
    
    queue = list(start_urls)
    visited = set()
    product_urls = {} # article -> url
    
    print("Starting catalog crawl...")
    while queue:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        
        print(f"Crawling: {url}")
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code != 200:
                continue
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
            continue
            
        soup = BeautifulSoup(res.text, 'html.parser')
        for a in soup.find_all('a'):
            href = a.get('href')
            if not href:
                continue
            full_href = urllib.parse.urljoin(url, href)
            # Normalize url (remove query params, fragment, and ensure trailing slash)
            parsed = urllib.parse.urlparse(full_href)
            path = parsed.path
            if not path.endswith('/'):
                path += '/'
            clean_url = f"https://{parsed.netloc}{path}"
            
            if clean_url.startswith("https://trodat-russia.ru/catalog/"):
                # Check if it is a product page (ends with article number/code followed by /)
                # E.g., /catalog/printy/tekstovye-shtampy/4911/
                match = re.search(r'/catalog/.+/([^/]+)/$', clean_url)
                if match:
                    code = match.group(1)
                    # If the code is numeric, or is a known code
                    if code.isdigit() or code.lower() == 'ideal-seal':
                        if code not in product_urls:
                            product_urls[code] = clean_url
                            print(f"Found product page for article '{code}': {clean_url}")
                    else:
                        # It is a category or intermediate page, add to queue if not visited
                        if clean_url not in visited and clean_url not in queue:
                            queue.append(clean_url)
        # Sleep slightly to be polite
        time.sleep(0.1)
        
    print(f"\nCrawl finished. Found {len(product_urls)} product pages.")
    for code, p_url in sorted(product_urls.items())[:20]:
        print(f"  {code}: {p_url}")

if __name__ == '__main__':
    crawl()
