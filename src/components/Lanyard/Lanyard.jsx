/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import cardGLB from "./card.glb?url";
import lanyardTexture from "./lanyard.png?url";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({
  onRelease,
  retracting = false,
  frontTextureUrl = "/assets/activities/solo-lanyard-card-web.png",
  backTextureUrl = "/assets/activities/solo-lanyard-card-back-web.png",
}) {
  return (
    <div className={`lanyard-wrapper${retracting ? " isRetracting" : ""}`}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 20 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI * 0.85} />
        <directionalLight position={[3, 5, 6]} intensity={3.2} />
        <pointLight position={[-4, -2, 8]} intensity={18} color="#c084fc" />
        <Suspense fallback={null}>
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band onRelease={onRelease} frontTextureUrl={frontTextureUrl} backTextureUrl={backTextureUrl} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}

export function LanyardCluster({ cards, onRelease, retracting = false }) {
  return (
    <div className={`lanyard-cluster-wrapper${retracting ? " isRetracting" : ""}`}>
      <Canvas
        camera={{ position: [0, 0, 34], fov: 20 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI * 0.85} />
        <directionalLight position={[3, 5, 6]} intensity={3.2} />
        <pointLight position={[-4, -2, 8]} intensity={18} color="#c084fc" />
        <Suspense fallback={null}>
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
            {cards.map((card, index) => (
              <Band
                key={card.title}
                onRelease={onRelease}
                frontTextureUrl={card.frontTextureUrl}
                backTextureUrl={card.backTextureUrl}
                originX={(index - (cards.length - 1) / 2) * 3.35}
                originY={index % 2 === 0 ? 0 : 0.55}
                initialTilt={index % 2 === 0 ? -0.04 : 0.05}
                scale={1.15}
              />
            ))}
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, onRelease, frontTextureUrl, backTextureUrl, originX = 0, originY = 0, initialTilt = 0, scale = 2.25 }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const segmentProps = { type: "dynamic", canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useLoader(GLTFLoader, cardGLB);
  const texture = useLoader(THREE.TextureLoader, lanyardTexture);
  const [frontTexture, backTexture] = useLoader(THREE.TextureLoader, [frontTextureUrl, backTextureUrl]);
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (!hovered) return undefined;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }

    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  [frontTexture, backTexture].forEach((cardTexture) => {
    cardTexture.colorSpace = THREE.SRGBColorSpace;
    cardTexture.anisotropy = 16;
  });

  const releaseCard = (event) => {
    event.target.releasePointerCapture(event.pointerId);
    drag(false);
    onRelease?.();
  };

  return (
    <>
      <group position={[originX, 4 + originY, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={scale}
            rotation={[0, 0, initialTilt]}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={releaseCard}
            onPointerDown={(event) => {
              event.target.setPointerCapture(event.pointerId);
              drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                color="#f8f5ff"
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[1.58, 2.22]} />
              <meshBasicMaterial map={frontTexture} transparent side={THREE.FrontSide} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -0.018]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.58, 2.22]} />
              <meshBasicMaterial map={backTexture} transparent side={THREE.FrontSide} toneMapped={false} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={[1000, 1000]} useMap map={texture} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}
