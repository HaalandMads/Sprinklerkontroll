# Lager egne app-ikoner for web-versjonen (PWA), slik at den skiller seg fra APK-en:
# mørk bakgrunn, hvit sprinklerdyse, oransje dråper og teksten WEB.
from PIL import Image, ImageDraw, ImageFont

BG = (22, 32, 42)
WHITE = (255, 255, 255)
ORANGE = (242, 140, 40)


def font(size):
    for path in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'DejaVuSans-Bold.ttf'):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def icon(size=1024):
    im = Image.new('RGB', (size, size), BG)
    d = ImageDraw.Draw(im)
    u = size / 1024
    c = size / 2
    cy = c - 70 * u  # symbolet løftes litt for å gi plass til teksten
    d.rectangle([c - 40 * u, cy - 300 * u, c + 40 * u, cy - 130 * u], fill=WHITE)
    d.polygon([(c - 120 * u, cy - 130 * u), (c + 120 * u, cy - 130 * u), (c + 60 * u, cy - 25 * u), (c - 60 * u, cy - 25 * u)], fill=WHITE)
    d.rounded_rectangle([c - 210 * u, cy - 5 * u, c + 210 * u, cy + 35 * u], radius=12 * u, fill=WHITE)
    for dx, dy in [(-200, 130), (-100, 200), (0, 235), (100, 200), (200, 130)]:
        x, y, r = c + dx * u, cy + dy * u, 26 * u
        d.ellipse([x - r, y - r, x + r, y + r], fill=ORANGE)
        d.polygon([(x - r * 0.9, y - r * 0.3), (x + r * 0.9, y - r * 0.3), (x, y - r * 2.2)], fill=ORANGE)
    f = font(int(170 * u))
    text = 'WEB'
    box = d.textbbox((0, 0), text, font=f)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text((c - w / 2 - box[0], size - 290 * u - box[1]), text, font=f, fill=ORANGE)
    return im


if __name__ == '__main__':
    big = icon(1024)
    for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'apple-touch-icon.png')]:
        big.resize((size, size), Image.LANCZOS).save(f'dist/{name}')
    big.resize((48, 48), Image.LANCZOS).save('dist/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    print('ikoner laget')
