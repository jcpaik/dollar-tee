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

// Piecewise-linear colormap from evenly-spaced hex stops
function _ramp(hexStr) {
  const stops = hexStr.split('-').map(h => [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ]);
  return (t) => {
    t = Math.max(0, Math.min(1, t));
    const n = stops.length - 1;
    const i = Math.min(Math.floor(t * n), n - 1);
    const f = t * n - i;
    const [r0, g0, b0] = stops[i], [r1, g1, b1] = stops[i + 1];
    return new Color(
      Math.round(r0 + (r1 - r0) * f),
      Math.round(g0 + (g1 - g0) * f),
      Math.round(b0 + (b1 - b0) * f)
    );
  };
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

// ── Perceptually uniform sequential ──────────────────────────────

Color.inferno = _ramp('000004-1b0c41-4a0c6b-781c6d-a52c60-cf4446-ed6925-fb9b06-fcffa4');
Color.magma   = _ramp('000004-180f3d-440f76-721f81-9e2f7e-cd4071-f1605d-fca636-fcfdbf');
Color.plasma  = _ramp('0d0887-46039f-7201a8-9c179e-bd3786-d8576b-ed7953-fdb42f-f0f921');
Color.cividis = _ramp('002051-0d346b-37506b-5c6b64-7d845d-a09e53-c5b944-ead633-fdea45');

Color.turbo = (t) => {
  t = Math.max(0, Math.min(1, t));
  const r = 0.13572138 + t * (4.6153926 + t * (-42.6603226 + t * (132.1310823 + t * (-152.9423940 + t * 59.2863794))));
  const g = 0.09140261 + t * (2.1941884 + t * (4.8429666 + t * (-14.1850333 + t * (4.2772986 + t * 2.8295660))));
  const b = 0.10667330 + t * (12.6419461 + t * (-60.5820484 + t * (110.3627677 + t * (-89.9031091 + t * 27.3482497))));
  return new Color(
    Math.round(255 * Math.max(0, Math.min(1, r))),
    Math.round(255 * Math.max(0, Math.min(1, g))),
    Math.round(255 * Math.max(0, Math.min(1, b)))
  );
};

// ── Classic ──────────────────────────────────────────────────────

Color.hot = (t) => {
  t = Math.max(0, Math.min(1, t));
  return new Color(
    Math.round(255 * Math.min(1, t / 0.3651)),
    Math.round(255 * Math.max(0, Math.min(1, (t - 0.3651) / 0.381))),
    Math.round(255 * Math.max(0, Math.min(1, (t - 0.746) / 0.254)))
  );
};

Color.jet = _ramp('00007f-0000ff-007fff-00ffff-7fff7f-ffff00-ff7f00-ff0000-7f0000');

Color.gray = (t) => {
  const v = Math.round(255 * Math.max(0, Math.min(1, t)));
  return new Color(v, v, v);
};

Color.cubehelix = (t) => {
  t = Math.max(0, Math.min(1, t));
  const h = (5 / 3 - 3 * t) * Math.PI;
  const a = t * (1 - t) * 0.5;
  const ch = Math.cos(h), sh = Math.sin(h);
  return new Color(
    Math.round(255 * Math.max(0, Math.min(1, t + a * (-0.14861 * ch + 1.78277 * sh)))),
    Math.round(255 * Math.max(0, Math.min(1, t + a * (-0.29227 * ch - 0.90649 * sh)))),
    Math.round(255 * Math.max(0, Math.min(1, t + a * (1.97294 * ch))))
  );
};

// ── Diverging (ColorBrewer) ──────────────────────────────────────

Color.coolwarm = _ramp('3b4cc0-6788ee-9abbff-c9d7ef-eddbc7-f7a789-e36a53-b40426');
Color.spectral = _ramp('d53e4f-f46d43-fdae61-fee08b-ffffbf-e6f598-abdda4-66c2a5-3288bd');
Color.RdYlBu  = _ramp('d73027-f46d43-fdae61-fee090-ffffbf-e0f3f8-abd9e9-74add1-4575b4');
Color.RdBu    = _ramp('67001f-b2182b-d6604d-f4a582-f7f7f7-d1e5f0-92c5de-4393c3-2166ac');
Color.PiYG    = _ramp('c51b7d-de77ae-f1b6da-fde0ef-f7f7f7-e6f5d0-b8e186-7fbc41-4d9221');
Color.BrBG    = _ramp('8c510a-bf812d-dfc27d-f6e8c3-f5f5f5-c7eae5-80cdc1-35978f-01665e');
Color.PRGn    = _ramp('7b3294-9e6ab0-c2a5cf-e7d4e8-f7f7f7-d9f0d3-a6dba0-5aae61-1b7837');

// ── Sequential single-hue (ColorBrewer) ──────────────────────────

Color.blues   = _ramp('f7fbff-deebf7-c6dbef-9ecae1-6baed6-4292c6-2171b5-08519c-08306b');
Color.greens  = _ramp('f7fcf5-e5f5e0-c7e9c0-a1d99b-74c476-41ab5d-238b45-006d2c-00441b');
Color.reds    = _ramp('fff5f0-fee0d2-fcbba1-fc9272-fb6a4a-ef3b2c-cb181d-a50f15-67000d');
Color.oranges = _ramp('fff5eb-fee6ce-fdd0a2-fdae6b-fd8d3c-f16913-d94801-a63603-7f2704');
Color.purples = _ramp('fcfbfd-efedf5-dadaeb-bcbddc-9e9ac8-807dba-6a51a3-54278f-3f007d');

// ── Sequential multi-hue (ColorBrewer) ───────────────────────────

Color.YlOrRd = _ramp('ffffcc-ffeda0-fed976-feb24c-fd8d3c-fc4e2a-e31a1c-bd0026-800026');
Color.YlGnBu = _ramp('ffffd9-edf8b1-c7e9b4-7fcdbb-41b6c4-1d91c0-225ea8-253494-081d58');
Color.YlOrBr = _ramp('ffffe5-fff7bc-fee391-fec44f-fe9929-ec7014-cc4c02-993404-662506');
Color.YlGn   = _ramp('ffffe5-f7fcb1-d9f0a3-addd8e-78c679-41ab5d-238443-006837-004529');
Color.OrRd   = _ramp('fff7ec-fee8c8-fdd49e-fdbb84-fc8d59-ef6548-d7301f-b30000-7f0000');
Color.RdPu   = _ramp('fff7f3-fde0dd-fcc5c0-fa9fb5-f768a1-dd3497-ae017e-7a0177-49006a');
Color.BuPu   = _ramp('f7fcfd-e0ecf4-bfd3e6-9ebcda-8c96c6-8c6bb1-88419d-810f7c-4d004b');
Color.BuGn   = _ramp('f7fcfd-e5f5f9-ccece6-99d8c9-66c2a4-41ae76-238b45-006d2c-00441b');
Color.GnBu   = _ramp('f7fcf0-e0f3db-ccebc5-a8ddb5-7bccc4-4eb3d3-2b8cbe-0868ac-084081');
Color.PuRd   = _ramp('f7f4f9-e7e1ef-d4b9da-c994c7-df65b0-e7298a-ce1256-980043-67001f');
