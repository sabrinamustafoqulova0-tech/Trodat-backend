import re
import json

with open("C:/Users/User/Desktop/Project/backend/prisma/seed.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find the array of stamps
# It starts around const stamps = [ ... ]
stamps_match = re.search(r"const stamps = \[\s*(\{[\s\S]+?\})\s*\];", content)
if not stamps_match:
    # Try finding the array inside main function
    stamps_match = re.search(r"const stamps = \[\s*(\{[\s\S]+?\})\s*\]\s*;", content)

# Instead of complex parsing, let's find all object blocks in the stamps list using regex
# Each stamp block looks like:
# {
#   article: '...',
#   name: '...',
#   ...
# }
blocks = re.findall(r"\{\s*article:\s*'([^']+)',\s*name:\s*'([^']+)'", content)
print(f"Found {len(blocks)} stamps:")
for art, name in blocks:
    print(f"  Article: {art} | Name: {name}")
