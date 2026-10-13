import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Collects many primitive shapes with per-vertex colours and merges them
 * into a single BufferGeometry → one draw call for the whole static world.
 */
export class ColorGeometryBuilder {
  private parts: THREE.BufferGeometry[] = [];
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private c = new THREE.Color();

  private push(g: THREE.BufferGeometry, color: string, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0], scale: [number, number, number] = [1, 1, 1]) {
    const geo = g.index ? g.toNonIndexed() : g;
    if (geo !== g) g.dispose();
    this.e.set(rot[0], rot[1], rot[2]);
    this.q.setFromEuler(this.e);
    this.m.compose(new THREE.Vector3(...pos), this.q, new THREE.Vector3(...scale));
    geo.applyMatrix4(this.m);
    this.c.set(color).convertSRGBToLinear();
    const n = geo.attributes.position.count;
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      colors[i * 3] = this.c.r;
      colors[i * 3 + 1] = this.c.g;
      colors[i * 3 + 2] = this.c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    this.parts.push(geo);
  }

  box(color: string, pos: [number, number, number], size: [number, number, number], rotY = 0) {
    this.push(new THREE.BoxGeometry(size[0], size[1], size[2]), color, pos, [0, rotY, 0]);
  }

  /** Box rotated around arbitrary axes. */
  boxR(color: string, pos: [number, number, number], size: [number, number, number], rot: [number, number, number]) {
    this.push(new THREE.BoxGeometry(size[0], size[1], size[2]), color, pos, rot);
  }

  cylinder(color: string, pos: [number, number, number], rTop: number, rBottom: number, h: number, seg = 8, rot: [number, number, number] = [0, 0, 0]) {
    this.push(new THREE.CylinderGeometry(rTop, rBottom, h, seg), color, pos, rot);
  }

  cone(color: string, pos: [number, number, number], r: number, h: number, seg = 8) {
    this.push(new THREE.ConeGeometry(r, h, seg), color, pos);
  }

  blob(color: string, pos: [number, number, number], r: number, scale: [number, number, number] = [1, 1, 1]) {
    this.push(new THREE.IcosahedronGeometry(r, 0), color, pos, [0, 0, 0], scale);
  }

  sphere(color: string, pos: [number, number, number], r: number, scale: [number, number, number] = [1, 1, 1], detail = 1) {
    this.push(new THREE.IcosahedronGeometry(r, detail), color, pos, [0, 0, 0], scale);
  }

  build(): THREE.BufferGeometry {
    const merged = mergeGeometries(this.parts, false)!;
    this.parts.forEach((p) => p.dispose());
    this.parts = [];
    merged.computeBoundingSphere();
    return merged;
  }
}

/** Shelf-packs rectangles into one canvas → one texture for all facades and signs. */
export class TextureAtlas {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private x = 0;
  private y = 0;
  private rowH = 0;
  private positions: number[] = [];
  private uvs: number[] = [];
  private normals: number[] = [];

  constructor(readonly size = 2048) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d')!;
  }

  /** Reserves a w×h pixel region, runs draw() in local coordinates, returns UV rect. */
  region(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
    w = Math.ceil(w);
    h = Math.ceil(h);
    const pad = 2;
    if (this.x + w + pad > this.size) {
      this.x = 0;
      this.y += this.rowH + pad;
      this.rowH = 0;
    }
    if (this.y + h > this.size) throw new Error('Atlas full');
    const ox = this.x;
    const oy = this.y;
    this.ctx.save();
    this.ctx.translate(ox, oy);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, w, h);
    this.ctx.clip();
    draw(this.ctx, w, h);
    this.ctx.restore();
    this.x += w + pad;
    this.rowH = Math.max(this.rowH, h);
    const s = this.size;
    // half-pixel inset to avoid bleeding
    return { u0: (ox + 0.5) / s, v0: 1 - (oy + h - 0.5) / s, u1: (ox + w - 0.5) / s, v1: 1 - (oy + 0.5) / s };
  }

  /** Adds a quad: corners bottom-left, bottom-right, top-right, top-left. */
  quad(bl: THREE.Vector3, br: THREE.Vector3, tr: THREE.Vector3, tl: THREE.Vector3, uv: { u0: number; v0: number; u1: number; v1: number }) {
    const n = new THREE.Vector3().subVectors(br, bl).cross(new THREE.Vector3().subVectors(tl, bl)).normalize();
    const verts = [bl, br, tr, bl, tr, tl];
    const uvv = [[uv.u0, uv.v0], [uv.u1, uv.v0], [uv.u1, uv.v1], [uv.u0, uv.v0], [uv.u1, uv.v1], [uv.u0, uv.v1]];
    verts.forEach((v, i) => {
      this.positions.push(v.x, v.y, v.z);
      this.normals.push(n.x, n.y, n.z);
      this.uvs.push(uvv[i][0], uvv[i][1]);
    });
  }

  build(): { geometry: THREE.BufferGeometry; texture: THREE.CanvasTexture } {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));
    g.computeBoundingSphere();
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return { geometry: g, texture };
  }
}
