let mic, amplitude; // Microphone input and volume detection
let revealAmount = 0; // Control the visibility of the rainstorm layer
let lastLoudTime = 0; // Timestamp of the last loud sound
let bgImage;
let currentSpeed = 0.2; // Initial frequency
let rain = [];
const baseWidth = 457;
const baseHeight = 650;

// Rain
class RainDrop {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = random(baseWidth);
    this.y = random(-baseHeight, 0);
    this.length = random(10, 25);
    this.speed = random(3, 6);
    this.thickness = 1;
  } // Randomly generate the initial position and speed of raindrops
  update() {
    this.y += this.speed;
    if (this.y > baseHeight) this.reset();
  } // Update the falling position every frame and reset after falling out of the canvas
  display() {
    noStroke();
    fill(255);
    rect(this.x, this.y, this.thickness, this.length);
  } // Draw a single raindrop
}

function drawCircles(list) {
  noStroke();
  fill(51, 61, 69);
  for (let c of list) {
    ellipse(c.x, c.y, c.r * 2);
  }
} // Shadow

function drawFrameOverlay() {
  noStroke();
  fill(171, 207, 208);
  let edge = 30; // Border thickness

  rect(0, 0, baseWidth, edge); // Top
  rect(0, baseHeight - edge, baseWidth, edge); // Bottom
  rect(0, 0, edge, baseHeight); // Left
  rect(baseWidth - edge, 0, edge, baseHeight); // Right
} // Canvas border

function drawSplitCirclePrecise(cx, cy, radius, splitOffset = 0, rotationDeg = 0) {
  let resolution = 0.01;
  let redPoints = [];
  let greenPoints = [];

  // Circular point sampling (all based on local coordinates)
  for (let angle = 0; angle <= 360; angle += degrees(resolution)) {
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    if (x <= splitOffset) {
      redPoints.push({ x, y });
    } else {
      greenPoints.push({ x, y });
    }
  }

  // Calculate the endpoints of the white line (within the circle)
  let dx = splitOffset;
  if (abs(dx) >= radius) return;
  let dy = sqrt(sq(radius) - sq(dx));
  let top = { x: dx, y: -dy };
  let bottom = { x: dx, y: dy };

  push();
  translate(cx, cy);
  rotate(rotationDeg);
  noStroke();

  // Red part
  fill('rgb(253, 77, 74)');
  beginShape();
  vertex(top.x, top.y);
  redPoints.forEach(p => vertex(p.x, p.y));
  vertex(bottom.x, bottom.y);
  endShape(CLOSE);

  // Green part
  fill('rgb(114, 175, 93)');
  beginShape();
  vertex(top.x, top.y);
  greenPoints.forEach(p => vertex(p.x, p.y));
  vertex(bottom.x, bottom.y);
  endShape(CLOSE);

  // line
  // stroke('#DBAD6E');
  // strokeWeight(2);
  // line(top.x, top.y, bottom.x, bottom.y);
  pop();
} // The main body of the tree

// function drawSplitSemiCircle(cx, cy, radius, splitOffset = 0, rotationDeg = 0, direction = "up") {
//   let resolution = 0.01;
//   let points = [];

//   let startAngle = 0;
//   let endAngle = 180;
//   let flipY = -1;
//   if (direction === "down") {
//     startAngle = 180;
//     endAngle = 360;
//     flipY = 1;
//   }

//   let dx = constrain(splitOffset, -radius, radius);
//   let dy = sqrt(sq(radius) - sq(dx));
//   let arcX = dx;
//   let arcY = flipY * dy;

//   for (let angle = startAngle; angle <= endAngle; angle += degrees(resolution)) {
//     let x = cos(angle) * radius;
//     let y = sin(angle) * radius;
//     points.push({ x, y });
//   }

//   let redPoints = points.filter(p => p.x <= dx);
//   let greenPoints = points.filter(p => p.x > dx);

//   push();
//   translate(cx, cy);
//   rotate(rotationDeg);
//   noStroke();

