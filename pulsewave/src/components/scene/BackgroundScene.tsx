"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function MouseTracker({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x += (mouseRef.current.x * 1.5 - groupRef.current.position.x) * 0.02;
    groupRef.current.position.y += (mouseRef.current.y * 1 - groupRef.current.position.y) * 0.02;
  });

  return <group ref={groupRef} />;
}

function Particles({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const count = 150;
  const mesh = useRef<THREE.Points>(null!);
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));
  const geometryRef = useRef<THREE.BufferGeometry>(null!);

  useEffect(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = velocitiesRef.current;

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i * 3) - 0.5) * 24;
      pos[i * 3 + 1] = (seededRandom(i * 3 + 1) - 0.5) * 16;
      pos[i * 3 + 2] = (seededRandom(i * 3 + 2) - 0.5) * 10;
      vel[i * 3] = (seededRandom(i * 3 + 100) - 0.5) * 0.004;
      vel[i * 3 + 1] = (seededRandom(i * 3 + 200) - 0.5) * 0.004;
      vel[i * 3 + 2] = (seededRandom(i * 3 + 300) - 0.5) * 0.002;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometryRef.current = geo;
  }, []);

  useFrame((state) => {
    if (!mesh.current || !geometryRef.current) return;
    const posAttr = mesh.current.geometry.attributes.position as THREE.BufferAttribute;
    if (!posAttr) return;
    const arr = posAttr.array as Float32Array;
    const vel = velocitiesRef.current;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += vel[i * 3];
      arr[i * 3 + 1] += vel[i * 3 + 1];
      arr[i * 3 + 2] += vel[i * 3 + 2];

      if (Math.abs(arr[i * 3]) > 12) vel[i * 3] *= -1;
      if (Math.abs(arr[i * 3 + 1]) > 8) vel[i * 3 + 1] *= -1;
      if (Math.abs(arr[i * 3 + 2]) > 5) vel[i * 3 + 2] *= -1;
    }

    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = Math.sin(t * 0.05) * 0.1 + mouseRef.current.x * 0.05;
    mesh.current.rotation.x = Math.cos(t * 0.03) * 0.05 + mouseRef.current.y * 0.03;

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        size={0.07}
        color="#00CFFF"
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Lines({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const lineRef = useRef<THREE.LineSegments>(null!);
  const count = 150;
  const maxDist = 2.2;

  const positionsRef = useRef<Float32Array>(new Float32Array(count * 3));
  const linePositionsRef = useRef<Float32Array>(new Float32Array(count * count * 6));
  const initializedRef = useRef(false);

  useEffect(() => {
    const pos = positionsRef.current;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i * 3 + 500) - 0.5) * 24;
      pos[i * 3 + 1] = (seededRandom(i * 3 + 600) - 0.5) * 16;
      pos[i * 3 + 2] = (seededRandom(i * 3 + 700) - 0.5) * 10;
    }
    initializedRef.current = true;
  }, []);

  useFrame(() => {
    if (!lineRef.current || !initializedRef.current) return;
    const posAttr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const positions = positionsRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    let idx = 0;

    for (let i = 0; i < count && idx < arr.length - 5; i++) {
      const xi = positions[i * 3] + mx * 0.3;
      const yi = positions[i * 3 + 1] + my * 0.2;
      const zi = positions[i * 3 + 2];

      for (let j = i + 1; j < count && idx < arr.length - 5; j++) {
        const xj = positions[j * 3] + mx * 0.3;
        const yj = positions[j * 3 + 1] + my * 0.2;
        const zj = positions[j * 3 + 2];

        const dx = xi - xj;
        const dy = yi - yj;
        const dz = zi - zj;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDist) {
          arr[idx++] = xi;
          arr[idx++] = yi;
          arr[idx++] = zi;
          arr[idx++] = xj;
          arr[idx++] = yj;
          arr[idx++] = zj;
        }
      }
    }

    for (; idx < arr.length; idx++) {
      arr[idx] = 0;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[linePositionsRef.current, 3]}
          count={linePositionsRef.current.length / 3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00CFFF"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function FloatingShapes({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null!);

  const shapes = [
    { pos: [-5, 2.5, -4] as [number, number, number], speed: 0.3, type: "icosahedron" as const, scale: 0.7 },
    { pos: [6, -1.5, -5] as [number, number, number], speed: 0.2, type: "octahedron" as const, scale: 0.55 },
    { pos: [-4, -2.5, -6] as [number, number, number], speed: 0.4, type: "torus" as const, scale: 0.6 },
    { pos: [5, 3.5, -7] as [number, number, number], speed: 0.15, type: "dodecahedron" as const, scale: 0.45 },
    { pos: [0, -3, -8] as [number, number, number], speed: 0.25, type: "torusKnot" as const, scale: 0.35 },
  ];

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    group.current.children.forEach((child, i) => {
      const s = shapes[i];
      child.rotation.x = t * s.speed * 0.5 + my * 0.1;
      child.rotation.y = t * s.speed * 0.3 + mx * 0.1;
      child.position.y = s.pos[1] + Math.sin(t * s.speed + i) * 0.6;
      child.position.x = s.pos[0] + Math.cos(t * s.speed * 0.7 + i) * 0.3;
    });
  });

  return (
    <group ref={group}>
      {shapes.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.scale}>
          {s.type === "icosahedron" && <icosahedronGeometry args={[1, 1]} />}
          {s.type === "octahedron" && <octahedronGeometry args={[1, 0]} />}
          {s.type === "torus" && <torusGeometry args={[0.8, 0.25, 8, 24]} />}
          {s.type === "dodecahedron" && <dodecahedronGeometry args={[1, 0]} />}
          {s.type === "torusKnot" && <torusKnotGeometry args={[0.5, 0.15, 64, 8]} />}
          <meshStandardMaterial
            color="#00CFFF"
            wireframe
            transparent
            opacity={0.25}
            emissive="#00CFFF"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function NeonLights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#00CFFF" />
      <pointLight position={[-10, -5, 5]} intensity={0.2} color="#0043FF" />
      <pointLight position={[0, 5, -5]} intensity={0.15} color="#20D7D4" />
    </>
  );
}

export default function BackgroundScene() {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <MouseTracker mouseRef={mouseRef} />
        <NeonLights />
        <Particles mouseRef={mouseRef} />
        <Lines mouseRef={mouseRef} />
        <FloatingShapes mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}
