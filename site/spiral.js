(() => {
  "use strict";

  const PHI = (1 + Math.sqrt(5)) / 2;

  // Relaxed golden growth: radius ×φ per full turn
  const B = Math.log(PHI) / (2 * Math.PI);
  const TURNS = 3;
  const SPAN = Math.pow(PHI, TURNS);         // φ³ ≈ 4.24

  const MARGIN = 0.96;                       // small gap to the window edges

  // Background color wheel: starts at the right side of the spiral (3 o'clock)
  const HUE_START = 45;                      // hue at 3 o'clock
  const HUE_SWEEP = 360;                     // wheel turns as it wraps around (720 = two)
  const BG_SAT = 70;                         // %
  const BG_LIGHT = 30;                       // % — keep dark so the white spiral stands out

  const SPIRAL_COLOR = "#ffffff";            // or "#000000" with BG_LIGHT ≈ 65

  const canvas = document.getElementById("spiral");
  const ctx = canvas.getContext("2d");

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = W / 2;
    const cy = H / 2;

    // Background: color wheel blending around the center, starting from the right
    if (ctx.createConicGradient) {
      const bg = ctx.createConicGradient(0, cx, cy);   // 0 rad = 3 o'clock, clockwise
      const STEPS = 12;
      for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        bg.addColorStop(t, `hsl(${(HUE_START + HUE_SWEEP * t) % 360}, ${BG_SAT}%, ${BG_LIGHT}%)`);
      }
      ctx.fillStyle = bg;
    } else {
      ctx.fillStyle = `hsl(${HUE_START}, ${BG_SAT}%, ${BG_LIGHT}%)`;  // fallback: solid
    }
    ctx.fillRect(0, 0, W, H);

    // Spiral (single color)
    const r = MARGIN * Math.min(W, H) / 2;
    const TH0 = Math.PI / 2;                 // start at the bottom, wind inward towards the right
    const DTH = 2 * Math.PI * TURNS;

    ctx.beginPath();
    const N = 2000;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const theta = TH0 - DTH * t;
      const rr = r * Math.exp(-B * DTH * t);
      const x = cx + rr * Math.cos(theta);
      const y = cy + rr * Math.sin(theta);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = SPIRAL_COLOR;
    ctx.stroke();

    // Vanishing point
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = SPIRAL_COLOR;
    ctx.fill();
  }

  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  });

  draw();
})();