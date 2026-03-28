// Mathematica ColorData[97] palette + Color class
const n = Color.palette.length
const sz = min($width, $height) * 0.06
const gap = sz * 0.4
const cx = $width / 2, cy = $height * 0.5
const a = Color.auto(0)
const b = Color.auto(3)
const ringR = min($width, $height) * 0.25
const ringY = $height * 0.78

// Palette swatches — index space mapped to position + beat pulse
const swatches = table({i: n})
  .mapWith(({i}) => {
    const beat = $beats[i % 8]
    return {
      x: $width / 2 - (n * (sz + gap)) / 2 + i * (sz + gap) + sz/2,
      pulse: beat.active ? beat.ease("outElastic") : 0,
    }
  })
  .map(({i, x, pulse}) => [
    Fill(Color.auto(i)), NoStroke(),
    Circle(x, $height * 0.15, sz/2 * (0.8 + 0.4 * pulse)),
  ])

// Color mixing — [0, 1] space mapped to blended colors
const mixing = table({s: {n: 11}})
  .map(({s}) => [
    Fill(a.mix(b, s)), NoStroke(),
    Rect(cx - 200 + s * 400, cy, 35, 35),
  ])

// Rainbow ring — [0, 1) space mapped to angle, then to position
const rainbow = table({i: 60})
  .mapWith(({i}) => ({
    s: i / 60,
    angle: (i / 60) * TWO_PI + $time * 0.5,
  }))
  .map(({s, angle}) => [
    Fill(Color.rainbow(s)), NoStroke(),
    Circle(cx + cos(angle) * ringR, ringY + sin(angle) * ringR * 0.4, 8),
  ])

render(Bg('#0a0a1a'), swatches, mixing, rainbow)
