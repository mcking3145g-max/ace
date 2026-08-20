from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from html import unescape
from io import BytesIO
import re

from PIL import Image

SOURCES = {
    'pcCore': ('https://unsplash.com/photos/black-and-white-computer-tower-yJdDPQlljAc', 'pc-rtx2060.webp'),
    'pcPro': ('https://unsplash.com/photos/a-computer-tower-with-a-black-screen-fMbiAi0rbkA', 'pc-rtx4060.webp'),
    'pcElite': ('https://unsplash.com/photos/a-close-up-of-a-black-device-7_AraS9JLXo', 'pc-rx7700xt-intel.webp'),
    'pcRyzen': ('https://unsplash.com/photos/a-computer-tower-with-a-fan-FtP3ZM6hmNM', 'pc-rx7700xt-ryzen.webp'),
    'monitor': ('https://unsplash.com/photos/black-flat-screen-computer-monitor-turned-on-with-black-computer-keyboard-cIxE9fk7B2c', 'monitor.webp'),
    'ram': ('https://unsplash.com/photos/black-ram-stick-XIqWVbtftIs', 'ram.webp'),
    'keyboard': ('https://unsplash.com/photos/a-black-mechanical-keyboard-with-rgb-lighting-Gmoqo0u2ucY', 'keyboard.webp'),
    'mouse': ('https://unsplash.com/photos/black-and-white-box-on-black-surface-bh-aYQn8vfI', 'mouse.webp'),
    'headset': ('https://unsplash.com/photos/a-close-up-of-a-gaming-headset-on-a-black-background-Z1BBqeQ_2uM', 'headset.webp'),
    'mousepad': ('https://unsplash.com/photos/black-flat-screen-computer-monitor-turned-on-beside-black-computer-keyboard-xxL1FavYOh0', 'mousepad.webp'),
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Ace Gaming image updater)'}
OUT = Path('assets/rentals')
OUT.mkdir(parents=True, exist_ok=True)


def get(url: str) -> bytes:
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=30) as response:
        return response.read()


def og_image(page_url: str) -> str:
    page = get(page_url).decode('utf-8', errors='ignore')
    patterns = [
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, page, flags=re.I)
        if match:
            return unescape(match.group(1))
    raise RuntimeError(f'Could not find og:image for {page_url}')


for key, (page_url, filename) in SOURCES.items():
    image_url = og_image(page_url)
    raw = get(image_url)
    image = Image.open(BytesIO(raw)).convert('RGB')
    image.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
    image.save(OUT / filename, 'WEBP', quality=82, method=6)
    print(f'{key}: {filename} <- {urlparse(image_url).netloc}')

html_path = Path('rentals.html')
text = html_path.read_text(encoding='utf-8')
start = text.index('    const productArt = {')
end = text.index('    const products = [', start)

mapping = {
    'pcCore': 'assets/rentals/pc-rtx2060.webp',
    'pcPro': 'assets/rentals/pc-rtx4060.webp',
    'pcElite': 'assets/rentals/pc-rx7700xt-intel.webp',
    'pcRyzen': 'assets/rentals/pc-rx7700xt-ryzen.webp',
    'monitor': 'assets/rentals/monitor.webp',
    'ram': 'assets/rentals/ram.webp',
    'keyboard': 'assets/rentals/keyboard.webp',
    'mouse': 'assets/rentals/mouse.webp',
    'headset': 'assets/rentals/headset.webp',
    'mousepad': 'assets/rentals/mousepad.webp',
}

block = '    const productArt = {\n'
for key, path in mapping.items():
    block += f"      {key}: '{path}',\n"
block += '    };\n'

html_path.write_text(text[:start] + block + text[end:], encoding='utf-8')
print('Updated rentals.html productArt mapping.')
