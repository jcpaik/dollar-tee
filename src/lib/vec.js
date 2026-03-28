// vec.js — Immutable 2D vectors. All operations return new vectors.

class Vec2 {
  constructor(x, y) { this.x = x; this.y = y; this[0] = x; this[1] = y; }
  get length() { return 2; }
  *[Symbol.iterator]() { yield this.x; yield this.y; }

  add(b)     { return new Vec2(this.x + b.x, this.y + b.y); }
  sub(b)     { return new Vec2(this.x - b.x, this.y - b.y); }
  scale(s)   { return new Vec2(this.x * s, this.y * s); }
  neg()      { return new Vec2(-this.x, -this.y); }
  perp()     { return new Vec2(-this.y, this.x); }
  dot(b)     { return this.x * b.x + this.y * b.y; }
  cross(b)   { return this.x * b.y - this.y * b.x; }
  get mag()  { return Math.sqrt(this.x * this.x + this.y * this.y); }
  get angle(){ return Math.atan2(this.y, this.x); }
  norm()     { const m = this.mag; return m === 0 ? new Vec2(0, 0) : this.scale(1 / m); }
  rotate(a)  { const c = Math.cos(a), s = Math.sin(a); return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c); }
  dist(b)    { const dx = this.x - b.x, dy = this.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  lerp(b, t) { return new Vec2(this.x + (b.x - this.x) * t, this.y + (b.y - this.y) * t); }

  toString() { return `vec2(${this.x}, ${this.y})`; }
}

export { Vec2 };
export function vec2(x, y = 0) { return new Vec2(x, y); }

vec2.fromAngle = (a, r = 1) => new Vec2(Math.cos(a) * r, Math.sin(a) * r);
vec2.zero = new Vec2(0, 0);

vec2.add   = (a, b) => a.add(b);
vec2.sub   = (a, b) => a.sub(b);
vec2.scale = (a, s) => a.scale(s);
vec2.dot   = (a, b) => a.dot(b);
vec2.cross = (a, b) => a.cross(b);
vec2.dist  = (a, b) => a.dist(b);
vec2.lerp  = (a, b, t) => a.lerp(b, t);
