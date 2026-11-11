'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { scroll, pointer, setReady } from '@/lib/store'
import { POOL, RIPPLES, waterShader, poolShader, deckShader, oceanShader, skyShader } from './shaders'

// Uniformes partagés par tous les matériaux : un seul objet par uniforme
const U = {
  uTime: { value: 0 },
  uBlueprint: { value: 0 },
  uSunset: { value: 0 },
  uSunDir: { value: new THREE.Vector3(0.3, 0.8, 0.2).normalize() },
  uRipples: { value: Array.from({ length: RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)) },
}

const DAY_SUN = new THREE.Vector3(0.35, 0.85, 0.25).normalize()
const SET_SUN = new THREE.Vector3(1, 0.06, -0.28).normalize()

// Trajectoire de la caméra, indexée sur la progression globale du scroll (0 → 1)
const KEYFRAMES = [
  { p: 0.0, pos: [0, 22, 0.01], tgt: [0, 0, 0], drone: true },
  { p: 0.14, pos: [0, 20, 2], tgt: [0, 0, 0], drone: true },
  { p: 0.26, pos: [-1, 7, 7], tgt: [1, -0.4, 0] },
  { p: 0.36, pos: [-3, 0.35, 3], tgt: [3, -0.5, -0.5] },
  { p: 0.46, pos: [-5, -0.65, 1.2], tgt: [6, -0.85, -1] },
  { p: 0.6, pos: [17, 12, 17], tgt: [0, -0.6, 0], fit: true },
  { p: 0.76, pos: [-15, 10, 15], tgt: [0, -0.6, 0], fit: true },
  { p: 0.86, pos: [-12.5, 2.4, 2.5], tgt: [30, 1.6, -8] },
  { p: 1.0, pos: [-14, 2.8, 3.5], tgt: [30, 2.2, -9] },
]

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

const _a = new THREE.Vector3()
const _b = new THREE.Vector3()

function keyPos(k, aspect, out) {
  out.set(...k.pos)
  if (aspect < 1) {
    // Portrait : le bassin passe à la verticale et la caméra recule
    if (k.drone) out.set(k.pos[2] || 0.01, k.pos[1] * 1.35, 0)
    if (k.fit) out.sub(_b.set(...k.tgt)).multiplyScalar(1.45).add(_b)
  }
  return out
}

function sampleCamera(p, aspect, pos, tgt) {
  let i = 0
  while (i < KEYFRAMES.length - 2 && p > KEYFRAMES[i + 1].p) i++
  const k0 = KEYFRAMES[i]
  const k1 = KEYFRAMES[i + 1]
  const t = smooth(k0.p, k1.p, p)
  pos.lerpVectors(keyPos(k0, aspect, _a), keyPos(k1, aspect, pos), t)
  tgt.lerpVectors(_a.set(...k0.tgt), _b.set(...k1.tgt), t)
}

function Rig() {
  const { camera, size } = useThree()
  const s = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      look: new THREE.Vector3(),
      ray: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      hit: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
      last: { t: 0, x: 999, z: 999 },
      idx: 0,
      frames: 0,
      init: false,
      hud: null,
    }),
    []
  )

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const p = scroll.progress
    const aspect = size.width / size.height
    U.uTime.value = t
    U.uBlueprint.value = smooth(0.5, 0.58, p) * (1 - smooth(0.77, 0.85, p))
    U.uSunset.value = smooth(0.8, 0.97, p)
    U.uSunDir.value.copy(DAY_SUN).lerp(SET_SUN, U.uSunset.value).normalize()

    sampleCamera(p, aspect, s.pos, s.tgt)
    // légère parallaxe à la souris (coupée sous l'eau pour ne pas traverser la surface)
    const par = s.pos.y > 1 ? 1 : 0.25
    s.pos.x += pointer.x * 0.5 * par
    s.pos.z -= pointer.y * 0.35 * par

    if (!s.init) {
      camera.position.copy(s.pos)
      s.look.copy(s.tgt)
      s.init = true
    }
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 3.2)
    camera.position.lerp(s.pos, k)
    s.look.lerp(s.tgt, k)
    camera.lookAt(s.look)

    // Ondulations : intersection du pointeur avec le plan d'eau
    if (pointer.moved && t - s.last.t > 0.06 && camera.position.y > 0.5 && U.uBlueprint.value < 0.5) {
      pointer.moved = false
      s.ray.setFromCamera(s.ndc.set(pointer.x, pointer.y), camera)
      if (s.ray.ray.intersectPlane(s.plane, s.hit) && Math.abs(s.hit.x) < POOL.hx && Math.abs(s.hit.z) < POOL.hz) {
        const dx = s.hit.x - s.last.x
        const dz = s.hit.z - s.last.z
        if (dx * dx + dz * dz > 0.2) {
          U.uRipples.value[s.idx++ % RIPPLES].set(s.hit.x, s.hit.z, t, 1)
          s.last = { t, x: s.hit.x, z: s.hit.z }
        }
      }
    }

    // Altimètre (1 unité = 2,5 m)
    s.hud ||= document.getElementById('hud-alt')
    if (s.hud) {
      const m = camera.position.y * 2.5
      s.hud.textContent = m >= 0 ? `Alt +${m.toFixed(1)} m` : `Prof ${m.toFixed(1)} m`
    }

    if (++s.frames === 3) setReady()
  })

  return null
}

