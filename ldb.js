/*
 * ldb.js 1.0
 * Written by KP_CFTSZ
 * Public domain but credit is much appreciated :)
 * 
 * https://kpworld.xyz/
 * https://github.com/kpworld-xyz/ldb-js
 */

var Color = {
	// 16-color VGA palette
	BLACK: 0xFF000000,
	BLUE: 0xFF0000AA,
	GREEN: 0xFF00AA00,
	CYAN: 0xFF00AAAA,
	RED: 0xFFAA0000,
	MAGENTA: 0xFFAA00AA,
	BROWN: 0xFFAA5500,
	LIGHT_GRAY: 0xFFAAAAAA,
	DARK_GRAY: 0xFF555555,
	BRIGHT_BLUE: 0xFF5555FF,
	BRIGHT_GREEN: 0xFF55FF55,
	BRIGHT_CYAN: 0xFF55FFFF,
	BRIGHT_RED: 0xFFFF5555,
	BRIGHT_MAGENTA: 0xFFFF55FF,
	BRIGHT_YELLOW: 0xFFFFFF55,
	WHITE: 0xFFFFFFFF,

	// Filter colors
	LIGHT: -1,
	DARK: -2,
	DARKER: -3
}

var Keyboard = {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16, CTRL: 17, ALT: 18,
	PAUSE: 19,
	CAPS_LOCK: 20,
	ESCAPE: 27,
	SPACE: 32,
	PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36,
	LEFT_ARROW: 37, UP_ARROW: 38, RIGHT_ARROW: 39, DOWN_ARROW: 40,
	INSERT: 45,
	DELETE: 46,
	KEY_0: 48, KEY_1: 49, KEY_2: 50, KEY_3: 51, KEY_4: 52, KEY_5: 53, KEY_6: 54, KEY_7: 55,
	KEY_8: 56, KEY_9: 57, KEY_A: 65, KEY_B: 66, KEY_C: 67, KEY_D: 68, KEY_E: 69, KEY_F: 70,
	KEY_G: 71, KEY_H: 72, KEY_I: 73, KEY_J: 74, KEY_K: 75, KEY_L: 76, KEY_M: 77, KEY_N: 78,
	KEY_O: 79, KEY_P: 80, KEY_Q: 81, KEY_R: 82, KEY_S: 83, KEY_T: 84, KEY_U: 85, KEY_V: 86,
	KEY_W: 87, KEY_X: 88, KEY_Y: 89, KEY_Z: 90,
	LEFT_META: 91,
	RIGHT_META: 92,
	SELECT: 93,
	NUMPAD_0: 96, NUMPAD_1: 97, NUMPAD_2: 98, NUMPAD_3: 99, NUMPAD_4: 100,
	NUMPAD_5: 101, NUMPAD_6: 102, NUMPAD_7: 103, NUMPAD_8: 104, NUMPAD_9: 105,
	MULTIPLY: 106,
	ADD: 107,
	SUBTRACT: 109,
	DECIMAL: 110,
	DIVIDE: 111,
	F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118,
	F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
	NUM_LOCK: 144,
	SCROLL_LOCK: 145,
	SEMICOLON: 186,
	EQUALS: 187,
	COMMA: 188,
	DASH: 189,
	PERIOD: 190,
	FORWARD_SLASH: 191,
	GRAVE_ACCENT: 192,
	OPEN_BRACKET: 219,
	BACK_SLASH: 220,
	CLOSE_BRACKET: 221,
	SINGLE_QUOTE: 222
}

var Mouse = {
	LEFT: 1,
	MIDDLE: 1,
	RIGHT: 2
}

// Makes it so the given audio track will loop at the end
// Note that this does not guarantee seamless loops
function setToLoop(audio) {
	if (typeof audio.loop === 'boolean') {
		audio.loop = true;
	} else {
		audio.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
	}
}

// Math
var PI_RAD = Math.PI / 180;
var PI2 = Math.PI * 2, HALF_PI = Math.PI / 2;
var SIN_FACTOR = 360 / PI2;
var sinLut = new Float32Array(360);
for (var i = 0; i < 360; i++)
	sinLut[i] = Math.sin(i / SIN_FACTOR);

function fsin(theta) {
	theta %= PI2;
	if (theta < 0)
		theta += PI2;
	return sinLut[(theta * SIN_FACTOR) | 0];
}

function fcos(theta) {
	return fsin(theta + HALF_PI);
}

function lerp(start, end, percent) {
	return start + percent * (end - start);
}

