import requests
from bs4 import BeautifulSoup
import urllib.parse
import re
import os
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
}

def crawl_product_urls():
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
    product_urls = {}
    
    print("Crawling trodat-russia.ru for product pages...")
    while queue:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code != 200:
                continue
        except Exception as e:
            continue
            
        soup = BeautifulSoup(res.text, 'html.parser')
        for a in soup.find_all('a'):
            href = a.get('href')
            if not href:
                continue
            full_href = urllib.parse.urljoin(url, href)
            parsed = urllib.parse.urlparse(full_href)
            path = parsed.path
            if not path.endswith('/'):
                path += '/'
            clean_url = f"https://{parsed.netloc}{path}"
            
            if clean_url.startswith("https://trodat-russia.ru/catalog/"):
                match = re.search(r'/catalog/.+/([^/]+)/$', clean_url)
                if match:
                    code = match.group(1)
                    if code.isdigit() or code.lower() == 'ideal-seal':
                        if code not in product_urls:
                            product_urls[code] = clean_url
                            print(f"  [Found] '{code}' -> {clean_url}")
                    else:
                        if clean_url not in visited and clean_url not in queue:
                            queue.append(clean_url)
        time.sleep(0.05)
        
    print(f"Crawl complete. Found {len(product_urls)} product pages.")
    return product_urls

def get_image_url_from_product_page(product_url, article):
    try:
        res = requests.get(product_url, headers=headers, timeout=10)
        if res.status_code != 200:
            return None
            
        soup = BeautifulSoup(res.text, 'html.parser')
        img_candidates = []
        
        for img in soup.find_all('img'):
            src = img.get('src')
            if not src:
                continue
            full_src = urllib.parse.urljoin(product_url, src)
            
            # Skip common icons, flags, logos
            if any(x in full_src.lower() for x in ['logo', 'icon', 'close', 'yandex', 'mail.ru', 'flag']):
                continue
                
            alt = img.get('alt', '').strip()
            title = img.get('title', '').strip()
            cls = img.get('class', [])
            
            img_candidates.append({
                'url': full_src,
                'alt': alt,
                'title': title,
                'class': cls
            })
            
        # Strategy 1: Match img with alt equal or containing the article number
        for c in img_candidates:
            if c['alt'] == article or article in c['alt']:
                return c['url']
                
        # Strategy 2: Match img with class js-img and in upload
        for c in img_candidates:
            if 'js-img' in c['class'] and 'upload' in c['url']:
                return c['url']
                
        # Strategy 3: Any image containing upload
        for c in img_candidates:
            if 'upload' in c['url']:
                return c['url']
                
    except Exception as e:
        print(f"Error extracting image for {article}: {e}")
    return None

def download_image(url, article, dest_dir):
    try:
        # Determine file extension
        parsed = urllib.parse.urlparse(url)
        ext = os.path.splitext(parsed.path)[1]
        if not ext or len(ext) > 5:
            ext = '.jpg'
            
        filename = f"{article}{ext}"
        filepath = os.path.join(dest_dir, filename)
        
        print(f"  Downloading: {url} -> {filename}")
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(res.content)
            return filename
    except Exception as e:
        print(f"  Failed downloading image for {article}: {e}")
    return None

def main():
    dest_dir = "C:/Users/User/Desktop/Project/react/public/images/stamps"
    os.makedirs(dest_dir, exist_ok=True)
    
    # 1. Crawl trodat-russia.ru
    product_urls = crawl_product_urls()
    
    # 2. Read seed.ts to find all unique articles and check their series
    with open("C:/Users/User/Desktop/Project/backend/prisma/seed.ts", "r", encoding="utf-8") as f:
        seed_content = f.read()
        
    # Extract unique stamp blocks to identify series fallback
    # Stamp pattern: article: '...', series: '...'
    stamp_blocks = re.findall(r"\{\s*article:\s*'([^']+)'(?:.|\n)+?series:\s*'([^']+)'", seed_content)
    article_series_map = {art: ser.lower() for art, ser in stamp_blocks}
    
    unique_articles = list(article_series_map.keys())
    print(f"Found {len(unique_articles)} articles in seed file.")
    
    # Map from article to new image filename
    article_image_map = {}
    
    # Download images
    for idx, article in enumerate(unique_articles):
        print(f"[{idx+1}/{len(unique_articles)}] Processing article '{article}'...")
        
        # Check if already downloaded
        downloaded_file = None
        for ext in ['.jpg', '.png', '.jpeg', '.webp']:
            if os.path.exists(os.path.join(dest_dir, f"{article}{ext}")):
                downloaded_file = f"{article}{ext}"
                break
                
        if downloaded_file:
            print(f"  Already downloaded: {downloaded_file}")
            article_image_map[article] = f"/images/stamps/{downloaded_file}"
            continue
            
        # Find product url
        p_url = product_urls.get(article)
        image_url = None
        if p_url:
            image_url = get_image_url_from_product_page(p_url, article)
            
        if image_url:
            filename = download_image(image_url, article, dest_dir)
            if filename:
                article_image_map[article] = f"/images/stamps/{filename}"
                # Sleep polite
                time.sleep(0.1)
                continue
                
        # Fallback series image
        series = article_series_map.get(article, 'printy')
        # Map series to existing public images
        fallback_map = {
            'professional': '/images/stamps/professional.png',
            'printy': '/images/stamps/printy.png',
            'mobile': '/images/stamps/mobile.png',
            'classic': '/images/stamps/classic.png',
            'ideal': '/images/stamps/ideal.png',
            'accessories': '/images/stamps/accessories.png'
        }
        fallback_path = fallback_map.get(series, '/images/stamps/printy.png')
        print(f"  [No Image] Using fallback for series '{series}': {fallback_path}")
        article_image_map[article] = fallback_path

    # 3. Update seed.ts
    def replace_image_main(match):
        prefix = match.group(1)
        article = match.group(2)
        old_url = match.group(3)
        suffix = match.group(4)
        
        new_path = article_image_map.get(article, fallback_map.get(article_series_map.get(article, 'printy'), '/images/stamps/printy.png'))
        return f"{prefix}{new_path}{suffix}"
        
    print("Updating backend/prisma/seed.ts...")
    # Regex: captures up to article, captures article, captures placeholder, captures close quote
    pattern = r"(article:\s*'([^']+)'(?:.|\n)+?imageMain:\s*')([^']+)(')"
    updated_content = re.sub(pattern, replace_image_main, seed_content)
    
    with open("C:/Users/User/Desktop/Project/backend/prisma/seed.ts", "w", encoding="utf-8") as f:
        f.write(updated_content)
        
    print("Done! seed.ts successfully updated with local image paths.")

if __name__ == '__main__':
    main()
