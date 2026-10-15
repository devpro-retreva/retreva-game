import * as THREE from 'three';
import type { BuildingDef, SignDef } from '../../game/content/types';

export const DISPLAY_FONT = '"Bricolage Grotesque Variable", "Arial Narrow", system-ui, sans-serif';
export const STOREY_H = 3.1;

/** Deterministic PRNG so every load paints the same street. */
export function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, amt: number): string {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
  return `#${c.getHexString()}`;
}
export { shade };

function weather(ctx: CanvasRenderingContext2D, w: number, h: number, rnd: () => number, strength = 1) {
  // dust gradient toward the ground
  const g = ctx.createLinearGradient(0, h * 0.55, 0, h);
  g.addColorStop(0, 'rgba(120,70,40,0)');
  g.addColorStop(1, `rgba(120,70,40,${0.28 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // rain streaks
  for (let i = 0; i < 26 * strength; i++) {
    const x = rnd() * w;
    const y = rnd() * h * 0.7;
    const len = 10 + rnd() * h * 0.25;
    ctx.fillStyle = `rgba(40,30,20,${0.04 + rnd() * 0.06})`;
    ctx.fillRect(x, y, 1 + rnd() * 2.5, len);
  }
  // speckle
  for (let i = 0; i < w * h * 0.004; i++) {
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(rnd() * w, rnd() * h, 2, 2);
  }
}

function louvreWindow(ctx: CanvasRenderingContext2D, x: number, y: number, ww: number, wh: number, trim: string, ppm: number, rnd: () => number) {
  const f = 0.1 * ppm;
  ctx.fillStyle = trim;
  ctx.fillRect(x - f, y - f, ww + f * 2, wh + f * 2);
  // sill
  ctx.fillStyle = shade(trim, -0.12);
  ctx.fillRect(x - f * 1.6, y + wh + f, ww + f * 3.2, f * 0.9);
  // glass louvres
  ctx.fillStyle = '#2b3236';
  ctx.fillRect(x, y, ww, wh);
  const slats = 9;
  for (let i = 0; i < slats; i++) {
    const sy = y + (i / slats) * wh;
    ctx.fillStyle = rnd() > 0.85 ? 'rgba(255,214,150,0.55)' : 'rgba(170,190,200,0.35)';
    ctx.fillRect(x + 2, sy + 1, ww - 4, wh / slats - 2.5);
  }
  // burglary-proof bars
  ctx.fillStyle = '#1d1a17';
  const bars = Math.max(3, Math.round(ww / (0.18 * ppm)));
  for (let i = 1; i < bars; i++) ctx.fillRect(x + (i / bars) * ww - 1, y, 2, wh);
  ctx.fillRect(x, y + wh * 0.5 - 1, ww, 2);
  // drip stain below
  ctx.fillStyle = 'rgba(30,20,10,0.12)';
  ctx.fillRect(x + ww * 0.1, y + wh + f * 2, ww * 0.8, wh * 0.35);
}

function door(ctx: CanvasRenderingContext2D, x: number, y: number, dw: number, dh: number, trim: string) {
  ctx.fillStyle = trim;
  ctx.fillRect(x - 3, y - 3, dw + 6, dh + 3);
  ctx.fillStyle = '#4a3324';
  ctx.fillRect(x, y, dw, dh);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 1; i < 4; i++) ctx.fillRect(x + 4, y + (i / 4) * dh, dw - 8, 2);
  ctx.fillRect(x + dw / 2 - 1, y, 2, dh);
  ctx.fillStyle = '#c8a24a';
  ctx.fillRect(x + dw * 0.4, y + dh * 0.55, 4, 4);
}

function shopFront(ctx: CanvasRenderingContext2D, x: number, y: number, sw: number, sh: number, trim: string, ppm: number, rnd: () => number) {
  ctx.fillStyle = trim;
  ctx.fillRect(x - 4, y - 4, sw + 8, sh + 4);
  // warm interior
  const g = ctx.createLinearGradient(0, y, 0, y + sh);
  g.addColorStop(0, '#2a1d14');
  g.addColorStop(1, '#5b3d26');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, sw, sh);
  // shelves with goods
  const shelves = 3;
  for (let s = 0; s < shelves; s++) {
    const sy = y + sh * 0.3 + s * sh * 0.2;
    ctx.fillStyle = '#7a5838';
    ctx.fillRect(x + 6, sy, sw - 12, 3);
    let gx = x + 8;
    while (gx < x + sw - 14) {
      const gw = 5 + rnd() * 9;
      const gh = 6 + rnd() * 12;
      const hues = ['#e4572e', '#f2b705', '#2c5f9e', '#1f6f4a', '#f4f0e6', '#d97a8a', '#8a4f7d'];
      ctx.fillStyle = hues[Math.floor(rnd() * hues.length)];
      ctx.fillRect(gx, sy - gh, gw, gh);
      gx += gw + 2 + rnd() * 4;
    }
  }
  // counter
  ctx.fillStyle = shade(trim, -0.2);
  ctx.fillRect(x, y + sh * 0.78, sw, sh * 0.22);
  // rolled shutter
  ctx.fillStyle = '#8c8b86';
  ctx.fillRect(x, y, sw, 0.34 * ppm);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < 6; i++) ctx.fillRect(x, y + i * 0.06 * ppm, sw, 1);
}

/** Curtain-wall glazing (terminals, malls): reflective glass, mullions, sliding doors at ground level. */
function glassFacade(b: BuildingDef, ppm: number, ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rnd = seeded(b.id + 'glass');
  const sky = ctx.createLinearGradient(0, 0, w * 0.3, h);
  sky.addColorStop(0, '#9fc3d4');
  sky.addColorStop(0.55, '#5d8296');
  sky.addColorStop(1, '#3b5566');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // soft diagonal reflections
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const x0 = rnd() * w;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0 + 0.8 * ppm, 0);
    ctx.lineTo(x0 + 0.8 * ppm - h * 0.35, h);
    ctx.lineTo(x0 - h * 0.35, h);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const sH = STOREY_H * ppm;
  // ground floor: lit hall behind the glass, with travellers and their bags as silhouettes
  const ground = h - sH;
  const hall = ctx.createLinearGradient(0, ground, 0, h);
  hall.addColorStop(0, '#dfe8ec');
  hall.addColorStop(0.7, '#aebfc8');
  hall.addColorStop(1, '#8a9ba5');
  ctx.fillStyle = hall;
  ctx.fillRect(0, ground + 0.15 * ppm, w, sH - 0.15 * ppm);
  for (let x = 0.6 * ppm; x < w - 0.6 * ppm; x += (1.4 + rnd() * 2.4) * ppm) {
    const ph = (1.1 + rnd() * 0.3) * ppm;
    ctx.fillStyle = `rgba(40, 46, 52, ${0.1 + rnd() * 0.12})`;
    ctx.fillRect(x, h - ph, 0.32 * ppm, ph);
    ctx.beginPath();
    ctx.arc(x + 0.16 * ppm, h - ph - 0.14 * ppm, 0.14 * ppm, 0, Math.PI * 2);
    ctx.fill();
    if (rnd() > 0.5) ctx.fillRect(x + 0.4 * ppm, h - 0.55 * ppm, 0.36 * ppm, 0.55 * ppm);
  }
  // a sheen over the ground-floor glass
  const sheen = ctx.createLinearGradient(0, ground, 0, h);
  sheen.addColorStop(0, 'rgba(255,255,255,0.28)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  sheen.addColorStop(1, 'rgba(120,150,170,0.18)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, ground, w, sH);
  // mullions and transoms
  ctx.fillStyle = b.trim;
  const bay = 1.6 * ppm;
  for (let x = 0; x <= w; x += bay) ctx.fillRect(x - 0.04 * ppm, 0, 0.08 * ppm, h);
  for (let st = 0; st <= b.storeys; st++) ctx.fillRect(0, h - st * sH - 0.08 * ppm, w, 0.16 * ppm);
  // sliding doors
  for (let x = w * 0.18; x < w; x += 6.5 * ppm) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x, ground + 0.6 * ppm, 2.2 * ppm, sH - 0.6 * ppm);
    ctx.fillStyle = b.trim;
    ctx.fillRect(x + 1.08 * ppm, ground + 0.6 * ppm, 0.04 * ppm, sH - 0.6 * ppm);
    ctx.fillRect(x, ground + 0.55 * ppm, 2.2 * ppm, 0.08 * ppm);
  }
  // roof cladding band
  ctx.fillStyle = shade(b.wall, -0.1);
  ctx.fillRect(0, 0, w, 0.45 * ppm);
}

/** Paints the street-facing wall of a building. */
export function paintFacade(b: BuildingDef, ppm: number) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (b.style === 'glass') return glassFacade(b, ppm, ctx, w, h);
    const rnd = seeded(b.id);
    ctx.fillStyle = b.wall;
    ctx.fillRect(0, 0, w, h);
    // faint render patches
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = shade(b.wall, (rnd() - 0.5) * 0.08);
      ctx.globalAlpha = 0.5;
      ctx.fillRect(rnd() * w, rnd() * h, w * (0.1 + rnd() * 0.3), h * (0.05 + rnd() * 0.2));
    }
    ctx.globalAlpha = 1;

    const sH = STOREY_H * ppm;
    // plinth
    ctx.fillStyle = shade(b.wall, -0.18);
    ctx.fillRect(0, h - 0.45 * ppm, w, 0.45 * ppm);
    // floor bands
    for (let s = 1; s < b.storeys; s++) {
      ctx.fillStyle = b.trim;
      ctx.fillRect(0, h - s * sH - 0.1 * ppm, w, 0.2 * ppm);
    }
    // parapet band
    ctx.fillStyle = shade(b.wall, -0.08);
    ctx.fillRect(0, 0, w, 0.25 * ppm);

    const ground = h - sH;
    if (b.sign) {
      shopFront(ctx, w * 0.12, ground + 0.62 * ppm, w * 0.76, sH - 0.62 * ppm - 0.45 * ppm + 0.45 * ppm * 0.4, b.trim, ppm, rnd);
    } else {
      const dw = 1.1 * ppm;
      door(ctx, w * 0.5 - dw / 2, ground + 0.75 * ppm, dw, sH - 0.75 * ppm - 0.1 * ppm, b.trim);
      const ww = 1.2 * ppm;
      louvreWindow(ctx, w * 0.18 - ww / 2, ground + 1.0 * ppm, ww, 1.2 * ppm, b.trim, ppm, rnd);
      louvreWindow(ctx, w * 0.82 - ww / 2, ground + 1.0 * ppm, ww, 1.2 * ppm, b.trim, ppm, rnd);
    }

    for (let s = 1; s < b.storeys; s++) {
      const top = h - (s + 1) * sH;
      const bays = Math.max(2, Math.floor(w / ppm / 3.1));
      const isTopBalcony = b.balcony && s === b.storeys - 1;
      for (let i = 0; i < bays; i++) {
        const cx = ((i + 0.5) / bays) * w;
        const middle = bays % 2 === 1 ? i === Math.floor(bays / 2) : i === bays / 2 - 1 || i === bays / 2;
        if (isTopBalcony && middle) {
          const dw = 1.0 * ppm;
          door(ctx, cx - dw / 2, top + 0.6 * ppm, dw, 2.3 * ppm, b.trim);
        } else {
          const ww = 1.3 * ppm;
          louvreWindow(ctx, cx - ww / 2, top + 0.85 * ppm, ww, 1.35 * ppm, b.trim, ppm, rnd);
        }
      }
    }
    weather(ctx, w, h, rnd);
  };
}

/** Hand-painted signboard. */
export function paintSign(sign: SignDef, seed: string) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const rnd = seeded(seed);
    ctx.fillStyle = sign.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = sign.fg;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 3;
    ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.globalAlpha = 1;
    ctx.fillStyle = sign.fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mainH = sign.sub ? h * 0.48 : h * 0.62;
    let size = mainH;
    ctx.font = `800 ${size}px ${DISPLAY_FONT}`;
    while (ctx.measureText(sign.text).width > w * 0.88 && size > 8) {
      size -= 2;
      ctx.font = `800 ${size}px ${DISPLAY_FONT}`;
    }
    ctx.fillText(sign.text, w / 2, sign.sub ? h * 0.4 : h * 0.52);
    if (sign.sub) {
      let s2 = h * 0.17;
      ctx.font = `650 ${s2}px ${DISPLAY_FONT}`;
      while (ctx.measureText(sign.sub).width > w * 0.86 && s2 > 6) {
        s2 -= 1;
        ctx.font = `650 ${s2}px ${DISPLAY_FONT}`;
      }
      ctx.fillText(sign.sub, w / 2, h * 0.76);
    }
    // bolts
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (const [bx, by] of [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // sun fade & grime
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,255,255,0.10)');
    g.addColorStop(1, 'rgba(60,40,20,0.14)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rnd() * 0.06})`;
      ctx.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 6, 1 + rnd() * 3);
    }
  };
}

