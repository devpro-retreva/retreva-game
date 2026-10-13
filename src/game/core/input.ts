/**
 * Unified input state. Keyboard, mouse-drag and touch all write here;
 * the player controller and camera read it each frame.
 */
export const input = {
  keys: new Set<string>(),
  /** Virtual joystick, -1…1. y = forward. */
  joy: { x: 0, y: 0 },
  /** Accumulated look deltas in pixels since last frame. */
  look: { dx: 0, dy: 0 },
  sprintToggle: false,
  enabled: true,
};

const FORWARD = ['KeyW', 'ArrowUp'];
const BACK = ['KeyS', 'ArrowDown'];
const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];

const anyDown = (codes: string[]) => codes.some((c) => input.keys.has(c));

/** Movement intent relative to the camera. Magnitude ≤ 1. */
export function readMove(): { x: number; y: number; sprint: boolean } {
  if (!input.enabled) return { x: 0, y: 0, sprint: false };
  let x = (anyDown(RIGHT) ? 1 : 0) - (anyDown(LEFT) ? 1 : 0);
  let y = (anyDown(FORWARD) ? 1 : 0) - (anyDown(BACK) ? 1 : 0);
  const keyboard = x !== 0 || y !== 0;
  if (!keyboard) {
    x = input.joy.x;
    y = input.joy.y;
  }
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  const joyHard = !keyboard && Math.hypot(input.joy.x, input.joy.y) > 0.92;
  const sprint = input.keys.has('ShiftLeft') || input.keys.has('ShiftRight') || input.sprintToggle || joyHard;
  return { x, y, sprint };
}

export function consumeLook(): { dx: number; dy: number } {
  const v = { dx: input.look.dx, dy: input.look.dy };
  input.look.dx = 0;
  input.look.dy = 0;
  return v;
}

export function clearInput() {
  input.keys.clear();
  input.joy.x = 0;
  input.joy.y = 0;
  input.look.dx = 0;
  input.look.dy = 0;
}
