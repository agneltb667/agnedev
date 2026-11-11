// Shaders GLSL de la scène. Unités : 1 unité = 2,5 m (bassin 20 × 10 = 50 m × 25 m).

export const POOL = { hx: 10, hz: 5, depth: 1.2, deck: 0.12 }
export const RIPPLES = 12

const common = /* glsl */ `
uniform float uTime;
uniform float uBlueprint;
uniform float uSunset;
uniform vec3 uSunDir;
uniform vec4 uRipples[${RIPPLES}];

// Houle douce + ondes circulaires déclenchées par la souris
float waveHeight(vec2 p) {
  float t = uTime;
  float h = 0.0;
  h += sin(p.x * 0.55 + t * 0.9) * 0.035;
  h += sin(p.y * 0.8 - t * 1.1 + p.x * 0.3) * 0.03;
  h += sin((p.x + p.y) * 1.7 + t * 1.6) * 0.012;
  h += sin((p.x - p.y) * 2.6 - t * 2.1) * 0.007;
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = t - r.z;
    if (age < 0.0 || age > 4.0) continue;
    float d = distance(p, r.xy);
    float front = age * 2.4;
    float env = exp(-abs(d - front) * 1.5) * exp(-age * 0.9) * r.w;
    h += sin((d - front) * 6.0) * env * 0.08;
  }
  return h;
}

vec3 waveNormal(vec2 p) {
  float e = 0.04;
  float h = waveHeight(p);
  return normalize(vec3(h - waveHeight(p + vec2(e, 0.0)), e, h - waveHeight(p + vec2(0.0, e))));
}

vec3 skyColor(vec3 dir) {
  float y = dir.y;
  vec3 top = mix(vec3(0.28, 0.54, 0.86), vec3(0.06, 0.09, 0.24), uSunset);
  vec3 hor = mix(vec3(0.80, 0.90, 0.97), vec3(1.0, 0.50, 0.27), uSunset);
  vec3 col = mix(hor, top, pow(clamp(y, 0.0, 1.0), 0.5));
  // bande rose au-dessus de l'horizon au coucher
  col = mix(col, vec3(0.86, 0.38, 0.45), uSunset * exp(-abs(y - 0.12) * 14.0) * 0.45);
  float s = max(dot(dir, uSunDir), 0.0);
  vec3 sunCol = mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.62, 0.32), uSunset);
  col += sunCol * (pow(s, 700.0) * 5.0 + pow(s, 10.0) * (0.15 + 0.5 * uSunset));
  col = mix(col, mix(vec3(0.55, 0.6, 0.62), vec3(0.22, 0.14, 0.18), uSunset), smoothstep(0.0, -0.2, y));
  return col;
}

vec3 blueprintColor(float g) {
  return mix(vec3(0.016, 0.07, 0.13), vec3(0.55, 0.86, 1.0), clamp(g, 0.0, 1.0));
}
`

const fragUtils = /* glsl */ `
float gridLines(vec2 p, float scale, float w) {
  vec2 q = p / scale;
  vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
  return 1.0 - min(min(g.x, g.y) / w, 1.0);
}

float caustics(vec2 p) {
  float t = uTime * 0.6;
  vec2 q = p * 1.3;
  float c = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    q += vec2(sin(q.y * 1.7 + t + fi), cos(q.x * 1.5 - t * 1.2 + fi * 1.3)) * 0.45;
    c += 1.0 / (1.0 + 18.0 * abs(sin(q.x + q.y * 0.6) * cos(q.y - q.x * 0.4)));
  }
  return pow(c / 3.0, 2.2);
}
`

const worldVert = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

