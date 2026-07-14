import re

def test():
    with open("C:/Users/User/Desktop/Project/react/scratch/bing_raw.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    urls = re.findall(r'https?://[^\s"\'>\\{}]+\.(?:jpg|png|jpeg|webp)', html, re.IGNORECASE)
    print(f"Total image URLs found: {len(urls)}")
    
    excluded_domains = [
        'bing.com', 'bing.net', 'microsoft.com', 'yimg.com', 'doubleclick', 'google', 
        'facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'wikipedia', 
        'pinterest', 'yahoo', 'live.com', 'office.com', 'skype', 'msn.com', 'gstatic.com'
    ]
    
    filtered = []
    for u in urls:
        u_clean = u.replace('\\/', '/').replace('\\', '')
        if not any(dom in u_clean.lower() for dom in excluded_domains):
            if u_clean not in filtered:
                filtered.append(u_clean)
                
    print(f"Filtered image URLs ({len(filtered)}):")
    for idx, u in enumerate(filtered[:30]):
        print(f"{idx+1}: {u}")

if __name__ == '__main__':
    test()