function alpha(color, other) {
	var br = ((color >> 16) & 0xFF) / 0xFF;
	var bg = ((color >> 8) & 0xFF) / 0xFF;
	var bb = ((color) & 0xFF) / 0xFF;

	var fa = ((other >> 24) & 0xFF) / 0xFF;
	var fr = ((other >> 16) & 0xFF) / 0xFF;
	var fg = ((other >> 8) & 0xFF) / 0xFF;
	var fb = ((other) & 0xFF) / 0xFF;

	var r = (fr * fa + (br * (1.0 - fa))) * 0xFF;
	var g = (fg * fa + (bg * (1.0 - fa))) * 0xFF;
	var b = (fb * fa + (bb * (1.0 - fa))) * 0xFF;

	return 0xFF << 24 | ~~r << 16 | ~~g << 8 | ~~b;
}

// Bitmap manipulation
function Bitmap(info) {
	var self = this;

	if (typeof info === 'object') {
		self.w = info.w;
		self.h = info.h;
		self.px = new Uint32Array(self.w * self.h);
	} else if (typeof info === 'string') {
		var img = new Image();
		img.src = info;
		img.onload = function() {
			var canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			var context = canvas.getContext('2d');
			context.drawImage(img, 0, 0);
			self.w = img.width;
			self.h = img.height;
			self.px = new Uint32Array(self.w * self.h);
			var data = context.getImageData(0, 0, self.w, self.h).data;
			var c = [];
			for (var i = 0; i < self.w * self.h; i++) {
				for (var z = 0; z < 4; z++)
					c[z] = data[i * 4 + z];
				self.px[i] = c[3] << 24 | c[0] << 16 | c[1] << 8 | c[2];
			}
		}
	}
}

Bitmap.prototype.wipe = function(color) {
	var self = this;

	color = color || Color.BLUE;
	
	for (var i = 0; i < self.w * self.h; i++)
		self.px[i] = color;
}

Bitmap.prototype.set = function(index, color, blend) {
	var self = this;

	// If we're trying to filter out *all* alpha values
	if (!blend && !((color >> 24) & 0xFF)) {
		return;
	}
	
	var src = self.px[index];
	switch (color) {
		// Color filters
		case Color.LIGHT: self.px[index] = (src & 0x7F7F7F) << 1; break;
		case Color.DARK: self.px[index] = (src & 0xFEFEFE) >> 1; break;
		case Color.DARKER: self.px[index] = (src & 0xFCFCFC) >> 2; break;
		// Normal case
		default: self.px[index] = blend ? alpha(src, color) : color; break;
	}
}

Bitmap.prototype.draw = function(src, x, y, blend) {
	var self = this;
	
	blend = blend || false;
	
	for (var i = 0; i < src.w; i++) {
		var xo = ~~x + i;
		if (xo < 0 || xo >= self.w)
			continue;

		for (var j = 0; j < src.h; j++) {
			var yo = ~~y + j;
			if (yo < 0 || yo >= self.h)
				continue;
			
			self.set(xo + yo * self.w, src.px[i + j * src.w], blend);
		}
	}
}

Bitmap.prototype.stretch = function(src, x, y, w, h, blend) {
	var self = this;

	blend = blend || false;
	
	for (var i = 0; i < w; i++) {
		var xo = ~~x + i;
		if (xo < 0 || xo >= self.w)
			continue;
		var xf = ~~(i / (w / src.w));

		for (var j = 0; j < h; j++) {
			var yo = ~~y + j;
			if (yo < 0 || yo >= self.h)
				continue;
			var yf = ~~(j / (h / src.h));
			
			self.set(xo + yo * self.w, src.px[xf + yf * src.w], blend);
		}
	}
}

Bitmap.prototype.crop = function(src, x, y, cx, cy, cw, ch, blend) {
	var self = this;

	blend = blend || false;
	
	for (var i = 0; i < cw; i++) {
		var xo = ~~x + i;
		if (xo < 0 || xo >= self.w)
			continue;
		
		for (var j = 0; j < ch; j++) {
			var yo = ~~y + j;
			if (yo < 0 || yo >= self.h)
				continue;
			
			self.set(xo + yo * self.w, src.px[i + cx + (j + cy) * src.w], blend);
		}
	}
}

Bitmap.prototype.stretchCropped = function(src, x, y, w, h, cx, cy, cw, ch, blend) {
	var self = this;

	blend = blend || false;
	
	for (var i = 0; i < w + src.w - src.w; i++) {
		var xo = ~~x + i;
		if (xo < 0 || xo >= self.w)
			continue;
		var xf = ~~(i / (w / cw));

		for (var j = 0; j < h; j++) {
			var yo = ~~y + j;
			if (yo < 0 || yo >= self.h)
				continue;
			var yf = ~~(j / (h / ch));
			
			self.set(xo + yo * self.w, src.px[xf + cx + (yf + cy) * src.w], blend);
		}
	}
}

