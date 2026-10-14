"""Generates the Retreva splash/cover illustrations as standalone SVG files (original vector art). Run: python3 generate.py"""
import math, os, random

OUT = os.path.dirname(os.path.abspath(__file__))  
os.makedirs(OUT, exist_ok=True)


def save(name, w, h, body, defs=''):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
    if defs:
        svg += f'<defs>{defs}</defs>'
    svg += body + '</svg>'
    with open(os.path.join(OUT, name), 'w') as f:
        f.write(svg)


def lg(id_, stops, x2=0, y2=1, x1=0, y1=0):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rg(id_, stops, cx=.5, cy=.5, r=.5):
    s = ''
    for t in stops:
        op = f' stop-opacity="{t[2]}"' if len(t) > 2 else ''
        s += f'<stop offset="{t[0]}" stop-color="{t[1]}"{op}/>'
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


def sparkle(x, y, s, fill='#fff', op=1):
    return (f'<path d="M{x} {y-s} Q{x+s*.18} {y-s*.18} {x+s} {y} Q{x+s*.18} {y+s*.18} {x} {y+s} '
            f'Q{x-s*.18} {y+s*.18} {x-s} {y} Q{x-s*.18} {y-s*.18} {x} {y-s} Z" fill="{fill}" opacity="{op}"/>')


# ───────────────────────── PARIS ─────────────────────────
def paris():
    r = random.Random(1)
    d = lg('sky', [(0, '#24245e'), (.42, '#9c4f8f'), (.78, '#ff9e74'), (1, '#ffd49a')])
    d += lg('tw', [(0, '#fff0bf'), (.5, '#f5b955'), (1, '#c97a26')])
    d += lg('riv', [(0, '#3a2d6a'), (1, '#1d1740')])
    d += rg('glow', [(0, '#ffd27a', .55), (1, '#ffd27a', 0)])
    b = '<rect width="400" height="300" fill="url(#sky)"/>'
    b += ''.join(f'<circle cx="{r.uniform(0,400):.0f}" cy="{r.uniform(0,90):.0f}" r="{r.uniform(.6,1.4):.1f}" fill="#fff" opacity="{r.uniform(.4,.9):.2f}"/>' for _ in range(28))
    b += '<circle cx="318" cy="214" r="34" fill="#ffe3a6" opacity=".9"/>'
    b += '<ellipse cx="200" cy="150" rx="110" ry="140" fill="url(#glow)"/>'
    # Eiffel tower
    t = ('<path d="M199 22 L201 22 L203 62 L197 62 Z"/>'
         '<path d="M196 62 L204 62 L212 140 L188 140 Z"/>'
         '<rect x="183" y="138" width="34" height="7" rx="1"/>'
         '<path d="M187 145 L213 145 L225 196 L175 196 Z"/>'
         '<rect x="163" y="194" width="74" height="9" rx="1"/>'
         '<path d="M167 203 L233 203 L274 264 L242 264 Q200 222 158 264 L126 264 Z"/>')
    b += f'<g fill="url(#tw)">{t}</g>'
    lat = ''
    for y0, y1, xa0, xa1, xb0, xb1 in [(62, 140, 196, 204, 188, 212), (145, 196, 187, 213, 175, 225)]:
        lat += f'<path d="M{xa0} {y0} L{xb1} {y1} M{xa1} {y0} L{xb0} {y1}"/>'
        mid = (y0 + y1) / 2
        lat += f'<path d="M{(xa0+xb0)/2:.0f} {mid:.0f} L{(xa1+xb1)/2:.0f} {mid:.0f}"/>'
    lat += '<path d="M170 210 L236 210 M150 232 Q200 214 250 232"/>'
    b += f'<g stroke="#a8641f" stroke-width="1" fill="none" opacity=".7">{lat}</g>'
    b += ''.join(f'<circle cx="{x}" cy="{y}" r="1.4" fill="#fffbe6"/>' for x, y in [(200, 70), (198, 100), (202, 120), (190, 170), (210, 170), (180, 199), (220, 199), (150, 240), (250, 240), (200, 30)])
    # Haussmann buildings
    def block(x0, x1, top, seed):
        rr = random.Random(seed)
        s = ''
        x = x0
        while x < x1:
            w = rr.randint(34, 52)
            h = rr.randint(28, 46)
            y = top - h + rr.randint(0, 10)
            s += f'<path d="M{x} 300 L{x} {y+8} L{x+5} {y} L{x+w-5} {y} L{x+w} {y+8} L{x+w} 300 Z" fill="#2c1d48"/>'
            for cx in range(x + 6, x + w - 6, 9):
                for cy in range(y + 14, 262, 12):
                    if rr.random() > .35:
                        s += f'<rect x="{cx}" y="{cy}" width="4" height="6" fill="#ffce7a" opacity="{rr.uniform(.55,1):.2f}"/>'
            x += w + 1
        return s
    b += block(-4, 140, 262, 3) + block(262, 404, 262, 4)
    b += '<rect x="0" y="262" width="400" height="38" fill="url(#riv)"/>'
    for i in range(14):
        y = 266 + i * 2.4
        w = 60 - i * 3
        b += f'<rect x="{200 - w/2:.0f}" y="{y:.1f}" width="{w}" height="1.2" fill="#ffd27a" opacity="{.8 - i*.05:.2f}"/>'
    b += '<rect x="290" y="268" width="56" height="1.4" fill="#ffe3a6" opacity=".6"/><rect x="300" y="274" width="36" height="1.2" fill="#ffe3a6" opacity=".45"/>'
    save('paris.svg', 400, 300, b, d)


# ───────────────────────── TOKYO ─────────────────────────
def tokyo():
    r = random.Random(2)
    d = lg('sky', [(0, '#f2a9c4'), (.55, '#ffd9c7'), (1, '#fff3e0')])
    d += lg('mt', [(0, '#4f5f9e'), (1, '#8e9fd6')])
    d += lg('lake', [(0, '#8aa5d8'), (1, '#5d78b5')])
    b = '<rect width="400" height="300" fill="url(#sky)"/>'
    b += '<circle cx="282" cy="96" r="40" fill="#ec4b3c"/>'
    b += '<path d="M20 236 Q100 180 176 98 Q196 90 214 98 Q296 176 390 236 Z" fill="url(#mt)"/>'
    b += '<path d="M176 98 Q196 90 214 98 Q232 118 248 136 L236 132 L228 146 L216 132 L206 150 L196 134 L184 148 L176 132 L162 142 L156 130 Q166 114 176 98 Z" fill="#fbfbff"/>'
    b += '<path d="M0 236 L400 236 L400 300 L0 300 Z" fill="url(#lake)"/>'
    b += '<path d="M60 236 Q130 262 196 290 Q262 262 340 236 Z" fill="#9cb2e0" opacity=".45"/>'
    b += '<path d="M0 230 Q60 222 120 234 L120 240 L0 240 Z" fill="#3b4a7c"/>'
    # pagoda
    pg = ''
    tiers = [(86, 228, 60), (86, 198, 50), (86, 171, 42), (86, 147, 34), (86, 126, 27)]
    for cx, y, w in tiers:
        pg += f'<rect x="{cx - w*.36:.1f}" y="{y-14}" width="{w*.72:.1f}" height="16" fill="#c3392e"/>'
        pg += f'<rect x="{cx - w*.36 + 4:.1f}" y="{y-11}" width="{w*.72-8:.1f}" height="8" fill="#7a1d18"/>'
        pg += f'<path d="M{cx - w/2 - 8:.1f} {y-12} Q{cx} {y-24} {cx + w/2 + 8:.1f} {y-12} L{cx + w/2 - 2:.1f} {y-17} L{cx - w/2 + 2:.1f} {y-17} Z" fill="#2b2433"/>'
    pg += '<rect x="85" y="86" width="2" height="26" fill="#2b2433"/><circle cx="86" cy="96" r="2.5" fill="#d8a640"/><circle cx="86" cy="103" r="2.5" fill="#d8a640"/>'
    b += pg
    # cherry blossom branches
    b += '<path d="M400 18 Q340 30 300 14 M372 24 Q350 50 318 58 M400 60 Q380 70 352 90" stroke="#4a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    b += '<path d="M0 30 Q40 40 70 26 M20 36 Q34 60 60 66" stroke="#4a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    for cx, cy, n, spread in [(330, 22, 26, 34), (340, 58, 18, 26), (378, 82, 18, 24), (36, 36, 22, 30), (58, 62, 12, 18)]:
        for _ in range(n):
            x = cx + r.uniform(-spread, spread)
            y = cy + r.uniform(-spread * .55, spread * .55)
            b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r.uniform(3.5,6.5):.1f}" fill="{r.choice(["#ffb7cf","#ff9ec0","#ffd3e2","#f78fb3"])}" opacity=".95"/>'
    for _ in range(18):
        x, y = r.uniform(120, 400), r.uniform(80, 280)
        b += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="2.6" ry="1.6" fill="#ffb7cf" transform="rotate({r.randint(0,180)} {x:.0f} {y:.0f})"/>'
    save('tokyo.svg', 400, 300, b, d)


