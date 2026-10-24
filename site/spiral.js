(() => {
  "use strict";

  const PHI = (1 + Math.sqrt(5)) / 2;

  // Relaxed golden growth: radius ×φ per full turn
  const B = Math.log(PHI) / (2 * Math.PI);
  const TURNS = 3;
  const SPAN = Math.pow(PHI, TURNS);         // φ³ ≈ 4.24

  const MARGIN = 0.96;                       // small gap to the window edges

  // Color wheel: amber at the outer tail (bottom → right), one full wheel
  // over the whole spiral, folding into the inner curl
  const HUE_START = 45;
  const HUE_SWEEP = 360;                     // try 360 * TURNS for a full wheel per turn

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
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const r = MARGIN * Math.min(W, H) / 2;

    const TH0 = Math.PI / 2;                 // start at the bottom, wind inward towards the right
    const DTH = 2 * Math.PI * TURNS;

    // t ∈ [0,1]: 0 = outer tail, 1 = vanishing point
    const point = (t) => {
      const theta = TH0 - DTH * t;
      const rr = r * Math.exp(-B * DTH * t);
      return { x: cx + rr * Math.cos(theta), y: cy + rr * Math.sin(theta) };
    };
    const hue = (t) => (HUE_START + HUE_SWEEP * t) % 360;

    ctx.lineCap = "round";                   // round caps hide joins between colored segments
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;

    const N = TURNS * 480;                   // ~1440 small segments, each its own hue
    for (let i = 0; i < N; i++) {
      const a = point(i / N);
      const b = point((i + 1) / N);
      ctx.strokeStyle = `hsl(${hue((i + 0.5) / N)}, 85%, 60%)`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Vanishing point, in the innermost hue
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = `hsl(${hue(1)}, 85%, 60%)`;
    ctx.fill();
  }

  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  });

  draw();
})();