Bitmap.prototype.rotate = function(src, x, y, rot, scale, blend) {
	var self = this;

	blend = blend || false;
	
	rot *= PI_RAD;
	var cos = fcos(rot);
	var sin = fsin(rot);
	var sw = src.w * scale, swh = sw / 2;
	var sh = src.h * scale, shh = sh / 2;
	var adjustw = sw * Math.SQRT2, awh = adjustw / 2;
	var adjusth = sh * Math.SQRT2, ahh = adjusth / 2;
	for (var p = 0; p < adjustw * adjusth; p++) {
		var i = ~~(p % adjustw), j = ~~(p / adjustw);
		var xd = i - awh, yd = j - ahh;
		var xr = (xd) * cos + (yd) * sin;
		var yr = -(xd) * sin + (yd) * cos;
		xd = Math.floor((Math.floor(xr) + swh) / (sw / src.w));
		yd = Math.floor((Math.floor(yr) + shh) / (sh / src.h));

		if (xd < 0 || yd < 0 || xd >= src.w || yd >= src.h)
			continue;

		var xx = (~~x + i) - adjustw / 2, yy = (~~y + j) - adjusth / 2;
		if (xx >= 0 && yy >= 0 && xx < self.w && yy < self.h) 
			self.set(~~xx + ~~yy * self.w, src.px[xd + yd * src.w], blend);
	}
}

Bitmap.prototype.fill = function(x, y, w, h, color, blend) {
	var self = this;

	color = color || Color.BRIGHT_MAGENTA;
	blend = blend || false;
	
	for (var i = 0; i < w; i++) {
		var xo = ~~x + i;
		if (xo < 0 || xo >= self.w)
			continue;

		for (var j = 0; j < h; j++) {
			var yo = ~~y + j;
			if (yo < 0 || yo >= self.h)
				continue;
			
			self.set(xo + yo * self.w, color, blend);
		}
	}
}

Bitmap.prototype.line = function(xa, ya, xb, yb, color, blend) {
	var self = this;

	color = color || Color.BRIGHT_YELLOW;
	blend = blend || false;

	xa = ~~xa; xb = ~~xb;
	ya = ~~ya; yb = ~~yb;
	var xd	= Math.abs(xb - xa), xdir = xa < xb ? 1 : -1;
	var yd	= Math.abs(yb - ya), ydir = ya < yb ? 1 : -1;
	var err = (xd > yd ? xd : -yd) / 2, e = 0;

	for (;;) {
		if (xa >= 0 && xa < self.w && ya >= 0 && ya < self.h)
			self.set(xa + ya * self.w, color, blend);
		if (xa == xb && ya == yb)
			break;

		e = err;
		if (e > -xd) err -= yd, xa += xdir;
		if (e < yd) err += xd, ya += ydir;
	}
}

var fontSheet = null;
var fontChars = 'abcdefghijklmnopqrstuvwxyz!?.,><= /+-*0123456789&^%$#~:;"\'[](){}|\\`@';
Bitmap.prototype.text = function(msg, x, y, color, blend) {
	var self = this;

	color = color || Color.LIGHT_GRAY;
	blend = blend || false;

	// Lazy font loading
	if (!this.fontSheet) {
		this.fontSheet = new Bitmap(
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAAQAQMAAADks7' +
			'LiAAAABlBMVEUAAAD///+l2Z/dAAABU0lEQVQoz1XPIUtEQRAH8EmLYbNMuA8x0f' +
			'CCXBCDH2KDmF64JCLD4UewXjAY/B6DyD8th+nxkpiMYhLDsji7Hnc4j22/N//5k5' +
			'ah1DpgvYYBWtoHn1xZiVIkIuAKZldgzvb5gTbSSWAQCXdiTszJbPUbPtbImCMHIp' +
			'ZCVIvh58cq85dNb42sGjm5YfaQmPZbtn0LtigoCyfTKML8jzz3WwD4C04qJLHsgg' +
			'7nopMMCMZPiDk4+ju3lTYvvUIF1G6hoifuKntUL92esmquWlVVznQkotne35OJSR' +
			'qGTuB/ZUMAcPMxjWQ2myVLKUlaLomFMjiEbNZIvnitTs5Pd0Q2m04mjouqJep6JF' +
			'6NnnR/14iJyOMTSSkyMYcYwAhCshhn8tlt4UZ6kDQiCDNdHnvQ6YFsHih1khDhBJ' +
			'm2/dw9icszSq30UDWqiuo1vXjpNrvScRh+AWJ6/tPOizmGAAAAAElFTkSuQmCC'
		);
	}

	if (!this.fontSheet.px)
		return;

	msg = msg.toLowerCase();
	
	for (var c = 0; c < msg.length; c++) {
		var ci = fontChars.indexOf(msg.charAt(c));
		if (ci < 0)
			continue;
		
		var cx = (ci % 34) * 8, cy = ~~(ci / 34) * 8;
		
		for (var i = 0; i < 8; i++) {
			var xo = (~~x + c * 8) + i;
			if (xo < 0 || xo >= self.w)
				continue;

			for (var j = 0; j < 8; j++) {
				var yo = ~~y + j;
				if (yo < 0 || yo >= self.h)
					continue;
				
				if (this.fontSheet.px[i + cx + (j + cy) * this.fontSheet.w] === Color.WHITE)
					self.set(xo + yo * self.w, color, blend);
			}
		}
	};
}