# ───────────────────────── DUBAI ─────────────────────────
def dubai():
    r = random.Random(3)
    d = lg('sky', [(0, '#1f86c9'), (.55, '#8fd2ef'), (1, '#ffe2a8')])
    d += lg('glass', [(0, '#f2f7fb'), (.5, '#b9cde0'), (1, '#6f8fb0')], x2=1, y2=0)
    d += lg('glass2', [(0, '#9fb9d4'), (1, '#4f6f93')], x2=1, y2=0)
    d += lg('sea', [(0, '#1fb5c8'), (1, '#0b7f9e')])
    b = '<rect width="400" height="300" fill="url(#sky)"/>'
    b += '<circle cx="80" cy="200" r="60" fill="#fff4cf" opacity=".35"/><circle cx="80" cy="200" r="28" fill="#fff6d9" opacity=".8"/>'
    # background towers
    xs = [(18, 30, 150), (52, 26, 120), (282, 30, 135), (318, 22, 170), (345, 34, 110), (378, 24, 140), (120, 22, 100), (150, 24, 130)]
    for x, w, h in xs:
        b += f'<rect x="{x}" y="{252-h}" width="{w}" height="{h}" fill="url(#glass2)" opacity=".85"/>'
        for yy in range(252 - h + 6, 250, 7):
            b += f'<rect x="{x+3}" y="{yy}" width="{w-6}" height="1.2" fill="#dbe8f4" opacity=".35"/>'
    # twisted tower
    b += '<path d="M248 252 L246 120 Q252 100 262 96 Q272 100 276 120 L274 252 Z" fill="url(#glass)"/>'
    b += ''.join(f'<path d="M247 {y} Q261 {y-6} 275 {y}" stroke="#7d98b6" stroke-width="1" fill="none"/>' for y in range(116, 252, 9))
    # supertall stepped spire
    pts = [(196, 254), (196, 210), (201, 210), (203, 168), (207, 168), (209, 128), (212, 128), (214, 92), (216, 92), (217, 58), (218.5, 58), (219.2, 14), (219.8, 14),
           (220.5, 58), (222, 58), (224, 96), (227, 96), (230, 140), (234, 140), (238, 186), (242, 186), (245, 226), (250, 226), (250, 254)]
    b += '<polygon points="' + ' '.join(f'{x},{y}' for x, y in pts) + '" fill="url(#glass)"/>'
    b += '<path d="M220 20 L220 254" stroke="#ffffff" stroke-width="1.2" opacity=".6"/>'
    b += ''.join(f'<path d="M{200+i*0} {y} L{246} {y}" stroke="#8aa5c3" stroke-width=".8" opacity=".5"/>' for i, y in enumerate(range(200, 254, 8)))
    b += sparkle(220, 16, 7, '#ffffff', .95)
    # sea, beach, palms
    b += '<path d="M0 252 L400 252 L400 300 L0 300 Z" fill="url(#sea)"/>'
    b += ''.join(f'<rect x="{r.uniform(0,380):.0f}" y="{r.uniform(258,296):.0f}" width="{r.uniform(8,24):.0f}" height="1.4" fill="#d9fbff" opacity=".7"/>' for _ in range(16))
    b += '<path d="M0 282 Q120 270 240 300 L0 300 Z" fill="#f2d39b"/>'
    def palm(x, y, s):
        p = f'<path d="M{x} {y} Q{x+4*s} {y-30*s} {x+2*s} {y-62*s}" stroke="#5a3b24" stroke-width="{4*s}" fill="none" stroke-linecap="round"/>'
        tx, ty = x + 2 * s, y - 62 * s
        for ang in [-160, -125, -90, -55, -20, 10, 200]:
            a = math.radians(ang)
            ex, ey = tx + math.cos(a) * 34 * s, ty + math.sin(a) * 18 * s + 10 * s
            p += f'<path d="M{tx} {ty} Q{(tx+ex)/2:.1f} {ty-12*s:.1f} {ex:.1f} {ey:.1f} Q{(tx+ex)/2:.1f} {ty-2*s:.1f} {tx} {ty} Z" fill="#1f7a4a"/>'
        return p
    b += palm(40, 292, 1.1) + palm(92, 296, .8)
    # yacht
    b += '<path d="M300 268 L370 268 L360 278 L310 278 Z" fill="#ffffff"/><path d="M318 268 L322 260 L352 260 L358 268 Z" fill="#e8eef4"/><rect x="326" y="262" width="22" height="3" fill="#2a4d6e"/>'
    save('dubai.svg', 400, 300, b, d)


# ───────────────────────── NEW YORK ─────────────────────────
def newyork():
    r = random.Random(4)
    d = lg('sky', [(0, '#0a1238'), (.6, '#27357a'), (1, '#7a4f9e')])
    d += lg('water', [(0, '#1b1f55'), (1, '#0c0f30')])
    d += lg('deco', [(0, '#d9dcef'), (1, '#6e74a8')], x2=1, y2=0)
    b = '<rect width="400" height="300" fill="url(#sky)"/>'
    b += ''.join(f'<circle cx="{r.uniform(0,400):.0f}" cy="{r.uniform(0,120):.0f}" r="{r.uniform(.5,1.3):.1f}" fill="#fff" opacity="{r.uniform(.3,.9):.2f}"/>' for _ in range(40))
    b += '<circle cx="330" cy="58" r="22" fill="#fff4c8"/><circle cx="322" cy="52" r="4" fill="#ecdca8"/><circle cx="337" cy="64" r="3" fill="#ecdca8"/>'
    # far skyline
    x = -4
    while x < 404:
        w = r.randint(14, 26); h = r.randint(60, 130)
        b += f'<rect x="{x}" y="{238-h}" width="{w}" height="{h}" fill="#1b2152"/>'
        x += w + r.randint(0, 3)
    # near skyline with windows
    def tower(x, w, h, fill='#121638', cap=None):
        s = f'<rect x="{x}" y="{240-h}" width="{w}" height="{h}" fill="{fill}"/>'
        if cap == 'flat':
            s += f'<rect x="{x+3}" y="{240-h-6}" width="{w-6}" height="6" fill="{fill}"/>'
        for cx in range(x + 3, x + w - 3, 5):
            for cy in range(240 - h + 6, 236, 6):
                if r.random() > .45:
                    s += f'<rect x="{cx}" y="{cy}" width="2.4" height="3" fill="{r.choice(["#ffd27a","#ffe7a8","#ffb956"])}" opacity="{r.uniform(.5,1):.2f}"/>'
        return s
    for x, w, h in [(0, 34, 120), (36, 22, 150), (60, 30, 100), (94, 26, 170), (236, 30, 140), (268, 24, 115), (294, 36, 160), (334, 26, 105), (362, 40, 135)]:
        b += tower(x, w, h, cap='flat' if h > 140 else None)
    # art-deco spire tower (generic)
    deco = ('<rect x="160" y="110" width="56" height="130"/>'
            '<rect x="166" y="84" width="44" height="28"/>'
            '<rect x="173" y="64" width="30" height="22"/>'
            '<rect x="179" y="48" width="18" height="18"/>'
            '<path d="M182 48 L188 22 L194 48 Z"/>'
            '<rect x="187.2" y="4" width="1.6" height="20"/>')
    b += f'<g fill="url(#deco)">{deco}</g>'
    for cx in range(164, 214, 5):
        for cy in range(116, 236, 7):
            if r.random() > .3:
                b += f'<rect x="{cx}" y="{cy}" width="2" height="3.5" fill="#fff3c4" opacity="{r.uniform(.5,1):.2f}"/>'
    b += '<rect x="166" y="84" width="44" height="3" fill="#ffd27a"/><rect x="173" y="64" width="30" height="2.5" fill="#ffd27a"/><circle cx="188" cy="4" r="2.5" fill="#ff5a5a"/>'
    # suspension bridge
    b += '<rect x="0" y="240" width="400" height="60" fill="url(#water)"/>'
    b += '<path d="M0 258 L400 258" stroke="#30356e" stroke-width="5"/>'
    b += '<rect x="96" y="196" width="14" height="64" fill="#2c315f"/><rect x="290" y="196" width="14" height="64" fill="#2c315f"/>'
    b += '<path d="M96 210 L110 210 M96 230 L110 230 M290 210 L304 210 M290 230 L304 230" stroke="#151a40" stroke-width="3"/>'
    b += '<path d="M-20 254 Q50 212 103 198 Q200 250 297 198 Q350 212 420 254" stroke="#e8ecff" stroke-width="1.6" fill="none"/>'
    for i in range(-4, 42):
        xx = i * 10
        # vertical suspenders under cable approximated
        if 103 < xx < 297:
            t = (xx - 103) / 194; y = 198 + 52 * 4 * t * (1 - t) * .6
            b += f'<path d="M{xx} {y:.1f} L{xx} 256" stroke="#c9cff5" stroke-width=".5" opacity=".7"/>'
    b += ''.join(f'<circle cx="{xx}" cy="257" r="1.3" fill="#ffe7a8"/>' for xx in range(4, 400, 14))
    for i in range(30):
        xx = r.uniform(0, 400)
        b += f'<rect x="{xx:.0f}" y="{r.uniform(264,298):.0f}" width="{r.uniform(4,16):.0f}" height="1.2" fill="#ffd27a" opacity="{r.uniform(.2,.6):.2f}"/>'
    save('newyork.svg', 400, 300, b, d)


