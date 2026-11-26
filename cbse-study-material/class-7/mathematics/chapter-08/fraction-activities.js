(() => {
  'use strict';
  const F = window.FractionMath;
  if (!F) return;
  const get = id => document.getElementById(id);
  const select = id => get(id).value;
  const num = id => get(id).valueAsNumber;
  const update = (id, handler, event = 'input') => get(id).addEventListener(event, handler);
  const click = (id, handler) => update(id, handler, 'click');
  const status = id => get(id + '-status');
  const say = (id, text) => {
    if (status(id).textContent !== text) status(id).textContent = text;
  };
  const fraction = (n, d) => ({ n, d });
  const read = id => fraction(num(id + '-n'), num(id + '-d'));
  const valid = id => [...get('tool-' + id).querySelectorAll('input[type=number]')].every(input => input.checkValidity());
  const ink = '#182d4c', blue = '#2359ae', teal = '#07736d', purple = '#7441ae';
  const lineFill = '#d6e3f3', wash = '#f8fafc';
  const canvasWidth = 600, canvasHeight = 370;
  const tau = 2 * Math.PI;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('.fraction-dialog');
  const content = dialog.querySelector('.fraction-dialog-content');
  let zoomDraw = null;
  function openDialog(element, redraw = null) {
    zoomDraw = redraw;
    content.replaceChildren(element);
    dialog.showModal();
    if (redraw) redraw();
  }
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { zoomDraw = null; content.replaceChildren(); });
  document.querySelector('.fraction-notes').addEventListener('click', event => {
    const answer = event.target.closest('[data-open-answer]');
    if (answer) document.querySelector(answer.hash).open = true;
    const image = event.target.closest('a[href$=".png"]');
    if (!image || !dialog.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const full = new Image();
    full.src = image.href;
    full.alt = image.querySelector('img').alt;
    openDialog(full);
  });
  document.querySelectorAll('.fraction-check').forEach(group => {
    group.addEventListener('click', event => {
      const choice = event.target.closest('button');
      if (!choice) return;
      group.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
      group.querySelector('[role=status]').textContent = (choice.dataset.correct === 'true' ? 'Correct. ' : 'Review this. ') + group.querySelector('template').content.textContent;
    });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => entry.target.classList.toggle('is-visible', entry.isIntersecting))
      .observe(document.querySelector('.fraction-cover'));
  }

  const describe = v => v.d === 1 ? String(v.n) : v.n + '/' + v.d;
  function displayMarkup(text) {
    const wrapper = document.createElement('span');
    const pieces = String(text).split(/(-?\d+\/\d+)/);
    pieces.forEach((part, i) => {
      if (!(i % 2)) { wrapper.append(part); return; }
      const [n, d] = part.split('/');
      if (n.startsWith('-')) wrapper.append('−');
      const box = document.createElement('span');
      box.className = 'lesson-fraction';
      box.setAttribute('role', 'math');
      box.setAttribute('aria-label', n.replace('-', '') + ' over ' + d);
      for (const term of [n.replace('-', ''), d]) {
        const cell = document.createElement('span');
        cell.setAttribute('aria-hidden', 'true');
        cell.textContent = term;
        box.append(cell);
      }
      wrapper.append(box);
    });
    return wrapper;
  }
  function solution(id, steps, answer) {
    const ol = document.createElement('ol');
    for (const step of steps) {
      const li = document.createElement('li');
      li.append(displayMarkup(step));
      ol.append(li);
    }
    const result = document.createElement('p');
    result.className = 'fraction-answer';
    result.append('Answer. ', displayMarkup(answer));
    status(id).replaceChildren(ol, result);
  }

  function graphics(ctx) {
    const text = (value, x, y, size = 24, color = ink) => {
      ctx.font = '700 ' + size + 'px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(value, x, y, 560);
    };
    const rect = (x, y, w, h, fill = wash, stroke = ink, width = 2) => {
      if (fill && w > 0) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
      if (stroke && w > 0) { ctx.lineWidth = width; ctx.strokeStyle = stroke; ctx.strokeRect(x, y, w, h); }
    };
    const line = (x, y, xx, yy, color = ink, width = 2, dash = []) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(xx, yy);
      ctx.stroke();
      ctx.restore();
    };
    const dot = (x, y, r, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, tau);
      ctx.fill();
    };
    const slice = (x, y, r, a, b, fill, stroke = ink) => {
      ctx.beginPath();
      if (b - a < tau - 0.001) ctx.moveTo(x, y);
      ctx.arc(x, y, r, a, b);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    const stacked = (v, x, y, color = ink) => {
      if (v.d === 1) { text(v.n, x, y, 26, color); return; }
      text(v.n, x, y - 14, 24, color);
      line(x - 20, y, x + 20, y, color);
      text(v.d, x, y + 16, 24, color);
    };
    return { text, rect, line, dot, slice, stacked };
  }
  function paint(canvas, render) {
    const width = canvas.clientWidth;
    if (!width) return;
    const w = Math.round(width * (window.devicePixelRatio || 1));
    const h = Math.round(w * canvasHeight / canvasWidth);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const context = canvas.getContext('2d');
    context.setTransform(w / canvasWidth, 0, 0, h / canvasHeight, 0, 0);
    context.fillStyle = wash;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    render(graphics(context));
  }
  function surface(id, draw) {
    const detail = get('tool-' + id);
    const canvas = get(id + '-canvas');
    const render = pen => {
      if (valid(id)) draw(pen);
      else {
        pen.text('Check the number fields.', 300, 175);
        say(id, 'Use whole-number counts within the given ranges. Denominators must be at least one.');
      }
    };
    const redraw = () => { if (detail.open) paint(canvas, render); if (dialog.open && zoomDraw && id === 'line') zoomDraw(); };
    detail.addEventListener('toggle', redraw);
    if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(canvas);
    window.addEventListener('resize', redraw, { passive: true });
    canvas.closest('.fraction-live').hidden = false;
    return { canvas, detail, redraw, render };
  }
  function bind(id, view, exclusions = []) {
    view.detail.querySelectorAll('input, select').forEach(control => {
      if (!exclusions.includes(control.id)) update(control.id, view.redraw);
    });
  }
  function chartBar(pen, v, y, wholeWidth, x = 46, color = blue) {
    const numUnits = Math.max(1, Math.ceil(v.n / v.d));
    const piece = wholeWidth / v.d;
    pen.rect(x, y, numUnits * wholeWidth, 51, lineFill);
    pen.rect(x, y, v.n * piece, 51, color, null);
    if (piece >= 7) {
      for (let j = 1; j < numUnits * v.d; j++) pen.line(x + j * piece, y, x + j * piece, y + 51, ink, j % v.d ? 1 : 3);
    } else {
      for (let j = 1; j < numUnits; j++) pen.line(x + j * wholeWidth, y, x + j * wholeWidth, y + 51, ink, 3);
    }
  }
  const shownAs = f => F.renderMixed(F.simplify(f));
  function drawBars(pen, values, captions) {
    const unitWidth = 506 / Math.max(...values.map(v => Math.max(1, Math.ceil(v.n / v.d))));
    const step = values.length > 2 ? 99 : 130;
    values.forEach((v, i) => {
      const y = 55 + i * step;
      chartBar(pen, v, y, unitWidth, 46, i % 2 ? teal : blue);
      pen.text(captions[i], 300, y + 64, 20);
    });
  }

  function showParts(pen, v, model) {
    const wholes = Math.max(1, Math.ceil(v.n / v.d));
    if (wholes > 8 || model === 'bars') {
      chartBar(pen, v, 145, 506 / wholes);
      if (wholes > 8 && model !== 'bars') pen.text('Bar view for larger quantities', 300, 230, 23);
      return;
    }
    const cols = Math.min(4, wholes), rows = Math.ceil(wholes / cols);
    const distance = 520 / cols;
    const radius = Math.min(72, distance * .41, 142 / rows);
    for (let i = 0; i < wholes; i++) {
      const x = 40 + (i % cols + .5) * distance;
      const y = 74 + (Math.floor(i / cols) + .5) * (245 / rows);
      for (let j = 0; j < v.d; j++) {
        const shade = i * v.d + j < v.n ? blue : lineFill;
        if (model === 'circles') {
          pen.slice(x, y, radius, -Math.PI / 2 + j * tau / v.d, -Math.PI / 2 + (j + 1) * tau / v.d, shade);
        } else {
          const columns = v.d % 2 ? v.d : v.d / 2;
          const rows = v.d / columns;
          const step = 2 * radius / columns;
          pen.rect(x - radius + j % columns * step, y - radius / 2 + Math.floor(j / columns) * radius / rows, step, radius / rows, shade);
        }
      }
    }
  }
  const builder = surface('builder', pen => {
    const v = read('build');
    showParts(pen, v, select('build-model'));
    pen.stacked(v, 300, 40);
    say('builder', v.n + ' selected parts. Each whole has ' + v.d + ' equal ' + (v.d === 1 ? 'part' : 'parts') + '. Simplified value: ' + shownAs(v) + '.');
  });
  bind('builder', builder);

  let equivalentGoal = false;
  const equivalents = surface('equivalence', pen => {
    const a = read('equiv-a'), b = read('equiv-b');
    drawBars(pen, [a, b], ['Top bar · ' + describe(a), 'Lower bar · ' + describe(b)]);
    const same = F.cmp(a, b) === 0;
    const ref = F.simplify(a);
    const lower = F.simplify(b);
    say('equivalence', (same ? 'Equivalent. Both reduce to ' + describe(ref) + '.' : 'Different shaded lengths. The values reduce to ' + describe(ref) + ' and ' + describe(lower) + '.') + (equivalentGoal && !same ? ' Change the lower fraction to match the top.' : ''));
  });
  bind('equivalence', equivalents);
  let challenge = 0;
  click('equiv-next', () => {
    const prompts = [[1, 3, 4, 9], [3, 4, 8, 12], [2, 5, 3, 10], [4, 3, 7, 6]];
    const [a, b, c, d] = prompts[challenge++ % prompts.length];
    for (const [id, value] of [['equiv-a-n', a], ['equiv-a-d', b], ['equiv-b-n', c], ['equiv-b-d', d]]) get(id).value = value;
    equivalentGoal = true;
    equivalents.redraw();
  });

  let checkedLine = false;
  const lineExtent = () => Math.max(2, Math.ceil(num('line-n') / num('line-d')) + 1);
  const lineView = surface('line', pen => {
    const v = read('line');
    const ticks = lineExtent() * v.d;
    const at = num('line-tick');
    const x = n => 45 + 510 * n / ticks;
    pen.line(45, 180, 555, 180, ink, 3);
    for (let j = 0; j <= ticks; j++) {
      if (ticks > 60 && j % v.d !== 0 && j !== at) continue;
      const major = j % v.d === 0;
      pen.line(x(j), major ? 166 : 173, x(j), major ? 194 : 187);
      if (major && (lineExtent() < 13 || (j / v.d) % 3 === 0)) pen.text(j / v.d, x(j), 220, 19);
    }
    pen.dot(x(at), 180, 8, purple);
    pen.stacked(v, 300, 55, blue);
    if (checkedLine) {
      pen.dot(x(v.n), 180, 4, teal);
      pen.text('Equivalent target: ' + (2 * v.n) + '/' + (2 * v.d), 300, 300, 22, teal);
    }
    const place = F.simplify(fraction(at, v.d));
    say('line', 'Target ' + describe(v) + '. Marker ' + describe(place) + '. ' + (checkedLine ? at === v.n ? 'Correct. The doubled numerator and denominator name the same point.' : 'The target is ' + v.n + ' tick steps of size 1/' + v.d + ' from zero.' : 'Place the marker and check.'));
  });
  function moveLine(tick) {
    const limit = lineExtent() * num('line-d');
    if (!Number.isFinite(limit) || limit < 1) return;
    const next = Math.max(0, Math.min(limit, tick));
    for (const id of ['line-marker', 'line-tick']) { get(id).max = limit; get(id).value = next; }
    checkedLine = false;
    lineView.redraw();
  }
  for (const id of ['line-n', 'line-d']) update(id, () => {
    if (Number.isFinite(num('line-tick'))) moveLine(num('line-tick'));
    lineView.redraw();
  });
  for (const id of ['line-marker', 'line-tick']) update(id, () => {
    if (get(id).checkValidity()) moveLine(num(id));
    else lineView.redraw();
  });
  function localPoint(event, canvas) {
    const box = canvas.getBoundingClientRect();
    return [(event.clientX - box.left) * 600 / box.width, (event.clientY - box.top) * 370 / box.height];
  }
  const placeOnLine = (event, canvas) => {
    const [x] = localPoint(event, canvas);
    moveLine(Math.round((x - 45) / 510 * lineExtent() * num('line-d')));
  };
  lineView.canvas.addEventListener('click', event => placeOnLine(event, lineView.canvas));
  click('line-check', () => { checkedLine = true; lineView.redraw(); });
  click('line-zoom', () => {
    const canvas = document.createElement('canvas');
    canvas.style.aspectRatio = '600 / 370';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Enlarged fraction number line');
    canvas.setAttribute('aria-describedby', 'line-status');
    canvas.addEventListener('click', event => placeOnLine(event, canvas));
    openDialog(canvas, () => paint(canvas, lineView.render));
  });
  moveLine(2);

  let mulProgress = 1, animation = 0;
  const multiplication = surface('mul', pen => {
    const a = read('mul-a'), b = read('mul-b');
    const rows = Math.max(a.d, a.n), cols = Math.max(b.d, b.n);
    const unit = Math.min(250 * a.d / rows, 530 * b.d / cols, 236);
    const cellWidth = unit / b.d, cellHeight = unit / a.d;
    const x = (600 - cellWidth * cols) / 2, y = (328 - cellHeight * rows) / 2 + 4;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const isRow = i < a.n && i + 1 <= mulProgress * a.n + .001;
        const isCol = j < b.n && j + 1 <= mulProgress * b.n + .001;
        const fill = isRow && isCol ? purple : isRow ? '#7eade9' : isCol ? '#78d5c7' : wash;
        pen.rect(x + j * cellWidth, y + i * cellHeight, cellWidth, cellHeight, fill, '#7790ae', 1);
      }
    }
    pen.rect(x, y, unit, unit, null, ink, 4);
    const result = F.mul(a, b);
    pen.stacked(result, 300, 343, purple);
    say('mul', a.n + ' selected rows × ' + b.n + ' selected columns gives ' + a.n * b.n + ' overlap cells. A unit square contains ' + a.d * b.d + ' cells. Product: ' + describe(result) + '.');
  });
  bind('mul', multiplication);
  multiplication.detail.addEventListener('toggle', () => {
    if (!multiplication.detail.open) { cancelAnimationFrame(animation); mulProgress = 1; }
  });
  click('mul-replay', () => {
    cancelAnimationFrame(animation);
    if (media.matches) { mulProgress = 1; multiplication.redraw(); return; }
    const started = performance.now();
    const frame = now => {
      mulProgress = Math.min(1, (now - started) / 780);
      multiplication.redraw();
      if (mulProgress < 1 && multiplication.detail.open) animation = requestAnimationFrame(frame);
    };
    animation = requestAnimationFrame(frame);
  });

  const division = surface('div', pen => {
    const a = read('div-a'), b = read('div-b');
    const lcm = F.lcm(a.d, b.d);
    const left = a.n * (lcm / a.d), one = b.n * (lcm / b.d);
    const groups = Math.floor(left / one), remainder = left % one;
    const extent = Math.max(one, groups * one + (remainder ? one : 0));
    const step = 510 / extent;
    pen.text('Dividend', 300, 54);
    pen.rect(45, 86, step * extent, 57, lineFill);
    pen.rect(45, 86, step * left, 57, blue, null);
    pen.text('Divisor-sized groups', 300, 186);
    if (extent / one <= 24) {
      for (let j = 0; j < extent / one; j++) {
        pen.rect(45 + j * one * step, 220, one * step, 60, '#e1f1ec', teal, 2);
        if (j < groups) pen.rect(45 + j * one * step, 220, one * step, 60, teal, ink, 1);
      }
    } else {
      pen.rect(45, 220, groups * one * step, 60, teal, ink, 2);
      if (remainder) pen.rect(45 + groups * one * step, 220, one * step, 60, '#e1f1ec', teal);
    }
    if (remainder) pen.rect(45 + groups * one * step, 220, remainder * step, 60, purple, ink, 2);
    if (step >= 9) {
      for (let j = 1; j < extent; j++) pen.line(45 + j * step, 86, 45 + j * step, 143, ink, 1);
    }
    const result = F.div(a, b);
    const portion = F.simplify(fraction(remainder, one));
    pen.stacked(result, 300, 320, purple);
    say('div', 'Using pieces of size 1/' + lcm + ', the amounts are ' + left + ' pieces and ' + one + ' pieces per group. Fit ' + groups + ' complete groups' + (remainder ? ' and ' + describe(portion) + ' of another' : '') + '. Reciprocal check: ' + describe(a) + ' × ' + b.d + '/' + b.n + ' = ' + describe(result) + '.');
  });
  bind('div', division);

  function parse(raw) {
    const match = raw.trim().match(/^([+-]?)(\d{1,4})(?:(?:\s+(\d{1,4})|)\s*\/\s*(\d{1,4}))?$/);
    if (!match) throw Error('Use a whole number, a fraction such as 3/4, or a mixed number such as 1 3/4.');
    const [, sign, integer, numerator, denominator] = match;
    const d = denominator === undefined ? 1 : Number(denominator);
    if (!d) throw Error('A denominator cannot be zero.');
    if (numerator !== undefined && Number(numerator) >= d) throw Error('The fractional part of a mixed number must be proper.');
    const n = numerator === undefined ? Number(integer) : Number(integer) * d + Number(numerator);
    // Bounded inputs keep all products exact in the shared integer arithmetic engine.
    if (n > 9999) throw Error('The numerator after conversion must be 9999 or below.');
    return { value: fraction(sign === '-' ? -n : n, d), mixed: numerator !== undefined, raw: raw.trim() };
  }
  const simpleStep = (v, result) => {
    const g = F.gcd(v.n, v.d);
    return g > 1 ? 'Divide numerator and denominator by ' + g + ': ' + describe(result) + '.' : 'The fraction is already in simplest form.';
  };
  function calculate() {
    try {
      const aInput = parse(select('calc-a'));
      const a = aInput.value;
      const op = select('calc-op');
      const steps = [];
      if (aInput.mixed) steps.push(aInput.raw + ' = ' + describe(a) + ' after converting whole units into equal parts.');
      let rawResult = a;
      let result = F.simplify(a);
      if (op === 'simple' || op === 'mixed') {
        if (op === 'mixed') {
          const abs = Math.abs(a.n);
          steps.push(abs + ' ÷ ' + a.d + ' has quotient ' + Math.floor(abs / a.d) + ' and remainder ' + abs % a.d + '.');
        }
      } else {
        const bInput = parse(select('calc-b'));
        const b = bInput.value;
        if (bInput.mixed) steps.push(bInput.raw + ' = ' + describe(b) + ' after converting whole units into equal parts.');
        if (op === '+' || op === '-') {
          const den = F.lcm(a.d, b.d), topA = a.n * (den / a.d), topB = b.n * (den / b.d);
          steps.push('LCM of ' + a.d + ' and ' + b.d + ' is ' + den + '. Rewrite as ' + topA + '/' + den + ' and ' + topB + '/' + den + '.');
          rawResult = fraction(op === '+' ? topA + topB : topA - topB, den);
          steps.push('Combine the numerators and keep the common denominator: ' + describe(rawResult) + '.');
          result = op === '+' ? F.add(a, b) : F.sub(a, b);
        } else {
          if (op === '÷' && b.n === 0) throw Error('Division by zero is undefined.');
          const factor = op === '×' ? b : fraction(Math.sign(b.n) * b.d, Math.abs(b.n));
          if (op === '÷') steps.push('Keep ' + describe(a) + ' and multiply by the divisor’s reciprocal, ' + describe(factor) + '.');
          const first = F.gcd(a.n, factor.d), second = F.gcd(factor.n, a.d);
          if (first > 1) steps.push('Cancel ' + a.n + ' and ' + factor.d + ' by ' + first + '.');
          if (second > 1) steps.push('Cancel ' + factor.n + ' and ' + a.d + ' by ' + second + '.');
          const x = fraction(a.n / first, a.d / second), y = fraction(factor.n / second, factor.d / first);
          rawResult = fraction(x.n * y.n, x.d * y.d);
          steps.push('Multiply ' + describe(x) + ' × ' + describe(y) + ' to get ' + describe(rawResult) + '.');
          result = op === '×' ? F.mul(a, b) : F.div(a, b);
        }
      }
      steps.push(simpleStep(rawResult, result));
      const alternate = shownAs(result);
      solution('calc', steps, op === 'mixed' && aInput.mixed ? describe(result) : describe(result) + (alternate !== describe(result) ? ' = ' + alternate : ''));
    } catch (error) { say('calc', error.message); }
  }
  click('calc-go', calculate);
  for (const id of ['calc-a', 'calc-b']) update(id, event => { if (event.key === 'Enter') calculate(); }, 'keydown');
  update('calc-op', () => {
    get('calc-b').closest('label').hidden = ['simple', 'mixed'].includes(select('calc-op'));
  });

  let comparison = [fraction(3, 8), fraction(5, 8)];
  let explained = false;
  const random = max => 1 + Math.floor(Math.random() * max);
  const compare = surface('compare', pen => {
    const [a, b] = comparison;
    if (explained) drawBars(pen, comparison, ['First · ' + describe(a), 'Second · ' + describe(b)]);
    else { pen.stacked(a, 205, 178); pen.text('?', 300, 178, 30, purple); pen.stacked(b, 395, 178); }
  });
  function newCompare() {
    const level = select('compare-level'), d = 3 + random(7);
    if (level === 'same') comparison = [fraction(random(d - 1), d), fraction(random(d - 1), d)];
    if (level === 'different') {
      const c = 3 + random(6);
      comparison = Math.random() < .25 ? [fraction(1, 2), fraction(2, 4)] : [fraction(random(d - 1), d), fraction(random(c - 1), c === d ? c + 1 : c)];
    }
    if (level === 'mixed') comparison = [fraction(d + random(d - 1), d), fraction(7 + random(5), 5)];
    explained = false;
    say('compare', 'Compare ' + describe(comparison[0]) + ' with ' + describe(comparison[1]) + '.');
    compare.redraw();
  }
  say('compare', 'Compare 3/8 with 5/8.');
  click('compare-next', newCompare);
  update('compare-level', newCompare, 'change');
  click('compare-check', () => {
    const [a, b] = comparison, sign = F.compareSymbol(a, b);
    const den = F.lcm(a.d, b.d);
    explained = true;
    say('compare', (select('compare-answer') === sign ? 'Correct. ' : 'Review this. ') + a.n * (den / a.d) + '/' + den + ' ' + sign + ' ' + b.n * (den / b.d) + '/' + den + '. Equal denominators mean the piece counts can be compared.');
    compare.redraw();
  });

  let pizzaSlices = new Set([0, 1, 2, 3, 4]);
  function pizzaLayout(parts) {
    const occupied = Math.max(0, ...pizzaSlices) + 1;
    const count = Math.max(2, Math.ceil(occupied / parts));
    if (count > 6) return [];
    const cols = Math.min(3, count), rows = Math.ceil(count / cols);
    const w = 530 / cols, h = 288 / rows;
    return Array.from({ length: count }, (_, i) => ({
      x: 35 + (i % cols + .5) * w, y: 44 + (Math.floor(i / cols) + .5) * h,
      r: Math.min(78, w * .41, h * .41)
    }));
  }
  const pizza = surface('pizza', pen => {
    const parts = num('pizza-parts'), chosen = num('pizza-quantity'), more = num('pizza-add'), people = num('pizza-people');
    const set = fraction(chosen, parts), mode = select('pizza-mode'), layout = pizzaLayout(parts);
    if (!layout.length) chartBar(pen, set, 155, 500 / Math.ceil(chosen / parts));
    layout.forEach(({ x, y, r }, i) => {
      for (let j = 0; j < parts; j++) {
        const angle = -Math.PI / 2 + j * tau / parts;
        const active = pizzaSlices.has(i * parts + j);
        pen.slice(x, y, r, angle, angle + tau / parts, active ? '#eab65e' : '#efe5d4');
        if (active && r > 33) {
          const middle = angle + tau / parts / 2;
          pen.dot(x + r * .66 * Math.cos(middle), y + r * .66 * Math.sin(middle), 4, '#a5472c');
        }
      }
    });
    pen.stacked(set, 300, 35);
    const amount = mode === 'combine' ? F.add(set, fraction(more, parts)) : mode === 'share' ? F.div(set, fraction(people, 1)) : F.mul(set, fraction(1, 2));
    const operation = mode === 'combine' ? 'Add ' + more + ' more equal slices to get ' : mode === 'share' ? 'Divide the selected amount by ' + people + ' to give each person ' : 'Multiply the selected amount by one half to get ';
    say('pizza', chosen + ' slices selected, with ' + parts + ' slices per pizza. ' + operation + shownAs(amount) + ' pizza units.');
  });
  const resetPizza = () => {
    if (get('pizza-quantity').checkValidity()) pizzaSlices = new Set(Array.from({ length: num('pizza-quantity') }, (_, i) => i));
    pizza.redraw();
  };
  for (const id of ['pizza-parts', 'pizza-quantity']) update(id, resetPizza);
  for (const id of ['pizza-add', 'pizza-people', 'pizza-mode']) update(id, pizza.redraw);
  pizza.canvas.addEventListener('click', event => {
    if (!valid('pizza')) return;
    const [x, y] = localPoint(event, pizza.canvas);
    const parts = num('pizza-parts'), layout = pizzaLayout(parts);
    const i = layout.findIndex(circle => Math.hypot(x - circle.x, y - circle.y) <= circle.r);
    if (i < 0) return;
    const { x: cx, y: cy } = layout[i];
    const index = i * parts + Math.floor(((Math.atan2(y - cy, x - cx) + Math.PI / 2 + tau) % tau) * parts / tau);
    if (pizzaSlices.has(index)) pizzaSlices.delete(index);
    else if (pizzaSlices.size < 24) pizzaSlices.add(index);
    get('pizza-quantity').value = pizzaSlices.size;
    pizza.redraw();
  });

  const recipe = surface('recipe', pen => {
    const portions = num('recipe-count');
    const factor = fraction(portions, 4);
    const flour = F.mul(fraction(3, 4), factor), milk = F.mul(fraction(1, 2), factor);
    drawBars(pen, [flour, milk], ['Flour · ' + shownAs(flour) + ' cups', 'Milk · ' + shownAs(milk) + ' cups']);
    solution('recipe', [
      'New servings ÷ original servings = ' + portions + ' ÷ 4 = ' + describe(F.simplify(factor)) + '.',
      'Flour: 3/4 × ' + describe(factor) + ' = ' + describe(flour) + ' cups.',
      'Milk: 1/2 × ' + describe(factor) + ' = ' + describe(milk) + ' cups.'
    ], shownAs(flour) + ' cups flour and ' + shownAs(milk) + ' cups milk.');
  });
  bind('recipe', recipe);

  const puzzles = {
    missing: ['What times 5/6 equals 5/8?', 'Divide the result by the known factor.', '5/8 ÷ 5/6 = 5/8 × 6/5 = 3/4.', fraction(3, 4)],
    equiv: ['Give the simplest fraction equivalent to 12/18.', 'Both terms have the factor 6.', 'Divide both terms by 6 to get 2/3.', fraction(2, 3)],
    target: ['What fraction must be added to 7/12 to reach 1?', 'Rename 1 in twelfths.', '12/12 − 7/12 = 5/12.', fraction(5, 12)],
    order: ['Find 2/3 − (1/2 × 1/3).', 'Evaluate the product inside brackets first.', 'The product is 1/6. Subtract 1/6 from 4/6 to get 1/2.', fraction(1, 2)]
  };
  const progressKey = 'vyasa-class7-working-fractions-puzzles-v1';
  let done = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey));
    if (Array.isArray(saved)) done = new Set(saved.filter(key => Object.hasOwn(puzzles, key)));
  } catch { /* Learning tools still work when storage is unavailable. */ }
  const puzzle = (message = '') => {
    const [question] = puzzles[select('puzzle-kind')];
    status('puzzle').replaceChildren(displayMarkup(question + (message ? ' ' + message : '')));
    get('puzzle-progress').textContent = done.size + ' of 4 puzzles solved.';
  };
  update('puzzle-kind', () => { get('puzzle-answer').value = ''; puzzle(); }, 'change');
  click('puzzle-hint', () => puzzle(puzzles[select('puzzle-kind')][1]));
  click('puzzle-reveal', () => puzzle(puzzles[select('puzzle-kind')][2]));
  click('puzzle-check', () => {
    const key = select('puzzle-kind'), [, hint, explanation, answer] = puzzles[key];
    try {
      const entered = parse(select('puzzle-answer')).value;
      if (!F.eq(entered, answer)) { puzzle('Try again. ' + hint); return; }
      if (key === 'equiv' && !F.isReduced(entered)) { puzzle('The value is equivalent. Write it in simplest form.'); return; }
      done.add(key);
      try { localStorage.setItem(progressKey, JSON.stringify([...done])); } catch { /* Progress remains available this visit. */ }
      puzzle('Correct. ' + explanation);
    } catch (error) { puzzle(error.message); }
  });
  puzzle();

  const mistakes = [
    ['units', 'A student writes 1/3 + 1/6 = 2/9.', 'Use equal-sized units: 2/6 + 1/6 = 3/6 = 1/2.'],
    ['divisor', 'A student writes 2/3 ÷ 4/5 = 3/2 × 4/5.', 'Invert the divisor only: 2/3 × 5/4 = 5/6.'],
    ['mixed', 'A student writes 1 2/5 = 3/5.', 'One whole contains five fifths. Add two fifths to get 7/5.'],
    ['product', 'A student writes 2/5 × 3/5 = 6/5.', 'Multiply both numerators and denominators: 6/25.']
  ];
  let activeMistake = 0;
  const showMistake = (message = '') => status('mistake').replaceChildren(displayMarkup(mistakes[activeMistake][1] + (message ? ' ' + message : '')));
  click('mistake-next', () => { activeMistake = (activeMistake + 1) % mistakes.length; showMistake(); });
  click('mistake-check', () => {
    const [expected, , why] = mistakes[activeMistake];
    showMistake((select('mistake-choice') === expected ? 'Correct. ' : 'Review this. ') + why);
  });
  showMistake();
  for (const id of ['calc', 'puzzle', 'mistake']) get('tool-' + id).querySelector('.fraction-live').hidden = false;
})();
