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
};

export default function SolarpunkPhoenixPrincipleAnimation({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let time = 0;
    let mouse = { x: 0, y: 0, active: false };
    const embers: Ember[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width || window.innerWidth;
      height = rect?.height || 620;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mouse.x = width / 2;
      mouse.y = height / 2;
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const handleMouseLeave = () => { mouse.active = false; };
    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    const spawnEmber = (cx: number, cy: number) => {
      if (embers.length > 140) return;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = Math.random() * 1.8 + 0.5;
      const fromTail = Math.random() < 0.35;
      embers.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: fromTail ? cy + 80 + Math.random() * 100 : cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed * 0.5,
        vy: fromTail ? Math.random() * 0.8 + 0.2 : Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 110 + 80,
        radius: Math.random() * 2.5 + 0.6,
        hue: Math.random() > 0.5 ? 25 + Math.random() * 20 : 40 + Math.random() * 15,
      });
    };

    // Draw outer sacred geometry ring
    const drawSacredRing = (cx: number, cy: number, r: number, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;

      // Main circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(38, 80%, 55%, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner decorative ring
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(38, 70%, 50%, ${alpha * 0.6})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Sacred spoke lines
      const spokes = 12;
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.88, cy + Math.sin(a) * r * 0.88);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = `hsla(38, 80%, 60%, ${alpha * 0.8})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Small node dots at spoke tips
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(38, 90%, 65%, ${alpha})`;
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw one wing (side: -1 = left, 1 = right)
    const drawWing = (cx: number, cy: number, side: -1 | 1, pulse: number, proximity: number) => {
      const t = time * 0.018;
      const flap = Math.sin(t) * 8 * side;
      const boost = proximity * 0.4;

      // Primary large feather sweeps - 5 main feather groups
      const featherLayers = [
        { count: 7, spreadBase: 320, liftBase: 110, colorH: 22, colorS: 95, colorL: 52 },
        { count: 6, spreadBase: 270, liftBase: 90, colorH: 32, colorS: 92, colorL: 58 },
        { count: 5, spreadBase: 210, liftBase: 70, colorH: 42, colorS: 88, colorL: 62 },
      ];

      for (const layer of featherLayers) {
        for (let i = 0; i < layer.count; i++) {
          const ratio = i / (layer.count - 1);
          const spread = layer.spreadBase * (0.3 + ratio * 0.7);
          const lift = layer.liftBase * Math.sin(ratio * Math.PI * 0.9);
          const waviness = Math.sin(t * 1.1 + i * 0.6) * 12;

          const sx = cx + side * 18;
          const sy = cy - 20 + ratio * 30;
          const cpx = cx + side * spread * 0.5;
          const cpy = cy - lift - waviness + flap;
          const ex = cx + side * spread;
          const ey = cy - lift * 0.3 + ratio * 120 + flap * 0.5;

          // Feather glow
          const grad = ctx.createLinearGradient(sx, sy, ex, ey);
          grad.addColorStop(0, `hsla(${layer.colorH}, ${layer.colorS}%, ${layer.colorL}%, ${0.65 + pulse * 0.2 + boost * 0.15})`);
          grad.addColorStop(0.5, `hsla(${layer.colorH + 10}, ${layer.colorS}%, ${layer.colorL + 8}%, ${0.4 + pulse * 0.15})`);
          grad.addColorStop(1, `hsla(${layer.colorH - 5}, ${layer.colorS - 10}%, ${layer.colorL - 8}%, ${0.08 + pulse * 0.08})`);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(cpx, cpy, ex, ey);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.8 - ratio * 1.4;
          ctx.shadowBlur = 20 + pulse * 12;
          ctx.shadowColor = `hsla(${layer.colorH}, 95%, 58%, ${0.5 + pulse * 0.3})`;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Secondary feather tip accent
          if (ratio > 0.5) {
            const tipGrad = ctx.createLinearGradient(cpx, cpy, ex, ey);
            tipGrad.addColorStop(0, `hsla(45, 90%, 70%, ${0.3 + pulse * 0.2})`);
            tipGrad.addColorStop(1, `hsla(22, 90%, 50%, ${0.05})`);
            ctx.beginPath();
            ctx.moveTo(cpx, cpy);
            ctx.quadraticCurveTo(
              cpx + side * 20,
              cpy - 20 + flap * 0.3,
              ex + side * 15,
              ey - 25
            );
            ctx.strokeStyle = tipGrad;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Upper crest feathers (pointing upward sharply)
      for (let i = 0; i < 4; i++) {
        const ratio = i / 3;
        const crestSpread = side * (50 + ratio * 100);
        const crestLift = 160 + ratio * 60 + Math.sin(t + i) * 10;

        const grad = ctx.createLinearGradient(cx, cy - 60, cx + crestSpread, cy - crestLift);
        grad.addColorStop(0, `hsla(38, 92%, 62%, ${0.6 + pulse * 0.2})`);
        grad.addColorStop(1, `hsla(22, 88%, 52%, ${0.15 + pulse * 0.1})`);

        ctx.beginPath();
        ctx.moveTo(cx + side * 10, cy - 60);
        ctx.quadraticCurveTo(
          cx + crestSpread * 0.6,
          cy - crestLift * 0.7,
          cx + crestSpread,
          cy - crestLift
        );
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8 - ratio * 0.8;
        ctx.shadowBlur = 18;
        ctx.shadowColor = `hsla(38, 95%, 60%, ${0.4 + pulse * 0.3})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    // Tail feathers flowing downward
    const drawTail = (cx: number, cy: number, pulse: number) => {
      const t = time * 0.014;
      const feathers = 9;

      for (let i = 0; i < feathers; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const ratio = i / (feathers - 1);
        const spread = (ratio - 0.5) * 260;
        const drop = 140 + Math.sin(ratio * Math.PI) * 80;
        const wave = Math.sin(t + i * 0.7) * 14;

        const hue = 22 + ratio * 18;
        const grad = ctx.createLinearGradient(cx, cy + 60, cx + spread, cy + drop);
        grad.addColorStop(0, `hsla(${hue}, 92%, 58%, ${0.5 + pulse * 0.2})`);
        grad.addColorStop(0.6, `hsla(${hue - 5}, 88%, 48%, ${0.3 + pulse * 0.15})`);
        grad.addColorStop(1, `hsla(${hue - 10}, 80%, 38%, ${0.05})`);

        ctx.beginPath();
        ctx.moveTo(cx + side * 8, cy + 60);
        ctx.quadraticCurveTo(
          cx + spread * 0.4 + wave,
          cy + drop * 0.5,
          cx + spread + wave * 0.5,
          cy + drop
        );
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2 - ratio * 0.8;
        ctx.shadowBlur = 14 + pulse * 8;
        ctx.shadowColor = `hsla(${hue}, 95%, 55%, ${0.4 + pulse * 0.2})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    // Bird body - flame-shaped torso
    const drawBody = (cx: number, cy: number, pulse: number) => {
      // Outer body glow
      const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      outerGlow.addColorStop(0, `hsla(40, 95%, 70%, ${0.12 + pulse * 0.06})`);
      outerGlow.addColorStop(0.4, `hsla(28, 90%, 55%, ${0.08 + pulse * 0.04})`);
      outerGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Main torso shape - upward flame/bird body
      const bodyGrad = ctx.createLinearGradient(cx, cy - 130, cx, cy + 80);
      bodyGrad.addColorStop(0, `hsla(42, 95%, 72%, ${0.9 + pulse * 0.08})`);
      bodyGrad.addColorStop(0.3, `hsla(32, 94%, 60%, ${0.75 + pulse * 0.12})`);
      bodyGrad.addColorStop(0.7, `hsla(22, 92%, 50%, ${0.6 + pulse * 0.1})`);
      bodyGrad.addColorStop(1, `hsla(18, 88%, 42%, ${0.35 + pulse * 0.08})`);

      ctx.beginPath();
      ctx.moveTo(cx, cy - 130);
      // Head crown spike
      ctx.bezierCurveTo(cx - 8, cy - 90, cx - 30, cy - 60, cx - 34, cy - 20);
      // Left body side
      ctx.bezierCurveTo(cx - 28, cy + 20, cx - 18, cy + 55, cx, cy + 80);
      // Right body side mirror
      ctx.bezierCurveTo(cx + 18, cy + 55, cx + 28, cy + 20, cx + 34, cy - 20);
      ctx.bezierCurveTo(cx + 30, cy - 60, cx + 8, cy - 90, cx, cy - 130);

      ctx.fillStyle = bodyGrad;
      ctx.shadowBlur = 40;
      ctx.shadowColor = `hsla(30, 95%, 58%, ${0.5 + pulse * 0.25})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Body outline shimmer
      ctx.beginPath();
      ctx.moveTo(cx, cy - 130);
      ctx.bezierCurveTo(cx - 8, cy - 90, cx - 30, cy - 60, cx - 34, cy - 20);
      ctx.bezierCurveTo(cx - 28, cy + 20, cx - 18, cy + 55, cx, cy + 80);
      ctx.bezierCurveTo(cx + 18, cy + 55, cx + 28, cy + 20, cx + 34, cy - 20);
      ctx.bezierCurveTo(cx + 30, cy - 60, cx + 8, cy - 90, cx, cy - 130);
      ctx.strokeStyle = `hsla(45, 95%, 75%, ${0.35 + pulse * 0.2})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    // Head and beak
    const drawHead = (cx: number, cy: number, pulse: number) => {
      const headY = cy - 120;

      // Head glow
      const headGlow = ctx.createRadialGradient(cx, headY, 0, cx, headY, 40);
      headGlow.addColorStop(0, `hsla(45, 100%, 80%, ${0.8 + pulse * 0.15})`);
      headGlow.addColorStop(0.4, `hsla(38, 95%, 65%, ${0.5 + pulse * 0.1})`);
      headGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, headY, 40, 0, Math.PI * 2);
      ctx.fillStyle = headGlow;
      ctx.fill();

      // Head sphere
      const headGrad = ctx.createRadialGradient(cx - 4, headY - 4, 2, cx, headY, 22);
      headGrad.addColorStop(0, `hsla(48, 100%, 82%, ${0.95})`);
      headGrad.addColorStop(0.5, `hsla(40, 95%, 68%, ${0.85})`);
      headGrad.addColorStop(1, `hsla(28, 90%, 52%, ${0.7})`);
      ctx.beginPath();
      ctx.arc(cx, headY, 22, 0, Math.PI * 2);
      ctx.fillStyle = headGrad;
      ctx.shadowBlur = 30;
      ctx.shadowColor = `hsla(42, 98%, 65%, ${0.6 + pulse * 0.3})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Beak - sharp downward point
      const beakGrad = ctx.createLinearGradient(cx - 8, headY + 10, cx + 8, headY + 35);
      beakGrad.addColorStop(0, `hsla(38, 90%, 65%, 0.9)`);
      beakGrad.addColorStop(1, `hsla(25, 85%, 48%, 0.7)`);
      ctx.beginPath();
      ctx.moveTo(cx - 8, headY + 10);
      ctx.lineTo(cx + 8, headY + 10);
      ctx.lineTo(cx, headY + 35);
      ctx.closePath();
      ctx.fillStyle = beakGrad;
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(cx + 5, headY - 4, 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(0, 0%, 5%, 0.9)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6, headY - 5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(45, 100%, 90%, 0.9)`;
      ctx.fill();

      // Crown feathers - crest spikes
      for (let i = 0; i < 5; i++) {
        const ratio = (i - 2) / 2;
        const spikeX = cx + ratio * 16;
        const spikeH = 28 + (1 - Math.abs(ratio)) * 22 + Math.sin(time * 0.022 + i) * 5;
        const spikeHue = 38 + i * 5;

        ctx.beginPath();
        ctx.moveTo(spikeX - 4, headY - 18);
        ctx.lineTo(spikeX, headY - 18 - spikeH);
        ctx.lineTo(spikeX + 4, headY - 18);
        ctx.fillStyle = `hsla(${spikeHue}, 95%, 68%, ${0.7 + pulse * 0.2})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${spikeHue}, 95%, 65%, ${0.5})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    // Heart core / sacred center
    const drawCore = (cx: number, cy: number, pulse: number, proximity: number) => {
      const coreY = cy - 30;
      const coreR = 16 + pulse * 5 + proximity * 6;

      // Sacred geometry inner triangle
      ctx.save();
      ctx.translate(cx, coreY);
      ctx.rotate(time * 0.005);

      // Upward triangle
      ctx.beginPath();
      ctx.moveTo(0, -coreR * 1.4);
      ctx.lineTo(coreR * 1.2, coreR * 0.8);
      ctx.lineTo(-coreR * 1.2, coreR * 0.8);
      ctx.closePath();
      ctx.strokeStyle = `hsla(45, 100%, 80%, ${0.4 + pulse * 0.2})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Downward triangle
      ctx.beginPath();
      ctx.moveTo(0, coreR * 1.4);
      ctx.lineTo(coreR * 1.2, -coreR * 0.8);
      ctx.lineTo(-coreR * 1.2, -coreR * 0.8);
      ctx.closePath();
      ctx.strokeStyle = `hsla(28, 95%, 68%, ${0.35 + pulse * 0.15})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();

      // Core orb
      const coreGrad = ctx.createRadialGradient(cx - 2, coreY - 2, 0, cx, coreY, coreR * 3);
      coreGrad.addColorStop(0, `hsla(50, 100%, 92%, 0.95)`);
      coreGrad.addColorStop(0.2, `hsla(44, 98%, 78%, ${0.75 + pulse * 0.2})`);
      coreGrad.addColorStop(0.5, `hsla(32, 94%, 58%, ${0.35 + pulse * 0.15})`);
      coreGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, coreY, coreR * 3, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, coreY, coreR, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(48, 100%, 88%, ${0.88 + pulse * 0.1})`;
      ctx.shadowBlur = 25 + pulse * 15;
      ctx.shadowColor = `hsla(42, 100%, 68%, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.52;
      const pulse = (Math.sin(time * 0.024) + 1) / 2;
      const slowPulse = (Math.sin(time * 0.008) + 1) / 2;

      const proximity = mouse.active
        ? Math.max(0, 1 - Math.hypot(mouse.x - cx, mouse.y - cy) / Math.max(width * 0.45, 240))
        : 0;

      // Subtle warm background wash
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.65);
      bgGrad.addColorStop(0, `rgba(180, 100, 20, ${0.10 + pulse * 0.04})`);
      bgGrad.addColorStop(0.35, `rgba(120, 50, 10, ${0.06})`);
      bgGrad.addColorStop(1, 'rgba(3, 5, 2, 0.02)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer sacred ring
      const ringR = Math.min(width, height) * 0.42;
      drawSacredRing(cx, cy - 10, ringR, 0.18 + slowPulse * 0.06);

      // Inner ring
      drawSacredRing(cx, cy - 10, ringR * 0.72, 0.12 + slowPulse * 0.04);

      // Rotating light rays from center (like the image's radial burst)
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + time * 0.003;
        const inner = 70;
        const outer = ringR * 0.68 + Math.sin(time * 0.01 + i * 0.5) * 12;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy - 10 + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy - 10 + Math.sin(angle) * outer);
        ctx.strokeStyle = `hsla(${i % 2 === 0 ? 38 : 28}, 85%, 58%, ${0.05 + pulse * 0.04})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      drawTail(cx, cy, pulse);
      drawWing(cx, cy, -1, pulse, proximity);
      drawWing(cx, cy, 1, pulse, proximity);
      drawBody(cx, cy, pulse);
      drawHead(cx, cy, pulse);
      drawCore(cx, cy, pulse, proximity);

      // Spawn and draw embers
      if (Math.random() < 0.85) spawnEmber(cx, cy);

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life += 1;
        e.x += e.vx + Math.sin(time * 0.015 + e.life * 0.06) * 0.3;
        e.y += e.vy;
        e.vy -= 0.006;

        if (e.life >= e.maxLife) { embers.splice(i, 1); continue; }

        const age = e.life / e.maxLife;
        const alpha = age < 0.15 ? age / 0.15 : 1 - age;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * (1 - age * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue}, 95%, 65%, ${alpha * 0.65})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${e.hue}, 95%, 58%, ${alpha * 0.55})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Vignette
      const vignette = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.1, cx, cy, Math.max(width, height) * 0.72);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(2, 5, 3, 0.52)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
    />
  );
}
