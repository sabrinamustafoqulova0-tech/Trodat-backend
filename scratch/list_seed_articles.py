import re

def test():
    with open("C:/Users/User/Desktop/Project/backend/prisma/seed.ts", "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find all stamps declarations. They look like:
    # {
    #   article: '4910',
    #   name: 'Trodat Printy 4910',
    #   ...
    # }
    
    # We can match all blocks inside stamps list or simply extract article and name properties
    articles = re.findall(r"article:\s*'([^']+)'", content)
    names = re.findall(r"name:\s*'([^']+)'", content)
    
    print(f"Total articles in seed: {len(articles)}")
    print(f"Total names in seed: {len(names)}")
    
    unique_articles = sorted(list(set(articles)))
    print(f"Unique articles ({len(unique_articles)}):")
    print(", ".join(unique_articles))

if __name__ == '__main__':
    test()