/* ---------- Surface de l'eau ---------- */
export const waterShader = {
  vertexShader: common + /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  w.y += waveHeight(w.xz) * (1.0 - uBlueprint * 0.85);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,
  fragmentShader: common + fragUtils + /* glsl */ `
varying vec3 vWorld;
void main() {
  vec3 n = waveNormal(vWorld.xz);
  vec3 V = normalize(cameraPosition - vWorld);
  bool below = cameraPosition.y < vWorld.y;
  vec3 col;
  float alpha;

  if (!below) {
    float fres = pow(1.0 - max(dot(n, V), 0.0), 4.0);
    vec3 R = reflect(-V, n);
    vec3 deep = mix(vec3(0.0, 0.42, 0.55), vec3(0.02, 0.16, 0.26), uSunset);
    col = mix(deep, skyColor(R), 0.1 + fres * 0.85);
    float spec = pow(max(dot(R, uSunDir), 0.0), 240.0);
    col += spec * mix(vec3(1.0), vec3(1.0, 0.65, 0.35), uSunset) * 2.2;
    alpha = clamp(0.22 + fres * 0.8 + spec, 0.0, 1.0);
  } else {
    // Vue sous-marine : fenêtre de Snell, réflexion totale au-delà
    n = -n;
    float cosT = max(dot(n, V), 0.0);
    vec3 tir = vec3(0.05, 0.40, 0.50);
    vec3 refr = refract(-V, n, 1.33);
    vec3 sky = dot(refr, refr) > 0.0 ? skyColor(normalize(refr)) * 1.15 : tir;
    col = mix(tir, sky, smoothstep(0.6, 0.78, cosT));
    alpha = 0.94;
  }

  float g = gridLines(vWorld.xz, 1.0, 1.0) * 0.4 + gridLines(vWorld.xz, 5.0, 1.4);
  col = mix(col, vec3(0.55, 0.86, 1.0), uBlueprint);
  alpha = mix(alpha, g * 0.75, uBlueprint);
  gl_FragColor = vec4(col, alpha);
}`,
}

/* ---------- Bassin (fond + parois carrelés) ---------- */
export const poolShader = {
  vertexShader: worldVert,
  fragmentShader: common + fragUtils + /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  bool isFloor = vNormal.y > 0.5;
  vec2 uv = isFloor ? vWorld.xz : (abs(vNormal.x) > 0.5 ? vWorld.zy : vWorld.xy);

  // fausse réfraction : la surface agitée déforme le carrelage
  vec3 sn = waveNormal(vWorld.xz);
  vec2 shift = sn.xz * (cameraPosition.y > 0.0 ? 0.35 : 0.12);
  vec2 tp = uv + shift;

  vec3 col = vec3(0.56, 0.85, 0.93);
  if (isFloor) {
    vec2 q = vWorld.xz + shift;
    float d = abs(fract(q.y) - 0.5);
    // lignes de nage, avec la barre du « T » en bout de bassin
    float inLane = step(abs(q.y), 4.0);
    float lane = (1.0 - smoothstep(0.05, 0.07, d)) * inLane * (1.0 - smoothstep(8.4, 8.5, abs(q.x)));
    float tbar = (1.0 - smoothstep(0.05, 0.07, abs(abs(q.x) - 8.45))) * (1.0 - smoothstep(0.28, 0.3, d)) * inLane;
    col = mix(col, vec3(0.06, 0.18, 0.42), max(lane, tbar));
  }
  col = mix(col, vec3(0.93, 0.98, 1.0), gridLines(tp, 0.25, 1.0) * 0.35);

  float depthF = clamp(-vWorld.y / ${POOL.depth.toFixed(2)}, 0.0, 1.0);
  col *= mix(vec3(1.0), vec3(0.5, 0.82, 0.9), depthF);
  vec3 sunCol = mix(vec3(1.0), vec3(1.0, 0.7, 0.45), uSunset);
  col += caustics(tp * 0.9) * 0.55 * sunCol * (0.4 + 0.6 * depthF);
  col *= mix(1.0, 0.72, uSunset);

  if (cameraPosition.y < 0.0) {
    float fd = length(cameraPosition - vWorld);
    col = mix(col, vec3(0.03, 0.32, 0.42), 1.0 - exp(-fd * 0.1));
  }

  float g = gridLines(uv, 0.5, 1.0) * 0.3 + gridLines(uv, 2.5, 1.4) * 0.8;
  col = mix(col, blueprintColor(g), uBlueprint);
  gl_FragColor = vec4(col, 1.0);
}`,
}

/* ---------- Plage en pierre autour du bassin ---------- */
export const deckShader = {
  vertexShader: worldVert,
  fragmentShader: common + fragUtils + /* glsl */ `
