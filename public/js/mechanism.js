document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('my-links');
  if (!toggle || !drawer) return;

  const coinImg = document.querySelector('.menu-coin');
  const IMG_BASE = coinImg
    ? coinImg.src.replace(/[^/]+$/, '') + 'mechanism/'
    : '/img/mechanism/';
  const GEAR_SRC = IMG_BASE + 'gear.webp';
  const TEETH_SRC = IMG_BASE + 'dents.webp';
  const RACK_SRC = IMG_BASE + 'cremalheira.webp';
  const MACHINE_SRC = IMG_BASE + 'machine.webp';

  const MASTER_X = 77;
  const CONFIG = {
    PINION_COLOR: '#5d4c40',
    RACK_COLOR: '#55463a',
    N_TEETH: 10,
    HOLE_FACTOR: 0.6,
    TOOTH_H_FACTOR: 0.45,
    RACK_BASE_FACTOR: 0.35,
    SPEED_RACK: 4,
    SPEED_SLIDE: 5,
    STEP_RACK: 10,
    STEP_SLIDE: 15,
    SCALE_FIT: 2160,
    TEETH_GRID: [4, 3],
    DISC_R: 1.0,
    TOOTH_TUCK: 0.25,
    TOOTH_SQUASH: 0.9,
    RACK_TOOTH_MATCH: 1.05,
    RACK_Y_NUDGE: 0,
    MACHINE_DRUM_R: 0.57,
    MACHINE_CX_F: 0.6533,
    MACHINE_CY_F: 0.5610,
    MACHINE_DRUM_R_F: 0.2303,
    MACHINE_X_NUDGE: 0,
    MACHINE_Y_NUDGE: 0,
    CANVAS_ABOVE: 140,
    MECH_SHADOW: 0.54,
    MECH_SHADOW_BLUR: 12,
    GEAR_TINT: 0.22,
    GEAR_TINT_COLOR: '40, 47, 42'
  };

  const pitch = (2 * Math.PI * MASTER_X) / CONFIG.N_TEETH;
  const toothH = pitch * CONFIG.TOOTH_H_FACTOR;
  const baseH = MASTER_X * CONFIG.RACK_BASE_FACTOR;

  const scale0 = Math.min(1, window.innerWidth / CONFIG.SCALE_FIT);
  const OPEN_WIDTH = drawer.offsetWidth || 350;
  const targetEnd = OPEN_WIDTH / scale0;
  const rackTeeth = Math.max(6, Math.ceil((targetEnd - MASTER_X + 3 * pitch) / pitch));
  const rackLen = rackTeeth * pitch;
  const maxS = Math.min(rackLen - (3 * pitch), Math.max(0, targetEnd - MASTER_X));

  const canvas = document.createElement('canvas');
  canvas.id = 'mechanism-canvas';
  canvas.style.cssText = 'position:fixed;left:0;bottom:0;z-index:3050;pointer-events:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = '@keyframes mech-shake{0%{transform:translateX(0)}25%{transform:translateX(3px)}50%{transform:translateX(-2px)}100%{transform:translateX(0)}}.mech-shake{animation:mech-shake .15s ease-out}';
  document.head.appendChild(shakeStyle);

  const state = {
    currentS: 0,
    globalX: -500,
    targetGoal: toggle.checked ? 'EXPANDED' : 'HIDDEN',
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    hideOffset: -500
  };
  if (toggle.checked) {
    state.globalX = 0;
    state.currentS = maxS;
  }

  let sprite = null;
  let rackArt = null;
  let machineArt = null;
  let running = false;
  let forceDraw = true;
  let lastDrawnS = null;
  let lastDrawnX = null;

  const isLight = () => !document.body.classList.contains('dark-mode');

  function kick() {
    forceDraw = true;
    if (!running && isLight()) {
      running = true;
      requestAnimationFrame(animate);
    }
  }

  function triggerImpact() {
    canvas.classList.remove('mech-shake');
    void canvas.offsetWidth;
    canvas.classList.add('mech-shake');
    setTimeout(() => canvas.classList.remove('mech-shake'), 160);
  }

  function drawGear(c, x, y, radius, tH, rotation, color) {
    const innerR = radius - tH / 2;
    const outerR = radius + tH / 2;
    const angleStep = (Math.PI * 2) / CONFIG.N_TEETH;

    c.save();
    c.translate(x, y);
    c.rotate(rotation - (0.25 * angleStep));

    c.beginPath();
    c.fillStyle = color;
    for (let i = 0; i < CONFIG.N_TEETH; i++) {
      const a = i * angleStep;
      c.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
      c.lineTo(Math.cos(a + angleStep * 0.1) * outerR, Math.sin(a + angleStep * 0.1) * outerR);
      c.lineTo(Math.cos(a + angleStep * 0.4) * outerR, Math.sin(a + angleStep * 0.4) * outerR);
      c.lineTo(Math.cos(a + angleStep * 0.5) * innerR, Math.sin(a + angleStep * 0.5) * innerR);
      c.lineTo(Math.cos(a + angleStep) * innerR, Math.sin(a + angleStep) * innerR);
    }
    c.fill();

    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(0, 0, radius * CONFIG.HOLE_FACTOR, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function drawRack(c, y, startX, length, p, tH, bH, color) {
    c.save();
    c.fillStyle = color;
    const offset = 0.25 * p;
    let fX = null, lastX = null;

    for (let x = -p; x <= length + p; x += p) {
      const pX = startX + x + offset;
      if (pX + p < startX || pX > startX + length - p * 0.1) continue;
      if (fX === null) fX = pX;
      lastX = pX + p;
    }

    if (fX !== null && lastX !== null) c.fillRect(fX, y + tH / 2, lastX - fX, bH);

    c.beginPath();
    for (let x = -p; x <= length + p; x += p) {
      const pX = startX + x + offset;
      if (pX + p < startX || pX > startX + length - p * 0.1) continue;
      c.moveTo(pX + p * 0.5, y + tH / 2);
      c.lineTo(pX + p * 0.6, y - tH / 2);
      c.lineTo(pX + p * 0.9, y - tH / 2);
      c.lineTo(pX + p * 1.0, y + tH / 2);
    }
    c.fill();
    c.restore();
  }

  function makeProbe(img) {
    const probe = document.createElement('canvas');
    probe.width = img.naturalWidth;
    probe.height = img.naturalHeight;
    const pg = probe.getContext('2d');
    pg.drawImage(img, 0, 0);
    let px = null;
    try {
      const d = pg.getImageData(0, 0, probe.width, probe.height);
      px = d.data;
      let hasAlpha = false;
      for (let i = 3; i < px.length; i += 997 * 4) {
        if (px[i] < 250) { hasAlpha = true; break; }
      }
      if (!hasAlpha) {
        for (let i = 0; i < px.length; i += 4) {
          if (px[i] > 238 && px[i + 1] > 238 && px[i + 2] > 238) px[i + 3] = 0;
        }
        pg.putImageData(d, 0, 0);
      }
    } catch (e) {}
    return { probe, px };
  }

  function alphaBBox(px, w, h, x0, y0, x1, y1) {
    let minX = x1, minY = y1, maxX = x0, maxY = y0;
    for (let y = y0; y < y1; y += 2) {
      for (let x = x0; x < x1; x += 2) {
        if (px[(y * w + x) * 4 + 3] > 40) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return maxX > minX ? { x: minX, y: minY, w: maxX - minX, h: maxY - minY } : null;
  }

  function cellAsym(px, w, bb) {
    let l = 0, r = 0, ln = 0, rn = 0;
    const mid = bb.x + bb.w / 2;
    for (let y = bb.y; y < bb.y + bb.h; y += 2) {
      for (let x = bb.x; x < bb.x + bb.w; x += 2) {
        const o = (y * w + x) * 4;
        if (px[o + 3] < 60) continue;
        const lum = 0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2];
        if (x < mid) { l += lum; ln++; } else { r += lum; rn++; }
      }
    }
    if (!ln || !rn) return 0;
    const L = l / ln, R = r / rn;
    return (R - L) / (R + L + 1e-6);
  }

  function lightDir(px, w, h, cx, cy) {
    let vx = 0, vy = 0, tot = 0;
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const o = (y * w + x) * 4;
        if (px[o + 3] < 60) continue;
        const lum = 0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2];
        vx += (x - cx) * lum;
        vy += (y - cy) * lum;
        tot += lum;
      }
    }
    const n = Math.hypot(vx, vy);
    if (!n || !tot) return { x: -0.707, y: -0.707 };
    return { x: vx / n, y: vy / n };
  }

  function measureRack(probe, px) {
    const w = probe.width, h = probe.height;
    if (!px) return null;
    const bb = alphaBBox(px, w, h, 0, 0, w, h);
    if (!bb) return null;
    let baseTop = bb.y + bb.h;
    for (let y = bb.y; y < bb.y + bb.h; y++) {
      let n = 0;
      for (let x = bb.x; x < bb.x + bb.w; x += 2) {
        if (px[(y * w + x) * 4 + 3] > 40) n++;
      }
      if (n * 2 >= bb.w * 0.85) { baseTop = y; break; }
    }
    const rowY = Math.max(bb.y, Math.round(bb.y + (baseTop - bb.y) * 0.5));
    const runs = [];
    let run = null;
    for (let x = bb.x; x <= bb.x + bb.w; x++) {
      const on = x < bb.x + bb.w && px[(rowY * w + x) * 4 + 3] > 40;
      if (on && !run) run = { s: x };
      else if (!on && run) { run.e = x; runs.push(run); run = null; }
    }
    const centers = runs.filter(r => (r.e - r.s) > 4).map(r => (r.s + r.e) / 2);
    if (centers.length < 2) return null;
    let pit = 0;
    for (let i = 1; i < centers.length; i++) pit += centers[i] - centers[i - 1];
    pit /= centers.length - 1;
    return {
      probe,
      bb,
      pitch: pit,
      lastCenterFromRight: (bb.x + bb.w) - centers[centers.length - 1],
      toothMid: (baseTop - bb.y) / 2,
      toothH: baseTop - bb.y
    };
  }

  function buildSprite(gearImg, teethImg) {
    const gear = makeProbe(gearImg);
    const teeth = makeProbe(teethImg);

    let cxI = gear.probe.width / 2;
    let cyI = gear.probe.height / 2;
    let rI = Math.min(gear.probe.width, gear.probe.height) * 0.465;
    if (gear.px) {
      const bb = alphaBBox(gear.px, gear.probe.width, gear.probe.height, 0, 0, gear.probe.width, gear.probe.height);
      if (bb) {
        cxI = bb.x + bb.w / 2;
        cyI = bb.y + bb.h / 2;
        rI = (bb.w + bb.h) / 4;
      }
    }

    const cells = [];
    const [cols, rows] = CONFIG.TEETH_GRID;
    const cw = teeth.probe.width / cols;
    const ch = teeth.probe.height / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (teeth.px) {
          const bb = alphaBBox(teeth.px, teeth.probe.width, teeth.probe.height,
            Math.floor(c * cw), Math.floor(r * ch),
            Math.floor((c + 1) * cw), Math.floor((r + 1) * ch));
          if (bb) cells.push(bb);
        } else {
          cells.push({ x: c * cw, y: r * ch, w: cw, h: ch });
        }
      }
    }

    const outerR = MASTER_X + toothH / 2;
    const innerR = MASTER_X - toothH / 2;
    const SS = 2;
    const size = Math.ceil(outerR * 2 + 8);
    const spr = document.createElement('canvas');
    spr.width = size * SS;
    spr.height = size * SS;
    const g = spr.getContext('2d');
    g.scale(SS, SS);
    g.translate(size / 2, size / 2);

    const discR = innerR * CONFIG.DISC_R;
    const k = discR / rI;
    g.save();
    g.scale(k, k);
    g.drawImage(gear.probe, -cxI, -cyI);
    g.restore();

    const stepA = (Math.PI * 2) / CONFIG.N_TEETH;
    const tuck = toothH * CONFIG.TOOTH_TUCK;
    const dh = (outerR - innerR) + tuck;

    const ld = gear.px
      ? lightDir(gear.px, gear.probe.width, gear.probe.height, cxI, cyI)
      : { x: -0.707, y: -0.707 };
    const asyms = cells.map((bb, idx) => ({
      idx,
      a: teeth.px ? cellAsym(teeth.px, teeth.probe.width, bb) : 0
    }));
    asyms.sort((p, q) => p.a - q.a);
    const desired = [];
    for (let i = 0; i < CONFIG.N_TEETH; i++) {
      const midA = i * stepA + stepA * 0.25;
      desired.push({ i, d: -Math.sin(midA) * ld.x + Math.cos(midA) * ld.y });
    }
    desired.sort((p, q) => p.d - q.d);
    const assign = new Array(CONFIG.N_TEETH);
    for (let k2 = 0; k2 < desired.length; k2++) {
      const pick = asyms[Math.round((k2 * (asyms.length - 1)) / Math.max(1, desired.length - 1))];
      assign[desired[k2].i] = cells[pick.idx];
    }

    for (let i = 0; i < CONFIG.N_TEETH; i++) {
      const cell = assign[i] || cells[i % cells.length];
      const midA = i * stepA + stepA * 0.25;
      const dw = dh * (cell.w / cell.h) * CONFIG.TOOTH_SQUASH;
      g.save();
      g.rotate(midA + Math.PI / 2);
      g.drawImage(teeth.probe, cell.x, cell.y, cell.w, cell.h, -dw / 2, -outerR, dw, dh);
      g.restore();
    }

    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(' + CONFIG.GEAR_TINT_COLOR + ', ' + CONFIG.GEAR_TINT + ')';
    g.fillRect(-size / 2, -size / 2, size, size);
    g.globalCompositeOperation = 'source-over';

    sprite = { canvas: spr, size };
  }

  function loadImg(src, onOk) {
    const img = new Image();
    img.onload = () => onOk(img);
    img.src = src;
  }

  loadImg(GEAR_SRC, gearImg => {
    loadImg(TEETH_SRC, teethImg => {
      buildSprite(gearImg, teethImg);
      kick();
    });
  });

  loadImg(RACK_SRC, rackImg => {
    const p = makeProbe(rackImg);
    rackArt = measureRack(p.probe, p.px);
    kick();
  });

  loadImg(MACHINE_SRC, machineImg => {
    machineArt = makeProbe(machineImg);
    kick();
  });

  function animate() {
    if (!isLight()) {
      running = false;
      return;
    }
    const s = state;
    s.width = window.innerWidth;
    s.height = window.innerHeight;
    s.scale = Math.min(1, s.width / CONFIG.SCALE_FIT);
    const gearXBase = (MASTER_X * 1.2) * s.scale;
    const pinionVisibleWidth = (MASTER_X + toothH / 2) * s.scale;
    s.hideOffset = -(gearXBase + pinionVisibleWidth + 50);

    if (s.targetGoal === 'EXPANDED') {
      if (s.globalX < 0) {
        s.globalX += CONFIG.SPEED_SLIDE;
        if (s.globalX >= 0) { s.globalX = 0; triggerImpact(); }
      } else if (s.currentS < maxS) {
        s.currentS += CONFIG.SPEED_RACK;
        if (s.currentS >= maxS) { s.currentS = maxS; triggerImpact(); }
      }
    } else {
      if (s.currentS > 0) {
        s.currentS -= CONFIG.SPEED_RACK;
        if (s.currentS <= 0) { s.currentS = 0; triggerImpact(); }
      } else if (s.globalX > s.hideOffset) {
        s.globalX -= CONFIG.SPEED_SLIDE;
        if (s.globalX <= s.hideOffset) { s.globalX = s.hideOffset; }
      }
    }

    const steppedS = Math.round(s.currentS / CONFIG.STEP_RACK) * CONFIG.STEP_RACK;
    const steppedX = Math.round(s.globalX / CONFIG.STEP_SLIDE) * CONFIG.STEP_SLIDE;

    const cw = Math.ceil((targetEnd + 2 * pitch) * s.scale) + 8;
    const chh = Math.ceil((CONFIG.CANVAS_ABOVE + MASTER_X + 60) * s.scale);
    const needsDraw = forceDraw || steppedS !== lastDrawnS || steppedX !== lastDrawnX ||
      canvas.width !== cw || canvas.height !== chh;

    if (needsDraw) {
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== chh) canvas.height = chh;
      ctx.clearRect(0, 0, cw, chh);
      const padding = 60 * s.scale;
      const gearY = chh - (MASTER_X * s.scale) - padding;

      ctx.save();
      ctx.translate(steppedX, gearY);
      ctx.scale(s.scale, s.scale);
      ctx.shadowColor = 'rgba(0, 0, 0, ' + CONFIG.MECH_SHADOW + ')';
      ctx.shadowBlur = CONFIG.MECH_SHADOW_BLUR;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 5;

      const rotation = -steppedS / MASTER_X;
      const rackXInternal = (MASTER_X - rackLen) + steppedS;
      const rackEndInternal = rackXInternal + rackLen;

      if (machineArt) {
        const mw = machineArt.probe.width;
        const mh = machineArt.probe.height;
        const mk = (MASTER_X * CONFIG.MACHINE_DRUM_R) / (mw * CONFIG.MACHINE_DRUM_R_F);
        ctx.drawImage(machineArt.probe,
          MASTER_X - (mw * CONFIG.MACHINE_CX_F) * mk + CONFIG.MACHINE_X_NUDGE,
          -(mh * CONFIG.MACHINE_CY_F) * mk + CONFIG.MACHINE_Y_NUDGE,
          mw * mk,
          mh * mk);
      }

      if (rackArt) {
        const sf = pitch / rackArt.pitch;
        const sfY = sf * Math.min(1.3, Math.max(0.7,
          (toothH * CONFIG.RACK_TOOTH_MATCH) / (rackArt.toothH * sf)));
        const W = rackArt.bb.w * sf;
        const H = rackArt.bb.h * sfY;
        const lastC = rackArt.lastCenterFromRight * sf;
        const phi = ((((rackLen - lastC) % pitch) + pitch) % pitch);
        const E = rackEndInternal + ((pitch - phi) % pitch);
        const yTop = MASTER_X - rackArt.toothMid * sfY + CONFIG.RACK_Y_NUDGE;
        ctx.drawImage(rackArt.probe, rackArt.bb.x, rackArt.bb.y, rackArt.bb.w, rackArt.bb.h,
          E - W, yTop, W, H);
      } else {
        drawRack(ctx, MASTER_X, rackXInternal, rackLen, pitch, toothH, baseH, CONFIG.RACK_COLOR);
      }

      if (sprite) {
        const angleStep = (Math.PI * 2) / CONFIG.N_TEETH;
        ctx.save();
        ctx.translate(MASTER_X, 0);
        ctx.rotate(rotation - (0.25 * angleStep));
        ctx.drawImage(sprite.canvas, -sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size);
        ctx.restore();
      } else {
        drawGear(ctx, MASTER_X, 0, MASTER_X, toothH, rotation, CONFIG.PINION_COLOR);
      }
      ctx.restore();

      const screenRackEnd = (rackEndInternal * s.scale) + steppedX;
      drawer.style.transform = 'translateX(' + Math.min(0, screenRackEnd - OPEN_WIDTH) + 'px)';

      lastDrawnS = steppedS;
      lastDrawnX = steppedX;
      forceDraw = false;
    }

    const settled = s.targetGoal === 'EXPANDED'
      ? (s.globalX >= 0 && s.currentS >= maxS)
      : (s.currentS <= 0 && s.globalX <= s.hideOffset);
    if (settled) {
      running = false;
      return;
    }
    requestAnimationFrame(animate);
  }

  function applyTheme() {
    if (isLight()) {
      canvas.style.display = '';
      drawer.style.transition = 'none';
      kick();
    } else {
      canvas.style.display = 'none';
      drawer.style.transition = '';
      drawer.style.transform = '';
    }
  }

  new MutationObserver(applyTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  toggle.addEventListener('change', () => {
    state.targetGoal = toggle.checked ? 'EXPANDED' : 'HIDDEN';
    kick();
  });

  window.addEventListener('resize', kick);

  applyTheme();
});
