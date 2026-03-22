// Demo sketches — each is a code string that gets eval'd.
// User code receives: ctx, t, W, H, and all stdlib names as locals.

export const DEMOS = {

  "Blank Canvas": `\
// Your blank canvas — go wild!
// Available: ctx, t (seconds), W, H (canvas size)
// Shapes:  circle(x,y,r)  rect(x,y,w,h)  line(x1,y1,x2,y2)  polygon(pts)
// Style:   fill(color)  stroke(color)  lineWidth(w)  bg(color)  noFill()  noStroke()
// Color:   Color.hsl(h,s,l)  Color.rgb(r,g,b)  Color.hex('#fff')  Color.auto(i)
// Math:    lerp  ease  map  clamp  noise  noise2  sin cos abs ...
// Easing:  easeInQuad  easeOutCubic  easeInOutElastic  easeOutBounce  ...
//          cubicBezier(x1,y1,x2,y2)  spring(stiffness, damping)
// Beats:   $beat  $loop  $bar1–$bar8  $bars[i]  tween($bar1, 0, 100, "outCubic")
//          $bar1.ease("outCubic")  $bar1.ease("outCubic", 50, 250)
// Modes:   return [...] for declarative, or use ctx directly for imperative

return [
  bg('#0a0a1a'),
];
`,

  "Pulsing Circles": `\
// Concentric circles pulsing to the beat — declarative mode
const n = 12;
const shapes = [bg('#0a0a1a')];

for (let i = n; i >= 0; i--) {
  const bar = $bars[i % 8];
  const pulse = bar.active ? bar.ease("outCubic") : 0;
  const r = lerp(20, min(W, H) * 0.45, i / n) * (0.7 + 0.3 * pulse);
  shapes.push(
    fill(Color.hsl(t * 30 + i * 25, 70, 40 + pulse * 20)),
    circle(W / 2, H / 2, r)
  );
}
return shapes;
`,

  "Easing Gallery": `\
// All easing curves visualized
const easings = [
  ['InSine', easeInSine],       ['OutSine', easeOutSine],       ['InOutSine', easeInOutSine],
  ['InCubic', easeInCubic],     ['OutCubic', easeOutCubic],     ['InOutCubic', easeInOutCubic],
  ['InExpo', easeInExpo],       ['OutExpo', easeOutExpo],       ['InOutExpo', easeInOutExpo],
  ['InBack', easeInBack],       ['OutBack', easeOutBack],       ['InOutBack', easeInOutBack],
  ['InElastic', easeInElastic], ['OutElastic', easeOutElastic], ['InOutElastic', easeInOutElastic],
  ['InBounce', easeInBounce],   ['OutBounce', easeOutBounce],   ['InOutBounce', easeInOutBounce],
];
const cols = 3, rows = 6;
const padX = 60, padY = 40;
const cellW = (W - padX * 2) / cols;
const cellH = (H - padY * 2) / rows;
const scene = [bg('#0a0a1a')];

const progress = $beat.progress;

for (let idx = 0; idx < easings.length; idx++) {
  const [name, fn] = easings[idx];
  const col = idx % cols, row = floor(idx / cols);
  const ox = padX + col * cellW, oy = padY + row * cellH;
  const gw = cellW * 0.7, gh = cellH * 0.55;

  // Label
  scene.push(
    fill('#666'), font('11px monospace'),
    text(name, ox + 4, oy + 14)
  );

  // Axes
  scene.push(
    stroke('#333'), lineWidth(1), noFill(),
    line(ox, oy + gh + 20, ox + gw, oy + gh + 20),
    line(ox, oy + 20, ox, oy + gh + 20)
  );

  // Curve
  scene.push(stroke(Color.hsl(idx * 20, 70, 55)), lineWidth(1.5));
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const x0 = ox + (i / steps) * gw;
    const x1 = ox + ((i + 1) / steps) * gw;
    const y0 = oy + gh + 20 - fn(i / steps) * gh;
    const y1 = oy + gh + 20 - fn((i + 1) / steps) * gh;
    scene.push(line(x0, y0, x1, y1));
  }

  // Moving dot
  const dotX = ox + progress * gw;
  const dotY = oy + gh + 20 - fn(progress) * gh;
  scene.push(fill('#fff'), noStroke(), circle(dotX, dotY, 3));
}

return scene;
`,

  "Bouncing Dots": `\
// Bouncing dots synced to the beat — each uses a different easing
const scene = [bg('#0a0a1a')];
const easings = [
  easeOutBounce, easeOutElastic, easeOutBack,
  easeOutCubic, easeOutExpo, easeOutCirc,
];
const n = easings.length;
const spacing = W / (n + 1);

for (let i = 0; i < n; i++) {
  const x = spacing * (i + 1);
  const eased = $beat.ease(easings[i]);
  const y = lerp(H * 0.85, H * 0.15, eased);
  const r = 15 + eased * 10;

  scene.push(
    // Trail
    alpha(0.3), fill(Color.hsl(i * 60, 70, 40)), noStroke(),
    circle(x, y, r * 0.6),
    // Main dot
    alpha(1), fill(Color.hsl(i * 60, 70, 55)),
    circle(x, y, r)
  );
}

return scene;
`,

  "3D Box Grid": `\
// Isometric box grid — imperative mode using ctx directly
const cs = 28, N = 6;
const isoX = (x, y) => (x - y) * cs * 0.866;
const isoY = (x, y, z) => (x + y) * cs * 0.5 - z * cs;

ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, W, H);

for (let z = 0; z < 3; z++) {
  for (let y = N - 1; y >= 0; y--) {
    for (let x = 0; x < N; x++) {
      const wave = sin(t + x * 0.5 + y * 0.5 + z) * 0.5 + 0.5;
      if (wave < 0.3) continue;

      const sx = W / 2 + isoX(x, y);
      const sy = H * 0.35 + isoY(x, y, z);
      const hue = t * 40 + x * 30 + z * 60;

      // Top face
      ctx.fillStyle = Color.hsl(hue, 70, 35 + wave * 30).toCSS();
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + cs*0.866, sy + cs*0.5);
      ctx.lineTo(sx, sy + cs);
      ctx.lineTo(sx - cs*0.866, sy + cs*0.5);
      ctx.closePath();
      ctx.fill();

      // Left face
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.moveTo(sx - cs*0.866, sy + cs*0.5);
      ctx.lineTo(sx, sy + cs);
      ctx.lineTo(sx, sy + cs*2);
      ctx.lineTo(sx - cs*0.866, sy + cs*1.5);
      ctx.closePath();
      ctx.fill();

      // Right face
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.moveTo(sx + cs*0.866, sy + cs*0.5);
      ctx.lineTo(sx, sy + cs);
      ctx.lineTo(sx, sy + cs*2);
      ctx.lineTo(sx + cs*0.866, sy + cs*1.5);
      ctx.closePath();
      ctx.fill();
    }
  }
}
`,

  "Spinning Polygons": `\
// Spinning polygons with trails — imperative + declarative mix
ctx.fillStyle = 'rgba(10, 10, 26, 0.12)';
ctx.fillRect(0, 0, W, H);

const cx = W / 2, cy = H / 2;
const sides = 5 + floor(sin(t * 0.3) * 2 + 2);
const baseR = min(W, H) * 0.3;
const scene = [];

for (let j = 0; j < 3; j++) {
  const r = baseR * (0.5 + j * 0.25);
  const angle = t * (0.5 + j * 0.2) * (j % 2 ? -1 : 1);
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = angle + (i / sides) * TWO_PI;
    const wobble = 1 + sin(t * 2 + i + j) * 0.1;
    pts.push([cx + cos(a) * r * wobble, cy + sin(a) * r * wobble]);
  }
  scene.push(
    noFill(),
    stroke(Color.hsl(t * 50 + j * 120, 80, 55)),
    lineWidth(2),
    polygon(pts)
  );
}
draw(ctx, scene);
`,

  "Color Field": `\
// Noise-based animated color grid
const step = 10;
const scene = [];

for (let x = 0; x < W; x += step) {
  for (let y = 0; y < H; y += step) {
    const nx = x / W * 4 + sin(t * 0.3) * 2;
    const ny = y / H * 4 + t * 0.2;
    const n = noise2(nx, ny);
    scene.push(
      fill(Color.hsl(n * 360 + t * 20, 60 + n * 30, 30 + n * 35)),
      noStroke(),
      rect(x, y, step, step)
    );
  }
}
return scene;
`,

  "Line Wave": `\
// Flowing sine wave lines
const rows = 40, cols = 80;
const scene = [bg('#0a0a1a')];

for (let j = 0; j < rows; j++) {
  const y0 = (j / rows) * H;
  scene.push(stroke(Color.hsl(j * 8 + t * 30, 70, 50)), lineWidth(1.5), noFill());
  for (let i = 0; i < cols; i++) {
    const x = (i / cols) * W;
    const phase = i * 0.15 + j * 0.1 + t;
    const amp = sin(t * 0.5 + j * 0.2) * 30 + 20;
    const y = y0 + sin(phase) * amp;
    const xNext = ((i + 1) / cols) * W;
    const yNext = y0 + sin(phase + 0.15) * amp;
    scene.push(line(x, y, xNext, yNext));
  }
}
return scene;
`,

  "Palette Demo": `\
// Mathematica ColorData[97] palette + Color class
const scene = [bg('#0a0a1a')];
const n = Color.palette.length;
const sz = min(W, H) * 0.06;
const gap = sz * 0.4;

// Palette swatches
for (let i = 0; i < n; i++) {
  const x = W / 2 - (n * (sz + gap)) / 2 + i * (sz + gap);
  const y = H * 0.15;
  const bar = $bars[i % 8];
  const pulse = bar.active ? bar.ease("outElastic") : 0;

  scene.push(
    fill(Color.auto(i)),
    noStroke(),
    circle(x + sz/2, y, sz/2 * (0.8 + 0.4 * pulse))
  );
}

// Color mixing demo
const cx = W / 2, cy = H * 0.5;
const a = Color.auto(0);
const b = Color.auto(3);
for (let i = 0; i <= 10; i++) {
  const frac = i / 10;
  const mixed = a.mix(b, frac);
  const x = cx - 200 + i * 40;
  scene.push(fill(mixed), noStroke(), rect(x, cy, 35, 35));
}

// Rainbow ring
const ringR = min(W, H) * 0.25;
const ringY = H * 0.78;
for (let i = 0; i < 60; i++) {
  const angle = (i / 60) * TWO_PI + t * 0.5;
  const c = Color.rainbow(i / 60);
  scene.push(
    fill(c), noStroke(),
    circle(cx + cos(angle) * ringR, ringY + sin(angle) * ringR * 0.4, 8)
  );
}

return scene;
`,
};
