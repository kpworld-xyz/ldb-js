![ldb.js](https://kpworld.xyz/ldbjs.png)
---

**ldb.js** is a *very* small single-file framework for game jams. It provides the bare necessities and nothing else.  
One file, zero dependencies, and public domain.

This is what a simple project looks like:
```js
function init() {
    // Load images, maps, and other game data here.
}

function update(delta, input) {
    // Handle input, physics, and other game logic here.
}

function render(screen, time, fps) {
    // Draw your graphics here.
    screen.wipe();
    screen.text("Hello, world!", 8, 8);
}

// This will create a 160x120 viewport stretched out over a 640x480 canvas
launch(160, 120, 640, 480, init, update, render);
```

The web page for this game can be generated with the `gen-page.pl` script.

```xml
./gen-page.pl <canvas_width> <canvas_height> <js_file>
```

This will give you the following output (scaled up in the browser):  
![Hello, world!](https://kpworld.xyz/ldbjs_helloworld.png)

*"Oh, but it isn't versatile!"*  
**You're** not versatile!