# ───────────────────────── SANTORINI ─────────────────────────
def santorini():
    r = random.Random(5)
    d = lg('sky', [(0, '#3d5fb8'), (.5, '#f39bb6'), (1, '#ffd9a0')])
    d += lg('sea', [(0, '#2b6fd0'), (1, '#123f8f')])
    b = '<rect width="400" height="300" fill="url(#sky)"/>'
    b += '<circle cx="330" cy="168" r="30" fill="#ffe0a3"/>'
    b += '<rect x="0" y="176" width="400" height="124" fill="url(#sea)"/>'
    b += '<path d="M300 176 L360 176 L345 300 L315 300 Z" fill="#ffd28a" opacity=".25"/>'
    b += ''.join(f'<rect x="{r.uniform(260,400):.0f}" y="{r.uniform(180,296):.0f}" width="{r.uniform(6,20):.0f}" height="1.4" fill="#ffe0a3" opacity="{r.uniform(.3,.8):.2f}"/>' for _ in range(16))
    # cliff
    b += '<path d="M0 120 Q90 112 170 150 Q220 175 250 220 Q262 260 250 300 L0 300 Z" fill="#8a5a4a"/>'
    b += '<path d="M0 150 Q100 150 180 190 Q220 215 236 260 L236 300 L0 300 Z" fill="#6e4438"/>'
    # houses
    houses = [(10, 104, 40, 30), (52, 100, 34, 34), (90, 110, 44, 28), (136, 126, 36, 30), (20, 136, 36, 30), (60, 138, 42, 32), (106, 142, 38, 28), (148, 158, 40, 28),
              (186, 174, 34, 28), (30, 170, 44, 30), (78, 176, 40, 28), (122, 174, 42, 30), (168, 190, 36, 28), (204, 206, 30, 26), (50, 208, 40, 28), (96, 208, 44, 30),
              (144, 210, 40, 28), (186, 228, 34, 26), (20, 240, 46, 30), (70, 242, 42, 30), (118, 244, 44, 28), (166, 250, 40, 30)]
    for x, y, w, h in houses:
        b += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="2" fill="#fbfbfd"/>'
        b += f'<rect x="{x+w-8}" y="{y}" width="8" height="{h}" fill="#dfe4f0"/>'
        b += f'<rect x="{x+6}" y="{y+h-14}" width="7" height="12" rx="3.5" fill="#2a5bc4"/>'
        if w > 36:
            b += f'<rect x="{x+18}" y="{y+8}" width="6" height="6" fill="#1d3f8f"/>'
    for cx, cy, rr in [(100, 110, 13), (150, 158, 11), (60, 136, 10), (196, 206, 10)]:
        b += f'<path d="M{cx-rr} {cy} A{rr} {rr} 0 0 1 {cx+rr} {cy} Z" fill="#1c5fd4"/><rect x="{cx-rr}" y="{cy}" width="{rr*2}" height="10" fill="#fbfbfd"/><rect x="{cx-.8}" y="{cy-rr-7}" width="1.6" height="7" fill="#e8d18a"/><path d="M{cx-3} {cy-rr-4} L{cx+3} {cy-rr-4}" stroke="#e8d18a" stroke-width="1.4"/>'
    # bell tower
    b += '<rect x="214" y="170" width="20" height="40" fill="#fbfbfd"/><path d="M214 170 L224 156 L234 170 Z" fill="#1c5fd4"/><rect x="219" y="176" width="10" height="12" rx="5" fill="#ce9b3a"/>'
    # bougainvillea
    for _ in range(70):
        x = r.uniform(0, 200); y = r.uniform(130, 290)
        b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r.uniform(1.8,4):.1f}" fill="{r.choice(["#e0338a","#f05aa5","#c41d6f"])}" opacity=".9"/>'
    # yacht on sea
    b += '<path d="M280 232 L346 232 L336 242 L288 242 Z" fill="#fff"/><path d="M294 232 L300 222 L330 222 L336 232 Z" fill="#e8eef4"/><rect x="302" y="225" width="24" height="3" fill="#1c3f6e"/><path d="M286 244 Q312 250 340 244" stroke="#cfe3ff" stroke-width="1.2" fill="none" opacity=".7"/>'
    save('santorini.svg', 400, 300, b, d)


