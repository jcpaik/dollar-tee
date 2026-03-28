// Isometric box grid — imperative mode using ctx directly
const cs = 28, N = 6
const isoX = (x, y) => (x - y) * cs * 0.866
const isoY = (x, y, z) => (x + y) * cs * 0.5 - z * cs

ctx.fillStyle = '#0a0a1a'
ctx.fillRect(0, 0, $width, $height)

for (let z = 0; z < 3; z++) {
  for (let y = N - 1; y >= 0; y--) {
    for (let x = 0; x < N; x++) {
      const wave = sin($t + x * 0.5 + y * 0.5 + z) * 0.5 + 0.5
      if (wave < 0.3) continue

      const sx = $width / 2 + isoX(x, y)
      const sy = $height * 0.35 + isoY(x, y, z)
      const hue = $t * 40 + x * 30 + z * 60

      // Top face
      ctx.fillStyle = Color.hsl(hue, 70, 35 + wave * 30).toCSS()
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(sx + cs*0.866, sy + cs*0.5)
      ctx.lineTo(sx, sy + cs)
      ctx.lineTo(sx - cs*0.866, sy + cs*0.5)
      ctx.closePath()
      ctx.fill()

      // Left face
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.moveTo(sx - cs*0.866, sy + cs*0.5)
      ctx.lineTo(sx, sy + cs)
      ctx.lineTo(sx, sy + cs*2)
      ctx.lineTo(sx - cs*0.866, sy + cs*1.5)
      ctx.closePath()
      ctx.fill()

      // Right face
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.beginPath()
      ctx.moveTo(sx + cs*0.866, sy + cs*0.5)
      ctx.lineTo(sx, sy + cs)
      ctx.lineTo(sx, sy + cs*2)
      ctx.lineTo(sx + cs*0.866, sy + cs*1.5)
      ctx.closePath()
      ctx.fill()
    }
  }
}
