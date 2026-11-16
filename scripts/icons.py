# Lager app-ikoner til web-versjonen fra assets/icon.png.
from PIL import Image
src = Image.open('assets/icon.png').convert('RGBA')
for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'apple-touch-icon.png')]:
    src.resize((size, size), Image.LANCZOS).convert('RGB').save(f'dist/{name}')
print('ikoner laget')