/** Small tiling textures for ground surfaces. */
export function makeTiledTexture(size: number, repeat: [number, number], draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function paintAsphalt(base: string) {
  return (ctx: CanvasRenderingContext2D, s: number) => {
    const rnd = seeded('asphalt');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < s * s * 0.03; i++) {
      const v = rnd();
      ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${v * 0.06})` : `rgba(0,0,0,${v * 0.18})`;
      ctx.fillRect(rnd() * s, rnd() * s, 1 + rnd() * 2, 1 + rnd() * 2);
    }
    // patched sections & cracks
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.12 + rnd() * 0.12})`;
      ctx.fillRect(rnd() * s * 0.8, rnd() * s * 0.8, s * (0.1 + rnd() * 0.2), s * (0.06 + rnd() * 0.15));
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      let x = rnd() * s;
      let y = rnd() * s;
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (rnd() - 0.5) * 30;
        y += (rnd() - 0.3) * 24;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // red dust on edges
    const g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, 'rgba(170,90,50,0.35)');
    g.addColorStop(0.12, 'rgba(170,90,50,0)');
    g.addColorStop(0.88, 'rgba(170,90,50,0)');
    g.addColorStop(1, 'rgba(170,90,50,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  };
}

export function paintPaving(base: string) {
  return (ctx: CanvasRenderingContext2D, s: number) => {
    const rnd = seeded('paving');
    ctx.fillStyle = shade(base, -0.12);
    ctx.fillRect(0, 0, s, s);
    const n = 4;
    const t = s / n;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const off = y % 2 ? t / 2 : 0;
        ctx.fillStyle = shade(base, (rnd() - 0.5) * 0.08);
        ctx.fillRect(x * t + off + 2, y * t + 2, t - 4, t - 4);
        if (off && x === 0) ctx.fillRect(off - t + 2, y * t + 2, t - 4, t - 4); // wrap-around half tile
      }
    }
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(90,50,30,${rnd() * 0.08})`;
      ctx.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 4, 2 + rnd() * 4);
    }
  };
}

export function paintLaterite(base: string) {
  return (ctx: CanvasRenderingContext2D, s: number) => {
    const rnd = seeded('laterite');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${rnd() > 0.5 ? '90,40,20' : '220,150,100'},${0.05 + rnd() * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(rnd() * s, rnd() * s, 10 + rnd() * 40, 6 + rnd() * 24, rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < s * s * 0.02; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rnd() * 0.12})`;
      ctx.fillRect(rnd() * s, rnd() * s, 1.5, 1.5);
    }
  };
}