# ───────────────────────── MALDIVES ─────────────────────────
def maldives():
    r = random.Random(6)
    d = lg('sky', [(0, '#2fa7ec'), (1, '#bdeeff')])
    d += lg('lag', [(0, '#0e79b0'), (.35, '#14b5c8'), (1, '#5ff0dc')])
    b = '<rect width="400" height="300" fill="url(#sky)"/>'
    for cx, cy, s in [(70, 50, 1), (300, 34, 1.3), (200, 70, .8)]:
        b += f'<g fill="#fff" opacity=".92"><ellipse cx="{cx}" cy="{cy}" rx="{30*s}" ry="{11*s}"/><ellipse cx="{cx+18*s}" cy="{cy-8*s}" rx="{18*s}" ry="{12*s}"/><ellipse cx="{cx-16*s}" cy="{cy-4*s}" rx="{14*s}" ry="{9*s}"/></g>'
    b += '<rect x="0" y="118" width="400" height="182" fill="url(#lag)"/>'
    b += '<rect x="0" y="118" width="400" height="3" fill="#0a5f8f" opacity=".6"/>'
    for _ in range(40):
        b += f'<path d="M{r.uniform(0,400):.0f} {r.uniform(130,296):.0f} q4 -2 8 0" stroke="#e8fffb" stroke-width="1.2" fill="none" opacity="{r.uniform(.3,.8):.2f}"/>'
    # boardwalk
    b += '<path d="M-10 214 Q120 170 230 150 Q300 140 380 146" stroke="#b7865a" stroke-width="5" fill="none"/>'
    vill = [(40, 196, 1.0), (96, 178, .92), (150, 164, .84), (204, 154, .76), (256, 148, .68), (304, 146, .6), (348, 146, .54)]
    for x, y, s in vill:
        w = 46 * s; h = 20 * s
        for k in range(4):
            sx = x - w / 2 + 4 + k * (w - 8) / 3
            b += f'<rect x="{sx:.1f}" y="{y:.1f}" width="{2*s:.1f}" height="{18*s:.1f}" fill="#5b3a22"/>'
        b += f'<rect x="{x-w/2:.1f}" y="{y-h:.1f}" width="{w:.1f}" height="{h:.1f}" fill="#f6e6c8"/>'
        b += f'<rect x="{x-w/4:.1f}" y="{y-h*.75:.1f}" width="{w/2:.1f}" height="{h*.55:.1f}" fill="#3a6f8f"/>'
        b += f'<path d="M{x-w/2-6*s:.1f} {y-h:.1f} L{x:.1f} {y-h-18*s:.1f} L{x+w/2+6*s:.1f} {y-h:.1f} Z" fill="#c4874a"/>'
        b += f'<path d="M{x-w/2-6*s:.1f} {y-h:.1f} L{x+w/2+6*s:.1f} {y-h:.1f}" stroke="#8a5a2c" stroke-width="{2*s:.1f}"/>'
        b += f'<rect x="{x-w/2:.1f}" y="{y+18*s:.1f}" width="{w:.1f}" height="{3*s:.1f}" fill="#7fe6e0" opacity=".5"/>'
    # islet with palm
    b += '<ellipse cx="350" cy="262" rx="70" ry="16" fill="#f7e6bd"/><ellipse cx="350" cy="266" rx="84" ry="22" fill="#9ff3e6" opacity=".45"/>'
    b += '<path d="M344 258 Q350 220 370 196" stroke="#6b4426" stroke-width="5" fill="none" stroke-linecap="round"/>'
    tx, ty = 370, 196
    for ang in [-170, -130, -95, -60, -25, 10, 40]:
        a = math.radians(ang)
        ex, ey = tx + math.cos(a) * 42, ty + math.sin(a) * 22 + 14
        b += f'<path d="M{tx} {ty} Q{(tx+ex)/2:.1f} {ty-14:.1f} {ex:.1f} {ey:.1f} Q{(tx+ex)/2:.1f} {ty-3:.1f} {tx} {ty} Z" fill="#1d8a52"/>'
    b += sparkle(120, 240, 6, '#ffffff', .9) + sparkle(260, 210, 4, '#ffffff', .8) + sparkle(60, 270, 5, '#ffffff', .8)
    save('maldives.svg', 400, 300, b, d)


# ───────────────────────── VILLA ─────────────────────────
def villa():
    r = random.Random(7)
    d = lg('sky', [(0, '#1a2457'), (.55, '#7d4a8c'), (1, '#f39a6a')])
    d += lg('glass', [(0, '#ffe2a0'), (1, '#ffb555')])
    d += lg('pool', [(0, '#5df2ee'), (1, '#119fb5')])
    b = '<rect width="400" height="300" fill="url(#sky)"/>'
    b += ''.join(f'<circle cx="{r.uniform(0,400):.0f}" cy="{r.uniform(0,80):.0f}" r="{r.uniform(.5,1.2):.1f}" fill="#fff" opacity="{r.uniform(.3,.8):.2f}"/>' for _ in range(24))
    b += '<path d="M0 176 Q120 150 240 170 Q330 180 400 160 L400 300 L0 300 Z" fill="#26324f"/>'
    b += '<rect x="0" y="168" width="400" height="18" fill="#3a3f72" opacity=".7"/>'
    # villa volumes
    b += '<rect x="80" y="150" width="260" height="62" fill="#f4f1ea"/>'
    b += '<rect x="96" y="160" width="228" height="44" fill="url(#glass)"/>'
    b += ''.join(f'<rect x="{x}" y="160" width="3" height="44" fill="#d9d2c4"/>' for x in range(130, 324, 38))
    b += '<rect x="140" y="104" width="220" height="48" fill="#f9f7f2"/>'
    b += '<rect x="154" y="112" width="150" height="34" fill="url(#glass)"/>'
    b += ''.join(f'<rect x="{x}" y="112" width="3" height="34" fill="#d9d2c4"/>' for x in range(190, 304, 38))
    b += '<rect x="130" y="100" width="240" height="6" fill="#ffffff"/><rect x="70" y="146" width="280" height="6" fill="#ffffff"/>'
    b += '<rect x="318" y="112" width="34" height="34" fill="#c8a27a"/>'
    # people silhouettes inside & lamps
    b += '<circle cx="230" cy="122" r="5" fill="#ffd27a"/><circle cx="170" cy="172" r="5" fill="#ffd27a"/>'
    # deck + pool
    b += '<rect x="40" y="212" width="340" height="10" fill="#d9c7a8"/>'
    b += '<rect x="56" y="222" width="320" height="40" fill="url(#pool)"/>'
    b += '<rect x="56" y="222" width="320" height="3" fill="#b8fffb"/>'
    b += '<rect x="96" y="226" width="228" height="16" fill="#ffd27a" opacity=".25"/>'
    for i in range(10):
        b += f'<path d="M{70 + i*30} {236 + (i%3)*8} q6 -3 12 0" stroke="#e8ffff" stroke-width="1.2" fill="none" opacity=".7"/>'
    b += '<rect x="0" y="262" width="400" height="38" fill="#1b2340"/>'
    # loungers
    for x in [80, 130]:
        b += f'<path d="M{x} 210 L{x+30} 210 L{x+36} 202" stroke="#ffffff" stroke-width="3" fill="none"/>'
    # palms
    def palm(x, y, s):
        p = f'<path d="M{x} {y} Q{x-6*s} {y-50*s} {x+4*s} {y-100*s}" stroke="#20150f" stroke-width="{5*s}" fill="none"/>'
        tx, ty = x + 4 * s, y - 100 * s
        for ang in [-170, -135, -100, -70, -35, 0, 25]:
            a = math.radians(ang)
            ex, ey = tx + math.cos(a) * 48 * s, ty + math.sin(a) * 22 * s + 14 * s
            p += f'<path d="M{tx} {ty} Q{(tx+ex)/2:.1f} {ty-14*s:.1f} {ex:.1f} {ey:.1f} Q{(tx+ex)/2:.1f} {ty-3*s:.1f} {tx} {ty} Z" fill="#141a2e"/>'
        return p
    b += palm(30, 262, 1.4) + palm(380, 262, 1.2)
    save('villa.svg', 400, 300, b, d)


