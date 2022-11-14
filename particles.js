const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const eases = require('eases');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const particles = [];
const cursor = { x: 9999, y: 9999 };

let elCanvas;

const sketch = ({ width, height, canvas }) => {
  let x, y, particle, radius;
  let pos = [];

  const numCircles = 15;
  let dotRadius = 12;
  let cirRadius = 0;
  const fitRadius = dotRadius;
  const gapCircle = 8;
  const gapDot = 4;

  elCanvas = canvas;
  canvas.addEventListener('mousedown', onMouseDown);

  // to draw concentric circles pattern
  for(let i = 0; i < numCircles; i++) {
    const circumference = Math.PI * 2 * cirRadius;
    const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gapDot)) : 1;
    const fitSlice = Math.PI * 2 / numFit;

    for(let j = 0; j < numFit; j++) {
      const theta = fitSlice * j;

      x = Math.cos(theta) * cirRadius;
      y = Math.sin(theta) * cirRadius;

      x += width * 0.5;
      y += height * 0.5;

      radius = dotRadius;

      particle = new Particle({ x, y, radius });
      particles.push(particle);
    }

    cirRadius += fitRadius * 2 + gapCircle;
    dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius;
  }

  // for(let i = 0; i < 200; i++) {
  //   x = width * 0.5;
  //   y = height * 0.5;

  //   random.insideCircle(400, pos);
  //   x += pos[0];
  //   y += pos[1];

  //   particle = new Particle({ x, y });
    
  //   particles.push(particle);
  // }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    particles.forEach(particle => {
      particle.update();
      particle.draw(context);
    });
  };
};

const onMouseDown = (e) => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  onMouseMove(e);
};

const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  cursor.x = x;
  cursor.y = y;

  console.log("cursor: ", cursor);
};

const onMouseUp = () => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);

  cursor.x = 9999;
  cursor.y = 9999;
};

canvasSketch(sketch, settings);

class Particle {
  constructor({ x, y, radius = 10 }) {
    // position
    this.x = x;
    this.y = y;

    // acceleration
    this.ax = 0;
    this.ay = 0;

    // velocity
    this.vx = 0;
    this.vy = 0;

    // initial position
    this.ix = x;
    this.iy = y;

    this.radius = radius;

    this.minDist = random.range(100, 200);
    this.pushFactor = random.range(0.01, 0.02);
    this.pullFactor = random.range(0.002, 0.006);
    this.dampFactor = random.range(0.90, 0.95); // this variable is used to calm the particle so as to come back to its initial position when there is no push and pull
  }

  update() {
    let dx, dy, dd, distDelta;

    // pull factor which is going to pull the particle to it's initial position
    dx = this.ix - this.x;
    dy = this.iy - this.y;

    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;

    // push force which is pushing the particle when the cursor is clicked near to it
    dx = this.x - cursor.x;
    dy = this.y - cursor.y;
    dd = Math.sqrt(dx * dx + dy * dy); // hypotenuse

    distDelta = this.minDist - dd;

    if(dd < this.minDist) {
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
    }

    this.vx += this.ax;
    this.vy += this.ay;

    this.vx *= this.dampFactor;
    this.vy *= this.dampFactor;

    this.x += this.vx;
    this.y += this.vy;
  }

  // draw the particles
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = 'white';

    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}
