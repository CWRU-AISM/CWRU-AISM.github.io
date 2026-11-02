// Dot-matrix globe with arcs from the lab to its collaborators.
// Reads its points from #globe[data-sites] and its colors from the CSS tokens,
// so it follows the light/dark theme.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const mount = document.getElementById('globe');
if (mount) init(mount).catch(() => mount.remove());

async function init(mount) {
  const sites = JSON.parse(mount.dataset.sites);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.z = 4.1;
  const globe = new THREE.Group();
  scene.add(globe);

  const toVec = (lat, lon, r = R) => {
    const p = THREE.MathUtils.degToRad(90 - lat), t = THREE.MathUtils.degToRad(lon + 180);
    return new THREE.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t));
  };

  // Land dots: a Fibonacci sphere filtered by an equirectangular land mask.
  const img = await new Promise((ok, fail) => {
    const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = mount.dataset.mask;
  });
  const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const mask = ctx.getImageData(0, 0, c.width, c.height).data;
  const land = [], N = 42000, golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, lat = Math.asin(y) * 180 / Math.PI;
    const lon = ((i * golden * 180 / Math.PI) % 360) - 180;
    const px = Math.floor((lon + 180) / 360 * c.width), py = Math.floor((90 - lat) / 180 * c.height);
    if (mask[(py * c.width + px) * 4] > 128) land.push(...toVec(lat, lon).toArray());
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(land, 3));
  const dotMat = new THREE.PointsMaterial({ size: 0.019, sizeAttenuation: true });
  globe.add(new THREE.Points(dotGeo, dotMat));

  // Body in the surface color: hides back-side dots and gives the globe an edge.
  const bodyMat = new THREE.MeshBasicMaterial();
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 64, 48), bodyMat));

  // Pins and arcs.
  const pinMat = new THREE.MeshBasicMaterial(), arcMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.85 });
  const home = sites[0], a = toVec(home.lat, home.lon);
  sites.forEach((s, i) => {
    const pin = new THREE.Mesh(new THREE.SphereGeometry(i ? 0.018 : 0.03, 16, 12), pinMat);
    pin.position.copy(toVec(s.lat, s.lon, R * 1.004));
    globe.add(pin);
    if (!i) return;
    const b = toVec(s.lat, s.lon), lift = 1 + 0.12 + a.distanceTo(b) * 0.22;
    const mid = a.clone().add(b).normalize().multiplyScalar(lift);
    const curve = new THREE.QuadraticBezierCurve3(a.clone().multiplyScalar(1.004), mid, b.clone().multiplyScalar(1.004));
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)), arcMat));
  });

  // Colors come from the CSS tokens; convert via a 1px canvas so oklch works.
  const px = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const css = (name) => {
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    px.fillRect(0, 0, 1, 1);
    const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
  };
  const paint = () => {
    dotMat.color = css('--muted'); bodyMat.color = css('--surface');
    pinMat.color = css('--accent'); arcMat.color = css('--accent');
  };
  paint();
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paint);

  // Start facing North America, tilted slightly.
  globe.rotation.set(0.3, 0.25, 0);

  // Drag to rotate.
  let drag = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    globe.rotation.y += (e.clientX - drag.x) * 0.006;
    globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + (e.clientY - drag.y) * 0.004, -1.1, 1.1);
    drag = { x: e.clientX, y: e.clientY };
    if (reduce) render();
  });
  el.addEventListener('pointerup', () => { drag = null; });

  const resize = () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
  };
  const render = () => renderer.render(scene, camera);
  new ResizeObserver(resize).observe(mount);

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(mount);
  const tick = () => {
    if (visible && !drag && !reduce) globe.rotation.y += 0.0012;
    if (visible) render();
    requestAnimationFrame(tick);
  };
  resize();
  tick();
}
