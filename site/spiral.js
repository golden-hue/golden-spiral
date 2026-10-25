(() => {
  "use strict";

  const PHI = (1 + Math.sqrt(5)) / 2;
  const B = Math.log(PHI) / (2 * Math.PI);   // ×φ per full turn
  const TURNS = 3;
  const SPAN = Math.pow(PHI, TURNS);
  const MARGIN = 0.95;                        // keep the spiral inside the window
  const TH0 = Math.PI / 2;                    // starts at 6 o'clock
  const DTH = 2 * Math.PI * TURNS;

  // Hue model: follows the spiral ARMS (isolines are log-spirals, not circles)
  const HUE_START = 45;        // hue at fraction 0 (the outermost / black side)
  const HUE_RANGE = 360;       // one full wheel across the three turns
  const BG_SAT = 0.72;         // 0..1
  const BASE_L = 0.34;         // 0..1 lightness inside the arms
  const ARM_STEP = 0.0;        // optional per-ring lightness depth cue (0 = flat)
  const FADE = 0.75;           // rings outside turn 1 over which it fades to black
  const SPIRAL_COLOR = "#ffffff";

  const canvas = document.getElementById("spiral");
  const ctx = canvas.getContext("2d");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = W / 2, cy = H / 2;
    const rOuter = MARGIN * Math.min(W, H) / 2;
    const K = rOuter * Math.exp(-B * TH0);      // ring-1 log-spiral: r = K·e^{Bθ}
    const lnK = Math.log(K), lnPHI = Math.log(PHI);

    // --- Background: hue that follows the spiral arms (per-pixel) ---
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const octx = off.getContext("2d");
    const img = octx.createImageData(W, H);
    const d = img.data;
    for (let py = 0; py < H; py++) {
      const dy = py - cy;
      for (let px = 0; px < W; px++) {
        const dx = px - cx;
        const r = Math.max(Math.hypot(dx, dy), 1e-4);
        const th = Math.atan2(dy, dx);
        const m = (lnK + B * th - Math.log(r)) / lnPHI;          // arm index
        const hueFrac = clamp((m + 1) / 3, 0, 1);
        const hue = HUE_START + hueFrac * HUE_RANGE;
        const L = m < 0
          ? BASE_L * clamp(1 + m / FADE, 0, 1)                  // fade to black outside turn 1
          : BASE_L + ARM_STEP * clamp(m, 0, 2);
        const [rr, gg, bb] = hslToRgb(hue, BG_SAT, L);
        const i = (py * W + px) * 4;
        d[i] = rr; d[i + 1] = gg; d[i + 2] = bb; d[i + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.drawImage(off, 0, 0, W, H);

    // --- Spiral (single color), 3 turns, 6 o'clock → inward toward the right ---
    ctx.beginPath();
    const N = 2000;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const theta = TH0 - DTH * t;
      const rr = rOuter * Math.exp(-B * DTH * t);
      const x = cx + rr * Math.cos(theta);
      const y = cy + rr * Math.sin(theta);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineCap = "round"; ctx.lineJoin = "round";
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