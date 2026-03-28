// complex.js — Immutable complex numbers. All operations return new values.
// Methods accept plain numbers (treated as real) for convenience.

function _cx(b) { return typeof b === 'number' ? new Complex(b, 0) : b; }

class Complex {
  constructor(re, im) { this.re = re; this.im = im; }

  add(b)   { b = _cx(b); return new Complex(this.re + b.re, this.im + b.im); }
  sub(b)   { b = _cx(b); return new Complex(this.re - b.re, this.im - b.im); }
  mul(b)   { b = _cx(b); return new Complex(this.re * b.re - this.im * b.im, this.re * b.im + this.im * b.re); }
  div(b)   { b = _cx(b); const d = b.re * b.re + b.im * b.im; return new Complex((this.re * b.re + this.im * b.im) / d, (this.im * b.re - this.re * b.im) / d); }
  conj()   { return new Complex(this.re, -this.im); }
  neg()    { return new Complex(-this.re, -this.im); }
  inv()    { const d = this.re * this.re + this.im * this.im; return new Complex(this.re / d, -this.im / d); }
  get abs(){ return Math.sqrt(this.re * this.re + this.im * this.im); }
  get arg(){ return Math.atan2(this.im, this.re); }
  pow(n)   { const r = this.abs, a = this.arg, rn = Math.pow(r, n); return new Complex(rn * Math.cos(n * a), rn * Math.sin(n * a)); }
  sqrt()   { return this.pow(0.5); }
  exp()    { const r = Math.exp(this.re); return new Complex(r * Math.cos(this.im), r * Math.sin(this.im)); }
  log()    { return new Complex(Math.log(this.abs), this.arg); }
  lerp(b, t) { b = _cx(b); return new Complex(this.re + (b.re - this.re) * t, this.im + (b.im - this.im) * t); }
  toString() { return `complex(${this.re}, ${this.im})`; }
}

export function complex(re, im = 0) { return new Complex(re, im); }

complex.fromPolar = (r, a) => new Complex(r * Math.cos(a), r * Math.sin(a));
complex.i = new Complex(0, 1);

complex.add  = (a, b) => _cx(a).add(b);
complex.sub  = (a, b) => _cx(a).sub(b);
complex.mul  = (a, b) => _cx(a).mul(b);
complex.div  = (a, b) => _cx(a).div(b);
complex.exp  = (z) => _cx(z).exp();
complex.log  = (z) => _cx(z).log();
complex.pow  = (z, n) => _cx(z).pow(n);
complex.sqrt = (z) => _cx(z).sqrt();
