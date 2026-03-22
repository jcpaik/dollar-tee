I want a live code edit and render functionality.

Like, p5js playground.

What I don't like: I can't change the code real-time as I save.

I need some hot reloading to happen while the animation loop is running.

Ctrl-C and the color changes. Click on any color variable and I get to choose the color palette and it renders real-time, like 'thebookofshaders.com' demos.

It should be realizable! I know that. But it is of a hard engineering problem. I need to break it down further.

We should plan on PLAN.md iteratively. Do not go native plan mode, but write your thoughts first on PLAN.md

My idea: p5.js or raw canvas for backend.

Want: some demo codes, 3D array, box rendering function from 3D arrays, some global time variable, some easing function that uses global time variable to control
 the radius of some ball, I click 'save' and it renders on right.

Like, I want p5.js with better live hot reloading (actually targeted towards live shows) so that as I change the code, it gets reflected _right away_ while the
global time variable keeps on changing.

Hard parts: as I change some or all parts of the code, should it rerender/recompile the whole thing? For hot-reloading, yes it should.

How does Strudel handle all these??? The problem is so hard.
