// Color class — internal representation: r,g,b in 0-255, a in 0-1

export class Color {
  constructor(r, g, b, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static rgb(r, g, b, a = 1) {
    return new Color(r, g, b, a);
  }

  static hsl(h, s, l, a = 1) {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    return new Color(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
      a
    );
  }

  static hex(str) {
    str = str.replace('#', '');
    if (str.length === 3) str = str[0]+str[0]+str[1]+str[1]+str[2]+str[2];
    return new Color(
      parseInt(str.slice(0, 2), 16),
      parseInt(str.slice(2, 4), 16),
      parseInt(str.slice(4, 6), 16),
      str.length === 8 ? parseInt(str.slice(6, 8), 16) / 255 : 1
    );
  }

  alpha(a) { return new Color(this.r, this.g, this.b, a); }

  lighten(amount) {
    const { h, s, l } = this.toHSL();
    return Color.hsl(h, s, Math.min(100, l + amount * 100), this.a);
  }

  darken(amount) { return this.lighten(-amount); }

  mix(other, t = 0.5) {
    if (typeof other === 'string') other = Color.hex(other);
    return new Color(
      Math.round(this.r + (other.r - this.r) * t),
      Math.round(this.g + (other.g - this.g) * t),
      Math.round(this.b + (other.b - this.b) * t),
      this.a + (other.a - this.a) * t
    );
  }

  toHSL() {
    const r = this.r / 255, g = this.g / 255, b = this.b / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const l = (mx + mn) / 2;
    if (mx === mn) return { h: 0, s: 0, l: l * 100 };
    const d = mx - mn;
    const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h;
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  toCSS() {
    if (this.a >= 1) return `rgb(${this.r}, ${this.g}, ${this.b})`;
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a.toFixed(3)})`;
  }

  toString() { return this.toCSS(); }
}

// Mathematica ColorData[97] default plot palette
Color.palette = [
  Color.hex('#5E81B5'),
  Color.hex('#E19C24'),
  Color.hex('#8FB032'),
  Color.hex('#EB6235'),
  Color.hex('#8778B3'),
  Color.hex('#C56E1A'),
  Color.hex('#5D9EC7'),
  Color.hex('#FFBF00'),
  Color.hex('#A5609D'),
  Color.hex('#929600'),
];

Color.auto = (i) => Color.palette[((i % Color.palette.length) + Color.palette.length) % Color.palette.length];

// Continuous colormap: viridis approximation (t in 0-1)
Color.viridis = (t) => {
  t = Math.max(0, Math.min(1, t));
  // Piecewise linear approximation
  const r = Math.round(Math.max(0, Math.min(255, 255 * (-0.73 * t * t + 0.09 * t + 0.27))));
  const g = Math.round(Math.max(0, Math.min(255, 255 * (0.005 + t * (0.93 - t * 0.5)))));
  const b = Math.round(Math.max(0, Math.min(255, 255 * (0.33 + 0.42 * Math.sin(Math.PI * (0.92 * t + 0.17))))));
  return new Color(r, g, b);
};

// Rainbow colormap (t in 0-1)
Color.rainbow = (t) => Color.hsl(t * 360, 80, 55);