# ───────────────────────── JEWELRY ─────────────────────────
def jewelry():
    d = rg('vel', [(0, '#5a1846'), (1, '#1a0715')], cx=.45, cy=.4, r=.75)
    d += lg('gold', [(0, '#fff1b8'), (.45, '#f2c14e'), (1, '#a8701e')], x2=1, y2=1)
    d += lg('dia', [(0, '#ffffff'), (1, '#9fdcff')], x2=1, y2=1)
    b = '<rect width="400" height="300" fill="url(#vel)"/>'
    # necklace curve with stones
    pts = []
    for i in range(29):
        t = i / 28
        x = 40 + t * 250
        y = 40 + math.sin(t * math.pi) * 130
        pts.append((x, y))
    b += '<path d="M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + '" stroke="url(#gold)" stroke-width="2" fill="none"/>'
    for i, (x, y) in enumerate(pts):
        rr = 4 + 3 * math.sin(i / 28 * math.pi)
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr:.1f}" fill="url(#dia)" stroke="#d9f2ff" stroke-width=".8"/>'
    # pendant
    px, py = 165, 196
    b += f'<path d="M{px} {py-4} L{px} {py+6}" stroke="url(#gold)" stroke-width="2"/>'
    b += f'<polygon points="{px},{py+4} {px+20},{py+20} {px},{py+52} {px-20},{py+20}" fill="url(#dia)" stroke="#e6f7ff" stroke-width="1"/>'
    b += f'<polygon points="{px},{py+4} {px+8},{py+20} {px},{py+52} {px-8},{py+20}" fill="#c9ecff" opacity=".7"/>'
    b += f'<path d="M{px-20} {py+20} L{px+20} {py+20}" stroke="#ffffff" stroke-width="1" opacity=".8"/>'
    # watch
    wx, wy = 300, 200
    b += f'<rect x="{wx-14}" y="{wy-80}" width="28" height="160" rx="6" fill="url(#gold)"/>'
    b += ''.join(f'<rect x="{wx-14}" y="{wy-80+k*12}" width="28" height="1.2" fill="#8a5a17" opacity=".6"/>' for k in range(14))
    b += f'<circle cx="{wx}" cy="{wy}" r="34" fill="url(#gold)"/><circle cx="{wx}" cy="{wy}" r="27" fill="#0f2a3a"/>'
    for k in range(12):
        a = math.radians(k * 30)
        b += f'<rect x="{wx + math.cos(a)*22 - 1.2:.1f}" y="{wy + math.sin(a)*22 - 1.2:.1f}" width="2.4" height="2.4" fill="#ffe7a0"/>'
    b += f'<path d="M{wx} {wy} L{wx} {wy-17} M{wx} {wy} L{wx+12} {wy+5}" stroke="#ffe7a0" stroke-width="2" stroke-linecap="round"/>'
    # ring
    rx_, ry_ = 92, 236
    b += f'<ellipse cx="{rx_}" cy="{ry_}" rx="26" ry="16" fill="none" stroke="url(#gold)" stroke-width="7"/>'
    b += f'<polygon points="{rx_-12},{ry_-18} {rx_+12},{ry_-18} {rx_+18},{ry_-28} {rx_},{ry_-46} {rx_-18},{ry_-28}" fill="url(#dia)" stroke="#e6f7ff" stroke-width="1"/>'
    b += f'<path d="M{rx_-18} {ry_-28} L{rx_+18} {ry_-28} M{rx_} {ry_-46} L{rx_-6} {ry_-28} L{rx_} {ry_-18} M{rx_} {ry_-46} L{rx_+6} {ry_-28} L{rx_} {ry_-18}" stroke="#ffffff" stroke-width=".8" fill="none" opacity=".8"/>'
    for x, y, s in [(170, 210, 12), (96, 186, 10), (318, 168, 8), (60, 70, 6), (240, 60, 7), (350, 270, 6), (205, 120, 5)]:
        b += sparkle(x, y, s, '#ffffff', .95)
    save('jewelry.svg', 400, 300, b, d)


# ───────────────────────── SPORTS CAR ─────────────────────────
def car():
    d = lg('paint', [(0, '#ff5a46'), (.35, '#d42a22'), (1, '#6e0c0e')])
    d += lg('glass', [(0, '#3a4a6a'), (1, '#0b0f1a')])
    d += lg('rim', [(0, '#ffffff'), (.5, '#b9c0cc'), (1, '#5d6472')], x2=1, y2=1)
    d += rg('shadow', [(0, '#000000', .55), (1, '#000000', 0)])
    b = '<ellipse cx="400" cy="262" rx="380" ry="26" fill="url(#shadow)"/>'
    body = ('M58 214 Q52 190 62 170 Q80 156 120 150 Q170 140 250 108 Q330 84 410 86 Q480 88 528 112 '
            'Q600 132 668 142 Q722 150 740 166 Q752 182 748 200 L742 214 L668 214 A62 62 0 0 0 548 214 '
            'L252 214 A62 62 0 0 0 132 214 Z')
    b += f'<path d="{body}" fill="url(#paint)"/>'
    b += '<path d="M268 114 Q330 92 408 92 Q470 94 512 116 L486 150 L286 152 Z" fill="url(#glass)"/>'
    b += '<path d="M400 94 L398 152" stroke="#6e0c0e" stroke-width="5"/>'
    b += '<path d="M290 118 Q340 102 392 100 L390 112 Q340 114 300 126 Z" fill="#8aa0c8" opacity=".35"/>'
    b += '<path d="M120 172 Q400 150 728 168" stroke="#ff9a85" stroke-width="3" fill="none" opacity=".75"/>'
    b += '<path d="M150 196 Q330 186 540 190" stroke="#4a080a" stroke-width="2" fill="none" opacity=".7"/>'
    b += '<path d="M420 154 L424 210" stroke="#5a0a0c" stroke-width="2" opacity=".6"/>'
    b += '<path d="M300 176 L380 174 L370 192 L306 194 Z" fill="#3a0608" opacity=".55"/>'
    b += '<path d="M520 120 L548 116 L546 130 L522 132 Z" fill="#6e0c0e"/>'
    b += '<path d="M690 150 Q722 154 740 168 L700 166 Z" fill="#fff3c7"/>'
    b += '<path d="M64 168 Q80 160 108 158 L104 170 L66 176 Z" fill="#ff3b3b"/>'
    b += '<path d="M640 204 L742 204" stroke="#1a0a0a" stroke-width="4"/><path d="M60 204 L130 204" stroke="#1a0a0a" stroke-width="4"/>'
    for cx in [190, 608]:
        b += f'<circle cx="{cx}" cy="214" r="54" fill="#101114"/>'
        b += f'<circle cx="{cx}" cy="214" r="40" fill="url(#rim)"/>'
        b += f'<circle cx="{cx}" cy="214" r="34" fill="#2a2d33"/>'
        for k in range(10):
            a = math.radians(k * 36)
            b += f'<path d="M{cx} 214 L{cx + math.cos(a)*34:.1f} {214 + math.sin(a)*34:.1f}" stroke="url(#rim)" stroke-width="5" stroke-linecap="round"/>'
        b += f'<path d="M{cx-26} 196 A30 30 0 0 1 {cx+4} 186" stroke="#f2b705" stroke-width="7" fill="none"/>'
        b += f'<circle cx="{cx}" cy="214" r="8" fill="#d9dde4"/><circle cx="{cx}" cy="214" r="3" fill="#5d6472"/>'
    b += '<path d="M180 120 Q300 70 420 72" stroke="#ffffff" stroke-width="2" fill="none" opacity=".25"/>'
    save('car.svg', 800, 300, b, d)


# ───────────────────────── PRIVATE JET + contrail ─────────────────────────
def jet():
    d = lg('fus', [(0, '#ffffff'), (.6, '#e6ebf2'), (1, '#a9b4c6')])
    d += lg('trail', [(0, '#ffffff', ), (1, '#ffffff')], x2=1, y2=0)
    b = '<path d="M20 200 Q180 200 300 120" stroke="#ffffff" stroke-width="3" fill="none" stroke-dasharray="2 9" stroke-linecap="round" opacity=".75"/>'
    b += '<g transform="translate(300 52) rotate(-18)">'
    b += '<path d="M10 70 Q14 54 40 52 L190 50 Q230 50 250 62 Q258 68 250 74 Q230 84 190 84 L40 84 Q16 84 10 70 Z" fill="url(#fus)"/>'
    b += '<path d="M28 54 L6 14 L30 14 L62 52 Z" fill="#e6ebf2"/><path d="M8 18 L30 18 L40 32 L16 32 Z" fill="#f2b705"/>'
    b += '<path d="M90 76 L150 128 L170 128 L140 74 Z" fill="#c9d1de"/>'
    b += '<ellipse cx="70" cy="52" rx="22" ry="9" fill="#d5dbe5"/><ellipse cx="54" cy="52" rx="5" ry="7" fill="#6b7587"/>'
    b += ''.join(f'<ellipse cx="{x}" cy="64" rx="4" ry="5" fill="#2a3550"/>' for x in range(96, 190, 14))
    b += '<path d="M226 58 Q240 60 248 66 L232 66 Z" fill="#2a3550"/>'
    b += '<path d="M40 76 L240 72" stroke="#f2b705" stroke-width="3"/>'
    b += '</g>'
    save('jet.svg', 600, 240, b, d)


# ───────────────────────── GLOBE / SUN with flight paths ─────────────────────────
def globe():
    d = rg('core', [(0, '#fff6d6', 1), (.35, '#ffd27a', .95), (.7, '#ff9a62', .55), (1, '#ff6a6a', 0)])
    d += rg('halo', [(0, '#ffd27a', .35), (1, '#ffd27a', 0)])
    b = '<circle cx="500" cy="500" r="500" fill="url(#halo)"/>'
    b += '<circle cx="500" cy="500" r="360" fill="url(#core)"/>'
    g = ''
    for k in range(-3, 4):
        ry = 300 * math.cos(math.radians(k * 22))
        cy = 500 + 300 * math.sin(math.radians(k * 22))
        g += f'<ellipse cx="500" cy="{cy:.1f}" rx="{ry:.1f}" ry="{ry*.22:.1f}"/>'
    for k in range(6):
        g += f'<ellipse cx="500" cy="500" rx="{300*abs(math.cos(math.radians(k*30))):.1f}" ry="300"/>'
    b += f'<g fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".28">{g}</g>'
    b += '<circle cx="500" cy="500" r="300" fill="none" stroke="#ffffff" stroke-width="2" opacity=".4"/>'
    # flight arcs between pins
    pins = [(330, 420), (640, 360), (720, 560), (400, 610), (560, 470), (260, 560)]
    arcs = [(0, 1, -120), (1, 2, -60), (3, 0, -90), (4, 2, -50), (5, 4, -110), (3, 2, -40)]
    for a, c, lift in arcs:
        (x1, y1), (x2, y2) = pins[a], pins[c]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + lift
        b += f'<path d="M{x1} {y1} Q{mx:.0f} {my:.0f} {x2} {y2}" stroke="#fff3c4" stroke-width="3" fill="none" stroke-dasharray="3 10" stroke-linecap="round" opacity=".9"/>'
    for x, y in pins:
        b += f'<circle cx="{x}" cy="{y}" r="9" fill="#ffffff" opacity=".35"/><circle cx="{x}" cy="{y}" r="4.5" fill="#ffffff"/>'
    # orbit ring
    b += '<ellipse cx="500" cy="520" rx="470" ry="120" fill="none" stroke="#ffe7a8" stroke-width="2" opacity=".35" transform="rotate(-12 500 520)"/>'
    r = random.Random(9)
    for _ in range(40):
        x, y = r.uniform(30, 970), r.uniform(30, 970)
        if math.hypot(x - 500, y - 500) > 380:
            b += sparkle(round(x), round(y), r.uniform(2, 6), '#fff6d6', r.uniform(.4, .9))
    save('globe.svg', 1000, 1000, b, d)


# ───────────────────────── WORLD HORIZON (1920 wide) ─────────────────────────
def horizon():
    r = random.Random(10)
    d = lg('fade', [(0, '#2a1c4f'), (1, '#120c26')])
    b = ''
    # far layer
    x = 0
    far = ''
    while x < 1920:
        w = r.randint(30, 70); h = r.randint(60, 170)
        far += f'<rect x="{x}" y="{300-h}" width="{w}" height="{h+120}"/>'
        x += w + r.randint(0, 8)
    b += f'<g fill="#5a3a78" opacity=".55">{far}</g>'
    near = ''
    # little Eiffel
    near += '<path d="M300 300 L322 300 Q311 284 300 300 Z M296 300 L308 236 L314 236 L326 300 Z M309 236 L310 196 L312 196 L313 236 Z"/>'
    near += '<rect x="302" y="258" width="18" height="4"/><rect x="306" y="234" width="10" height="3"/>'
    # clock tower (generic)
    near += '<rect x="520" y="170" width="34" height="140"/><path d="M516 170 L537 120 L558 170 Z"/><rect x="535" y="96" width="4" height="26"/>'
    # dome
    near += '<path d="M700 300 L700 250 Q740 196 780 250 L780 300 Z"/><rect x="738" y="198" width="4" height="16"/>'
    # supertall
    near += '<polygon points="1100,320 1100,250 1106,250 1108,190 1113,190 1115,130 1118,130 1119,70 1121,70 1122,130 1125,130 1127,190 1132,190 1134,250 1140,250 1140,320"/>'
    # Lagos-style cable-stayed bridge
    near += '<rect x="1360" y="270" width="380" height="8"/><rect x="1548" y="150" width="10" height="128"/>'
    for k in range(9):
        near += f'<path d="M1553 {160 + k*4} L{1380 + k*20} 272 M1553 {160 + k*4} L{1726 - k*20} 272" stroke="#1d1338" stroke-width="2"/>'
    # generic towers
    for x0, w, h in [(40, 60, 150), (110, 44, 110), (170, 70, 190), (380, 50, 130), (440, 64, 170), (600, 56, 120), (820, 70, 160), (900, 48, 210), (960, 60, 130),
                     (1030, 50, 180), (1170, 66, 160), (1250, 54, 120), (1780, 60, 170), (1850, 70, 130)]:
        near += f'<rect x="{x0}" y="{310-h}" width="{w}" height="{h+110}"/>'
    # palms
    for px in [640, 1300, 1760]:
        near += f'<path d="M{px} 320 Q{px+6} 270 {px+2} 230" stroke="#1d1338" stroke-width="7" fill="none"/>'
        tx, ty = px + 2, 230
        for ang in [-170, -135, -100, -70, -35, 0, 25]:
            a = math.radians(ang)
            ex, ey = tx + math.cos(a) * 46, ty + math.sin(a) * 22 + 14
            near += f'<path d="M{tx} {ty} Q{(tx+ex)/2:.1f} {ty-14:.1f} {ex:.1f} {ey:.1f} Q{(tx+ex)/2:.1f} {ty-3:.1f} {tx} {ty} Z"/>'
    b += f'<g fill="#1d1338">{near}</g>'
    # windows on near towers
    win = ''
    for x0, w, h in [(40, 60, 150), (170, 70, 190), (440, 64, 170), (820, 70, 160), (900, 48, 210), (1030, 50, 180), (1170, 66, 160), (1780, 60, 170)]:
        for cx in range(x0 + 6, x0 + w - 6, 10):
            for cy in range(310 - h + 10, 400, 14):
                if r.random() > .55:
                    win += f'<rect x="{cx}" y="{cy}" width="4" height="6" opacity="{r.uniform(.4,.95):.2f}"/>'
    b += f'<g fill="#ffcf7a">{win}</g>'
    b += '<rect x="0" y="320" width="1920" height="100" fill="url(#fade)"/>'
    save('horizon.svg', 1920, 420, b, d)


# ───────────────────────── THE HEROES ─────────────────────────
def heroes():
    d = lg('emerald', [(0, '#15a083'), (.45, '#0e6b58'), (1, '#073d33')], x2=1, y2=1)
    d += lg('sheen', [(0, '#5fe3c1'), (1, '#1f9c7f')])
    d += lg('gold', [(0, '#fff1b8'), (.5, '#f2c14e'), (1, '#b07a22')], x2=1, y2=1)
    d += lg('blazer', [(0, '#f8f0de'), (1, '#d8c7a4')], x2=1, y2=0)
    d += lg('case', [(0, '#2c3b62'), (1, '#121a30')], x2=1, y2=0)
    d += lg('screen', [(0, '#3fc1c9'), (1, '#1d6f9a')])
    d += rg('phoneGlow', [(0, '#fff3c4', .8), (1, '#fff3c4', 0)])
    d += rg('ground', [(0, '#000000', .45), (1, '#000000', 0)])
    WS, WSH, WHL = '#7b4a2c', '#5a331d', '#a26c46'      # her skin
    MS, MSH = '#e9c19b', '#c6966f'                       # his skin
    HAIR, HAIRL = '#17100e', '#3d2b24'
    b = '<ellipse cx="390" cy="958" rx="330" ry="30" fill="url(#ground)"/>'

    # ── HIM (behind) ──
    # suitcase
    b += '<rect x="528" y="560" width="6" height="86" fill="#9aa3b5"/><rect x="590" y="560" width="6" height="86" fill="#9aa3b5"/>'
    b += '<rect x="520" y="550" width="84" height="14" rx="7" fill="#1a2238"/>'
    b += '<rect x="506" y="640" width="118" height="290" rx="18" fill="url(#case)"/>'
    b += ''.join(f'<rect x="{x}" y="652" width="3" height="266" rx="1.5" fill="#3d4f7e" opacity=".8"/>' for x in (530, 556, 582, 606))
    b += '<path d="M506 662 L506 646 Q506 640 520 640 L530 640 M624 662 L624 646 Q624 640 610 640 L600 640 M506 908 L506 924 Q506 930 520 930 L530 930 M624 908 L624 924 Q624 930 610 930 L600 930" stroke="url(#gold)" stroke-width="5" fill="none"/>'
    b += '<rect x="548" y="760" width="34" height="8" rx="4" fill="url(#gold)"/>'
    b += '<circle cx="522" cy="938" r="9" fill="#0b0e18"/><circle cx="608" cy="938" r="9" fill="#0b0e18"/>'
    # legs + shoes
    b += '<path d="M408 498 L452 498 L448 916 L414 916 Q406 700 408 498 Z" fill="#262b3a"/>'
    b += '<path d="M452 498 L496 498 Q498 700 490 916 L456 916 Z" fill="#2e3446"/>'
    b += '<path d="M432 520 L431 910 M474 520 L473 910" stroke="#3f4760" stroke-width="2" opacity=".8"/>'
    b += '<path d="M410 912 L450 912 L452 934 Q430 946 396 940 Q394 926 410 912 Z" fill="#6b3b1f"/><path d="M400 936 Q424 940 450 932" stroke="#3a1e0e" stroke-width="3" fill="none"/>'
    b += '<path d="M456 912 L492 912 Q512 926 506 942 L458 940 Z" fill="#7a4524"/><path d="M460 938 L506 938" stroke="#3a1e0e" stroke-width="3"/>'
    # shirt
    b += '<path d="M398 262 L502 262 L498 508 L402 508 Z" fill="#ffffff"/>'
    b += '<path d="M450 330 L450 508" stroke="#e3e6ee" stroke-width="2"/>'
    # blazer
    b += '<path d="M384 266 Q416 252 432 258 L446 362 L448 514 L394 514 Q382 400 384 266 Z" fill="url(#blazer)"/>'
    b += '<path d="M516 266 Q484 252 468 258 L454 362 L452 514 L506 514 Q518 400 516 266 Z" fill="url(#blazer)"/>'
    b += '<path d="M432 258 L446 362 L422 316 L414 272 Z" fill="#e2d2b0"/><path d="M468 258 L454 362 L478 316 L486 272 Z" fill="#d9c8a3"/>'
    b += '<path d="M402 304 L420 300 L418 312 Z" fill="url(#gold)"/>'
    b += '<circle cx="449" cy="430" r="4" fill="#b8a27a"/>'
    b += '<path d="M440 470 L446 470 M398 470 L430 470" stroke="#cdbb95" stroke-width="2"/>'
    # collar
    b += '<path d="M432 252 L422 276 L446 290 Z M468 252 L478 276 L454 290 Z" fill="#ffffff" stroke="#e3e6ee" stroke-width="1"/>'
    # left arm (hand in pocket)
    b += '<path d="M386 268 Q362 280 360 332 L356 420 Q358 452 382 472 L402 462 Q386 432 388 402 L394 320 Z" fill="url(#blazer)"/>'
    b += '<path d="M380 470 Q392 482 404 470 L402 460 Z" fill="' + MS + '"/>'
    # right arm to suitcase
    b += '<path d="M514 268 Q540 280 544 334 L554 440 Q560 494 568 530 L546 538 Q536 482 528 444 L508 334 Z" fill="url(#blazer)"/>'
    b += '<path d="M544 528 L570 522 L572 540 L546 546 Z" fill="#ffffff"/>'
    b += '<path d="M546 542 L572 536 L574 548 L548 554 Z" fill="url(#gold)"/>'
    b += '<path d="M552 552 Q566 544 578 552 Q582 566 572 574 Q556 576 550 566 Z" fill="' + MS + '"/>'
    b += '<path d="M556 560 L574 558 M556 566 L572 565" stroke="' + MSH + '" stroke-width="1.5"/>'
    # neck + head
    b += f'<rect x="432" y="206" width="36" height="58" rx="12" fill="{MS}"/>'
    b += f'<path d="M434 226 Q450 240 466 226 L466 240 Q450 248 434 240 Z" fill="{MSH}" opacity=".7"/>'
    b += f'<ellipse cx="408" cy="162" rx="8" ry="13" fill="{MS}"/><ellipse cx="492" cy="162" rx="8" ry="13" fill="{MS}"/>'
    b += f'<path d="M408 150 Q408 100 450 100 Q492 100 492 150 Q492 198 468 212 Q450 220 432 212 Q408 198 408 150 Z" fill="{MS}"/>'
    b += f'<path d="M478 120 Q492 140 490 170 Q486 196 468 210 Q480 180 478 120 Z" fill="{MSH}" opacity=".45"/>'
    b += '<path d="M404 152 Q396 92 448 84 Q502 80 498 142 Q494 122 480 114 Q462 104 430 112 Q412 120 410 152 Z" fill="#141414"/>'
    b += '<path d="M418 104 Q446 64 494 90 Q474 94 456 104 Q436 100 418 104 Z" fill="#141414"/>'
    b += '<path d="M430 96 Q452 80 480 88" stroke="#3a3a3a" stroke-width="2.5" fill="none"/>'
    b += '<path d="M424 147 Q434 141 445 144 L445 149 Q434 147 424 151 Z M476 147 Q466 141 455 144 L455 149 Q466 147 476 151 Z" fill="#141414"/>'
    b += '<path d="M426 161 Q435 155 444 161 Q435 164 426 161 Z M456 161 Q465 155 474 161 Q465 164 456 161 Z" fill="#1b1411"/>'
    b += '<circle cx="437" cy="160" r="1.2" fill="#fff"/><circle cx="467" cy="160" r="1.2" fill="#fff"/>'
    b += f'<path d="M450 166 Q447 178 444 182 Q450 186 456 182" stroke="{MSH}" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    b += '<path d="M436 194 Q450 206 464 194 Q450 199 436 194 Z" fill="#ffffff" stroke="#9a5644" stroke-width="2.2" stroke-linejoin="round"/>'

    # ── HER (front) ──
    # hair back mass
    b += f'<path d="M196 170 Q188 108 250 106 Q314 108 306 172 Q320 262 312 362 Q302 420 286 434 L214 434 Q194 402 188 330 Q182 250 196 170 Z" fill="{HAIR}"/>'
    b += ''.join(f'<path d="M{x} 236 Q{x+4} 300 {x-2} 360 Q{x-6} 400 {x} 430" stroke="{HAIRL}" stroke-width="2" fill="none"/>' for x in range(200, 304, 9))
    # neck, shoulders, chest
    b += f'<rect x="236" y="232" width="28" height="56" rx="11" fill="{WS}"/>'
    b += f'<path d="M238 248 Q250 258 262 248 L262 262 Q250 268 238 262 Z" fill="{WSH}" opacity=".8"/>'
    b += f'<path d="M198 304 Q202 278 236 276 L264 276 Q298 278 302 304 L292 360 L208 360 Z" fill="{WS}"/>'
    # raised arm (behind dress line, in front of him): upper arm
    b += f'<path d="M292 290 Q312 300 320 330 L332 372 L314 384 L298 340 Z" fill="{WS}"/>'
    # leg through slit
    # dress
    dress = ('M206 292 Q230 284 238 286 L250 342 L262 286 Q270 284 294 292 Q302 342 288 402 Q282 422 284 442 '
             'Q306 522 318 642 Q332 782 354 906 Q302 928 250 925 Q206 926 176 912 Q190 800 198 700 '
             'Q206 560 218 442 Q220 422 214 402 Q200 342 206 292 Z')
    b += f'<path d="{dress}" fill="url(#emerald)"/>'
    b += '<path d="M276 450 Q300 560 312 700 Q322 800 336 890" stroke="url(#sheen)" stroke-width="7" fill="none" opacity=".55" stroke-linecap="round"/>'
    b += '<path d="M248 470 Q260 600 262 760 Q262 840 268 910" stroke="#05322a" stroke-width="3" fill="none" opacity=".5"/>'
    b += f'<path d="M222 690 Q230 684 238 690 L236 906 L212 908 Q216 800 222 690 Z" fill="{WS}"/>'
    b += f'<path d="M230 700 L228 900" stroke="{WHL}" stroke-width="2.5" opacity=".6"/>'
    b += '<path d="M222 690 Q216 800 212 908 M238 690 L236 906" stroke="#05322a" stroke-width="2.5" fill="none"/>'
    b += '<path d="M226 300 Q240 300 248 336 M274 300 Q262 300 252 336" stroke="#5fe3c1" stroke-width="2" fill="none" opacity=".6"/>'
    b += '<rect x="214" y="398" width="74" height="13" rx="5" fill="url(#gold)"/><rect x="242" y="395" width="18" height="19" rx="3" fill="none" stroke="#fff1b8" stroke-width="2.5"/>'
    # necklace + pendant
    b += '<path d="M232 286 Q250 320 268 286" stroke="url(#gold)" stroke-width="2" fill="none"/>'
    b += '<polygon points="250,316 257,326 250,340 243,326" fill="#eaf8ff" stroke="#9fd3ff" stroke-width="1"/>'
    b += sparkle(256, 318, 6, '#ffffff', .95)
    # passport hand (left)
    b += f'<path d="M208 294 Q190 302 188 332 L182 402 Q178 440 186 470 L202 476 Q202 440 204 404 L216 334 Z" fill="{WS}"/>'
    b += '<ellipse cx="193" cy="464" rx="11" ry="4" fill="none" stroke="url(#gold)" stroke-width="3"/>'
    b += '<g transform="rotate(-12 186 494)"><rect x="166" y="462" width="40" height="54" rx="4" fill="#1b2a5a"/>'
    b += '<circle cx="186" cy="486" r="9" fill="none" stroke="#e8b54a" stroke-width="1.6"/><path d="M177 486 L195 486 M186 477 Q180 486 186 495 Q192 486 186 477" stroke="#e8b54a" stroke-width="1.2" fill="none"/>'
    b += '<rect x="176" y="448" width="34" height="22" rx="2" fill="#fbf6ec"/><rect x="176" y="448" width="34" height="6" fill="#3fc1c9"/>'
    b += '<path d="M182 460 L198 460 M182 465 L204 465" stroke="#9aa3b5" stroke-width="1.4"/></g>'
    b += f'<path d="M184 480 Q196 472 208 482 Q210 498 198 504 Q186 504 182 494 Z" fill="{WS}"/>'
    b += f'<path d="M186 488 L204 486" stroke="{WSH}" stroke-width="1.4"/>'
    # raised forearm + phone
    b += '<ellipse cx="346" cy="268" rx="46" ry="54" fill="url(#phoneGlow)"/>'
    b += f'<path d="M314 382 Q326 340 334 304 L350 308 Q346 348 330 384 Z" fill="{WS}"/>'
    b += '<ellipse cx="336" cy="320" rx="9" ry="4" fill="none" stroke="url(#gold)" stroke-width="3" transform="rotate(-70 336 320)"/>'
    b += '<g transform="rotate(10 346 268)"><rect x="324" y="228" width="44" height="80" rx="9" fill="#0d0f14"/>'
    b += '<rect x="328" y="236" width="36" height="64" rx="5" fill="url(#screen)"/>'
    b += '<path d="M334 286 Q342 270 352 268 Q358 262 358 252" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="2 3" fill="none"/>'
    b += '<path d="M358 244 a5 5 0 1 1 0.01 0 Z M353 247 L358 256 L363 247" fill="#f2b705"/><circle cx="334" cy="288" r="2.5" fill="#ffffff"/></g>'
    b += f'<path d="M332 290 Q344 282 354 292 Q356 306 344 312 Q332 312 328 302 Z" fill="{WS}"/>'
    b += f'<path d="M338 298 L352 296" stroke="{WSH}" stroke-width="1.4"/>'
    # feet / heels
    b += f'<path d="M212 904 L236 904 L238 936 L208 940 Z" fill="{WS}"/>'
    b += '<path d="M198 936 Q220 928 242 934 L244 948 L196 950 Z" fill="url(#gold)"/><rect x="236" y="946" width="5" height="14" fill="#b07a22"/>'
    b += '<path d="M212 916 L236 912 M210 928 L238 924" stroke="url(#gold)" stroke-width="3"/>'
    b += '<path d="M284 918 Q304 912 318 926 L318 940 L282 940 Z" fill="url(#gold)"/>'
    # head
    b += f'<path d="M206 186 Q206 130 250 128 Q294 130 294 186 Q294 232 268 246 Q250 252 232 246 Q206 232 206 186 Z" fill="{WS}"/>'
    b += f'<path d="M282 150 Q296 190 284 228 Q274 242 262 248 Q286 210 282 150 Z" fill="{WSH}" opacity=".6"/>'
    b += f'<ellipse cx="226" cy="206" rx="10" ry="6" fill="{WHL}" opacity=".55"/><ellipse cx="272" cy="206" rx="9" ry="6" fill="{WHL}" opacity=".35"/>'
    # hair front + braids
    b += f'<path d="M200 192 Q194 116 250 110 Q308 116 300 192 Q296 160 282 148 Q262 134 250 150 Q238 134 218 148 Q204 160 200 192 Z" fill="{HAIR}"/>'
    b += '<path d="M250 112 L250 150" stroke="#2f2420" stroke-width="2"/>'
    b += f'<path d="M204 182 Q194 240 196 300 Q198 362 190 424 L206 426 Q214 362 212 300 Q212 240 216 194 Z" fill="{HAIR}"/>'
    b += f'<path d="M296 182 Q306 240 304 300 Q302 330 308 362 L294 364 Q290 330 290 300 Q290 240 286 194 Z" fill="{HAIR}"/>'
    b += ''.join(f'<path d="M{198 + (i % 2) * 6} {200 + i*20} l10 8" stroke="{HAIRL}" stroke-width="2"/>' for i in range(11))
    b += ''.join(f'<path d="M{292 + (i % 2) * 6} {200 + i*20} l10 8" stroke="{HAIRL}" stroke-width="2"/>' for i in range(8))
    # sunglasses on head
    b += '<rect x="214" y="124" width="32" height="17" rx="8" fill="#2a1b14" stroke="url(#gold)" stroke-width="2"/><rect x="254" y="124" width="32" height="17" rx="8" fill="#2a1b14" stroke="url(#gold)" stroke-width="2"/><path d="M246 131 L254 131" stroke="url(#gold)" stroke-width="2"/>'
    b += '<path d="M220 128 L230 128" stroke="#ffffff" stroke-width="1.5" opacity=".5"/><path d="M260 128 L270 128" stroke="#ffffff" stroke-width="1.5" opacity=".5"/>'
    # earrings
    b += '<circle cx="207" cy="214" r="11" fill="none" stroke="url(#gold)" stroke-width="3.5"/><circle cx="293" cy="214" r="11" fill="none" stroke="url(#gold)" stroke-width="3.5"/>'
    # face
    b += '<path d="M224 176 Q234 169 245 173 M256 173 Q266 169 277 176" stroke="#1b1110" stroke-width="3.2" fill="none" stroke-linecap="round"/>'
    b += '<path d="M226 188 Q235 180 245 188 Q235 193 226 188 Z M256 188 Q266 180 275 188 Q266 193 256 188 Z" fill="#1a1110"/>'
    b += '<path d="M225 187 L221 183 M276 187 L280 183" stroke="#1a1110" stroke-width="2" stroke-linecap="round"/>'
    b += '<circle cx="237" cy="186" r="1.3" fill="#fff"/><circle cx="267" cy="186" r="1.3" fill="#fff"/>'
    b += f'<path d="M250 192 Q246 204 243 208 Q250 213 257 208" stroke="{WSH}" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    b += '<path d="M237 222 Q244 216 250 219 Q256 216 263 222 Q250 226 237 222 Z" fill="#5a1f22"/>'
    b += '<path d="M237 222 Q250 234 263 222 Q250 227 237 222 Z" fill="#8a2f33"/>'
    b += '<path d="M245 228 Q250 230 255 228" stroke="#c46a6a" stroke-width="1.4" fill="none"/>'
    # rim light from the sunset
    b += '<path d="M300 176 Q316 262 310 356" stroke="#ffd27a" stroke-width="3" fill="none" opacity=".55"/>'
    b += '<path d="M296 300 Q304 360 290 410" stroke="#7af0d0" stroke-width="2.5" fill="none" opacity=".5"/>'
    save('heroes.svg', 760, 1000, b, d)


for fn in (paris, tokyo, dubai, newyork, santorini, maldives, villa, jewelry, car, jet, globe, horizon, heroes):
    fn()
print('ok', sorted(os.listdir(OUT)))