/** Vertical sky gradient used as the scene background. */
export function makeSkyTexture() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#9fbfcf');
  g.addColorStop(0.45, '#e8d4b4');
  g.addColorStop(0.62, '#f3c98b');
  g.addColorStop(1, '#e9a96c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function paintSand(base: string) {
  return (ctx: CanvasRenderingContext2D, s: number) => {
    const rnd = seeded('sand');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,250,235' : '150,110,60'},${0.06 + rnd() * 0.07})`;
      ctx.beginPath();
      ctx.ellipse(rnd() * s, rnd() * s, 20 + rnd() * 50, 4 + rnd() * 10, rnd() * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < s * s * 0.03; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(110,80,40,0.16)';
      ctx.fillRect(rnd() * s, rnd() * s, 1.2, 1.2);
    }
  };
}

export function paintWater() {
  return (ctx: CanvasRenderingContext2D, s: number) => {
    const rnd = seeded('water');
    const g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, '#3d93a8');
    g.addColorStop(1, '#2a6f8f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.1 + rnd() * 0.18})`;
      ctx.lineWidth = 1 + rnd() * 1.5;
      const y = rnd() * s;
      const x = rnd() * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 8, y - 3, x + 16 + rnd() * 20, y);
      ctx.stroke();
    }
  };
}