function useShader(def, extra) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { ...U },
        vertexShader: def.vertexShader,
        fragmentShader: def.fragmentShader,
        ...extra,
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )
}

function Pool() {
  const { hx, hz, depth, deck } = POOL
  const wallH = depth + deck
  const wallY = (deck - depth) / 2
  const water = useShader(waterShader, { transparent: true, depthWrite: false, side: THREE.DoubleSide })
  const tiles = useShader(poolShader)
  const stone = useShader(deckShader)

  const deckGeo = useMemo(() => {
    const R = 28
    const shape = new THREE.Shape()
    shape.moveTo(-R, -R).lineTo(R, -R).lineTo(R, R).lineTo(-R, R).lineTo(-R, -R)
    const hole = new THREE.Path()
    hole.moveTo(-hx, -hz).lineTo(-hx, hz).lineTo(hx, hz).lineTo(hx, -hz).lineTo(-hx, -hz)
    shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape)
  }, [hx, hz])

  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(hx * 2, wallH, hz * 2)), [hx, hz, wallH])
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#8fdcff', transparent: true, opacity: 0 }), [])
  const bubbles = useRef()

  useFrame(({ camera }) => {
    edgeMat.opacity = U.uBlueprint.value
    if (bubbles.current) bubbles.current.visible = camera.position.y < 0.2
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={water} renderOrder={2}>
        <planeGeometry args={[hx * 2, hz * 2, 160, 80]} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position-y={-depth} material={tiles}>
        <planeGeometry args={[hx * 2, hz * 2]} />
      </mesh>
      <mesh rotation-y={-Math.PI / 2} position={[hx, wallY, 0]} material={tiles}>
        <planeGeometry args={[hz * 2, wallH]} />
      </mesh>
      <mesh rotation-y={Math.PI / 2} position={[-hx, wallY, 0]} material={tiles}>
        <planeGeometry args={[hz * 2, wallH]} />
      </mesh>
      <mesh rotation-y={Math.PI} position={[0, wallY, hz]} material={tiles}>
        <planeGeometry args={[hx * 2, wallH]} />
      </mesh>
      <mesh position={[0, wallY, -hz]} material={tiles}>
        <planeGeometry args={[hx * 2, wallH]} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position-y={deck} geometry={deckGeo} material={stone} />
      <lineSegments geometry={edges} material={edgeMat} position-y={wallY} />

      <group ref={bubbles} visible={false}>
        <Sparkles count={140} scale={[hx * 1.8, depth * 0.9, hz * 1.8]} position-y={-depth / 2} size={2.5} speed={0.35} color="#c8f6ff" opacity={0.7} />
      </group>
    </group>
  )
}

function Surroundings() {
  const ocean = useShader(oceanShader)
  const sky = useShader(skyShader, { side: THREE.BackSide, depthWrite: false })
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-4} material={ocean}>
        <planeGeometry args={[2400, 2400]} />
      </mesh>
      <mesh material={sky} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[1000, 48, 24]} />
      </mesh>
    </>
  )
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 1.75]}
        camera={{ fov: 45, near: 0.05, far: 2500, position: [0, 22, 0.01] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Rig />
        <Pool />
        <Surroundings />
      </Canvas>
    </div>
  )
}
