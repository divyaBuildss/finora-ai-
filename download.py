import json
import os
import urllib.request

output_file = "/Users/gopaljidwivedi/.gemini/antigravity-ide/brain/6552adde-391f-4fce-aa6d-a4015890ad50/.system_generated/steps/5/output.txt"
output_dir = "/Users/gopaljidwivedi/FINORA AI/stitch_screens"

os.makedirs(output_dir, exist_ok=True)

with open(output_file, 'r') as f:
    data = json.load(f)

for screen in data.get('screens', []):
    title = screen.get('title', 'Unknown').replace('|', '-').replace('/', '-').replace(' ', '_')
    print(f"Downloading {title}...")
    
    screenshot = screen.get('screenshot', {})
    if screenshot and screenshot.get('downloadUrl'):
        url = screenshot.get('downloadUrl')
        urllib.request.urlretrieve(url, os.path.join(output_dir, f"{title}.png"))
        
    html_code = screen.get('htmlCode', {})
    if html_code and html_code.get('downloadUrl'):
        url = html_code.get('downloadUrl')
        urllib.request.urlretrieve(url, os.path.join(output_dir, f"{title}.html"))

print("Done.")
