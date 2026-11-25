(() => {
  'use strict';

  const get = id => document.getElementById(id);
  const tau = 2 * Math.PI;
  const rad = degrees => degrees * Math.PI / 180;
  const deg = radians => radians * 180 / Math.PI;
  const vec = angle => [Math.cos(angle), Math.sin(angle)];
  const add = (p, v, t = 1) => [p[0] + t * v[0], p[1] + t * v[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const length = p => Math.hypot(...p);
  const unit = p => add([0, 0], p, 1 / length(p));
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const round = value => Number(value.toFixed(1));
  const colour = { ink: '#17294c', blue: '#2656ba', teal: '#08796f', purple: '#783bb5', amber: '#a84810' };
  const palette = [colour.blue, colour.teal, colour.purple];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const read = id => get(id).valueAsNumber;
  const say = (id, message) => {
    const status = get(id + '-status');
    if (status.textContent !== message) status.textContent = message;
  };
  const on = (id, event, callback) => get(id).addEventListener(event, callback);
  const click = (id, callback) => on(id, 'click', callback);
  const field = (id, value) => {
    get(id).value = value;
    const output = get(id).labels?.[0]?.querySelector('output');
    if (output) output.value = get(id).value;
  };
  const degreeAngles = points => points.map((p, i) => {
    const first = sub(points[(i + 1) % 3], p);
    const second = sub(points[(i + 2) % 3], p);
    return deg(Math.atan2(Math.abs(cross(first, second)), dot(first, second)));
  });
  const fromAngles = (a, b, base = 1) => [[0, 0], [base, 0], add([0, 0], vec(-rad(a)), base * Math.sin(rad(b)) / Math.sin(rad(a + b)))];
  const fromLengths = (base, a, b) => {
    const projection = (base ** 2 + a ** 2 - b ** 2) / (2 * base);
    return [[0, 0], [base, 0], [projection, -Math.sqrt(Math.max(0, a ** 2 - projection ** 2))]];
  };
  const fit = (points, extras = []) => {
    const bounds = points.concat(extras);
    const xs = bounds.map(p => p[0]);
    const ys = bounds.map(p => p[1]);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const scale = Math.min(410 / Math.max(.01, xmax - xmin), 220 / Math.max(.01, ymax - ymin));
    const transform = p => [300 + (p[0] - (xmin + xmax) / 2) * scale, 181 + (p[1] - (ymin + ymax) / 2) * scale];
    return { points: points.map(transform), scale, transform };
  };

  function pen(ctx) {
    const line = (a, b, color = colour.ink, width = 3, dash = []) => {
      ctx.save();
      ctx.setLineDash(dash);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(...a);
      ctx.lineTo(...b);
      ctx.stroke();
      ctx.restore();
    };
    const text = (p, value, color = colour.ink, size = 23) => {
      ctx.font = '700 ' + size + 'px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#f8fafc';
      ctx.strokeText(value, ...p);
      ctx.fillStyle = color;
      ctx.fillText(value, ...p);
    };
    const arc = (p, radius, from, to, color = colour.teal) => {
      ctx.beginPath();
      ctx.arc(...p, radius, from, to);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
    };
    const mark = (p, color = colour.ink, radius = 5) => {
      ctx.beginPath();
      ctx.arc(...p, radius, 0, tau);
      ctx.fillStyle = color;
      ctx.fill();
    };
    const angle = (p, a, b, label, color, radius = 29) => {
      if (length(sub(p, a)) < .001 || length(sub(p, b)) < .001) return;
      const start = Math.atan2(a[1] - p[1], a[0] - p[0]);
      const end = Math.atan2(b[1] - p[1], b[0] - p[0]);
      const delta = (end - start + 3 * Math.PI) % tau - Math.PI;
      if (Math.abs(Math.abs(delta) - Math.PI / 2) < .00001) {
        const u = unit(sub(a, p)), v = unit(sub(b, p));
        const size = radius * .59;
        const corner = add(add(p, u, size), v, size);
        line(add(p, u, size), corner, color, 2);
        line(corner, add(p, v, size), color, 2);
      } else {
        arc(p, radius, start + Math.min(0, delta), start + Math.max(0, delta), color);
      }
      if (label) text(add(p, vec(start + delta / 2), radius + 24), label, color, 20);
    };
    const triangle = (pts, display = [], ticks = []) => {
      ctx.beginPath();
      ctx.moveTo(...pts[0]);
      pts.slice(1).forEach(p => ctx.lineTo(...p));
      ctx.closePath();
      ctx.fillStyle = '#e8f0ff';
      ctx.fill();
      const centre = pts.reduce((sum, pt) => add(sum, pt, 1 / 3), [0, 0]);
      pts.forEach((p, i) => {
        const q = pts[(i + 1) % 3];
        const r = pts[(i + 2) % 3];
        const side = sub(q, p);
        line(p, q);
        if (ticks[i]) {
          const m = add(p, side, .5);
          const u = unit(side);
          const perpendicular = [-u[1], u[0]];
          line(add(m, perpendicular, -8), add(m, perpendicular, 8), colour.teal, 3);
        }
        mark(p, palette[i]);
        text(add(p, unit(sub(p, centre)), 20), 'ABC'[i], palette[i]);
        if (display[i] !== undefined) {
          angle(p, q, r, display[i], palette[i], Math.min(26, length(side) / 5, length(sub(r, p)) / 5));
        }
      });
    };
    return { line, text, arc, mark, angle, triangle };
  }

  const dialog = document.querySelector('.triangle-dialog');
  const dialogContent = dialog.querySelector('.triangle-dialog-content');
  let enlarged = null;
  const enlarge = (element, redraw = null) => {
    enlarged = redraw;
    dialogContent.replaceChildren(element);
    dialog.showModal();
    if (redraw) redraw();
  };
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    enlarged = null;
    dialogContent.replaceChildren();
  });
  document.querySelector('.triangle-notes').addEventListener('click', event => {
    const answer = event.target.closest('[data-open-answer]');
    if (answer) document.querySelector(answer.hash).open = true;
    const link = event.target.closest('a[href$=".png"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
    event.preventDefault();
    const full = new Image();
    full.src = link.href;
    full.alt = link.querySelector('img')?.alt || 'Enlarged geometry diagram';
    enlarge(full);
  });
  document.querySelectorAll('.triangle-check').forEach(check => {
    check.addEventListener('click', event => {
      const choice = event.target.closest('button');
      if (!choice) return;
      check.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === choice)));
      const correction = check.querySelector('template').content.textContent;
      check.querySelector('[role=status]').textContent = (choice.dataset.correct === 'true' ? 'Correct. ' : 'Review this. ') + correction;
    });
  });
  const cover = document.querySelector('.triangle-cover');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => cover.classList.toggle('is-visible', entry.isIntersecting)).observe(cover);
  }

  function surface(id, render) {
    const canvas = get(id + '-canvas');
    const detail = get('tool-' + id);
    const live = canvas.closest('.triangle-live');
    live.hidden = false;
    let zoomCanvas = null;
    const show = target => {
      const width = target.clientWidth;
      if (!width) return;
      const ratio = window.devicePixelRatio || 1;
      const w = Math.round(width * ratio);
      const h = Math.round(width * 370 / 600 * ratio);
      if (target.width !== w || target.height !== h) {
        target.width = w;
        target.height = h;
      }
      const ctx = target.getContext('2d');
      ctx.setTransform(w / 600, 0, 0, h / 370, 0, 0);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 600, 370);
      render(pen(ctx));
    };
    const redraw = () => {
      if (detail.open) show(canvas);
      if (dialog.open && enlarged === redraw && zoomCanvas) show(zoomCanvas);
    };
    if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(canvas);
    window.addEventListener('resize', redraw, { passive: true });
    detail.addEventListener('toggle', redraw);
    click(id + '-zoom', () => {
      zoomCanvas = document.createElement('canvas');
      zoomCanvas.setAttribute('role', 'img');
      zoomCanvas.setAttribute('aria-label', canvas.getAttribute('aria-label'));
      zoomCanvas.setAttribute('aria-describedby', id + '-status');
      zoomCanvas.style.aspectRatio = '600 / 370';
      enlarge(zoomCanvas, redraw);
    });
    return { canvas, redraw, detail };
  }
  function slider(id, redraw) {
    on(id, 'input', () => {
      field(id, read(id));
      redraw();
    });
  }
  function position(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return [(event.clientX - rect.left) * 600 / rect.width, (event.clientY - rect.top) * 370 / rect.height];
  }

  const lineIds = [0, 1, 2];
  const lines = surface('lines', draw => {
    const values = lineIds.map(i => {
      const direction = vec(-rad(read('line-angle-' + i)));
      const normal = [-direction[1], direction[0]];
      const point = add([300, 185], normal, read('line-shift-' + i));
      draw.line(add(point, direction, -900), add(point, direction, 900), palette[i], 3);
      return { point, direction };
    });
    const pairs = [[0, 1], [1, 2], [2, 0]];
    const stops = [];
    let parallel = false, coincident = false;
    for (const [i, j] of pairs) {
      const { point, direction } = values[i];
      const second = values[j];
      const separation = sub(second.point, point);
      const denominator = cross(direction, second.direction);
      if (Math.abs(denominator) < 1e-10) {
        parallel = true;
        coincident ||= Math.abs(cross(separation, direction)) < 1e-8;
      } else {
        stops.push(add(point, direction, cross(separation, second.direction) / denominator));
      }
    }
    const onScreen = p => p[0] >= 0 && p[0] <= 600 && p[1] >= 0 && p[1] <= 370;
    stops.filter(onScreen).forEach(p => draw.mark(p, colour.amber, 6));
    if (parallel) {
      say('lines', coincident ? 'Two lines lie on top of one another. There are fewer than three distinct lines.' : 'A parallel pair never meets. This arrangement leaves the triangle open.');
    } else if (length(sub(stops[0], stops[1])) < 1e-7) {
      say('lines', 'Concurrent lines. All three pairs meet at the same point.');
    } else {
      const angles = degreeAngles(stops).map(value => value < .05 ? value.toFixed(3) : round(value));
      if (stops.every(onScreen)) draw.triangle(stops, angles.map(a => a + '°'));
      const extra = stops.every(onScreen) ? '' : ' At least one intersection lies off the diagram. This can happen with nearly parallel lines.';
      say('lines', 'Triangle formed. The interior angles are ' + angles.join('°, ') + '°.' + extra);
    }
  });
  lineIds.forEach(i => ['line-angle-', 'line-shift-'].forEach(prefix => slider(prefix + i, lines.redraw)));
  const preset = (name, angles, shifts) => click('preset-' + name, () => {
    lineIds.forEach(i => {
      field('line-angle-' + i, angles[i]);
      field('line-shift-' + i, shifts[i]);
    });
    lines.redraw();
  });
  preset('triangle', [0, 55, 122], [52, -56, 38]);
  preset('concurrent', [0, 55, 122], [0, 0, 0]);
  preset('parallel', [0, 0, 72], [-45, 55, 0]);

  let vertices = [[288, 82], [123, 273], [479, 273]];
  const sum = surface('sum', draw => {
    const angles = degreeAngles(vertices);
    draw.triangle(vertices, angles.map(a => round(a) + '°'));
    say('sum', 'A = ' + round(angles[0]) + '°, B = ' + round(angles[1]) + '°, C = ' + round(angles[2]) + '°. Sum = ' + Math.round(angles.reduce((a, b) => a + b)) + '°. Displayed angles are rounded.');
  });
  const move = (i, p) => {
    const next = vertices.map((q, j) => j === i
      ? [Math.max(35, Math.min(565, Math.round(p[0]))), Math.max(38, Math.min(332, Math.round(p[1])))]
      : q);
    const edges = next.map((q, j) => length(sub(q, next[(j + 1) % 3])));
    const height = Math.abs(cross(sub(next[1], next[0]), sub(next[2], next[0]))) / Math.max(...edges);
    if (Math.min(...edges) > 65 && height > 50) vertices = next;
    field('sum-x-' + i, vertices[i][0]);
    field('sum-y-' + i, vertices[i][1]);
    sum.redraw();
    if (vertices !== next) say('sum', 'Move stopped to preserve distinct vertices and a readable, non-flat triangle.');
  };
  lineIds.forEach(i => ['x', 'y'].forEach(axis => on('sum-' + axis + '-' + i, 'input', () => move(i, [read('sum-x-' + i), read('sum-y-' + i)]))));
  let dragged = null;
  sum.canvas.addEventListener('pointerdown', event => {
    const p = position(event, sum.canvas);
    const i = vertices.findIndex(q => length(sub(q, p)) < 43);
    if (i < 0) return;
    dragged = i;
    sum.canvas.setPointerCapture(event.pointerId);
  });
  sum.canvas.addEventListener('pointermove', event => {
    if (dragged !== null) move(dragged, position(event, sum.canvas));
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    sum.canvas.addEventListener(event, () => { dragged = null; });
  }

  function exteriorDiagram(draw, a, b, hide) {
    const c = 180 - a - b;
    const [rawB, rawC, rawA] = fromAngles(b, c);
    const { transform, points: [pa, pb, pc] } = fit([rawA, rawB, rawC], [[1.36, 0]]);
    const d = transform([1.36, 0]);
    const labels = [a, b, c].map((v, i) => hide === i ? '?' : v + '°');
    draw.triangle([pa, pb, pc], labels);
    draw.line(pc, d, colour.amber, 3, [7, 6]);
    draw.mark(d, colour.amber);
    draw.text(add(d, [0, 24]), 'D', colour.amber);
    draw.angle(pc, pa, d, hide === 3 ? '?' : a + b + '°', colour.amber, 45);
  }
  const exterior = surface('outer', draw => {
    const a = read('outer-a'), b = read('outer-b');
    exteriorDiagram(draw, a, b);
    say('outer', 'Remote angles ' + a + '° + ' + b + '° = exterior angle ' + (a + b) + '°. Adjacent interior angle = ' + (180 - a - b) + '°.');
  });
  const constrain = (current, other) => {
    field(current, Math.min(read(current), 164 - read(other)));
    exterior.redraw();
  };
  on('outer-a', 'input', () => constrain('outer-a', 'outer-b'));
  on('outer-b', 'input', () => constrain('outer-b', 'outer-a'));

  let progress = 1;
  let frame = 0;
  const sticks = surface('sticks', draw => {
    const [a, b, base] = lineIds.map(i => read('stick-' + i)).sort((x, y) => x - y);
    const canClose = a + b > base;
    const [ra, rb, rc] = canClose ? fromLengths(base, a, b) : [[0, 0], [base, 0], [a, 0]];
    const { points: [p, q, r], scale } = fit([ra, rb, rc], [[0, -b * .6], [base, -b * .6]]);
    const fromLeft = canClose ? Math.atan2(r[1] - p[1], r[0] - p[0]) : 0;
    const fromRight = canClose ? Math.atan2(r[1] - q[1], r[0] - q[0]) : -Math.PI;
    const left = add(p, vec(-1.15 + progress * (fromLeft + 1.15)), a * scale);
    const right = add(q, vec(-1.98 + progress * (fromRight + 1.98)), b * scale);
    draw.line(p, q, colour.ink, 5);
    draw.line(p, left, colour.blue, 5);
    draw.line(q, right, colour.teal, 5);
    draw.mark(left, colour.blue);
    draw.mark(right, colour.teal);
    draw.text(add(p, sub(q, p), .5).map((x, i) => i ? x + 29 : x), base + ' cm');
    draw.text([147, 34], a + ' cm', colour.blue);
    draw.text([453, 34], b + ' cm', colour.teal);
    const comparison = canClose ? ' > ' : a + b === base ? ' = ' : ' < ';
    say('sticks', a + ' + ' + b + comparison + base + '. ' + (canClose ? 'The shortest two together exceed the longest. A triangle can form.' : a + b === base ? 'The endpoints touch on the base. The result is flat.' : 'The endpoints leave a gap. No triangle can form.'));
  });
  const stopSticks = () => {
    cancelAnimationFrame(frame);
    progress = 1;
  };
  lineIds.forEach(i => slider('stick-' + i, () => { stopSticks(); sticks.redraw(); }));
  sticks.detail.addEventListener('toggle', () => { if (!sticks.detail.open) stopSticks(); });
  click('stick-replay', () => {
    stopSticks();
    if (reducedMotion.matches) { sticks.redraw(); return; }
    const began = performance.now();
    const animate = now => {
      progress = Math.min(1, (now - began) / 730);
      sticks.redraw();
      if (progress < 1 && sticks.detail.open) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  });

  const typeQuestions = [[60, 60, 60], [45, 90, 45], [35, 110, 35], [34, 57, 89], [43, 47, 90], [18, 104, 58], [70, 55, 55]];
  let typeIndex = 0;
  const classify = angles => [
    new Set(angles).size === 1 ? 'equilateral' : new Set(angles).size === 2 ? 'isosceles' : 'scalene',
    Math.max(...angles) > 90 ? 'obtuse' : Math.max(...angles) === 90 ? 'right' : 'acute'
  ];
  const types = surface('types', draw => {
    const angles = typeQuestions[typeIndex];
    const ticks = [angles[0] === angles[1] || angles[0] === angles[2], angles[1] === angles[0] || angles[1] === angles[2], angles[2] === angles[0] || angles[2] === angles[1]];
    const edgeTicks = [ticks[2], ticks[0], ticks[1]];
    const display = get('type-level').value === 'basic' ? angles.map(a => a + '°') : ['', '', ''];
    draw.triangle(fit(fromAngles(...angles)).points, display, edgeTicks);
  });
  const briefType = () => {
    types.redraw();
    const angles = typeQuestions[typeIndex];
    const equal = new Set(angles).size;
    const sideClue = equal === 1 ? 'All three sides have matching marks.' : equal === 2 ? 'Two sides have matching marks.' : 'The three measured sides have different lengths.';
    say('types', get('type-level').value === 'basic' ? 'Angles: ' + angles.join('°, ') + '°. ' + sideClue : sideClue + ' The largest angle is ' + (Math.max(...angles) > 90 ? 'greater than' : Math.max(...angles) < 90 ? 'less than' : 'exactly') + ' a right angle.');
  };
  types.detail.addEventListener('toggle', () => { if (types.detail.open) briefType(); });
  on('type-level', 'change', briefType);
  click('type-next', () => { typeIndex = (typeIndex + 1) % typeQuestions.length; briefType(); });
  click('type-check', () => {
    const angles = typeQuestions[typeIndex];
    const [side, angle] = classify(angles);
    const correct = get('type-sides').value === side && get('type-angles').value === angle;
    say('types', (correct ? 'Correct. ' : 'Review your choices. ') + 'The triangle is ' + side + ' and ' + angle + '. Angle measures are ' + angles.join('°, ') + '°. Equal angles face equal sides. The greatest angle determines the angle type.');
  });

  const labSteps = {
    sss: ['Draw base with ruler', 'Use compass at A', 'Use compass at B', 'Join C to A and B'],
    sas: ['Draw base with ruler', 'Use protractor at A', 'Mark AC with ruler', 'Join BC'],
    asa: ['Draw base with ruler', 'Use protractor at A', 'Use protractor at B', 'Mark C'],
    altitude: ['Draw and extend base', 'Place set square on ruler', 'Slide set square to A', 'Draw perpendicular AD']
  };
  let labStep = 0;
  let measured = null;
  let labVertices = [];
  let labAngles = [];
  const lab = surface('lab', draw => {
    const mode = get('lab-mode').value;
    const [base, ac, bc, a, b] = ['base', 'ac', 'bc', 'a', 'b'].map(key => read('lab-' + key));
    const triangular = mode === 'sss' && base < ac + bc && ac < base + bc && bc < base + ac;
    const error = mode === 'sss' && !triangular ? 'The lengths fail the strict triangle inequality.'
      : mode === 'asa' && a + b >= 180 ? 'The two positive base angles must total less than 180°.' : '';
    const valid = Array.from(document.querySelectorAll('#tool-lab input')).filter(i => !i.closest('label').hidden).every(i => i.checkValidity() && Number.isFinite(i.valueAsNumber));
    get('lab-step').disabled = labStep === 4 || !!error || !valid;
    get('lab-back').disabled = labStep === 0;
    get('lab-measure').disabled = labStep < 4;
    get('lab-step').textContent = labSteps[mode][labStep] || 'Construction finished';
    if (error || !valid) {
      labVertices = [];
      say('lab', valid ? error : 'Enter a positive length or an angle between 1° and 179° within each field’s range.');
      draw.text([300, 185], 'Check the given measurements.', colour.amber, 24);
      return;
    }
    let raw, extra = [];
    if (mode === 'altitude') {
      const [p, q, r] = fromAngles(115, 30);
      raw = [r, p, q];
      extra = [[r[0], 0]];
    } else if (mode === 'sss') {
      raw = fromLengths(base, ac, bc);
    } else if (mode === 'sas') {
      raw = [[0, 0], [base, 0], add([0, 0], vec(-rad(a)), ac)];
    } else {
      raw = fromAngles(a, b, base);
    }
    const { points: [p, q, r], transform } = fit(raw, extra);
    labVertices = [p, q, r];
    labAngles = degreeAngles(raw);
    if (labStep === 0) {
      draw.text([300, 183], 'Begin with the baseline.', colour.blue, 23);
    } else if (mode === 'altitude') {
      const foot = transform(extra[0]);
      draw.triangle(labVertices, [], []);
      draw.line(foot, q, colour.teal, 3, [6, 5]);
      if (labStep === 2 || labStep === 3) {
        const start = labStep === 2 ? add(q, sub(foot, q), .45) : foot;
        draw.line(add(start, [-45, 7]), add(start, [85, 7]), colour.blue, 7);
        const h = add(start, [0, -67]);
        const end = add(start, [67, 0]);
        draw.line(start, h, colour.teal, 5);
        draw.line(h, end, colour.teal, 5);
        draw.line(start, end, colour.teal, 5);
      }
      if (labStep === 4) {
        draw.line(p, foot, colour.teal, 4);
        draw.mark(foot, colour.teal);
        draw.angle(foot, p, r, '90°', colour.teal);
        draw.text(add(foot, [0, 28]), 'D', colour.teal);
      }
    } else {
      draw.line(p, q);
      draw.mark(p);
      draw.mark(q);
      draw.text(add(p, [0, 24]), 'A');
      draw.text(add(q, [0, 24]), 'B');
      draw.text(add(add(p, sub(q, p), .5), [0, 35]), base + ' cm', colour.blue, 20);
      if (mode === 'sss') {
        const entries = [[p, ac, colour.blue], [q, bc, colour.teal]];
        entries.slice(0, Math.max(0, labStep - 1)).forEach(([centre, radius, tint]) => {
          const direction = sub(r, centre);
          const heading = Math.atan2(direction[1], direction[0]);
          draw.arc(centre, length(direction), heading - .29, heading + .29, tint);
          draw.text(add(add(centre, direction, .55), [centre === p ? -42 : 42, -12]), radius + ' cm', tint, 19);
        });
      } else {
        if (labStep >= 2) {
          draw.line(p, add(p, sub(r, p), 1.13), colour.blue, 3, [6, 4]);
          draw.angle(p, q, r, a + '°', colour.blue);
          if (labStep === 2) protractor(draw, p, 58);
        }
        if (labStep >= 3 && mode === 'asa') {
          draw.line(q, add(q, sub(r, q), 1.13), colour.teal, 3, [6, 4]);
          draw.angle(q, p, r, b + '°', colour.teal);
          if (labStep === 3) protractor(draw, q, 58);
        }
        if (labStep >= 3 && mode === 'sas') {
          draw.mark(r, colour.purple);
          draw.text(add(r, [0, -20]), 'C', colour.purple);
          draw.text(add(add(p, sub(r, p), .56), [-46, 0]), ac + ' cm', colour.blue, 20);
        }
      }
      if (labStep === 4) {
        draw.line(p, r);
        draw.line(r, q);
        draw.mark(r, colour.purple);
        draw.text(add(r, [0, -22]), 'C', colour.purple);
      }
    }
    if (measured !== null && labStep === 4) {
      const i = measured;
      draw.angle(labVertices[i], labVertices[(i + 1) % 3], labVertices[(i + 2) % 3], round(labAngles[i]) + '°', colour.purple, 34);
      say('lab', 'Measured angle ' + 'ABC'[i] + ' is ' + round(labAngles[i]) + '°.');
    } else {
      say('lab', labStep === 4 ? 'Construction complete. Measure an angle or undo a step.' : 'Step ' + (labStep + 1) + ' of 4. ' + labSteps[mode][labStep] + '.');
    }
  });
  function protractor(draw, p, r) {
    draw.arc(p, r, Math.PI, tau, '#7188a5');
    for (let i = 0; i <= 18; i++) {
      const v = vec(Math.PI + i * Math.PI / 18);
      draw.line(add(p, v, r - 5), add(p, v, r), '#7188a5', 1);
    }
  }
  const resetLab = () => {
    const mode = get('lab-mode').value;
    const needed = {
      sss: ['base', 'ac', 'bc'], sas: ['base', 'ac', 'a'], asa: ['base', 'a', 'b'], altitude: []
    }[mode];
    for (const name of ['base', 'ac', 'bc', 'a', 'b']) {
      const label = get('lab-' + name).closest('label');
      label.hidden = !needed.includes(name);
    }
    labStep = 0;
    measured = null;
    lab.redraw();
  };
  resetLab();
  lab.canvas.tabIndex = 0;
  on('lab-mode', 'change', resetLab);
  for (const id of ['base', 'ac', 'bc', 'a', 'b']) on('lab-' + id, 'input', resetLab);
  click('lab-step', () => { labStep += 1; lab.redraw(); });
  click('lab-back', () => { labStep -= 1; measured = null; lab.redraw(); });
  click('lab-reset', resetLab);
  click('lab-measure', () => {
    measured = measured === null ? 0 : (measured + 1) % 3;
    lab.redraw();
  });
  lab.canvas.addEventListener('click', event => {
    if (labStep < 4) return;
    const p = position(event, lab.canvas);
    const index = labVertices.findIndex(q => length(sub(q, p)) < 41);
    if (index >= 0) { measured = index; lab.redraw(); }
  });
  lab.canvas.addEventListener('keydown', event => {
    if (labStep < 4 || !/^[123]$/.test(event.key)) return;
    measured = Number(event.key) - 1;
    lab.redraw();
  });

  const random = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  let missing = { a: 48, b: 67, method: 'sum' };
  const unknown = surface('missing', draw => {
    const { a, b, method } = missing;
    const c = 180 - a - b;
    if (method === 'sum') draw.triangle(fit(fromAngles(a, b)).points, [a + '°', b + '°', '?']);
    if (method === 'exterior') exteriorDiagram(draw, a, b, 3);
    if (method === 'linear') {
      const { points: [p, q, r], transform } = fit(fromAngles(a, b), [[1.38, 0]]);
      draw.triangle([p, q, r], ['', '?', '']);
      const d = transform([1.38, 0]);
      draw.line(q, d, colour.amber, 3, [7, 6]);
      draw.angle(q, r, d, (180 - b) + '°', colour.amber, 45);
      draw.mark(d, colour.amber);
      draw.text(add(d, [0, 22]), 'D', colour.amber);
    }
    if (method === 'equal') draw.triangle(fit(fromAngles(a, b)).points, ['?', b + '°', c + '°'], [false, true, true]);
  });
  function unknownClue() {
    const { a, b, method } = missing;
    const c = 180 - a - b;
    const clues = {
      sum: 'A = ' + a + '°, B = ' + b + '°. Find the angle at C.',
      exterior: 'A = ' + a + '°, B = ' + b + '°. Find exterior angle ACD.',
      linear: 'AB extends through B to D. Exterior angle CBD = ' + (180 - b) + '°. Find the interior angle at B.',
      equal: 'AC = BC. B = ' + b + '°, C = ' + c + '°. Find the angle at A.'
    };
    say('missing', clues[method]);
  }
  unknown.detail.addEventListener('toggle', () => { if (unknown.detail.open) unknownClue(); });
  click('missing-next', () => {
    const methods = ['sum', 'exterior', 'linear', 'equal'].filter(m => m !== missing.method);
    const method = methods[random(0, methods.length - 1)];
    const a = random(33, 64);
    missing = { a, b: method === 'equal' ? a : random(39, 72), method };
    field('missing-value', '');
    unknown.redraw();
    unknownClue();
  });
  click('missing-check', () => {
    const { a, b, method } = missing;
    const answers = { sum: 180 - a - b, exterior: a + b, equal: b, linear: b };
    const reasons = {
      sum: 'Angle sum: 180° − ' + a + '° − ' + b + '° = ' + answers.sum + '°.',
      exterior: 'Exterior equals the remote angles added: ' + a + '° + ' + b + '° = ' + answers.exterior + '°.',
      equal: 'AC = BC, so the opposite angles B and A both measure ' + b + '°.',
      linear: 'The interior and exterior angles form a linear pair. 180° − ' + (180 - b) + '° = ' + b + '°.'
    };
    const correct = read('missing-value') === answers[method];
    const rightMethod = get('missing-reason').value === method;
    say('missing', (correct && rightMethod ? 'Correct. ' : correct ? 'Your angle is correct. Check the property. ' : 'Review your answer. ') + reasons[method]);
  });

  const mistakeQuestions = [
    ['adjacent', 'A student finds the exterior angle at C by adding B = 62° and the interior C = 74°.', 'Add the remote angles A and B: 44° + 62° = 106°. C is the adjacent angle.'],
    ['total', 'A student calculates C = 360° − 55° − 65°.', 'The interior angles sum to 180°. C = 180° − 55° − 65° = 60°.'],
    ['strict', 'A student says 3 cm, 5 cm and 8 cm form a triangle because 3 + 5 equals 8.', 'The shortest two must add to more than the longest. Equality gives a straight arrangement.'],
    ['base', 'At B a student reads 110° for the intended 70° angle while using the zero that points away from A.', 'Measure from BA using its zero line. The two scales run in opposite directions.']
  ];
  let mistake = 0;
  const errors = surface('error', draw => {
    if (mistake === 0) exteriorDiagram(draw, 44, 62, 3);
    if (mistake === 1) draw.triangle(fit(fromAngles(55, 65)).points, ['55°', '65°', '?']);
    if (mistake === 2) {
      draw.line([100, 210], [500, 210], colour.ink, 5);
      draw.line([100, 193], [250, 193], colour.blue, 5);
      draw.line([250, 193], [500, 193], colour.teal, 5);
      draw.text([175, 154], '3 cm', colour.blue);
      draw.text([375, 154], '5 cm', colour.teal);
      draw.text([300, 239], '8 cm');
    }
    if (mistake === 3) {
      const { points: [p, q, r] } = fit(fromAngles(45, 70));
      draw.line(p, q);
      draw.line(q, r, colour.teal, 4);
      draw.text(add(p, [0, 24]), 'A');
      draw.text(add(q, [0, 24]), 'B');
      protractor(draw, q, 61);
      draw.angle(q, p, r, '70°', colour.teal);
    }
  });
  get('error-question').textContent = mistakeQuestions[0][1];
  click('error-next', () => {
    mistake = (mistake + 1) % mistakeQuestions.length;
    get('error-question').textContent = mistakeQuestions[mistake][1];
    say('error', '');
    errors.redraw();
  });
  click('error-check', () => {
    const [answer, , explanation] = mistakeQuestions[mistake];
    say('error', (get('error-choice').value === answer ? 'Correct. ' : 'Review the reasoning. ') + explanation);
  });
})();
