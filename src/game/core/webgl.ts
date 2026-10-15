/** Checks once whether this browser can create a WebGL context (no rendering, nothing kept). */
let cached: 'webgl2' | 'webgl' | null | undefined;
export function webglSupport(): 'webgl2' | 'webgl' | null {
  if (cached !== undefined) return cached;
  try {
    const c = document.createElement('canvas');
    cached = c.getContext('webgl2') ? 'webgl2' : c.getContext('webgl') || c.getContext('experimental-webgl') ? 'webgl' : null;
  } catch {
    cached = null;
  }
  return cached;
}