// fill('#DE5E60');
// beginShape();
// vertex(dx, 0);
// redPoints.forEach(p => vertex(p.x, p.y));
// endShape(CLOSE);

// fill('#75AD82');
// beginShape();
// vertex(dx, 0);
// greenPoints.forEach(p => vertex(p.x, p.y));
// endShape(CLOSE);

// stroke('#262F37');
// strokeWeight(2);
// noFill();
// arc(0, 0, radius * 2, radius * 2, startAngle, endAngle);

// stroke('#DBAD6E');
// strokeWeight(2);
// line(dx, 0, dx, -arcY);

//   pop();
// } 
// Draw the top arch of the tree (Not enabled)

function drawTopArch(x, y, w, h, fillColor, strokeColor = 'rgb(223, 191, 106)', strokeW = 2) {
  noStroke();
  fill(fillColor);
  beginShape();
  for (let a = 0; a <= 180; a += 0.01) {
    let px = x + cos(a) * w / 2;
    let py = y - sin(a) * h / 2;
    vertex(px, py);
  }
  vertex(x - w / 2, y);
  vertex(x + w / 2, y);
  endShape(CLOSE);

  noFill();
  stroke(strokeColor);
  strokeWeight(strokeW);
  arc(x, y, w, h, 180, 0);
} // Bottom arch decoration

function drawPolygon(points, fillColor = null, strokeColor = null, strokeW = 1) {
  if (fillColor) {
    fill(fillColor);
  } else {
    noFill();
  }

  if (strokeColor) {
    stroke(strokeColor);
    strokeWeight(strokeW);
  } else {
    noStroke();
  }

  beginShape();
  for (let pt of points) {
    vertex(pt.x, pt.y);
  }
  endShape(CLOSE);
} // Base

function drawPath(points, strokeW = 2) {
  stroke('rgb(223, 191, 106)');
  strokeWeight(strokeW);
  noFill();

  beginShape();
  for (let pt of points) {
    vertex(pt.x, pt.y);
  }
  endShape();
} // Link line of the tree

function preload() {
  bgImage = loadImage('1.jpg');
} // Load background image

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  mic = new p5.AudioIn(); // Create microphone input
  mic.start(); // Start the microphone input
  amplitude = new p5.Amplitude(); // Get volume
  amplitude.setInput(mic);

  userStartAudio(); // Enable audio input, user interaction is required to activate

  for (let i = 0; i < 100; i++) rain.push(new RainDrop()); // Initialize 100 small raindrops
}

