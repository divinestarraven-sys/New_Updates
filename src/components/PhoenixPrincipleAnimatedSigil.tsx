import { useEffect, useRef } from 'react';

import { useEffect, useRef } from 'react';

type PhoenixPrincipleAnimatedSigilProps = {
  className?: string;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  hue: number;
};

type OrbitSeed = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  hue: number;
  alpha: number;
};

export default function PhoenixPrincipleAnimatedSigil({
  className = '',
}: PhoenixPrincipleAnimatedSigilProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const ctx = context;
    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseActive = false;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const sparks: Spark[] = [];
    const orbitSeeds: OrbitSeed[] = Array.from({ length: 150 }, (_, index) => ({
      angle: (index / 150) * Math.PI * 2 + Math.random() * 0.8,
      radius: 80 + Math.random() * 290,
      speed: 0.0015 + Math.random() * 0.004,
      size: 0.6 + Math.random() * 1.9,
      hue: Math.random() > 0.55 ? 45 : Math.random() > 0.25 ? 135 : 25,
      alpha: 0.12 + Math.random() * 0.45,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent?.getBoundingClientRect();

      width = rect?.width || 1000;
      height = rect?.height || 680;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      mouseX = width / 2;
      mouseY = height / 2;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    const drawCircle = (
      x: number,
      y: number,
      radius: number,
      alpha: number,
      hue = 45,
      lineWidth = 1
    ) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, 80%, 62%, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const drawSacredGeometry = (
      cx: number,
      cy: number,
      scale: number,
      pulse: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.0007);

      const outer = 275 * scale;
      const middle = 195 * scale;
      const inner = 105 * scale;

      drawCircle(0, 0, outer, 0.18 + pulse * 0.08, 45, 1.2);
      drawCircle(0, 0, middle, 0.14 + pulse * 0.08, 135, 1);
      drawCircle(0, 0, inner, 0.18 + pulse * 0.08, 45, 1);

      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        const x1 = Math.cos(a) * inner;
        const y1 = Math.sin(a) * inner;
        const x2 = Math.cos(a) * outer;
        const y2 = Math.sin(a) * outer;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsla(${i % 2 === 0 ? 45 : 135}, 85%, 62%, ${
          0.065 + pulse * 0.06
        })`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * middle;
        const y = Math.sin(a) * middle;

        ctx.beginPath();
        ctx.arc(x, y, 9 * scale + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${i % 2 === 0 ? 45 : 135}, 90%, 64%, ${
          0.28 + pulse * 0.18
        })`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(45, 95%, 58%, ${0.35 + pulse * 0.2})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        drawCircle(x, y, 25 * scale, 0.16 + pulse * 0.08, i % 2 === 0 ? 45 : 135);
      }

      ctx.restore();
    };

    const drawFeather = (
      shoulderX: number,
      shoulderY: number,
      side: -1 | 1,
      index: number,
      total: number,
      scale: number,
      flap: number,
      pulse: number
    ) => {
      const r = index / (total - 1);
      const upperBias = 1 - r;

      const length = (120 + r * 270) * scale;
      const rise = (-135 + r * 260) * scale;
      const spread = (45 + r * 32) * scale;

      const wingLift = flap * (55 + upperBias * 65) * scale;
      const startX = shoulderX + side * (index * 1.2) * scale;
      const startY = shoulderY + r * 25 * scale;
      const tipX = shoulderX + side * length;
      const tipY = shoulderY + rise - wingLift;

      const cp1X = shoulderX + side * length * 0.34;
      const cp1Y = shoulderY + (-165 + r * 90) * scale - wingLift * 0.9;

      const cp2X = shoulderX + side * length * 0.72;
      const cp2Y = shoulderY + (-120 + r * 210) * scale - wingLift * 0.55;

      const lowerCpX = shoulderX + side * length * 0.42;
      const lowerCpY = shoulderY + (-30 + r * 170) * scale - wingLift * 0.2;

      const gradient = ctx.createLinearGradient(startX, startY, tipX, tipY);
      gradient.addColorStop(0, `hsla(42, 95%, 72%, ${0.56 + pulse * 0.22})`);
      gradient.addColorStop(0.42, `hsla(28, 100%, 55%, ${0.32 + pulse * 0.18})`);
      gradient.addColorStop(0.76, `hsla(135, 75%, 45%, ${0.19 + pulse * 0.1})`);
      gradient.addColorStop(1, `hsla(45, 100%, 64%, ${0.1 + pulse * 0.12})`);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, tipX, tipY);
      ctx.bezierCurveTo(
        tipX - side * spread,
        tipY + spread * 0.18,
        lowerCpX,
        lowerCpY,
        startX,
        startY
      );
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 22;
      ctx.shadowColor = `hsla(28, 100%, 58%, ${0.18 + pulse * 0.22})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cp1X, cp1Y, tipX, tipY);
      ctx.strokeStyle = `hsla(45, 95%, 78%, ${0.18 + pulse * 0.2})`;
      ctx.lineWidth = 0.8 + upperBias * 0.8;
      ctx.stroke();
    };

    const drawWing = (
      cx: number,
      cy: number,
      side: -1 | 1,
      scale: number,
      flap: number,
      pulse: number
    ) => {
      const shoulderX = cx + side * 32 * scale;
      const shoulderY = cy - 70 * scale;

      const featherCount = 18;

      for (let i = featherCount - 1; i >= 0; i -= 1) {
        drawFeather(shoulderX, shoulderY, side, i, featherCount, scale, flap, pulse);
      }

      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.bezierCurveTo(
        cx + side * 95 * scale,
        cy - 190 * scale - flap * 35 * scale,
        cx + side * 230 * scale,
        cy - 175 * scale - flap * 65 * scale,
        cx + side * 355 * scale,
        cy - 90 * scale - flap * 35 * scale
      );
      ctx.strokeStyle = `hsla(45, 95%, 70%, ${0.45 + pulse * 0.22})`;
      ctx.lineWidth = 2.2 * scale;
      ctx.shadowBlur = 26;
      ctx.shadowColor = `hsla(45, 95%, 60%, ${0.35 + pulse * 0.2})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawBody = (
      cx: number,
      cy: number,
      scale: number,
      pulse: number
    ) => {
      const bodyGradient = ctx.createLinearGradient(
        cx,
        cy - 190 * scale,
        cx,
        cy + 150 * scale
      );
      bodyGradient.addColorStop(0, `hsla(45, 100%, 78%, ${0.95})`);
      bodyGradient.addColorStop(0.32, `hsla(26, 100%, 55%, ${0.82})`);
      bodyGradient.addColorStop(0.72, `hsla(135, 82%, 42%, ${0.46})`);
      bodyGradient.addColorStop(1, `hsla(42, 100%, 58%, ${0.65})`);

      ctx.beginPath();
      ctx.moveTo(cx, cy - 190 * scale);
      ctx.bezierCurveTo(
        cx - 42 * scale,
        cy - 115 * scale,
        cx - 48 * scale,
        cy - 12 * scale,
        cx,
        cy + 118 * scale
      );
      ctx.bezierCurveTo(
        cx + 48 * scale,
        cy - 12 * scale,
        cx + 42 * scale,
        cy - 115 * scale,
        cx,
        cy - 190 * scale
      );
      ctx.closePath();

      ctx.fillStyle = bodyGradient;
      ctx.shadowBlur = 38;
      ctx.shadowColor = `hsla(28, 100%, 55%, ${0.35 + pulse * 0.22})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Emerald heart gem
      const heartRadius = (26 + pulse * 6) * scale;
      const heartGradient = ctx.createRadialGradient(cx, cy - 10 * scale, 0, cx, cy, heartRadius * 3);
      heartGradient.addColorStop(0, `hsla(145, 92%, 72%, 0.95)`);
      heartGradient.addColorStop(0.35, `hsla(45, 100%, 70%, 0.58)`);
      heartGradient.addColorStop(1, `hsla(145, 90%, 45%, 0)`);

      ctx.beginPath();
      ctx.arc(cx, cy - 8 * scale, heartRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = heartGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 44 * scale);
      ctx.lineTo(cx + 28 * scale, cy - 4 * scale);
      ctx.lineTo(cx, cy + 42 * scale);
      ctx.lineTo(cx - 28 * scale, cy - 4 * scale);
      ctx.closePath();
      ctx.strokeStyle = `hsla(45, 100%, 74%, ${0.55 + pulse * 0.26})`;
      ctx.lineWidth = 1.4 * scale;
      ctx.stroke();
    };

    const drawHead = (
      cx: number,
      cy: number,
      scale: number,
      pulse: number
    ) => {
      const headY = cy - 202 * scale;

      // Neck flame
      ctx.beginPath();
      ctx.moveTo(cx, cy - 82 * scale);
      ctx.bezierCurveTo(
        cx - 26 * scale,
        cy - 128 * scale,
        cx - 16 * scale,
        cy - 178 * scale,
        cx,
        headY
      );
      ctx.bezierCurveTo(
        cx + 23 * scale,
        cy - 164 * scale,
        cx + 22 * scale,
        cy - 122 * scale,
        cx,
        cy - 82 * scale
      );
      ctx.fillStyle = `hsla(27, 100%, 55%, ${0.65 + pulse * 0.15})`;
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.ellipse(cx + 5 * scale, headY, 26 * scale, 19 * scale, -0.15, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(31, 100%, 55%, 0.92)`;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `hsla(45, 100%, 62%, ${0.4 + pulse * 0.2})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crest feathers
      for (let i = 0; i < 5; i += 1) {
        const a = -Math.PI / 2 - 0.45 + i * 0.22;
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, headY - 13 * scale);
        ctx.quadraticCurveTo(
          cx + Math.cos(a) * 22 * scale,
          headY - 30 * scale + Math.sin(time * 0.05 + i) * 3 * scale,
          cx + Math.cos(a) * 46 * scale,
          headY - 36 * scale
        );
        ctx.strokeStyle = `hsla(${i % 2 ? 135 : 45}, 92%, 64%, ${0.55 + pulse * 0.2})`;
        ctx.lineWidth = 1.8 * scale;
        ctx.stroke();
      }

      // Beak
      ctx.beginPath();
      ctx.moveTo(cx + 25 * scale, headY - 2 * scale);
      ctx.lineTo(cx + 60 * scale, headY + 5 * scale);
      ctx.lineTo(cx + 25 * scale, headY + 11 * scale);
      ctx.closePath();
      ctx.fillStyle = `hsla(45, 100%, 70%, 0.9)`;
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(cx + 12 * scale, headY - 5 * scale, 3.2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(145, 100%, 78%, 0.95)`;
      ctx.fill();
    };

    const drawTail = (
      cx: number,
      cy: number,
      scale: number,
      pulse: number
    ) => {
      for (let i = 0; i < 9; i += 1) {
        const r = (i - 4) / 4;
        const spread = r * 120 * scale;
        const sway = Math.sin(time * 0.025 + i) * 12 * scale;

        ctx.beginPath();
        ctx.moveTo(cx, cy + 92 * scale);
        ctx.bezierCurveTo(
          cx + spread * 0.25,
          cy + 150 * scale,
          cx + spread + sway,
          cy + 210 * scale,
          cx + spread * 1.35 + sway,
          cy + 290 * scale
        );

        ctx.strokeStyle = `hsla(${i % 2 ? 135 : 32}, 92%, 58%, ${0.22 + pulse * 0.22})`;
        ctx.lineWidth = (2.5 + (1 - Math.abs(r)) * 3) * scale;
        ctx.shadowBlur = 18;
        ctx.shadowColor = `hsla(32, 100%, 55%, ${0.3 + pulse * 0.2})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Root/leaf triangle motif below body
      ctx.beginPath();
      ctx.moveTo(cx, cy + 118 * scale);
      ctx.lineTo(cx + 54 * scale, cy + 216 * scale);
      ctx.lineTo(cx - 54 * scale, cy + 216 * scale);
      ctx.closePath();
      ctx.strokeStyle = `hsla(45, 100%, 72%, ${0.34 + pulse * 0.2})`;
      ctx.lineWidth = 1.2 * scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy + 146 * scale);
      ctx.lineTo(cx, cy + 206 * scale);
      ctx.strokeStyle = `hsla(135, 90%, 60%, ${0.42 + pulse * 0.18})`;
      ctx.lineWidth = 1.1 * scale;
      ctx.stroke();
    };

    const spawnSpark = (cx: number, cy: number, scale: number) => {
      if (sparks.length > 110) return;

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 0.5 + Math.random() * 1.7;

      sparks.push({
        x: cx + (Math.random() - 0.5) * 120 * scale,
        y: cy + 120 * scale + Math.random() * 80 * scale,
        vx: Math.cos(angle) * speed * 0.35,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 70 + Math.random() * 100,
        radius: 0.8 + Math.random() * 2.1,
        hue: Math.random() > 0.5 ? 42 : 25,
      });
    };

    const drawParticles = (
      cx: number,
      cy: number,
      scale: number,
      pulse: number
    ) => {
      for (const seed of orbitSeeds) {
        seed.angle += prefersReducedMotion ? seed.speed * 0.15 : seed.speed;

        const x = cx + Math.cos(seed.angle) * seed.radius * scale;
        const y = cy + Math.sin(seed.angle * 0.82) * seed.radius * 0.58 * scale;

        ctx.beginPath();
        ctx.arc(x, y, seed.size * scale * (0.8 + pulse * 0.55), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${seed.hue}, 90%, 68%, ${seed.alpha})`;
        ctx.fill();
      }

      if (!prefersReducedMotion && Math.random() < 0.85) {
        spawnSpark(cx, cy, scale);
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i];
        spark.life += 1;

        spark.x += spark.vx + Math.sin(time * 0.02 + spark.life * 0.1) * 0.25;
        spark.y += spark.vy;
        spark.vy -= 0.004;

        const age = spark.life / spark.maxLife;

        if (age >= 1) {
          sparks.splice(i, 1);
          continue;
        }

        const alpha = age < 0.18 ? age / 0.18 : 1 - age;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${spark.hue}, 100%, 66%, ${alpha * 0.65})`;
        ctx.shadowBlur = 16;
        ctx.shadowColor = `hsla(${spark.hue}, 100%, 55%, ${alpha * 0.55})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const drawBackground = (cx: number, cy: number, pulse: number) => {
      const bg = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.max(width, height) * 0.75
      );

      bg.addColorStop(0, `rgba(214,178,94,${0.14 + pulse * 0.04})`);
      bg.addColorStop(0.28, 'rgba(63,175,90,0.09)');
      bg.addColorStop(0.6, 'rgba(15,46,43,0.17)');
      bg.addColorStop(1, 'rgba(5,10,8,0.96)');

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(
        cx,
        cy,
        Math.min(width, height) * 0.2,
        cx,
        cy,
        Math.max(width, height) * 0.78
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.58)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const animate = () => {
      time += prefersReducedMotion ? 0.25 : 1;

      const cx = width / 2;
      const cy = height * 0.49;

      const baseScale = Math.min(width / 1050, height / 760);
      const pulse = (Math.sin(time * 0.026) + 1) / 2;
      const breathScale = baseScale * (0.92 + pulse * 0.035);

      const mouseDistance = Math.hypot(mouseX - cx, mouseY - cy);
      const mouseInfluence = mouseActive
        ? Math.max(0, 1 - mouseDistance / Math.max(width * 0.45, 260))
        : 0;

      const flap = prefersReducedMotion
        ? Math.sin(time * 0.015) * 0.18
        : Math.sin(time * 0.075) * (0.55 + mouseInfluence * 0.22);

      ctx.clearRect(0, 0, width, height);

      drawBackground(cx, cy, pulse);
      drawParticles(cx, cy, breathScale, pulse);
      drawSacredGeometry(cx, cy, breathScale, pulse);

      ctx.save();
      ctx.translate(
        (mouseX - cx) * mouseInfluence * 0.012,
        (mouseY - cy) * mouseInfluence * 0.008
      );

      drawWing(cx, cy, -1, breathScale, flap, pulse);
      drawWing(cx, cy, 1, breathScale, flap, pulse);
      drawTail(cx, cy, breathScale, pulse);
      drawBody(cx, cy, breathScale, pulse);
      drawHead(cx, cy, breathScale, pulse);

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section
      className={[
        'relative overflow-hidden rounded-[2rem] border border-[#D6B25E]/35 bg-[#071310] shadow-2xl shadow-[#D6B25E]/10',
        className,
      ].join(' ')}
      aria-label="Animated Phoenix Principle sigil with flapping wings"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,10,8,0.32)_100%)]" />

      <div className="pointer-events-none absolute left-4 right-4 top-4 flex justify-center">
        <div className="rounded-full border border-[#D6B25E]/25 bg-black/35 px-5 py-2 text-center backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.32em] text-[#D6B25E]/90">
            The Phoenix Principle
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 right-5 mx-auto max-w-3xl rounded-2xl border border-[#D6B25E]/25 bg-black/45 p-4 text-center backdrop-blur-md">
        <p className="font-serif text-xl text-[#E8F2EB] md:text-2xl">
          Burn what is false. Protect what is true. Rise in alignment.
        </p>
      </div>
    </section>
  );
}

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
