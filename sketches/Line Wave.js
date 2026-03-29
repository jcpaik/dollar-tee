// Flowing sine wave lines

const waves = range({j: 40, i: 80})
  .mapWith(({j, i}) => {
    const y0 = (j / 40) * $height
    const amp = sin($time * 0.5 + j * 0.2) * 30 + 20
    const phase = i * 0.15 + j * 0.1 + $time
    return {
      x: (i / 80) * $width,
      y: y0 + sin(phase) * amp,
      xNext: ((i + 1) / 80) * $width,
      yNext: y0 + sin(phase + 0.15) * amp,
    }
  })
  .map(({j, x, y, xNext, yNext}) => [
    Stroke(Color.hsl(j * 8 + $time * 30, 70, 50)),
    LineWidth(1.5), NoFill(), StrokeCap(SQUARE),
    Line(x, y, xNext, yNext),
  ])

render(Background('#0a0a1a'), waves)

// const ys = range({from: 0, to: $height, steps: 40})

// const line = Line([0, $height/2], [$width, $height/2])

// const lines = ys.map(y => Line([0, y], [$width, y]))

// render([
//   Fill("White"), Font('Georgia'),
//   TextAlign(CENTER, BASELINE),
//   Text("Hi", [$width/2, $height/2], 20)
// ])

function SineWave(y0, amplitude, period, offset) {
  let points = range({t: {from: 0, to: 1, steps: 80}}).map(({t}) => {
    let x = t * $width;
    let phase = x / period * TWO_PI + offset;
    let y = y0 + amplitude * sin(phase);
    return vec2(x, y);
  })

  return Line(points);
}

let y0 = $height / 2;

let ampAmp = val(50, 0, 50);

let period = val(374, 200, 400);

let offset = $time;

let colorWeight = val(214, 0, 400);

let colorTimeSpeed = val(120, 0, 120);

let phaseSpaceOffset = val(4, 0, 4);

let dampDip = 1;

function colorOffset() {
  if ($beats[0].active)
    return $beats[0].ease(easeOutBack, 0, 0.5);
  else if ($beats[1].active)
    return 0.5;
  else if ($beats[2].active)
    return $beats[2].ease(easeOutBack, 0.5, -0.5 * dampDip);
  else if ($beats[3].active)
    return -0.5 * dampDip;
  else if ($beats[4].active)
    return $beats[4].ease(easeOutExpo, -0.5 * dampDip, -0.4 * dampDip);
  else if ($beats[5].active)
    return $beats[5].ease(easeOutExpo, -0.4 * dampDip, -0.1 * dampDip);
  else if ($beats[6].active)
    return $beats[6].ease(easeOutExpo, -0.1 * dampDip, 0.2 * dampDip);
  else if ($beats[7].active)
    return $beats[7].ease(easeOutExpo, 0.2 * dampDip, -0.0 * dampDip);
  else
    return 0.0;
}

let colorPhase = u => (u * colorWeight + $time * colorTimeSpeed) / 360 + colorOffset()

// let colorEase = u => Color.hsl(
//   u * colorWeight + $time * colorTimeSpeed + colorPhase(u) * 360, 70, 50)
let colorEase = u => Color.coolwarm(
  (sin(colorPhase(u) * 2*PI) + 1)/2
)

let lines = range({from: 0, to: 1, steps: 35}).map(u => {
  let y0 = -0.2 + u * $height;
  return [
    Stroke(colorEase(u)),
    SineWave(y0, ampAmp * sin(8 * u + $time), period, u * phaseSpaceOffset + $time)
  ]
}) 

// watch(lines[0])

render([
  Background("Black"),
  [StrokeCap(SQUARE), LineWidth(1.5), lines]
])