// Core engine
function launch(viewportWidth, viewportHeight, canvasWidth, canvasHeight, initFunc, updateFunc, renderFunc) {
	var canvasId = "game-viewport";
	
	// Setup the outer canvas, the idea here is we have a little canvas we stretch up to the size of this one
	var outerCanvas = document.getElementById(canvasId);
	outerCanvas.width = canvasWidth;
	outerCanvas.height = canvasHeight;
	var outerCanvasCtx = outerCanvas.getContext('2d', {alpha: false});

	// Setup an inner canvas for our little viewport
	var innerCanvas = document.createElement('canvas');
	innerCanvas.width = viewportWidth;
	innerCanvas.height = viewportHeight;
	var innerCanvasCtx = innerCanvas.getContext('2d', {alpha: false});

	// Input stuff
	var inputState = {
		keys: new Array(65536),
		mouseButtons: new Array(8),
		mouseX: 0,
		mouseY: 0,
		focused: false,
		allowRepeats: true
	};

	outerCanvas.addEventListener('keydown', function(e) {
		if (!(!inputState.allowRepeats && e.repeat))
			inputState.keys[e.keyCode] = true;
	}, false);

	outerCanvas.addEventListener('keyup', function(e) {
		inputState.keys[e.keyCode] = false;
	}, false);

	outerCanvas.addEventListener('mousedown', function(e) {
		inputState.mouseButtons[e.button] = true;
	}, false);

	outerCanvas.addEventListener('mouseup', function(e) {
		inputState.mouseButtons[e.button] = false;
	}, false);

	outerCanvas.addEventListener('mousemove', function(e) {
		var offset = outerCanvas.getBoundingClientRect();
		inputState.mouseX = parseInt(e.clientX - offset.left) / (canvasWidth / viewportWidth);
		inputState.mouseY = parseInt(e.clientY - offset.top) / (canvasHeight / viewportHeight);
	}, false);
	
	outerCanvas.addEventListener('focusout', function(e) {
		for (var i = 0; i < inputState.keys.length; i++)
			inputState.keys[i] = false;
		inputState.focused = false;
	}, false);

	outerCanvas.addEventListener('focusin', function(e) {
		inputState.focused = true;
	}, false);

	// Viewport and fonts
	var viewport = new Bitmap({w: viewportWidth, h: viewportHeight});

	// Initialize the game
	initFunc();

	// Main game loop
	var ticks = 0;
	var adjustedTicks = 0;
	var lastTime = 0;
	var fps = 0;
	(function tick(timeStamp) {
		var deltaTime = 0;
		if (lastTime) {
			deltaTime = timeStamp - lastTime;
			adjustedTicks += 0.09 * deltaTime;
			
			// Update
			updateFunc(deltaTime, inputState);
			
			if (ticks++ % 60 === 0)
				fps = Math.round(10 * (1000 / deltaTime)) / 10;
		}
		lastTime = timeStamp;
		
		// Render
		renderFunc(viewport, adjustedTicks, fps);

		var imgData = innerCanvasCtx.createImageData(viewport.w, viewport.h);
		for (var i = 0; i < viewport.w * viewport.h; i++) {
			imgData.data[i * 4 + 0] = (viewport.px[i] >> 16) & 0xFF;
			imgData.data[i * 4 + 1] = (viewport.px[i] >> 8) & 0xFF;
			imgData.data[i * 4 + 2] = (viewport.px[i]) & 0xFF;
			imgData.data[i * 4 + 3] = 0xFF;
		}

		innerCanvasCtx.putImageData(imgData, 0, 0);

		// We want it pixely
		outerCanvasCtx.webkitImageSmoothingEnabled = false;
		outerCanvasCtx.msImageSmoothingEnabled = false;
		outerCanvasCtx.imageSmoothingEnabled = false;
		outerCanvasCtx.drawImage(innerCanvas, 0, 0, canvasWidth, canvasHeight);

		requestAnimationFrame(tick);
	})(0);
}

