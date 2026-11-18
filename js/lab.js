/* ==========================================================================
   LAB.JS — ส่วนเสริมที่เล่นได้จริงของ TATAR PORTFOLIO
   1. Lab dialog shell (เปิด/ปิดหน้าต่างแล็บจากการ์ดผลงาน)
   2. Cyber-Yantra Generator (สร้างยันต์จากชื่อ + ธาตุพลังงาน)
   3. Energy Playground (ฟิสิกส์จริงด้วย Matter.js)
   ========================================================================== */
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labs = {};

  /* ========================================================================
     1. Lab dialog shell
     ======================================================================== */
  function openLab(id) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.documentElement.classList.add('lab-open');
    // รอให้ dialog จัด layout เสร็จก่อน จึงค่อยวัดขนาด canvas
    requestAnimationFrame(() => labs[id]?.open());
  }

  function closeLab(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else {
      dialog.removeAttribute('open');
      dialog.dispatchEvent(new Event('close'));
    }
  }

  document.querySelectorAll('[data-lab-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => openLab(trigger.dataset.labOpen));
  });

  document.querySelectorAll('.lab-dialog').forEach((dialog) => {
    dialog.querySelectorAll('[data-lab-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeLab(dialog));
    });
    // คลิกพื้นหลังนอกหน้าต่างเพื่อปิด
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeLab(dialog);
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('lab-open');
      labs[dialog.id]?.close();
    });
  });

  /* ========================================================================
     2. Cyber-Yantra Generator
     - ชื่อ + ธาตุ ถูกแปลงเป็น seed แล้วใช้สุ่มแบบกำหนดผลได้ (deterministic)
       ชื่อเดิม + ธาตุเดิม จึงได้ยันต์เดิมทุกครั้ง
     ======================================================================== */
  const ELEMENTS = {
    solar: { label: 'SOLAR', th: 'แสงอาทิตย์', main: '#c6ff00', alt: '#ffb000' },
    wind: { label: 'WIND', th: 'สายลม', main: '#f5f4ef', alt: '#b388ff' },
    water: { label: 'WATER', th: 'สายน้ำ', main: '#3de8ff', alt: '#b388ff' },
    bio: { label: 'BIO', th: 'ชีวมวล', main: '#5df07a', alt: '#c6ff00' },
  };
  const SAMPLE_NAMES = ['พลังงาน', 'SOLAR', 'สายลม', 'GREEN SIGNAL', 'ต้นกล้า', 'FUTURE', 'แสงแรก', 'TATAR', 'ยั่งยืน', 'CIRCUIT'];
  const INK = '#070707';
  const PAPER = '#f5f4ef';

  function hashSeed(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function mulberry32(a) {
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // แยกตัวอักษรโดยให้สระบน/ล่างและวรรณยุกต์ติดไปกับพยัญชนะ
  function graphemes(text) {
    if (window.Intl && Intl.Segmenter) {
      return [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text)].map((s) => s.segment);
    }
    return text.match(/[\s\S][ัิ-ฺ็-๎̀-ͯ]*/g) || [];
  }

  function buildYantra(rawName, elementKey) {
    const name = (rawName || '').trim() || 'TATAR';
    const key = ELEMENTS[elementKey] ? elementKey : 'solar';
    const el = ELEMENTS[key];
    const seed = hashSeed(name.toLowerCase() + '|' + key);
    const rnd = mulberry32(seed);
    const pick = (list) => list[Math.floor(rnd() * list.length)];
    const letters = graphemes(name.toUpperCase()).filter((g) => g.trim());
    const N = pick([6, 8, 8, 10, 12, 12, 16]);
    const step = TAU / N;
    const sig = seed.toString(16).toUpperCase().padStart(8, '0').slice(0, 6);

    const cx = 540;
    const cy = 474;
    const R = 384;
    const rPoly = R - 82;
    const rOut = R - 98;
    const rIn = R * 0.44;
    const rCore = R * 0.21;
    const P = (r, a) => [cx + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2)];

    const ops = [];
    const op = (fn) => ops.push((ctx) => {
      ctx.save();
      fn(ctx);
      ctx.restore();
    });
    const ring = (r, color, width, alpha = 1, dash = null) => op((ctx) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();
    });
    const poly = (points, color, width, { alpha = 1, close = true, fill = null, fillAlpha = 0.14 } = {}) => op((ctx) => {
      ctx.beginPath();
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      if (close) ctx.closePath();
      if (fill) {
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
    });
    const dot = (x, y, r, color, hollow = false) => op((ctx) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      if (hollow) {
        ctx.fillStyle = INK;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
    });
    const label = (text, x, y, font, color, align = 'left', alpha = 1) => op((ctx) => {
      ctx.globalAlpha = alpha;
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(text, x, y);
    });

    // --- กรอบโปสเตอร์ ---
    const m = 38;
    const b = 46;
    [[m, m, 1, 1], [1080 - m, m, -1, 1], [m, 1080 - m, 1, -1], [1080 - m, 1080 - m, -1, -1]].forEach(([x, y, sx, sy]) => {
      poly([[x + b * sx, y], [x, y], [x, y + b * sy]], el.main, 3, { close: false });
    });
    label('CYBER-YANTRA / GENERATED SIGNAL', m + 20, m + 34, '700 17px "JetBrains Mono", monospace', PAPER, 'left', 0.85);
    label(`N=${N} / SIG-${sig}`, 1080 - m - 20, m + 34, '700 17px "JetBrains Mono", monospace', el.main, 'right');

    // --- วงนอก + ขีดองศา ---
    ring(R, el.main, 3);
    ring(R - 9, el.main, 1, 0.6);
    for (let i = 0; i < N; i++) {
      op((ctx) => {
        ctx.strokeStyle = el.main;
        ctx.lineCap = 'butt';
        for (let j = 0; j < 6; j++) {
          const a = i * step + (j * step) / 6;
          const [x1, y1] = P(R - 9, a);
          const [x2, y2] = P(R - (j === 0 ? 30 : 19), a);
          ctx.lineWidth = j === 0 ? 3 : 1.5;
          ctx.globalAlpha = j === 0 ? 1 : 0.7;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });
    }

    // --- วงอักขระ: ตัวอักษรของชื่อเรียงรอบวง ---
    const glyphCount = N * 3;
    const source = letters.length ? letters : ['T'];
    for (let i = 0; i < glyphCount; i++) {
      const slot = i % (source.length + 1);
      const char = slot === source.length ? '·' : source[slot];
      const a = (i / glyphCount) * TAU;
      op((ctx) => {
        const [x, y] = P(R - 54, a);
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.font = '600 25px "Bai Jamjuree", "Chakra Petch", sans-serif';
        ctx.fillStyle = char === '·' ? el.alt : PAPER;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, 0, 2);
      });
    }
    ring(R - 78, el.alt, 1.5, 0.9);

    // --- โครงเรขาคณิตซ้อน (เหมือนกรอบยันต์) ---
    const sides = N >= 8 ? N / 2 : N;
    for (let k = 0; k < 2; k++) {
      const points = [];
      for (let i = 0; i < sides; i++) points.push(P(rPoly, i * (TAU / sides) + k * (Math.PI / sides)));
      poly(points, el.alt, 1.6, { alpha: 0.6 });
    }
    for (let i = 0; i < sides * 2; i++) {
      const [x, y] = P(rPoly, i * (Math.PI / sides));
      dot(x, y, 4.5, el.main);
    }

    // --- ลวดลายประจำธาตุ ---
    const span = rOut - rIn;
    if (key === 'solar') {
      for (let i = 0; i < N; i++) {
        const a = i * step;
        poly([P(rIn, a - step * 0.3), P(rOut, a), P(rIn, a + step * 0.3)], el.main, 2.6, { fill: i % 2 ? el.alt : el.main });
        poly([P(rIn + 6, a + step / 2), P(rIn + span * 0.55, a + step / 2)], el.alt, 2.2, { close: false });
      }
    } else if (key === 'bio') {
      const leaf = (a, length, color, width) => op((ctx) => {
        const [sx, sy] = P(rIn, a);
        const [tx, ty] = P(rIn + length, a);
        const [ax, ay] = P(rIn + length * 0.5, a - step * 0.52);
        const [bx, by] = P(rIn + length * 0.5, a + step * 0.52);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(ax, ay, tx, ty);
        ctx.quadraticCurveTo(bx, by, sx, sy);
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        const [mx, my] = P(rIn + length - 16, a);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(mx, my);
        ctx.stroke();
      });
      for (let i = 0; i < N; i++) leaf(i * step + step / 2, span * 0.62, el.alt, 1.8);
      for (let i = 0; i < N; i++) leaf(i * step, span, el.main, 2.6);
    } else if (key === 'water') {
      for (let k = 0; k < 3; k++) {
        const base = rIn + 16 + ((span - 32) * k) / 2;
        const amp = 8 + rnd() * 9;
        const phase = k * Math.PI;
        const points = [];
        for (let j = 0; j < 360; j++) {
          const a = (j / 360) * TAU;
          points.push(P(base + amp * Math.sin(N * a + phase), a));
        }
        poly(points, k === 1 ? el.alt : el.main, k === 1 ? 2 : 2.6);
      }
      for (let i = 0; i < N; i++) {
        const [x, y] = P(rIn + span * 0.5, i * step + step / 2);
        dot(x, y, 6, el.main, i % 2 === 0);
      }
    } else {
      const dir = rnd() < 0.5 ? -1 : 1;
      const swirl = (a, from, color, width) => {
        const points = [];
        for (let j = 0; j <= 40; j++) {
          const t = from + ((1 - from) * j) / 40;
          points.push(P(rIn + span * t, a + t * step * 1.6 * dir));
        }
        poly(points, color, width, { close: false });
        return points[points.length - 1];
      };
      for (let i = 0; i < N; i++) {
        const [ex, ey] = swirl(i * step, 0, el.main, 2.8);
        swirl(i * step + step * 0.3, 0.3, el.alt, 1.6);
        dot(ex, ey, 5, el.main);
      }
    }
    ring(rOut, el.main, 1.5, 0.75);
    ring(rIn, el.main, 2.4);

    // --- ดาวหลายแฉกเชื่อมจุด ---
    const maxSkip = Math.max(2, Math.floor((N - 1) / 2));
    const skip = 2 + Math.floor(rnd() * (maxSkip - 1));
    op((ctx) => {
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = el.alt;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const [x1, y1] = P(rIn - 6, i * step);
        const [x2, y2] = P(rIn - 6, (i + skip) * step);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    });

    // --- ลายวงจรอิเล็กทรอนิกส์ ---
    const rBend = R * (0.29 + rnd() * 0.05);
    for (let i = 0; i < N; i++) {
      const a = i * step + step / 2;
      const bend = (rnd() < 0.5 ? -1 : 1) * step * (0.16 + rnd() * 0.2);
      const hollow = rnd() < 0.5;
      op((ctx) => {
        const [x0, y0] = P(rCore, a);
        const [x1, y1] = P(rBend, a);
        const [x2, y2] = P(rIn - 16, a + bend);
        ctx.strokeStyle = el.main;
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.arc(cx, cy, rBend, a - Math.PI / 2, a + bend - Math.PI / 2, bend < 0);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      const [nx, ny] = P(rIn - 16, a + bend);
      dot(nx, ny, 6, hollow ? el.main : el.alt, hollow);
    }

    // --- แกนกลาง ---
    op((ctx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, rCore, 0, TAU);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.strokeStyle = el.main;
      ctx.lineWidth = 3.2;
      ctx.stroke();
    });
    ring(rCore - 11, el.alt, 1.5, 0.9, [3, 7]);
    op((ctx) => {
      ctx.font = `700 ${Math.round(rCore * 1.02)}px "Bai Jamjuree", "Chakra Petch", sans-serif`;
      ctx.fillStyle = el.main;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(source[0], cx, cy + 5);
    });

    // --- ป้ายชื่อด้านล่าง ---
    const shown = graphemes(name.toUpperCase()).slice(0, 24).join('');
    op((ctx) => {
      let size = 62;
      ctx.font = `700 ${size}px "Bai Jamjuree", "Chakra Petch", sans-serif`;
      while (size > 26 && ctx.measureText(shown).width > 700) {
        size -= 2;
        ctx.font = `700 ${size}px "Bai Jamjuree", "Chakra Petch", sans-serif`;
      }
      ctx.fillStyle = PAPER;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(shown, m + 20, 978);
    });
    label(`ELEMENT / ${el.label}`, 1080 - m - 20, 962, '700 17px "JetBrains Mono", monospace', el.main, 'right');
    label(el.th, 1080 - m - 20, 992, '600 22px "Bai Jamjuree", sans-serif', PAPER, 'right', 0.85);
    poly([[m + 20, 1006], [1080 - m - 20, 1006]], el.main, 2, { close: false, alpha: 0.7 });
    label('TATAR / GREEN SIGNAL / CODE × NATURE', m + 20, 1034, '700 15px "JetBrains Mono", monospace', PAPER, 'left', 0.65);
    label('2569', 1080 - m - 20, 1034, '700 15px "JetBrains Mono", monospace', PAPER, 'right', 0.65);

    return { ops, el, key, N, sig, name };
  }

  function paintYantraBackground(ctx, el) {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, 1080, 1080);
    const glow = ctx.createRadialGradient(540, 474, 30, 540, 474, 520);
    glow.addColorStop(0, el.main + '26');
    glow.addColorStop(1, el.main + '00');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.strokeStyle = 'rgba(245, 244, 239, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let p = 54; p < 1080; p += 54) {
      ctx.moveTo(p, 0);
      ctx.lineTo(p, 1080);
      ctx.moveTo(0, p);
      ctx.lineTo(1080, p);
    }
    ctx.stroke();
  }

  (() => {
    const dialog = document.getElementById('yantra-lab');
    if (!dialog) return;
    const canvas = dialog.querySelector('[data-yantra-canvas]');
    const form = dialog.querySelector('[data-yantra-form]');
    const input = dialog.querySelector('[data-yantra-name]');
    const out = {
      sig: dialog.querySelector('[data-yantra-sig]'),
      sym: dialog.querySelector('[data-yantra-sym]'),
      layers: dialog.querySelector('[data-yantra-layers]'),
      element: dialog.querySelector('[data-yantra-element]'),
    };
    const ctx = canvas.getContext('2d');
    let current = null;
    let drawn = 0;
    let frame = 0;
    let timer = 0;
    let fontsReady = false;

    const selectedElement = () => form.querySelector('input[name="yantra-element"]:checked')?.value || 'solar';

    function finish() {
      cancelAnimationFrame(frame);
      if (!current) return;
      while (drawn < current.ops.length) current.ops[drawn++](ctx);
    }

    function generate(animate = true) {
      cancelAnimationFrame(frame);
      current = buildYantra(input.value, selectedElement());
      drawn = 0;
      paintYantraBackground(ctx, current.el);
      out.sig.textContent = 'SIG-' + current.sig;
      out.sym.textContent = current.N + ' แฉก';
      out.layers.textContent = current.ops.length + ' เส้น';
      out.element.textContent = current.el.label;

      if (!animate || reduceMotion) {
        finish();
        return;
      }
      const start = performance.now();
      const duration = 1400;
      const total = current.ops.length;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const target = Math.ceil((1 - Math.pow(1 - t, 2)) * total);
        while (drawn < target) current.ops[drawn++](ctx);
        if (drawn < total) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      generate();
    });
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(generate, 220);
    });
    form.querySelectorAll('input[name="yantra-element"]').forEach((radio) => {
      radio.addEventListener('change', () => generate());
    });
    dialog.querySelector('[data-yantra-random]').addEventListener('click', () => {
      const keys = Object.keys(ELEMENTS);
      let next = input.value;
      while (next === input.value) next = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
      input.value = next;
      const key = keys[Math.floor(Math.random() * keys.length)];
      form.querySelector(`input[name="yantra-element"][value="${key}"]`).checked = true;
      generate();
    });
    dialog.querySelector('[data-yantra-download]').addEventListener('click', () => {
      if (!current) generate(false);
      finish();
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cyber-yantra-${current.key}-${current.sig}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 2000);
      }, 'image/png');
    });

    labs['yantra-lab'] = {
      open() {
        generate();
        if (fontsReady || !document.fonts?.load) return;
        // โหลดฟอนต์ให้พร้อมก่อน แล้ววาดซ้ำเพื่อให้ตัวอักษรบน canvas ถูกต้อง
        Promise.all([
          document.fonts.load('700 60px "Bai Jamjuree"', 'กA'),
          document.fonts.load('600 25px "Bai Jamjuree"', 'กA'),
          document.fonts.load('700 17px "JetBrains Mono"', 'A'),
        ]).then(() => {
          fontsReady = true;
          if (dialog.open) generate(false);
        }).catch(() => {});
      },
      close() {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      },
    };
  })();

  /* ========================================================================
     3. Energy Playground (Matter.js)
     - ลูกพลังงานแสงอาทิตย์ตกลงมาตามแรงโน้มถ่วง ลาก/โยนได้
     - ตกบนแผงโซลาร์ = ชาร์จ, ชนกังหันให้หมุน = ชาร์จ
     ======================================================================== */
  (() => {
    const dialog = document.getElementById('energy-lab');
    if (!dialog) return;
    const canvas = dialog.querySelector('[data-energy-canvas]');
    const ctx = canvas.getContext('2d');
    const ui = {
      fill: dialog.querySelector('[data-energy-fill]'),
      pct: dialog.querySelector('[data-energy-pct]'),
      solar: dialog.querySelector('[data-energy-solar]'),
      wind: dialog.querySelector('[data-energy-wind]'),
      win: dialog.querySelector('[data-energy-win]'),
      gust: dialog.querySelector('[data-energy-gust]'),
    };
    const MAX_BALLS = 42;
    const STEP = 1000 / 60;

    let M = null;
    let engine = null;
    let mouse = null;
    let mouseConstraint = null;
    let turbine = null;
    let panel = null;
    let balls = [];
    let absorbQueue = [];
    let sparks = [];
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let lastTime = 0;
    let acc = 0;
    let spawnClock = 0;
    let gustClock = 0;
    let solar = 0;
    let wind = 0;
    let won = false;
    let running = false;
    let resizeTimer = 0;
    let lastHud = '';

    function loadMatter() {
      if (window.Matter) return Promise.resolve(window.Matter);
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'js/matter.min.js';
        script.onload = () => (window.Matter ? resolve(window.Matter) : reject(new Error('Matter missing')));
        script.onerror = () => reject(new Error('Matter failed to load'));
        document.head.appendChild(script);
      });
    }

    function setup(resetScore) {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(280, rect.width);
      H = Math.max(240, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      if (engine) {
        M.Events.off(engine);
        M.Composite.clear(engine.world, false);
        M.Engine.clear(engine);
      }
      engine = M.Engine.create();
      balls = [];
      absorbQueue = [];
      sparks = [];
      if (resetScore) {
        solar = 0;
        wind = 0;
        won = false;
        ui.win.hidden = true;
      }

      const wall = { isStatic: true, label: 'wall', friction: 0.3 };
      const T = 100;
      const floorY = H - 14;
      const world = engine.world;
      M.Composite.add(world, [
        M.Bodies.rectangle(W / 2, floorY + T / 2, W + T * 2, T, wall),
        M.Bodies.rectangle(W / 2, -T / 2, W + T * 2, T, wall),
        M.Bodies.rectangle(-T / 2, H / 2, T, H * 2, wall),
        M.Bodies.rectangle(W + T / 2, H / 2, T, H * 2, wall),
      ]);

      // แผงโซลาร์: เซนเซอร์ที่ดูดลูกพลังงานเมื่อสัมผัส
      const panelW = W * 0.34;
      panel = M.Bodies.rectangle(W * 0.77, floorY - 9, panelW, 18, { isStatic: true, isSensor: true, label: 'panel' });
      panel.plugin.width = panelW;

      // กังหัน: ใบพัดรูปกากบาทยึดแกนกลางไว้ หมุนได้อิสระ
      const hub = { x: W * 0.47, y: H * 0.5 };
      const blade = Math.min(W * 0.2, H * 0.3);
      turbine = M.Body.create({
        parts: [
          M.Bodies.rectangle(hub.x, hub.y, blade * 2, 13),
          M.Bodies.rectangle(hub.x, hub.y, 13, blade * 2),
        ],
        frictionAir: 0.012,
        label: 'turbine',
      });
      turbine.plugin.hub = hub;
      turbine.plugin.blade = blade;
      const pin = M.Constraint.create({ pointA: hub, bodyB: turbine, pointB: { x: 0, y: 0 }, length: 0, stiffness: 1 });
      M.Composite.add(world, [panel, turbine, pin]);

      if (!mouse) mouse = M.Mouse.create(canvas);
      mouse.pixelRatio = dpr;
      mouseConstraint = M.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      M.Composite.add(world, mouseConstraint);

      // แตะที่ว่าง = ปล่อยแสงเพิ่ม
      M.Events.on(mouseConstraint, 'mousedown', () => {
        if (!mouseConstraint.body && !won) burst(mouse.position.x, mouse.position.y, 4);
      });
      M.Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach(({ bodyA, bodyB }) => {
          if (bodyA.label === 'panel' && bodyB.label === 'ball') absorbQueue.push(bodyB);
          else if (bodyB.label === 'panel' && bodyA.label === 'ball') absorbQueue.push(bodyA);
        });
      });

      for (let i = 0; i < 6; i++) spawnBall(W * 0.1 + Math.random() * W * 0.2, 60 + Math.random() * 80);
      updateHud();
    }

    function spawnBall(x, y, vx = 0, vy = 0) {
      if (balls.length >= MAX_BALLS) {
        const oldest = balls.shift();
        M.Composite.remove(engine.world, oldest);
      }
      const r = 9 + Math.random() * 6;
      const ball = M.Bodies.circle(
        Math.min(W - r - 2, Math.max(r + 2, x)),
        Math.min(H - 40, Math.max(r + 2, y)),
        r,
        { restitution: 0.62, friction: 0.03, frictionAir: 0.004, density: 0.0014, label: 'ball' }
      );
      M.Body.setVelocity(ball, { x: vx, y: vy });
      balls.push(ball);
      M.Composite.add(engine.world, ball);
    }

    function burst(x, y, count) {
      for (let i = 0; i < count; i++) {
        spawnBall(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 6, -Math.random() * 3);
      }
      addSparks(x, y, 8, '#c6ff00');
    }

    function addSparks(x, y, count, color) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * TAU;
        const speed = 1 + Math.random() * 4;
        sparks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 1.5, life: 1, color });
      }
      if (sparks.length > 260) sparks.splice(0, sparks.length - 260);
    }

    function gust() {
      if (!engine || gustClock > 0) return;
      gustClock = 1100;
      balls.forEach((ball) => {
        M.Body.applyForce(ball, ball.position, {
          x: (0.022 + Math.random() * 0.012) * ball.mass,
          y: -(0.014 + Math.random() * 0.012) * ball.mass,
        });
      });
      M.Body.setAngularVelocity(turbine, turbine.angularVelocity + 0.16);
    }

    function updateHud() {
      const total = Math.min(100, solar + wind);
      const text = `${Math.floor(total)}|${Math.floor(solar)}|${Math.floor(wind)}`;
      if (text === lastHud) return;
      lastHud = text;
      ui.fill.style.width = total + '%';
      ui.pct.textContent = Math.floor(total) + '%';
      ui.solar.textContent = Math.floor(solar) + '%';
      ui.wind.textContent = Math.floor(wind) + '%';
    }

    function win() {
      won = true;
      ui.win.hidden = false;
      for (let i = 0; i < 12; i++) {
        addSparks(Math.random() * W, Math.random() * H * 0.7, 14, i % 2 ? '#c6ff00' : '#fc43d3');
      }
    }

    function simulate() {
      M.Engine.update(engine, STEP);

      if (absorbQueue.length) {
        absorbQueue.forEach((ball) => {
          const index = balls.indexOf(ball);
          if (index === -1) return;
          balls.splice(index, 1);
          M.Composite.remove(engine.world, ball);
          addSparks(ball.position.x, ball.position.y, 10, '#c6ff00');
          if (!won) solar += 3;
        });
        absorbQueue = [];
      }

      const spin = Math.abs(turbine.angularVelocity);
      if (!won && spin > 0.01) wind += Math.min(spin, 0.35) * 0.3;
      if (!won && spin > 0.12 && Math.random() < 0.25) {
        const a = turbine.angle + Math.floor(Math.random() * 4) * (Math.PI / 2);
        const { hub, blade } = turbine.plugin;
        addSparks(hub.x + Math.cos(a) * blade, hub.y + Math.sin(a) * blade, 1, '#b388ff');
      }

      spawnClock += STEP;
      if (!won && spawnClock > 850) {
        spawnClock = 0;
        spawnBall(W * 0.12 + Math.random() * W * 0.14, 78, 1 + Math.random() * 3.5, 0);
      }
      if (gustClock > 0) gustClock -= STEP;

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.12;
        s.life -= 0.028;
        if (s.life <= 0) sparks.splice(i, 1);
      }

      if (!won && solar + wind >= 100) win();
    }

    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, W, H);

      // ตารางพื้นหลัง
      ctx.strokeStyle = 'rgba(198, 255, 0, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W; x += 36) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = 0; y < H; y += 36) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();

      const floorY = H - 14;
      ctx.fillStyle = '#12160c';
      ctx.fillRect(0, floorY, W, 14);
      ctx.fillStyle = '#c6ff00';
      ctx.fillRect(0, floorY, W, 2);

      // ดวงอาทิตย์ (ตัวปล่อยพลังงาน)
      const sunX = W * 0.17;
      const sunY = 58;
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(now / 2600);
      ctx.strokeStyle = '#ffb000';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        ctx.rotate(TAU / 12);
        ctx.beginPath();
        ctx.moveTo(34, 0);
        ctx.lineTo(i % 2 ? 46 : 54, 0);
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#c6ff00';
      ctx.shadowColor = '#c6ff00';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(245, 244, 239, 0.7)';
      ctx.textAlign = 'left';
      ctx.fillText('SOURCE / SUN', sunX + 66, sunY + 4);

      // แผงโซลาร์
      const pw = panel.plugin.width;
      const px = panel.position.x - pw / 2;
      const py = panel.position.y - 9;
      ctx.fillStyle = '#0d2a4a';
      ctx.fillRect(px, py, pw, 18);
      ctx.strokeStyle = '#3de8ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, pw, 18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = px + 22; x < px + pw; x += 22) {
        ctx.moveTo(x, py);
        ctx.lineTo(x, py + 18);
      }
      ctx.moveTo(px, py + 9);
      ctx.lineTo(px + pw, py + 9);
      ctx.stroke();
      ctx.fillStyle = '#3de8ff';
      ctx.textAlign = 'center';
      ctx.fillText('SOLAR PANEL / DROP HERE', panel.position.x, py - 10);

      // กังหันลม
      const { hub } = turbine.plugin;
      const spin = Math.abs(turbine.angularVelocity);
      ctx.strokeStyle = 'rgba(245, 244, 239, 0.4)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(hub.x, floorY);
      ctx.stroke();
      ctx.fillStyle = spin > 0.05 ? '#c6ff00' : '#8e2cff';
      ctx.shadowColor = '#c6ff00';
      ctx.shadowBlur = Math.min(30, spin * 160);
      for (let i = 1; i < turbine.parts.length; i++) {
        const v = turbine.parts[i].vertices;
        ctx.beginPath();
        ctx.moveTo(v[0].x, v[0].y);
        for (let j = 1; j < v.length; j++) ctx.lineTo(v[j].x, v[j].y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = INK;
      ctx.strokeStyle = '#f5f4ef';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 11, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(245, 244, 239, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('WIND TURBINE / SPIN ME', hub.x, hub.y - turbine.plugin.blade - 14);

      // เส้นลมตอนกดปล่อยลม
      if (gustClock > 0) {
        const t = 1 - gustClock / 1100;
        ctx.strokeStyle = `rgba(245, 244, 239, ${0.5 * (1 - t)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 9; i++) {
          const y = H * 0.12 + ((H * 0.75) / 9) * i + Math.sin(i * 2.1) * 12;
          const x = -120 + t * (W + 240) - (i % 3) * 70;
          ctx.moveTo(x, y);
          ctx.lineTo(x + 110, y - 14);
        }
        ctx.stroke();
      }

      // ลูกพลังงาน
      ctx.shadowColor = '#c6ff00';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#c6ff00';
      ctx.beginPath();
      balls.forEach((ball) => {
        ctx.moveTo(ball.position.x + ball.circleRadius, ball.position.y);
        ctx.arc(ball.position.x, ball.position.y, ball.circleRadius, 0, TAU);
      });
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = INK;
      ctx.beginPath();
      balls.forEach((ball) => {
        const r = ball.circleRadius * 0.32;
        ctx.moveTo(ball.position.x + r, ball.position.y);
        ctx.arc(ball.position.x, ball.position.y, r, 0, TAU);
      });
      ctx.fill();

      // เส้นลากเมื่อจับวัตถุ
      if (mouseConstraint.body) {
        ctx.strokeStyle = '#fc43d3';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(mouseConstraint.body.position.x, mouseConstraint.body.position.y);
        ctx.lineTo(mouse.position.x, mouse.position.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      sparks.forEach((s) => {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (!running) return;
      const dt = Math.min(100, now - (lastTime || now));
      lastTime = now;
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 4) {
        simulate();
        acc -= STEP;
        steps++;
      }
      if (steps === 4) acc = 0;
      draw(now);
      updateHud();
      ui.gust.disabled = gustClock > 0;
      raf = requestAnimationFrame(loop);
    }

    function start(resetScore) {
      setup(resetScore);
      if (running) return;
      running = true;
      lastTime = 0;
      acc = 0;
      raf = requestAnimationFrame(loop);
    }

    dialog.querySelector('[data-energy-burst]').addEventListener('click', () => {
      if (engine && !won) burst(W * 0.17 + Math.random() * W * 0.25, 90, 8);
    });
    ui.gust.addEventListener('click', gust);
    dialog.querySelectorAll('[data-energy-reset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (M) start(true);
      });
    });
    addEventListener('resize', () => {
      if (!dialog.open || !M) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => start(false), 200);
    });

    labs['energy-lab'] = {
      open() {
        loadMatter()
          .then((Matter) => {
            M = Matter;
            if (dialog.open) start(!engine || won);
          })
          .catch(() => {
            ui.pct.textContent = 'ERR';
            ctx.fillStyle = PAPER;
            ctx.font = '14px monospace';
            ctx.fillText('โหลด js/matter.min.js ไม่สำเร็จ', 20, 40);
          });
      },
      close() {
        running = false;
        cancelAnimationFrame(raf);
      },
    };
  })();

  /* ========================================================================
     Deep link: เปิดแล็บได้ตรงจาก URL เช่น index.html?lab=yantra หรือ ?lab=energy
     ======================================================================== */
  const requested = new URLSearchParams(location.search).get('lab');
  if (requested && document.getElementById(requested + '-lab')) {
    setTimeout(() => openLab(requested + '-lab'), reduceMotion ? 0 : 1500);
  }
})();
