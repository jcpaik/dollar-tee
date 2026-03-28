// Interactive typography — letters orbit the mouse
const msg = 'DOLLAR TEE'
const n = msg.length

const letters = range(n).map(i => {
  const angle = i / n * TWO_PI + $time * 0.5
  const r = 80 + 30 * sin($time * 2 + i * 0.7)
  const x = $mouseX + r * cos(angle)
  const y = $mouseY + r * sin(angle)
  const size = 16 + 6 * sin($time * 3 + i)
  const hue = (i / n * 360 + $time * 40) % 360
  return [
    Fill(Color.hsl(hue, 80, 60)),
    [Translate(x, y), Rotate(angle + HALF_PI),
     TextAlign(CENTER, CENTER),
     Text(msg[i], 0, 0, size)]
  ]
})

render(Background('#0a0a1a'), NoStroke(), letters)