varying vec3 vWorld;
void main() {
  vec2 p = vWorld.xz;
  float n = fract(sin(dot(floor(p / 1.2), vec2(12.9898, 78.233))) * 43758.5453);
  vec3 stone = mix(vec3(0.60, 0.62, 0.62), vec3(0.70, 0.71, 0.69), n);
  stone = mix(stone, stone * 0.8, gridLines(p, 1.2, 0.8));

  float rim = max(abs(p.x) - ${POOL.hx.toFixed(1)}, abs(p.y) - ${POOL.hz.toFixed(1)});
  stone = mix(vec3(0.94, 0.94, 0.91), stone, smoothstep(0.42, 0.5, rim));

  float diff = 0.6 + 0.4 * max(uSunDir.y, 0.0);
  vec3 light = mix(vec3(1.0), vec3(1.0, 0.64, 0.46), uSunset) * mix(1.0, 0.7, uSunset);
  vec3 col = stone * diff * light;

  float g = gridLines(p, 1.0, 1.0) * 0.22 + gridLines(p, 5.0, 1.2) * 0.55
          + (1.0 - smoothstep(0.0, 0.08, abs(rim)));
  col = mix(col, blueprintColor(g), uBlueprint);
  gl_FragColor = vec4(col, 1.0);
}`,
}

/* ---------- Océan au loin (Dakar est sur la mer) ---------- */
export const oceanShader = {
  vertexShader: worldVert,
  fragmentShader: common + fragUtils + /* glsl */ `
varying vec3 vWorld;
void main() {
  vec2 p = vWorld.xz;
  float t = uTime;
  vec3 n = normalize(vec3(
    sin(p.x * 0.08 + t * 0.6) * 0.05 + sin(p.x * 0.9 + p.y * 0.7 + t * 1.7) * 0.02,
    1.0,
    cos(p.y * 0.1 - t * 0.5) * 0.05 + sin(p.x * 0.6 - p.y * 0.9 + t * 1.3) * 0.02));
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 R = reflect(-V, n);
  float fres = pow(1.0 - max(dot(n, V), 0.0), 5.0);
  vec3 deep = mix(vec3(0.02, 0.17, 0.27), vec3(0.06, 0.07, 0.15), uSunset);
  vec3 col = mix(deep, skyColor(R), 0.15 + 0.85 * fres);
  col += pow(max(dot(R, uSunDir), 0.0), 300.0) * mix(vec3(1.0), vec3(1.0, 0.6, 0.3), uSunset) * 3.0;

  vec3 flat_ = normalize(vec3(p.x - cameraPosition.x, 0.001, p.y - cameraPosition.z));
  float d = length(p - cameraPosition.xz);
  col = mix(col, skyColor(flat_), smoothstep(120.0, 700.0, d));

  float g = gridLines(p, 10.0, 1.0) * (1.0 - smoothstep(40.0, 200.0, d)) * 0.5;
  col = mix(col, blueprintColor(g), uBlueprint);
  gl_FragColor = vec4(col, 1.0);
}`,
}

/* ---------- Ciel ---------- */
export const skyShader = {
  vertexShader: worldVert,
  fragmentShader: common + /* glsl */ `
varying vec3 vWorld;
void main() {
  vec3 dir = normalize(vWorld - cameraPosition);
  vec3 col = skyColor(dir);
  col = mix(col, vec3(0.016, 0.06, 0.11), uBlueprint);
  gl_FragColor = vec4(col, 1.0);
}`,
}
