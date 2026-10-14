/*
 * Vyasa 3D Snakes & Ladders - Three.js scene, controls, models and animations.
 * Requires global THREE (vendor/three.min.js) and window.SNL (snl-engine.js).
 * Exposes window.SNL3D.
 */
(function () {
  "use strict";

  if (typeof window === "undefined") { return; }
  var THREE = window.THREE;
  var SNL = window.SNL;

  var BOARD_N = SNL ? SNL.BOARD_SIZE : 10;
  var TILE = 1;
  var TILE_SIZE = 0.9;
  var TILE_H = 0.14;
  var BASE_H = 0.3;
  var TILE_TOP = BASE_H + TILE_H;
  var DICE_SIZE = 0.8;

  var COLORS = {
    tileA: 0xfff3d6,
    tileB: 0xbfe3c6,
    base: 0x2b3a67,
    frame: 0x1d2747,
    ground: 0xdfe7f5
  };

  var SNAKE_COLORS = [
    0xe74c3c, 0x9b59b6, 0x2980b9, 0x16a085, 0xe67e22,
    0xd81b60, 0x8e44ad, 0x00897b, 0xf4511e, 0x3949ab
  ];

  function boardX(col) { return (col - (BOARD_N - 1) / 2) * TILE; }
  function boardZ(row) { return ((BOARD_N - 1) / 2 - row) * TILE; }

  function cellCenter(n) {
    var c = SNL.cellPosition(n);
    return { x: boardX(c.col), z: boardZ(c.row) };
  }

  function isWebGLAvailable() {
    try {
      var canvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function disposer(list) {
    return function dispose() {
      list.forEach(function (o) {
        if (!o) { return; }
        if (o.geometry) { o.geometry.dispose(); }
        if (o.material) {
          var mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(function (m) {
            if (m.map) { m.map.dispose(); }
            m.dispose();
          });
        }
      });
      list.length = 0;
    };
  }

  function makeNumberAtlas() {
    var S = 1024;
    var cell = S / BOARD_N;
    var cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    var ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = "#1f2740";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 60px Inter, Arial, sans-serif";
    for (var n = 1; n <= BOARD_N * BOARD_N; n++) {
      var c = SNL.cellPosition(n);
      var ax = c.col;
      var ay = (BOARD_N - 1) - c.row;
      ctx.fillText(String(n), (ax + 0.5) * cell, (ay + 0.5) * cell + 3);
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  }

  function pipTexture(value) {
    var S = 128;
    var cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#fbfbfb";
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = "#232838";
    var layouts = {
      1: [[.5, .5]],
      2: [[.28, .28], [.72, .72]],
      3: [[.28, .28], [.5, .5], [.72, .72]],
      4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]],
      5: [[.28, .28], [.72, .28], [.5, .5], [.28, .72], [.72, .72]],
      6: [[.28, .26], [.72, .26], [.28, .5], [.72, .5], [.28, .74], [.72, .74]]
    }[value];
    layouts.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0] * S, p[1] * S, S * 0.088, 0, Math.PI * 2);
      ctx.fill();
    });
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function taperedTube(points, tubularSegments, radialSegments, r0, r1) {
    var curve = new THREE.CatmullRomCurve3(points);
    var frames = curve.computeFrenetFrames(tubularSegments, false);
    var positions = [];
    var indices = [];
    var normals = [];
    var uvs = [];
    var i, j;
    for (i = 0; i <= tubularSegments; i++) {
      var t = i / tubularSegments;
      var r = r0 + (r1 - r0) * t;
      var center = curve.getPoint(t);
      var N = frames.normals[i];
      var B = frames.binormals[i];
      for (j = 0; j < radialSegments; j++) {
        var v = (j / radialSegments) * Math.PI * 2;
        var nx = Math.cos(v), ny = Math.sin(v);
        var px = center.x + r * (nx * N.x + ny * B.x);
        var py = center.y + r * (nx * N.y + ny * B.y);
        var pz = center.z + r * (nx * N.z + ny * B.z);
        positions.push(px, py, pz);
        normals.push(nx * N.x + ny * B.x, nx * N.y + ny * B.y, nx * N.z + ny * B.z);
        uvs.push(j / radialSegments, t);
      }
    }
    for (i = 1; i <= tubularSegments; i++) {
      for (j = 1; j <= radialSegments; j++) {
        var a = (radialSegments + 1) * (i - 1) + (j - 1);
        var b = (radialSegments + 1) * i + (j - 1);
        var c = (radialSegments + 1) * i + j;
        var d = (radialSegments + 1) * (i - 1) + j;
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    return { geometry: g, curve: curve };
  }

  function makeSnakeTextures(baseHex) {
    var S = 256;
    var R = (baseHex >> 16) & 255, G = (baseHex >> 8) & 255, B = baseHex & 255;
    var cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "rgb(" + R + "," + G + "," + B + ")";
    ctx.fillRect(0, 0, S, S);
    var gd = ctx.createLinearGradient(0, 0, S, 0);
    gd.addColorStop(0, "rgba(0,0,0,0.32)");
    gd.addColorStop(0.5, "rgba(255,255,255,0.10)");
    gd.addColorStop(1, "rgba(0,0,0,0.32)");
    ctx.fillStyle = gd;
    ctx.fillRect(0, 0, S, S);
    var bands = 4;
    for (var bi = 0; bi < bands; bi++) {
      var by = (bi + 0.5) * (S / bands);
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, by - S / (bands * 5), S, S / (bands * 2.6));
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(0, by + S / (bands * 4), S, S / (bands * 7));
    }
    var cols = 12, rows = 16;
    var cw = S / cols, ch = S / rows;
    for (var ry = 0; ry < rows; ry++) {
      for (var cx = 0; cx < cols; cx++) {
        var ox = (ry % 2) ? cw / 2 : 0;
        var px = cx * cw + ox + cw / 2;
        var py = ry * ch + ch / 2;
        ctx.beginPath();
        ctx.moveTo(px, py - ch * 0.5);
        ctx.quadraticCurveTo(px + cw * 0.5, py, px, py + ch * 0.5);
        ctx.quadraticCurveTo(px - cw * 0.5, py, px, py - ch * 0.5);
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - cw * 0.3, py - ch * 0.29);
        ctx.quadraticCurveTo(px, py - ch * 0.02, px + cw * 0.3, py - ch * 0.29);
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
    var map = new THREE.CanvasTexture(cv);
    map.encoding = THREE.sRGBEncoding;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2, 6);
    map.anisotropy = 4;

    var bv = document.createElement("canvas");
    bv.width = S; bv.height = S;
    var bx = bv.getContext("2d");
    bx.fillStyle = "#707070";
    bx.fillRect(0, 0, S, S);
    for (var qy = 0; qy < rows; qy++) {
      for (var qx = 0; qx < cols; qx++) {
        var qox = (qy % 2) ? cw / 2 : 0;
        var qpx = qx * cw + qox + cw / 2;
        var qpy = qy * ch + ch / 2;
        bx.beginPath();
        bx.moveTo(qpx, qpy - ch * 0.5);
        bx.quadraticCurveTo(qpx + cw * 0.5, qpy, qpx, qpy + ch * 0.5);
        bx.quadraticCurveTo(qpx - cw * 0.5, qpy, qpx, qpy - ch * 0.5);
        bx.fillStyle = "rgba(255,255,255,0.55)";
        bx.fill();
        bx.strokeStyle = "rgba(40,40,40,0.75)";
        bx.lineWidth = 1;
        bx.stroke();
      }
    }
    var bump = new THREE.CanvasTexture(bv);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(2, 6);
    return { map: map, bump: bump };
  }

  function makeWoodTextures() {
    var S = 256;
    var cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#c68a44";
    ctx.fillRect(0, 0, S, S);
    var i, y, x;
    for (i = 0; i < 90; i++) {
      var x0 = Math.random() * S;
      var amp = 4 + Math.random() * 10;
      var ph = Math.random() * Math.PI * 2;
      ctx.strokeStyle = "rgba(" + ((90 + Math.random() * 40) | 0) + "," + ((55 + Math.random() * 30) | 0) + ",20," + (0.06 + Math.random() * 0.12).toFixed(3) + ")";
      ctx.lineWidth = 0.5 + Math.random() * 1.4;
      ctx.beginPath();
      for (y = 0; y <= S; y += 6) {
        x = x0 + Math.sin((y / S) * Math.PI * 2 * (1 + (i % 3)) + ph) * amp;
        if (y === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
      }
      ctx.stroke();
    }
    for (i = 0; i < 3; i++) {
      var kx = Math.random() * S, ky = Math.random() * S;
      var grd = ctx.createRadialGradient(kx, ky, 1, kx, ky, 20);
      grd.addColorStop(0, "rgba(70,40,15,0.5)");
      grd.addColorStop(0.5, "rgba(120,80,40,0.22)");
      grd.addColorStop(1, "rgba(120,80,40,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(kx, ky, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    var map = new THREE.CanvasTexture(cv);
    map.encoding = THREE.sRGBEncoding;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, 3);
    map.anisotropy = 4;

    var bv = document.createElement("canvas");
    bv.width = S; bv.height = S;
    var bx = bv.getContext("2d");
    bx.fillStyle = "#808080";
    bx.fillRect(0, 0, S, S);
    for (i = 0; i < 90; i++) {
      var gx = Math.random() * S, ga = 4 + Math.random() * 10, gp = Math.random() * Math.PI * 2;
      bx.strokeStyle = "rgba(60,60,60," + (0.12 + Math.random() * 0.2).toFixed(3) + ")";
      bx.lineWidth = 0.5 + Math.random() * 1.4;
      bx.beginPath();
      for (y = 0; y <= S; y += 6) {
        var xx = gx + Math.sin((y / S) * Math.PI * 2 * (1 + (i % 3)) + gp) * ga;
        if (y === 0) { bx.moveTo(xx, y); } else { bx.lineTo(xx, y); }
      }
      bx.stroke();
    }
    var bump = new THREE.CanvasTexture(bv);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(1, 3);
    return { map: map, bump: bump };
  }

  function create(opts) {
    opts = opts || {};
    if (!isWebGLAvailable()) {
      if (opts.onError) { opts.onError("webgl-unsupported"); }
      return null;
    }

    var container = opts.container;
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1230);
    scene.fog = new THREE.Fog(0x0b1230, 26, 46);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch (e) {
      if (opts.onError) { opts.onError("renderer-failed"); }
      return null;
    }

    var isNarrow = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow ? 2 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "3D Snakes and Ladders board");
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    var target = new THREE.Vector3(0, 0.6, 0);
    var cam = { radius: 16, theta: 0, phi: 0.82, minRadius: 8.5, maxRadius: 28, minPhi: 0.22, maxPhi: 1.35 };

    function applyCamera() {
      cam.phi = Math.max(cam.minPhi, Math.min(cam.maxPhi, cam.phi));
      cam.radius = Math.max(cam.minRadius, Math.min(cam.maxRadius, cam.radius));
      var sp = Math.sin(cam.phi);
      camera.position.set(
        target.x + cam.radius * sp * Math.sin(cam.theta),
        target.y + cam.radius * Math.cos(cam.phi),
        target.z + cam.radius * sp * Math.cos(cam.theta)
      );
      camera.lookAt(target);
    }

    var hemi = new THREE.HemisphereLight(0xffffff, 0x445577, 0.85);
    scene.add(hemi);
    var ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);
    var sun = new THREE.DirectionalLight(0xffffff, 1.05);
    sun.position.set(-9, 16, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(isNarrow ? 1024 : 2048, isNarrow ? 1024 : 2048);
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 50;
    sun.shadow.bias = -0.0006;
    scene.add(sun);

    var resources = [];
    function track(o) { resources.push(o); return o; }
    function trackTexture(tex) {
      resources.push({ material: { map: tex, dispose: function () {} }, geometry: null });
      return tex;
    }

    var ground = track(new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      track(new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1, metalness: 0 }))
    ));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    var board = new THREE.Group();
    scene.add(board);

    var base = track(new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_N * TILE + 0.6, BASE_H, BOARD_N * TILE + 0.6),
      track(new THREE.MeshStandardMaterial({ color: COLORS.base, roughness: 0.55, metalness: 0.15 }))
    ));
    base.position.y = BASE_H / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    board.add(base);

    var frameMaterial = track(new THREE.MeshStandardMaterial({ color: COLORS.frame, roughness: 0.5, metalness: 0.25 }));
    var frameW = BOARD_N * TILE + 0.6;
    [
      [0, BOARD_N * TILE / 2 + 0.15, frameW, 0.3],
      [0, -BOARD_N * TILE / 2 - 0.15, frameW, 0.3]
    ].forEach(function (r) {
      var m = track(new THREE.Mesh(new THREE.BoxGeometry(r[2], 0.34, r[3]), frameMaterial));
      m.position.set(r[0], BASE_H - 0.05, r[1]);
      m.castShadow = true;
      board.add(m);
    });
    [
      [BOARD_N * TILE / 2 + 0.15, 0],
      [-BOARD_N * TILE / 2 - 0.15, 0]
    ].forEach(function (r) {
      var m = track(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, frameW), frameMaterial));
      m.position.set(r[0], BASE_H - 0.05, r[1]);
      m.castShadow = true;
      board.add(m);
    });

    var tileMatA = track(new THREE.MeshStandardMaterial({ color: COLORS.tileA, roughness: 0.85, metalness: 0.02 }));
    var tileMatB = track(new THREE.MeshStandardMaterial({ color: COLORS.tileB, roughness: 0.85, metalness: 0.02 }));
    var tileGeom = track(new THREE.BoxGeometry(TILE_SIZE, TILE_H, TILE_SIZE));
    for (var n = 1; n <= BOARD_N * BOARD_N; n++) {
      var c = SNL.cellPosition(n);
      var tile = new THREE.Mesh(tileGeom, ((c.row + c.col) % 2 === 0) ? tileMatA : tileMatB);
      tile.position.set(boardX(c.col), BASE_H + TILE_H / 2, boardZ(c.row));
      tile.castShadow = true;
      tile.receiveShadow = true;
      board.add(tile);
    }

    var atlas = makeNumberAtlas();
    resources.push({ material: { map: atlas, dispose: function () {} }, geometry: null });
    var numPositions = [];
    var numUvs = [];
    var numIndices = [];
    var vi = 0;
    var hs = TILE_SIZE * 0.34;
    var cellUv = 1 / BOARD_N;
    for (var n2 = 1; n2 <= BOARD_N * BOARD_N; n2++) {
      var cc = SNL.cellPosition(n2);
      var ax = cc.col;
      var ay = (BOARD_N - 1) - cc.row;
      var u0 = ax * cellUv, u1 = (ax + 1) * cellUv;
      var v1 = 1 - ay * cellUv, v0 = 1 - (ay + 1) * cellUv;
      var x = boardX(cc.col), z = boardZ(cc.row), y = TILE_TOP + 0.008;
      numPositions.push(x - hs, y, z + hs); numUvs.push(u0, v0);
      numPositions.push(x + hs, y, z + hs); numUvs.push(u1, v0);
      numPositions.push(x + hs, y, z - hs); numUvs.push(u1, v1);
      numPositions.push(x - hs, y, z - hs); numUvs.push(u0, v1);
      numIndices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      vi += 4;
    }
    var numGeom = track(new THREE.BufferGeometry());
    numGeom.setAttribute("position", new THREE.Float32BufferAttribute(numPositions, 3));
    numGeom.setAttribute("uv", new THREE.Float32BufferAttribute(numUvs, 2));
    numGeom.setIndex(numIndices);
    var numMat = track(new THREE.MeshBasicMaterial({ map: atlas, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    board.add(new THREE.Mesh(numGeom, numMat));

    var snakeGroups = [];
    SNL.snakeList().forEach(function (s, idx) {
      var a = cellCenter(s.from);
      var b = cellCenter(s.to);
      var start = new THREE.Vector3(a.x, TILE_TOP + 0.12, a.z);
      var end = new THREE.Vector3(b.x, TILE_TOP + 0.12, b.z);
      var dir = new THREE.Vector3().subVectors(end, start);
      var len = dir.length() || 1;
      var side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      var pts = [];
      var segs = 16;
      for (var i = 0; i <= segs; i++) {
        var t = i / segs;
        var p = new THREE.Vector3().lerpVectors(start, end, t);
        p.addScaledVector(side, Math.sin(t * Math.PI * 3) * Math.min(0.42, len * 0.085));
        p.y += Math.sin(t * Math.PI) * (0.22 + len * 0.018);
        p.y += Math.exp(-t * 5.5) * (0.38 + len * 0.02);
        pts.push(p);
      }
      var color = SNAKE_COLORS[idx % SNAKE_COLORS.length];
      var skin = makeSnakeTextures(color);
      trackTexture(skin.map);
      trackTexture(skin.bump);
      var bodyMat = track(new THREE.MeshStandardMaterial({
        color: 0xffffff, map: skin.map, bumpMap: skin.bump, bumpScale: 0.016,
        roughness: 0.42, metalness: 0.13
      }));
      var tube = taperedTube(pts, 96, 16, 0.15, 0.045);
      track(tube.geometry);
      var body = new THREE.Mesh(tube.geometry, bodyMat);
      body.castShadow = true;
      body.receiveShadow = true;

      var grp = new THREE.Group();
      grp.add(body);

      var headPos = pts[0];
      var bodyDir = new THREE.Vector3().subVectors(pts[1], pts[0]).normalize();
      var headGrp = new THREE.Group();
      headGrp.position.copy(headPos);
      headGrp.lookAt(headPos.clone().add(bodyDir.clone().negate()));

      var skullMat = track(new THREE.MeshStandardMaterial({
        color: 0xffffff, map: skin.map, bumpMap: skin.bump, bumpScale: 0.016,
        roughness: 0.36, metalness: 0.16
      }));
      var skull = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 18), skullMat);
      skull.scale.set(1.0, 0.82, 1.45);
      skull.position.z = -0.02;
      skull.castShadow = true;
      headGrp.add(skull);
      var snout = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), skullMat);
      snout.scale.set(0.92, 0.72, 1.15);
      snout.position.set(0, -0.02, -0.26);
      snout.castShadow = true;
      headGrp.add(snout);

      var eyeMat = track(new THREE.MeshStandardMaterial({ color: 0xf6cf3a, roughness: 0.34, metalness: 0.25 }));
      var pupilMat = track(new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.22 }));
      var lidMat = track(new THREE.MeshStandardMaterial({ color: 0xffffff, map: skin.map, bumpMap: skin.bump, roughness: 0.44 }));
      [-1, 1].forEach(function (sd) {
        var eye = new THREE.Mesh(new THREE.SphereGeometry(0.072, 14, 12), eyeMat);
        eye.position.set(sd * 0.11, 0.085, -0.05);
        eye.scale.set(1, 1, 1.25);
        headGrp.add(eye);
        var pup = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), pupilMat);
        pup.position.set(sd * 0.126, 0.085, -0.104);
        pup.scale.set(0.6, 1, 1.4);
        headGrp.add(pup);
        var lid = new THREE.Mesh(new THREE.SphereGeometry(0.076, 12, 10), lidMat);
        lid.position.set(sd * 0.11, 0.098, -0.046);
        lid.scale.set(1, 0.68, 1.3);
        headGrp.add(lid);
      });

      var nostrilMat = track(new THREE.MeshStandardMaterial({ color: 0x24242c, roughness: 0.4 }));
      [-1, 1].forEach(function (sd) {
        var no = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), nostrilMat);
        no.position.set(sd * 0.045, 0.01, -0.35);
        headGrp.add(no);
      });

      var tongueMat = track(new THREE.MeshStandardMaterial({ color: 0xe8335f, roughness: 0.5 }));
      var tongueStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.24, 8), tongueMat);
      tongueStem.rotation.x = Math.PI / 2;
      tongueStem.position.set(0, -0.035, -0.42);
      headGrp.add(tongueStem);
      [-1, 1].forEach(function (sd) {
        var prong = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.011, 0.14, 6), tongueMat);
        prong.rotation.x = Math.PI / 2;
        prong.rotation.z = sd * 0.4;
        prong.position.set(sd * 0.032, -0.035, -0.6);
        headGrp.add(prong);
      });

      grp.add(headGrp);

      var tailMat = track(new THREE.MeshStandardMaterial({
        color: 0xffffff, map: skin.map, bumpMap: skin.bump, roughness: 0.5
      }));
      var tail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.26, 12), tailMat);
      var tailDir = new THREE.Vector3().subVectors(pts[pts.length - 1], pts[pts.length - 2]).normalize();
      tail.position.copy(pts[pts.length - 1]);
      tail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailDir);
      tail.castShadow = true;
      grp.add(tail);

      grp.userData.phase = idx * 0.7;
      grp.userData.baseY = 0;
      snakeGroups.push(grp);
      scene.add(grp);
    });

    var wood = makeWoodTextures();
    trackTexture(wood.map);
    trackTexture(wood.bump);
    var railMat = track(new THREE.MeshStandardMaterial({
      color: 0xffffff, map: wood.map, bumpMap: wood.bump, bumpScale: 0.02,
      roughness: 0.62, metalness: 0.06
    }));
    var rungMat = track(new THREE.MeshStandardMaterial({
      color: 0xf3ddb6, map: wood.map, bumpMap: wood.bump, bumpScale: 0.02,
      roughness: 0.58, metalness: 0.08
    }));
    var capMat = track(new THREE.MeshStandardMaterial({ color: 0x6b4a25, roughness: 0.5, metalness: 0.35 }));
    SNL.ladderList().forEach(function (l) {
      var a = cellCenter(l.from);
      var b = cellCenter(l.to);
      var dx = b.x - a.x, dz = b.z - a.z;
      var L = Math.sqrt(dx * dx + dz * dz);
      var railGap = 0.15;
      var railR = 0.045;
      var railGeo = track(new THREE.CylinderGeometry(railR, railR, L, 14));
      var rungGeo = track(new THREE.CylinderGeometry(0.03, 0.03, railGap * 2 + 0.04, 12));
      var capGeo = track(new THREE.CylinderGeometry(railR + 0.012, railR + 0.012, 0.05, 14));
      var grp = new THREE.Group();
      [-railGap, railGap].forEach(function (off) {
        var rail = new THREE.Mesh(railGeo, railMat);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(L / 2, 0, off);
        rail.castShadow = true;
        grp.add(rail);
        [0.01, L - 0.01].forEach(function (ex) {
          var cap = new THREE.Mesh(capGeo, capMat);
          cap.rotation.z = Math.PI / 2;
          cap.position.set(ex, 0, off);
          cap.castShadow = true;
          grp.add(cap);
        });
      });
      var rungCount = Math.max(4, Math.round(L / 0.5));
      for (var i = 1; i < rungCount; i++) {
        var rx = (L / rungCount) * i;
        var rung = new THREE.Mesh(rungGeo, rungMat);
        rung.rotation.x = Math.PI / 2;
        rung.position.set(rx, 0, 0);
        rung.castShadow = true;
        grp.add(rung);
      }
      grp.position.set(a.x, TILE_TOP + 0.06, a.z);
      grp.rotation.y = Math.atan2(-dz, dx);
      scene.add(grp);
    });

    function makeToken(color) {
      var grp = new THREE.Group();
      var mat = track(new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.4 }));
      var base = new THREE.Mesh(track(new THREE.CylinderGeometry(0.24, 0.28, 0.12, 24)), mat);
      base.position.y = 0.06;
      base.castShadow = true;
      grp.add(base);
      var stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.09, 0.14, 0.3, 20)), mat);
      stem.position.y = 0.27;
      stem.castShadow = true;
      grp.add(stem);
      var ball = new THREE.Mesh(track(new THREE.SphereGeometry(0.17, 22, 18)), mat);
      ball.position.y = 0.52;
      ball.castShadow = true;
      grp.add(ball);
      return grp;
    }

    var tokens = [makeToken(0x2f6bff), makeToken(0xe8354f)];
    var tokenFlags = [false, false];
    tokens.forEach(function (t) { scene.add(t); });

    var ringMat = track(new THREE.MeshBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.4, 28), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    scene.add(ring);

    var diceFaceValues = [3, 4, 1, 6, 2, 5];
    var diceMats = diceFaceValues.map(function (v) {
      var t = pipTexture(v);
      var m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.05 });
      resources.push({ material: { map: t, dispose: function () {} }, geometry: null });
      return m;
    });
    var diceGeom = track(new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE));
    var dice = new THREE.Mesh(diceGeom, diceMats);
    dice.castShadow = true;
    dice.position.set(0, DICE_SIZE / 2 + 0.02, BOARD_N * TILE / 2 + 2.2);
    scene.add(dice);

    var targetEuler = {
      1: new THREE.Euler(0, 0, 0),
      6: new THREE.Euler(Math.PI, 0, 0),
      3: new THREE.Euler(0, 0, Math.PI / 2),
      4: new THREE.Euler(0, 0, -Math.PI / 2),
      2: new THREE.Euler(-Math.PI / 2, 0, 0),
      5: new THREE.Euler(Math.PI / 2, 0, 0)
    };

    var anims = [];
    function addAnim(dur, update, done, delay) {
      anims.push({ t0: null, dur: dur, update: update, done: done, delay: delay || 0 });
    }

    var clock = new THREE.Clock();
    var elapsed = 0;
    var running = true;
    var diceHome = dice.position.clone();

    function stepAnims(dt) {
      for (var i = anims.length - 1; i >= 0; i--) {
        var a = anims[i];
        if (a.delay > 0) { a.delay -= dt; continue; }
        if (a.t0 === null) { a.t0 = 0; }
        a.t0 += dt;
        var k = Math.min(1, a.t0 / a.dur);
        a.update(k);
        if (k >= 1) {
          anims.splice(i, 1);
          if (a.done) { a.done(); }
        }
      }
    }

    function render() {
      if (!running) { return; }
      var dt = Math.min(0.05, clock.getDelta());
      elapsed += dt;
      stepAnims(dt);
      snakeGroups.forEach(function (g) {
        g.position.y = Math.sin(elapsed * 1.6 + g.userData.phase) * 0.03;
        g.rotation.z = Math.sin(elapsed * 1.2 + g.userData.phase) * 0.015;
      });
      if (ring.visible) {
        ring.scale.setScalar(1 + Math.sin(elapsed * 6) * 0.06);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function resize() {
      var w = container.clientWidth || 1;
      var h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function layoutTokens(positions, movingIndex) {
      for (var i = 0; i < tokens.length; i++) {
        if (i === movingIndex) { continue; }
        var c = cellCenter(positions[i]);
        var off = sharedOffset(positions, i);
        tokens[i].position.set(c.x + off.x, TILE_TOP, c.z + off.z);
      }
    }

    function sharedOffset(positions, i) {
      var other = 1 - i;
      if (positions[other] === positions[i]) {
        return i === 0 ? { x: -0.2, z: 0.14 } : { x: 0.2, z: -0.14 };
      }
      return { x: 0, z: 0 };
    }

    var positions = [1, 1];
    var activeIndex = 0;
    tokens[0].position.set(cellCenter(1).x - 0.2, TILE_TOP, cellCenter(1).z + 0.14);
    tokens[1].position.set(cellCenter(1).x + 0.2, TILE_TOP, cellCenter(1).z - 0.14);

    applyCamera();

    var ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(resize);
      ro.observe(container);
    }
    window.addEventListener("resize", resize);
    resize();

    var pointerActive = false;
    var pinchDist = 0;
    var lastX = 0, lastY = 0;

    function onPointerDown(e) {
      if (e.pointerType === "touch" && e.isPrimary === false) { return; }
      pointerActive = true;
      lastX = e.clientX; lastY = e.clientY;
      renderer.domElement.setPointerCapture && renderer.domElement.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
      if (!pointerActive) { return; }
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      cam.theta -= dx * 0.006;
      cam.phi -= dy * 0.006;
      applyCamera();
    }
    function onPointerUp(e) {
      pointerActive = false;
      renderer.domElement.releasePointerCapture && renderer.domElement.releasePointerCapture(e.pointerId);
    }
    function onWheel(e) {
      e.preventDefault();
      cam.radius += e.deltaY * 0.012;
      applyCamera();
    }
    function onTouchStart(e) {
      if (e.touches.length === 2) {
        pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }
    function onTouchMove(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        var d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (pinchDist > 0) {
          cam.radius += (pinchDist - d) * 0.03;
          pinchDist = d;
          applyCamera();
        }
      }
    }

    var el = renderer.domElement;
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    var sound = { enabled: false, ctx: null };
    function ensureSoundCtx() {
      if (!sound.ctx) {
        try { sound.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { sound.ctx = null; }
      }
      return sound.ctx;
    }
    function beep(freq, dur, type, gain, delay) {
      if (!sound.enabled) { return; }
      var ctx = ensureSoundCtx();
      if (!ctx) { return; }
      try {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = type || "sine";
        osc.frequency.value = freq;
        g.gain.value = 0;
        var t0 = ctx.currentTime + (delay || 0);
        g.gain.linearRampToValueAtTime(gain || 0.06, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      } catch (err) { /* audio optional */ }
    }
    function noiseBurst(dur, gain, delay, f0, f1) {
      if (!sound.enabled) { return; }
      var ctx = ensureSoundCtx();
      if (!ctx) { return; }
      try {
        var len = Math.max(1, Math.floor(ctx.sampleRate * (dur + 0.05)));
        var buf = ctx.createBuffer(1, len, ctx.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < len; i++) { data[i] = Math.random() * 2 - 1; }
        var src = ctx.createBufferSource();
        src.buffer = buf;
        var hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = f0 || 1000;
        var g = ctx.createGain();
        g.gain.value = 0;
        var t0 = ctx.currentTime + (delay || 0);
        g.gain.linearRampToValueAtTime(gain || 0.03, t0 + 0.025);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        if (f1 && hp.frequency.linearRampToValueAtTime) { hp.frequency.linearRampToValueAtTime(f1, t0 + dur); }
        src.connect(hp); hp.connect(g); g.connect(ctx.destination);
        src.start(t0); src.stop(t0 + dur + 0.06);
      } catch (err) { /* audio optional */ }
    }
    function sfxDice() {
      if (!sound.enabled) { return; }
      for (var i = 0; i < 8; i++) {
        beep(200 + Math.random() * 320, 0.035, "square", 0.032, i * 0.08);
        if (i % 3 === 0) { noiseBurst(0.04, 0.02, i * 0.08, 3000, 6000); }
      }
    }
    function sfxDiceLand() {
      beep(440, 0.06, "triangle", 0.05, 0);
      noiseBurst(0.05, 0.03, 0, 1500, 4000);
    }
    function sfxStep() {
      beep(300, 0.04, "triangle", 0.028, 0);
      noiseBurst(0.035, 0.016, 0, 2500, 5000);
    }
    function sfxSnake() {
      noiseBurst(0.55, 0.06, 0, 1800, 5200);
      beep(180, 0.5, "sawtooth", 0.03, 0.05);
    }
    function sfxLadder() {
      [392, 466, 587, 698, 880].forEach(function (f, i) {
        beep(f, 0.12, "triangle", 0.045, i * 0.09);
      });
    }
    function sfxWin() {
      [523, 659, 784, 1046].forEach(function (f, i) {
        beep(f, 0.22, "triangle", 0.07, i * 0.14);
      });
      beep(523, 0.5, "sine", 0.05, 0.6);
      beep(659, 0.5, "sine", 0.04, 0.6);
      beep(784, 0.5, "sine", 0.04, 0.6);
      noiseBurst(0.25, 0.02, 0.6, 4000, 8000);
    }

    var reducedMotion = false;
    function speed(ms) { return reducedMotion ? Math.min(ms, 120) : ms; }

    var controller = {
      ready: true,
      domElement: renderer.domElement,
      setSound: function (on) {
        sound.enabled = !!on;
        if (sound.enabled) {
          var ctx = ensureSoundCtx();
          try { if (ctx && ctx.resume) { ctx.resume(); } } catch (e) {}
        }
      },
      setReducedMotion: function (on) { reducedMotion = !!on; },
      setTurn: function (index) {
        ring.visible = true;
        activeIndex = index;
        ring.position.set(tokens[index].position.x, TILE_TOP + 0.02, tokens[index].position.z);
        ring.material.color.setHex(index === 0 ? 0x2f6bff : 0xe8354f);
      },
      hideTurn: function () {
        ring.visible = false;
      },
      sync: function (pos) {
        positions = pos.slice();
        layoutTokens(positions, -1);
        if (ring.visible && activeIndex != null) {
          ring.position.set(tokens[activeIndex].position.x, TILE_TOP + 0.02, tokens[activeIndex].position.z);
        }
      },
      animateRoll: function (value, cb) {
        var tgt = targetEuler[value] || targetEuler[1];
        var turns = 2 + Math.floor(Math.random() * 3);
        var start = new THREE.Euler(
          tgt.x - Math.PI * 2 * turns,
          tgt.y - Math.PI * 2 * (1 + Math.floor(Math.random() * 2)),
          tgt.z - Math.PI * 2 * turns
        );
        var hop = 0.5 + Math.random() * 0.4;
        var dur = speed(0.95) / 1000;
        sfxDice();
        addAnim(dur, function (k) {
          var e = easeOutCubic(k);
          dice.rotation.set(
            start.x + (tgt.x - start.x) * e,
            start.y + (tgt.y - start.y) * e,
            start.z + (tgt.z - start.z) * e
          );
          dice.position.y = diceHome.y + Math.sin(k * Math.PI) * hop;
          dice.position.x = diceHome.x + Math.sin(k * Math.PI) * 0.25;
        }, function () {
          dice.rotation.set(tgt.x, tgt.y, tgt.z);
          dice.position.copy(diceHome);
          beep(560, 0.1, "triangle", 0.06, 0);
          if (cb) { cb(); }
        });
      },
      animateMove: function (plan, playerIndex, cb) {
        var token = tokens[playerIndex];
        var waypoints = [];
        var start = { x: token.position.x, y: token.position.y, z: token.position.z };
        plan.path.forEach(function (sq, i) {
          var c = cellCenter(sq);
          waypoints.push({ x: c.x, y: TILE_TOP, z: c.z, dur: speed(i === 0 ? 0.2 : 0.17) / 1000, arc: 0.12 });
        });
        if (plan.special) {
          var c2 = cellCenter(plan.specialTo);
          waypoints.push({
            x: c2.x, y: TILE_TOP, z: c2.z,
            dur: speed(plan.special === "ladder" ? 0.9 : 0.75) / 1000,
            arc: plan.special === "ladder" ? 0.6 : 0.2,
            special: plan.special
          });
        }
        if (waypoints.length === 0) {
          if (cb) { cb(); }
          return;
        }
        var total = waypoints.reduce(function (s, w) { return s + w.dur; }, 0);
        var segStart = [];
        var acc = 0;
        waypoints.forEach(function (w) { segStart.push(acc); acc += w.dur; });
        var prev = start;
        var lastSeg = -1;
        addAnim(total, function (k) {
          var time = k * total;
          var si = 0;
          while (si < waypoints.length - 1 && time > segStart[si] + waypoints[si].dur) { si++; }
          var w = waypoints[si];
          var local = Math.min(1, (time - segStart[si]) / w.dur);
          var from = si === 0 ? start : waypoints[si - 1];
          var e = easeInOutCubic(local);
          var x = from.x + (w.x - from.x) * e;
          var z = from.z + (w.z - from.z) * e;
          var y = TILE_TOP + Math.sin(local * Math.PI) * w.arc;
          token.position.set(x, y, z);
          if (si !== lastSeg) {
            lastSeg = si;
            if (w.special === "snake") { sfxSnake(); }
            else if (w.special === "ladder") { sfxLadder(); }
            else { sfxStep(); }
          }
        }, function () {
          positions[playerIndex] = plan.to;
          layoutTokens(positions, -1);
          if (cb) { cb(); }
        });
      },
      celebrate: function (playerIndex) {
        var token = tokens[playerIndex];
        var baseY = TILE_TOP;
        sfxWin();
        addAnim(speed(1.6) / 1000, function (k) {
          token.position.y = baseY + Math.abs(Math.sin(k * Math.PI * 3)) * 0.6;
          token.rotation.y = k * Math.PI * 4;
        }, function () {
          token.position.y = baseY;
        });
      },
      reset: function () {
        positions = [1, 1];
        tokens.forEach(function (t, i) {
          var c = cellCenter(1);
          var off = sharedOffset(positions, i);
          t.position.set(c.x + off.x, TILE_TOP, c.z + off.z);
          t.rotation.set(0, 0, 0);
        });
        dice.rotation.set(0, 0, 0);
        dice.position.copy(diceHome);
        anims.length = 0;
        controller.setTurn(0);
      },
      resetCamera: function () {
        cam.radius = 16; cam.theta = 0; cam.phi = 0.82;
        applyCamera();
      },
      dispose: function () {
        running = false;
        if (ro) { ro.disconnect(); }
        window.removeEventListener("resize", resize);
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", onPointerUp);
        el.removeEventListener("pointercancel", onPointerUp);
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        disposer(resources)();
        scene.traverse(function (o) {
          if (o.geometry) { o.geometry.dispose(); }
          if (o.material) {
            var mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach(function (m) { if (m.map) { m.map.dispose(); } m.dispose(); });
          }
        });
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };

    controller.setTurn(0);
    render();
    if (opts.onReady) { opts.onReady(controller); }
    return controller;
  }

  window.SNL3D = {
    create: create,
    isWebGLAvailable: isWebGLAvailable,
    VERSION: "1.1.0"
  };
})();
