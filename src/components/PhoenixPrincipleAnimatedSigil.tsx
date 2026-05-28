import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
};

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  hue: number;
  saturation: number;
};

type Particle = {
  angle: number;
  orbit: number;
  speed: number;
  radius: number;
  hue: number;
  alpha: number;
  phaseOffset: number;
};

export default function PhoenixPrincipleAnimatedSigil({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let time = 0;

    const embers: Ember[] = [];
    const particles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
      angle: (i / 80) * Math.PI * 2,
      orbit: 170 + Math.random() * 80,
      speed: (Math.random() * 0.006 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      radius: Math.random() * 1.6 + 0.5,
      hue: Math.random() > 0.5 ? 45 : Math.random() > 0.5 ? 142 : 30,
      alpha: Math.random() * 0.5 + 0.2,
      phaseOffset: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : 680;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnEmber = (cx: number, cy: number) => {
      if (embers.length > 120) return;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = Math.random() * 1.8 + 0.6;
      embers.push({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy + Math.random() * 40,
        vx: Math.cos(angle) * speed * 0.4,
        vy: Math.sin(angle) * speed - 0.5,
        life: 0,
        maxLife: Math.random() * 100 + 60,
        radius: Math.random() * 2.5 + 0.8,
        hue: Math.random() > 0.4 ? 40 : 22,
        saturation: 88 + Math.random() * 10,
      });
    };

    /* ── Sacred geometry helpers ── */
    const drawRing = (cx: number, cy: number, r: number, alpha: number, hue: number, lw = 1) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, 70%, 58%, ${alpha})`;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    const drawFlowerOfLife = (cx: number, cy: number, baseR: number, alpha: number) => {
      const petals = 6;
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        const px = cx + Math.cos(a) * baseR;
        const py = cy + Math.sin(a) * baseR;
        ctx.beginPath();
        ctx.arc(px, py, baseR, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(45, 68%, 55%, ${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(45, 68%, 55%, ${alpha})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    };

    const drawStarPolygon = (cx: number, cy: number, r: number, points: number, alpha: number, hue: number, rotation = 0) => {
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const a = (i / points) * Math.PI * 2 + rotation;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${hue}, 72%, 60%, ${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    };

    const drawGeometryNode = (cx: number, cy: number, r: number, alpha: number, hue: number) => {
      // outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, 78%, 62%, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      // inner fill
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 82%, 68%, ${alpha * 0.6})`;
      ctx.fill();
    };

    /* ── Head / beak ── */
    const drawHead = (cx: number, cy: number, scale: number, pulse: number) => {
      const headY = cy - 108 * scale;
      const headR = 16 * scale;

      // head glow
      const headGlow = ctx.createRadialGradient(cx, headY, 0, cx, headY, headR * 2.5);
      headGlow.addColorStop(0, `hsla(48, 100%, 80%, ${0.55 + pulse * 0.2})`);
      headGlow.addColorStop(0.4, `hsla(42, 92%, 58%, ${0.3 + pulse * 0.15})`);
      headGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, headY, headR * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = headGlow;
      ctx.fill();

      // head shape
      ctx.beginPath();
      ctx.ellipse(cx, headY, headR * 0.8, headR, 0, 0, Math.PI * 2);
      const headFill = ctx.createRadialGradient(cx - 3 * scale, headY - 4 * scale, 0, cx, headY, headR);
      headFill.addColorStop(0, `hsla(50, 100%, 78%, ${0.9 + pulse * 0.1})`);
      headFill.addColorStop(0.5, `hsla(40, 95%, 60%, ${0.7})`);
      headFill.addColorStop(1, `hsla(28, 90%, 42%, ${0.5})`);
      ctx.fillStyle = headFill;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `hsla(45, 95%, 62%, ${0.6 + pulse * 0.2})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // crest feathers
      for (let i = 0; i < 5; i++) {
        const cf = i / 4;
        const crX = cx + (cf - 0.5) * headR * 1.4;
        const crY = headY - headR;
        const crH = headR * (0.6 + Math.sin(cf * Math.PI) * 0.6 + Math.sin(time * 0.04 + i * 0.8) * 0.18);
        ctx.beginPath();
        ctx.moveTo(crX, crY);
        ctx.quadraticCurveTo(crX + (cf - 0.5) * 4, crY - crH * 0.5, crX, crY - crH);
        ctx.strokeStyle = `hsla(${40 + i * 8}, 92%, 68%, ${0.7 + pulse * 0.2})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(45, 90%, 65%, 0.5)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // eye
      const eyeX = cx + 5 * scale;
      const eyeY = headY - 2 * scale;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 2.8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(50, 100%, 85%, ${0.9})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeX + 0.5 * scale, eyeY, 1.2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#050a08';
      ctx.fill();

      // beak
      ctx.beginPath();
      ctx.moveTo(cx + headR * 0.6, headY + 1 * scale);
      ctx.lineTo(cx + headR * 1.5, headY + 5 * scale);
      ctx.lineTo(cx + headR * 0.6, headY + 5 * scale);
      ctx.closePath();
      ctx.fillStyle = `hsla(38, 90%, 62%, ${0.85 + pulse * 0.1})`;
      ctx.fill();
    };

    /* ── Neck ── */
    const drawNeck = (cx: number, cy: number, scale: number, pulse: number) => {
      const neckTop = cy - 90 * scale;
      const neckBot = cy - 48 * scale;
      const neckW = 12 * scale;

      const grad = ctx.createLinearGradient(cx - neckW, neckTop, cx + neckW, neckBot);
      grad.addColorStop(0, `hsla(45, 90%, 68%, ${0.65 + pulse * 0.15})`);
      grad.addColorStop(0.5, `hsla(30, 92%, 52%, ${0.55 + pulse * 0.1})`);
      grad.addColorStop(1, `hsla(142, 70%, 45%, ${0.3 + pulse * 0.08})`);

      ctx.beginPath();
      ctx.moveTo(cx - neckW * 0.6, neckTop);
      ctx.bezierCurveTo(cx - neckW, neckTop + 15 * scale, cx - neckW, neckBot - 10 * scale, cx - neckW * 0.8, neckBot);
      ctx.lineTo(cx + neckW * 0.8, neckBot);
      ctx.bezierCurveTo(cx + neckW, neckBot - 10 * scale, cx + neckW, neckTop + 15 * scale, cx + neckW * 0.6, neckTop);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // neck feather detail lines
      for (let i = 0; i < 4; i++) {
        const ny = neckTop + (i / 3) * (neckBot - neckTop);
        ctx.beginPath();
        ctx.moveTo(cx - neckW * 0.7, ny);
        ctx.lineTo(cx + neckW * 0.7, ny);
        ctx.strokeStyle = `hsla(42, 85%, 65%, ${0.2 + pulse * 0.08})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    };

    /* ── Chest / body ── */
    const drawBody = (cx: number, cy: number, scale: number, pulse: number) => {
      const bodyTop = cy - 48 * scale;
      const bodyBot = cy + 80 * scale;

      const bodyGrad = ctx.createLinearGradient(cx - 40 * scale, bodyTop, cx + 40 * scale, bodyBot);
      bodyGrad.addColorStop(0, `hsla(42, 94%, 68%, ${0.75 + pulse * 0.15})`);
      bodyGrad.addColorStop(0.3, `hsla(30, 96%, 55%, ${0.65 + pulse * 0.12})`);
      bodyGrad.addColorStop(0.65, `hsla(20, 90%, 45%, ${0.55 + pulse * 0.1})`);
      bodyGrad.addColorStop(1, `hsla(142, 72%, 40%, ${0.35 + pulse * 0.08})`);

      ctx.beginPath();
      ctx.moveTo(cx, bodyTop);
      ctx.bezierCurveTo(cx - 40 * scale, bodyTop + 20 * scale, cx - 34 * scale, bodyBot - 20 * scale, cx, bodyBot);
      ctx.bezierCurveTo(cx + 34 * scale, bodyBot - 20 * scale, cx + 40 * scale, bodyTop + 20 * scale, cx, bodyTop);
      ctx.closePath();
      ctx.fillStyle = bodyGrad;
      ctx.shadowBlur = 30;
      ctx.shadowColor = `hsla(40, 96%, 58%, ${0.32 + pulse * 0.18})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // chest flame plumage lines
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const py = bodyTop + t * (bodyBot - bodyTop) * 0.7;
        const hw = (28 - t * 12) * scale;
        ctx.beginPath();
        ctx.moveTo(cx - hw, py);
        ctx.quadraticCurveTo(cx, py + 6 * scale + Math.sin(time * 0.03 + i) * 2, cx + hw, py);
        ctx.strokeStyle = `hsla(${38 + t * 60}, 88%, ${68 - t * 15}%, ${0.3 + pulse * 0.12})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    };

    /* ── Wings ── */
    const drawWings = (cx: number, cy: number, scale: number, pulse: number) => {
      // Wing flap: smooth sinusoidal angle
      const flapT = Math.sin(time * 0.022);
      const flapAngle = flapT * 0.22; // radians

      for (const side of [-1, 1] as const) {
        const flapY = cy - flapAngle * side * 55 * scale;
        const featherCount = 14;

        for (let i = 0; i < featherCount; i++) {
          const ratio = i / (featherCount - 1);
          const baseSpread = 60 + ratio * 260;
          const lift = Math.sin(ratio * Math.PI) * 110 * scale + ratio * 55 * scale;

          // Each feather animated slightly
          const featherPhase = Math.sin(time * 0.02 + i * 0.35 + (side === -1 ? 0 : Math.PI * 0.1)) * 8 * scale;

          const sx = cx + side * 22 * scale;
          const sy = cy - 8 * scale;
          const cpX = cx + side * baseSpread * 0.45 * scale;
          const cpY = flapY - lift - featherPhase + 10 * scale;
          const ex = cx + side * baseSpread * scale;
          const ey = flapY - lift * 0.35 + ratio * 100 * scale + featherPhase * 0.5;

          // Primary feather stroke
          const wGrad = ctx.createLinearGradient(sx, sy, ex, ey);
          wGrad.addColorStop(0, `hsla(46, 92%, 72%, ${0.55 + pulse * 0.2})`);
          wGrad.addColorStop(0.35, `hsla(35, 96%, 58%, ${0.38 + pulse * 0.15})`);
          wGrad.addColorStop(0.7, `hsla(142, 76%, 52%, ${0.22 + pulse * 0.12})`);
          wGrad.addColorStop(1, `hsla(38, 90%, 48%, ${0.08 + pulse * 0.06})`);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(cpX, cpY, ex, ey);
          ctx.strokeStyle = wGrad;
          ctx.lineWidth = (2.2 - ratio * 1.0) * scale;
          ctx.shadowBlur = 14;
          ctx.shadowColor = `hsla(44, 92%, 60%, ${0.28 + pulse * 0.22})`;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Secondary thin vane line along feather
          if (i % 3 === 0) {
            const vaneX = cx + side * baseSpread * 0.7 * scale;
            const vaneY = flapY - lift * 0.5 + ratio * 70 * scale;
            ctx.beginPath();
            ctx.moveTo(cpX, cpY);
            ctx.lineTo(vaneX, vaneY);
            ctx.strokeStyle = `hsla(${i % 2 === 0 ? 45 : 142}, 80%, 65%, ${0.18 + pulse * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          // Geometry node at feather tip
          if (i % 4 === 0) {
            const nodeHue = i % 8 === 0 ? 45 : 142;
            drawGeometryNode(ex, ey, 4 * scale, 0.3 + pulse * 0.2, nodeHue);
          }
        }

        // Wing membrane shimmer behind feathers
        const memGrad = ctx.createLinearGradient(cx, cy, cx + side * 300 * scale, cy - 80 * scale);
        memGrad.addColorStop(0, `hsla(35, 90%, 55%, ${0.08 + pulse * 0.05})`);
        memGrad.addColorStop(0.5, `hsla(142, 72%, 48%, ${0.05 + pulse * 0.04})`);
        memGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(cx + side * 22 * scale, cy - 8 * scale);
        ctx.bezierCurveTo(
          cx + side * 120 * scale, cy - 80 * scale,
          cx + side * 220 * scale, cy - 50 * scale,
          cx + side * 300 * scale, cy + 40 * scale
        );
        ctx.bezierCurveTo(
          cx + side * 200 * scale, cy + 80 * scale,
          cx + side * 80 * scale, cy + 60 * scale,
          cx + side * 22 * scale, cy + 30 * scale
        );
        ctx.closePath();
        ctx.fillStyle = memGrad;
        ctx.fill();
      }
    };

    /* ── Tail feathers ── */
    const drawTail = (cx: number, cy: number, scale: number, pulse: number) => {
      const tailCount = 9;
      const tailBase = cy + 78 * scale;

      for (let i = 0; i < tailCount; i++) {
        const ratio = i / (tailCount - 1);
        const spread = (ratio - 0.5) * 200 * scale;
        const length = (80 + Math.sin(ratio * Math.PI) * 60) * scale;
        const curve = Math.sin(time * 0.018 + i * 0.4) * 14 * scale;

        const ex = cx + spread;
        const ey = tailBase + length;
        const cpX = cx + spread * 0.5 + curve;
        const cpY = tailBase + length * 0.55;

        const tailGrad = ctx.createLinearGradient(cx, tailBase, ex, ey);
        tailGrad.addColorStop(0, `hsla(40, 95%, 65%, ${0.55 + pulse * 0.18})`);
        tailGrad.addColorStop(0.4, `hsla(25, 90%, 52%, ${0.42 + pulse * 0.14})`);
        tailGrad.addColorStop(0.75, `hsla(142, 72%, 48%, ${0.28 + pulse * 0.1})`);
        tailGrad.addColorStop(1, `hsla(35, 85%, 42%, ${0.1})`);

        ctx.beginPath();
        ctx.moveTo(cx + (ratio - 0.5) * 18 * scale, tailBase);
        ctx.quadraticCurveTo(cpX, cpY, ex, ey);
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = (1.8 - Math.abs(ratio - 0.5) * 1.6) * scale;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(38, 92%, 58%, ${0.25 + pulse * 0.14})`;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tail tip node
        if (i % 3 === 0) {
          drawGeometryNode(ex, ey, 3.5 * scale, 0.4 + pulse * 0.2, i % 2 === 0 ? 45 : 142);
        }
      }
    };

    /* ── Alchemical sigil rings ── */
    const drawSigilRings = (cx: number, cy: number, scale: number, pulse: number, slowPulse: number) => {
      const ring1R = (72 + slowPulse * 8) * scale;
      const ring2R = (132 + slowPulse * 12) * scale;
      const ring3R = (200 + slowPulse * 16) * scale;
      const ring4R = (265 + slowPulse * 20) * scale;

      // Outer decorative band
      drawRing(cx, cy, ring4R, 0.06 + pulse * 0.03, 45, 0.7);
      drawRing(cx, cy, ring4R + 8 * scale, 0.04 + pulse * 0.02, 142, 0.5);

      // Node markers on outer ring
      const outerNodes = 12;
      for (let i = 0; i < outerNodes; i++) {
        const a = (i / outerNodes) * Math.PI * 2 + time * 0.001;
        const nx = cx + Math.cos(a) * ring4R;
        const ny = cy + Math.sin(a) * ring4R;
        const nodeHue = i % 3 === 0 ? 45 : i % 3 === 1 ? 142 : 30;
        drawGeometryNode(nx, ny, 4 * scale, 0.28 + pulse * 0.15, nodeHue);
      }

      // Third ring with spoke lines
      drawRing(cx, cy, ring3R, 0.1 + pulse * 0.05, 142, 0.9);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 - time * 0.0015;
        const inner = ring2R * 0.85;
        const outer = ring3R;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.strokeStyle = `hsla(${i % 2 === 0 ? 45 : 142}, 75%, 60%, ${0.07 + pulse * 0.04})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Second ring - alchemical
      drawRing(cx, cy, ring2R, 0.15 + pulse * 0.07, 45, 1.1);

      // Flower of life at mid ring
      drawFlowerOfLife(cx, cy, ring2R * 0.36, 0.1 + pulse * 0.05);

      // First inner ring
      drawRing(cx, cy, ring1R, 0.22 + pulse * 0.1, 45, 1.3);

      // Star polygon inscribed in first ring
      drawStarPolygon(cx, cy, ring1R * 0.88, 6, 0.1 + pulse * 0.05, 45, time * 0.003);
      drawStarPolygon(cx, cy, ring1R * 0.88, 6, 0.08 + pulse * 0.04, 142, -time * 0.002 + Math.PI / 6);

      // Innermost sacred geometry nodes (6 around center)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + time * 0.004;
        const r = ring1R * 0.55;
        const nx = cx + Math.cos(a) * r;
        const ny = cy + Math.sin(a) * r;
        drawGeometryNode(nx, ny, 5 * scale, 0.35 + pulse * 0.2, i % 2 === 0 ? 45 : 142);
      }
    };

    /* ── Core light ── */
    const drawCore = (cx: number, cy: number, scale: number, pulse: number) => {
      const r = (20 + pulse * 6) * scale;

      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 5);
      coreGlow.addColorStop(0, `hsla(50, 100%, 88%, 0.95)`);
      coreGlow.addColorStop(0.15, `hsla(45, 96%, 72%, ${0.7 + pulse * 0.2})`);
      coreGlow.addColorStop(0.4, `hsla(36, 90%, 55%, ${0.35 + pulse * 0.15})`);
      coreGlow.addColorStop(0.7, `hsla(142, 76%, 45%, ${0.12 + pulse * 0.08})`);
      coreGlow.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, cy, r * 5, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(48, 100%, 82%, ${0.85 + pulse * 0.15})`;
      ctx.shadowBlur = 28;
      ctx.shadowColor = `hsla(45, 98%, 65%, 0.7)`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Heart star / sigil cross
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const len = r * 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
        ctx.strokeStyle = `hsla(48, 100%, 80%, ${0.45 + pulse * 0.2})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    };

    /* ── Botanical vines / botanical solarpunk glow ── */
    const drawBotanical = (cx: number, cy: number, scale: number, pulse: number) => {
      for (const side of [-1, 1] as const) {
        // Main vine stem
        ctx.beginPath();
        ctx.moveTo(cx + side * 20 * scale, cy + 85 * scale);
        for (let i = 1; i <= 8; i++) {
          const vx = cx + side * (20 + i * 18 + Math.sin(time * 0.015 + i * 0.7) * 9) * scale;
          const vy = cy + (85 - i * 20) * scale;
          ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = `hsla(142, 68%, 46%, ${0.28 + pulse * 0.14})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Leaves along vine
        for (let i = 0; i < 5; i++) {
          const t = i / 4;
          const lx = cx + side * (28 + i * 20 + Math.sin(time * 0.015 + i) * 8) * scale;
          const ly = cy + (75 - i * 22) * scale;
          const la = side * 0.6 + Math.sin(time * 0.012 + i) * 0.12;
          const lw = (6 + Math.sin(t * Math.PI) * 4) * scale;
          const lh = 2.5 * scale;

          ctx.beginPath();
          ctx.ellipse(lx + side * lw * 0.4, ly - lh, lw, lh, la, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(142, 72%, 50%, ${0.2 + pulse * 0.1})`;
          ctx.fill();
        }

        // Bioluminescent glow dots
        for (let i = 0; i < 6; i++) {
          const gx = cx + side * (30 + i * 25 + Math.sin(time * 0.02 + i * 1.3) * 12) * scale;
          const gy = cy + (60 - i * 18 + Math.cos(time * 0.018 + i) * 6) * scale;
          const gAlpha = (0.3 + Math.sin(time * 0.04 + i * 0.7) * 0.2) * (0.6 + pulse * 0.4);

          ctx.beginPath();
          ctx.arc(gx, gy, 2.5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(142, 88%, 65%, ${gAlpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `hsla(142, 90%, 60%, ${gAlpha * 0.7})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    /* ── Orbital particles ── */
    const drawParticles = (cx: number, cy: number, scale: number, slowPulse: number) => {
      for (const p of particles) {
        p.angle += p.speed;
        const orbitR = (p.orbit + Math.sin(time * 0.01 + p.phaseOffset) * 18) * scale;
        const px = cx + Math.cos(p.angle) * orbitR;
        const py = cy + Math.sin(p.angle * 0.75) * orbitR * 0.45;

        ctx.beginPath();
        ctx.arc(px, py, p.radius * (0.7 + slowPulse * 0.4) * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 82%, 68%, ${p.alpha * (0.6 + slowPulse * 0.4)})`;
        ctx.fill();
      }
    };

    /* ── Main animation loop ── */
    const animate = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.52;

      // Adaptive scale so phoenix fits
      const rawScale = Math.min(width, height * 1.1) / 680;
      const scale = Math.max(0.38, Math.min(rawScale, 1.0));

      const pulse = (Math.sin(time * 0.026) + 1) / 2;
      const slowPulse = (Math.sin(time * 0.009) + 1) / 2;

      // Gentle breathing scale transform applied via canvas transform
      const breatheScale = 1 + Math.sin(time * 0.011) * 0.012;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(breatheScale, breatheScale);
      ctx.translate(-cx, -cy);

      // Ambient background glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.7);
      bgGlow.addColorStop(0, `rgba(200, 155, 60, 0.10)`);
      bgGlow.addColorStop(0.2, `rgba(20, 90, 50, 0.07)`);
      bgGlow.addColorStop(0.55, `rgba(10, 35, 20, 0.06)`);
      bgGlow.addColorStop(1, 'rgba(5, 10, 8, 0.02)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw layers from back to front
      drawSigilRings(cx, cy, scale, pulse, slowPulse);
      drawBotanical(cx, cy, scale, pulse);
      drawParticles(cx, cy, scale, slowPulse);
      drawTail(cx, cy, scale, pulse);
      drawWings(cx, cy, scale, pulse);
      drawBody(cx, cy, scale, pulse);
      drawNeck(cx, cy, scale, pulse);
      drawHead(cx, cy, scale, pulse);
      drawCore(cx, cy - 8 * scale, scale, pulse);

      // Embers
      if (Math.random() < 0.85) spawnEmber(cx, cy);

      for (let i = embers.length - 1; i >= 0; i--) {
        const em = embers[i];
        em.life += 1;
        em.x += em.vx + Math.sin(time * 0.02 + em.life * 0.07) * 0.28;
        em.y += em.vy;
        em.vy -= 0.018;

        if (em.life >= em.maxLife) {
          embers.splice(i, 1);
          continue;
        }

        const age = em.life / em.maxLife;
        const alpha = age < 0.2 ? age / 0.2 : 1 - age;

        ctx.beginPath();
        ctx.arc(em.x, em.y, em.radius * (1 - age * 0.35) * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${em.hue}, ${em.saturation}%, 65%, ${alpha * 0.65})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = `hsla(${em.hue}, 92%, 60%, ${alpha * 0.55})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Subtle vignette
      const vign = ctx.createRadialGradient(
        cx, cy, Math.min(width, height) * 0.1,
        cx, cy, Math.max(width, height) * 0.72
      );
      vign.addColorStop(0, 'transparent');
      vign.addColorStop(1, 'rgba(3, 8, 6, 0.52)');
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