function draw() {
background(0);

// Keep Proportion
let scaleFactor = min(windowWidth / baseWidth, windowHeight / baseHeight);

// Center alignment
translate(
  (windowWidth - baseWidth * scaleFactor) / 2,
  (windowHeight - baseHeight * scaleFactor) / 2
);
scale(scaleFactor);

image(bgImage, 0, 0, baseWidth, baseHeight);

let level = amplitude.getLevel(); // Get the current volume
let now = millis(); // Current timestamp

// Left and right swing angle driven by sound
let maxAngle = 1; //Fixed swing angle
let targetSpeed = map(level, 0.1, 0.3, 3, 5); // Frequency
targetSpeed = constrain(targetSpeed, 0.2, 5);  // Limit frequency range

// "Delayed response"
currentSpeed = lerp(currentSpeed, targetSpeed, 0.02);

// Calculate the swing angle
let swing1 = -sin(frameCount * currentSpeed) * maxAngle;
let swing2 =  sin(frameCount * currentSpeed + PI) * maxAngle;
let swing3 = -sin(frameCount * currentSpeed) * maxAngle;


// Shadow
let fixedCircles = [
  { x: 228.7, y: 369.8, r: 38.5 },
  { x: 242.7, y: 314.6, r: 28 },
  { x: 231.1, y: 417.4, r: 21.75 },
  { x: 238.2, y: 444.1, r: 16.5 },
  { x: 220.7, y: 467.94, r: 25 },
  { x: 233.7, y: 219.3, r: 23 },
  { x: 231.25, y: 248.5, r: 14.5 },
  { x: 192, y: 201.1, r: 13 },
  { x: 213.2, y: 200.2, r: 17 },
  { x: 260.84, y: 201.4, r: 16 },
  { x: 207, y: 182.55, r: 13 },
  { x: 275.268, y: 184.58, r: 13 },
  { x: 253.57, y: 274.75, r: 21.75 },
  { x: 225.7, y: 267.2, r: 15.5 },
  { x: 253.57, y: 274.75, r: 21.75 },
  { x: 172.4, y: 268.8, r: 20 },
  { x: 201.67, y: 272.3, r: 17 },
  { x: 281.4, y: 272.3, r: 16 },
  { x: 308.55, y: 267.65, r: 21 },

  { x: 142, y: 240, r: 34 },
  { x: 133.1, y: 194.7, r: 24 },
  { x: 140.46, y: 165.9, r: 16 },
  { x: 128.35, y: 142.5, r: 18 },
  { x: 95.38, y: 92.78, r: 28 },
  { x: 101.96, y: 128.1, r: 20 },
  { x: 102, y: 48, r: 30 },

  { x: 319.4, y: 237.1, r: 23 },
  { x: 325.77, y: 206.856, r: 18 },
  { x: 328.277, y: 170.56, r: 28.5 },
  { x: 326.36, y: 136.8, r: 15 },
  { x: 345.9, y: 130, r: 11.65 },
  { x: 369.53, y: 134.278, r: 22 },
  { x: 395.46, y: 143.946, r: 14.5 },
  { x: 410.44, y: 127.88, r: 14.5 },


  { x: 167.5, y: 481.436, r: 23.5 },
  { x: 197.81, y: 483, r: 14 },
  { x: 253.46, y: 480.3, r: 19 },
  { x: 289.5, y: 485.86, r: 25 },

];

drawCircles(fixedCircles);

// Base
drawPolygon([
  { x: 0, y: 483.25 },
  { x: 78.67, y: 484.6 },
  { x: 79.45, y: 547.9 },
  { x: 0, y: 546.3 },
], 'rgb(77, 142, 102)', 'rgb(51, 61, 69)', 3);

drawPolygon([
  { x: 78.67, y: 484.6 },
  { x: 79.45, y: 547.9 },
  { x: 388.9, y: 553 },
  { x: 388.9, y: 497 },
  { x: 206.1, y: 497.5 },
], 'rgb(77, 142, 102)', 'rgb(51, 61, 69)', 3);

drawPolygon([
  { x: 388.9, y: 553 },
  { x: 388.9, y: 497 },
  { x: 457, y: 498.2 },
  { x: 457, y: 552.4 },
], 'rgb(77, 142, 102)', 'rgb(51, 61, 69)', 3);

drawPolygon([
  { x: 340, y: 483.2 },
  { x: 340, y: 542.5 },
  { x: 105, y: 539 },
  { x: 105, y: 478.5 },
], 'rgb(223, 191, 106)', 'rgb(51, 61, 69)', 3);

// drawPolygon([
//   { x: 106.4, y: 482 },
//   { x: 107.8, y: 537 },
//   { x: 337.4, y: 540.8 },
//   { x: 336.2, y: 486.2 },
// ], null, '#262F37', 5);

// drawPolygon([
//   { x: 106.4, y: 482 },
//   { x: 107.8, y: 537 },
//   { x: 149, y: 537.8 },
//   { x: 149, y: 482.6 },
// ], '#D3B265');

drawPolygon([
  { x: 187.2, y: 483.4 },
  { x: 187.2, y: 538.3 },
  { x: 149, y: 537.8 },
  { x: 149, y: 482.6 },
], 'rgb(253, 77, 74)');

drawPolygon([
  { x: 187.2, y: 483.4 },
  { x: 187.2, y: 538.3 },
  { x: 231.5, y: 539 },
  { x: 231.5, y: 484.2 },
], 'rgb(114, 175, 93)');

// drawPolygon([
//   { x: 268.1, y: 485 },
//   { x: 267.1, y: 539.7 },
//   { x: 231.5, y: 539 },
//   { x: 231.5, y: 484.2 },
// ], '#D3B265');

drawPolygon([
  { x: 268.1, y: 485 },
  { x: 267.1, y: 539.7 },
  { x: 309, y: 540.39 },
  { x: 310, y: 485.7 },
], 'rgb(114, 175, 93)');

// Main body of the tree
drawSplitCirclePrecise(228.7, 369.8, 35.5, 5.73, -1.33); 
drawSplitCirclePrecise(242.7, 314.6, 25, -9.2, -1.33); 
drawSplitCirclePrecise(231.1, 417.4, 18.75, -4.5, -181.33); 
drawSplitCirclePrecise(238.2, 444.1, 13.5, 2, -181.33); 
drawSplitCirclePrecise(220.7, 467.94, 22, 16.1, -1.33); 

drawSplitCirclePrecise(225.7, 267.2, 12.5, -3, 272.84);
drawSplitCirclePrecise(253.57, 274.75, 18.75, -4, 90.84);
drawSplitCirclePrecise(172.4, 268.8, 17, -1, 270.84);
drawSplitCirclePrecise(201.67, 272.3, 14, -2, 90.84);
drawSplitCirclePrecise(281.4, 272.3, 13, -2, 90.84);
drawSplitCirclePrecise(308.55, 267.65, 18, -4, 270.84);

push();
translate(142, 240);
rotate(swing1);
drawSplitCirclePrecise(0, 0, 31, 4, 182.01);
drawSplitCirclePrecise(133.1 - 142, 194.7 - 240, 21, 6, 2.01);
drawSplitCirclePrecise(140.46 - 142, 165.9 - 240, 13, -1, 182.01);
drawSplitCirclePrecise(128.35 - 142, 142.5 - 240, 15, -0.9, -91.52);
drawSplitCirclePrecise(95.38 - 142, 92.78 - 240, 25, 3.1, -3.43);
drawSplitCirclePrecise(101.96 - 142, 128.1 - 240, 17, 1, -3.43);
drawSplitCirclePrecise(102 - 142, 48 - 240, 27, -6, -3.43);
pop();

push();
translate(319.4, 237.1);
rotate(swing2);
drawSplitCirclePrecise(0, 0, 20, 5, 4.45);
drawSplitCirclePrecise(325.77 - 319.4, 206.856 - 237.1, 15, -2, 184.45);
drawSplitCirclePrecise(328.277 - 319.4, 170.56 - 237.1, 25.5, 2, 4.45);
drawSplitCirclePrecise(326.36 - 319.4, 136.8 - 237.1, 12, -5, 184.45);
drawSplitCirclePrecise(345.9 - 319.4, 130 - 237.1, 8.65, -1, -254.52);
drawSplitCirclePrecise(369.53 - 319.4, 134.278 - 237.1, 19, -2, -74.52);
drawSplitCirclePrecise(395.46 - 319.4, 143.946 - 237.1, 11.5, -1.1, -74.52);
drawSplitCirclePrecise(410.44 - 319.4, 127.88 - 237.1, 11.5, 3, 182.84);
pop();

push();
translate(231.25, 248);
rotate(swing3);
drawSplitCirclePrecise(0, 0, 11.5, 1, -1.33); 
drawSplitCirclePrecise(233.7 - 231.25, 219.3 - 248.5, 20, 2.1, -181.33);
drawSplitCirclePrecise(192 - 231.25, 201.1 - 248.5, 10, -1, 90.76);
drawSplitCirclePrecise(213.2 - 231.25, 200.2 - 248.5, 14, -1.2, 270.76);
drawSplitCirclePrecise(260.84 - 231.25, 201.4 - 248.5, 13, 1, 90.76);
drawSplitCirclePrecise(207 - 231.25, 182.55 - 248.5, 10, -1.4, -1.1);
drawSplitCirclePrecise(275.268 - 231.25, 184.58 - 248.5, 10, 1, -0.91);
drawSplitCirclePrecise(253.57 - 231.25, 274.75 - 248.5, 18.75, -4, 90.84);
pop();
  
drawSplitCirclePrecise(167.5, 481.436, 20.5, 2, 91.27);
drawSplitCirclePrecise(197.81, 483, 11, -1, 271.27);
drawSplitCirclePrecise(253.46, 480.3, 16, 4, 91.27);
drawSplitCirclePrecise(289.5, 485.86, 22, 0.5, 271.27);

// Link lines of the tree
let pathPoints = [
  [
    { x: 95.27, y: 23.12 },
    { x: 103, y: 144 },
    { x: 141.69, y: 143 },
    { x: 137.2, y: 268.4 },
    { x: 323.1, y: 272 },
    { x: 332.15, y: 126.1 },
    { x: 406.4, y: 146.7 },
    { x: 407.8, y: 119 },
  ],
  [
    { x: 204.45, y: 173.55 },
    { x: 204.96, y: 201.1 }
  ],
  [
    { x: 182.85, y: 200.67 },
    { x: 276.2, y: 201.9 },
    { x: 275.76, y: 176.3 }
  ],
  [
    { x: 231.4, y: 201.9 },
    { x: 237.1, y: 484.2 }
  ],
  [
    { x: 108.43, y: 481.87 },
    { x: 336.2, y: 486.3 }
  ]
];

// Bottom link line bold
for (let i = 0; i < pathPoints.length; i++) {
  let weight = (i === 4) ? 3 : 2;
  drawPath(pathPoints[i], weight);
}


// Bottom arch decoration
  drawTopArch(128.1, 537.5, 41.2, 36.8, 'rgb(114, 175, 93)');
  drawTopArch(168, 538, 38.3, 30, 'rgb(223, 191, 106)');
  drawTopArch(209, 538.6, 44.2, 48.8, 'rgb(253, 77, 74)');
  drawTopArch(249.46, 539.3, 35.9, 40.2, 'rgb(253, 77, 74)');
  drawTopArch(289.5, 540, 41.97, 26.34, 'rgb(223, 191, 106)');
  drawTopArch(323.7, 540.6, 29, 29.2, 'rgb(114, 175, 93)');
  

let threshold = 0.05; // Sound trigger threshold

if (level > threshold) {
  lastLoudTime = now; // Record the last "sound" moment
}

// "Sound validity period"
if (now - lastLoudTime < 3000) {
  // Gradually appeared
  let target = constrain(map(level, 0.02, 0.2, 0, 1), 0, 1);
  revealAmount = lerp(revealAmount, target, 0.02);
} else {
  // Faded away
  revealAmount = lerp(revealAmount, 0, 0.01);
}

let stormAlpha = revealAmount * 255;
if (stormAlpha > 1) {
  push();
  // Heavy rain background
  fill(0, stormAlpha);
  rect(0, 0, baseWidth, baseHeight);

  for (let i = 0; i < 150; i++) {
    let x = random(baseWidth);
    let y = random(baseHeight);
    let len = random(15, 40);
    let spd = random(4, 7);
    fill(255, stormAlpha); // Transparency binding background changes
    noStroke();
    rect(x, (frameCount * spd + y) % baseHeight, 1, len);
  }

// Landing feedback
for (let i = 0; i < 30; i++) {
  let x = random(baseWidth - 20);
  let y = baseHeight - random(30, 100); // Range
  let lifetime = sin((frameCount + i * 10) * 0.2) * 0.5 + 0.5; // Flash
  let alpha = lifetime * stormAlpha;
  let w = random(8, 15); // Stretch
  let h = 2;
  
  noStroke();
  fill(255, alpha);
  rect(x, y, w, h);
}

  pop();
  }

  // Normal rain
  for (let drop of rain) {
    drop.update();
    drop.display();
  }

drawFrameOverlay();

}

// Adaptive canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
