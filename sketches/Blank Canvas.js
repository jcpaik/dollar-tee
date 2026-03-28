// Your blank canvas — go wild!
// Available: ctx, $time (seconds), $width, $height, $mouseX, $mouseY
// Shapes:  Circle(x,y,r)  Rect(x,y,w,h)  Line(x1,y1,x2,y2)  Polygon(pts)
//          Ngon(x,y,r,sides,angle)  Arc(x,y,r,start,end)  Ellipse(x,y,rx,ry)
//          Shape(pts)  Bezier(x1,y1,cx1,cy1,cx2,cy2,x2,y2)  Image(img,x,y,w,h)
// Style:   Fill(color)  Stroke(color)  LineWidth(w)  Background(color)  NoFill()  NoStroke()
//          BlendMode(mode)  StrokeCap(cap)  StrokeJoin(join)  Filter(type,param)
// Xform:  Translate(x,y)  Rotate(angle)  Scale(s)  — scoped by nested arrays
// Text:   Text(str,x,y)  TextSize(s)  TextAlign(h,v)  TextFont(f)
// Image:  Image(img,x,y,w,h)  Tint(color)  NoTint()
// Color:   Color.hsl(h,s,l)  Color.rgb(r,g,b)  Color.hex('#fff')  Color.auto(i)
// Math:    lerp  ease  map  clamp  noise  noise2  sin cos abs ...
// Easing:  easeInQuad  easeOutCubic  easeInOutElastic  easeOutBounce  ...
//          cubicBezier(x1,y1,x2,y2)  spring(stiffness, damping)
// Beats:   $beat  $loop  $beat1–$beat8  $beats[i]  tween($beat1, 0, 100, "outCubic")
//          $beat1.ease("outCubic")  $beat1.n (count)  $beat1.t (elapsed)
// Render:  render(Fill('red'), Circle(x,y,r))  — call anywhere, multiple times
// Table:   table({t: {n: 60}})  — 60 points from 0 to 1
//          table({i: 10})  table({i: [0, 10, 3]})  table({x: {to: 100, step: 10}})
//          .mapWith(({t}) => ({angle: t * TWO_PI}))     — derive new fields

render(Background('#0a0a1a'))
