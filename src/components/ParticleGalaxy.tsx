'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * GLSL particle "galaxy" that morphs between an astrolabe ring, a DNA helix
 * and a heart (click to evolve). Ported from VoXelo's CodePen
 * (https://codepen.io/VoXelo/pen/NPbGqrx) — the shaders are verbatim; sizing,
 * pointer input and the animation loop are scoped to this component's container
 * instead of the window so it can live inside a layout (e.g. the hero's left
 * column) without hijacking the page.
 */
export function ParticleGalaxy({
  className,
  particleCount = 70000,
}: {
  className?: string;
  particleCount?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const size = () => ({
      w: container.clientWidth || 1,
      h: container.clientHeight || 1,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

    const updateCameraZ = () => {
      const { w, h } = size();
      const aspect = w / h;
      const maxShapeExtent = 38.0;
      const fovRad = (camera.fov * Math.PI) / 180;
      let requiredZ = maxShapeExtent / Math.tan(fovRad / 2);
      if (aspect < 1.0) requiredZ /= aspect;
      camera.position.z = requiredZ;
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const applySize = () => {
      const { w, h } = size();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      updateCameraZ();
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
    };

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const ids = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      ids[i] = i / particleCount;
      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aId', new THREE.BufferAttribute(ids, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 0.0 },
        uCurrentShape: { value: 0 },
        uTargetShape: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uMorphProgress;
        uniform int uCurrentShape;
        uniform int uTargetShape;
        uniform vec2 uMouse;

        attribute float aId;
        attribute vec3 aRandom;

        varying vec3 vColor;
        varying float vAlpha;

        #define PI 3.14159265359

        vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
            return a + b*cos( 6.28318*(c*t+d) );
        }

        vec3 getAstrolabe(float id, vec3 rnd) {
            vec3 pos;
            if (rnd.x > 0.3) {
                float t = id * PI * 2.0;
                float u = t * 13.0;
                float v = t * 8.0;
                float r = 12.0 + 3.0 * cos(v);
                pos = vec3(r * cos(u), r * sin(u), 4.0 * sin(v));
                float noiseAngle = rnd.y * PI * 2.0;
                float noiseRadius = rnd.z * 1.5;
                pos += vec3(cos(noiseAngle), sin(noiseAngle), cos(noiseAngle)) * noiseRadius;
            } else {
                // Thin ring stroke — collapse particles onto a clean circle
                // (no radial noise, y=0) so the band reads as a luminous LINE
                // rather than scattered dots. The brightness/size streak is
                // animated per-particle in main() for the galaxy-arm feel.
                float ringIdx = floor(rnd.y * 3.0);
                float angle = id * PI * 2.0 * 1000.0 + uTime * 0.2 * (ringIdx > 1.0 ? -1.0 : 1.0);
                float r = 24.0 + ringIdx * 4.0;
                pos = vec3(r * cos(angle), 0.0, r * sin(angle));
                float tilt = 0.5 + ringIdx * 0.8;
                float rotX = cos(tilt); float rotY = sin(tilt);
                pos.yz = mat2(rotX, -rotY, rotY, rotX) * pos.yz;
                pos.xy = mat2(rotX, -rotY, rotY, rotX) * pos.xy;
            }
            return pos * 0.85;
        }

        vec3 getDNA(float id, vec3 rnd) {
            float h = (id - 0.5) * 75.0;
            float angle = h * 0.5 + uTime * 0.5;
            float radius = 16.0;
            float strand = step(0.5, rnd.x);
            angle += strand * PI;
            vec3 pos = vec3(cos(angle) * radius, h, sin(angle) * radius);
            float rungZone = fract(h * 0.5);
            if (rungZone < 0.15 && rnd.y > 0.4) {
                float span = (rnd.z * 2.0 - 1.0);
                pos = vec3(span * cos(angle - strand*PI) * radius, h, span * sin(angle - strand*PI) * radius);
            } else {
                pos += (rnd - 0.5) * 1.0;
            }
            return pos;
        }

        vec3 getHeart(float id, vec3 rnd) {
            float u = rnd.x * PI * 2.0;
            float v = acos(2.0 * rnd.y - 1.0);
            float x = 16.0 * pow(sin(u), 3.0);
            float y = 13.0 * cos(u) - 5.0 * cos(2.0 * u) - 2.0 * cos(3.0 * u) - cos(4.0 * u) + 3.0;
            float z = 5.0 * cos(v);
            vec3 pos = vec3(x, y, z);
            float layer = floor(rnd.z * 3.0);
            float scale = 1.0 - (layer * 0.35);
            float beat = 1.0 + pow(sin(uTime * 3.0 - layer * 0.8), 8.0) * 0.12;
            return pos * scale * beat * 1.5;
        }

        vec3 getShapePosition(int shape, float id, vec3 rnd) {
            if (shape == 0) return getAstrolabe(id, rnd);
            if (shape == 1) return getDNA(id, rnd);
            if (shape == 2) return getHeart(id, rnd);
            return vec3(0.0);
        }

        vec3 getShapeColor(int shape, float id, vec3 rnd) {
            if (shape == 0) {
                if (rnd.x <= 0.3) {
                    // Outer 3 rings — solid navy band.
                    return vec3(0.12, 0.18, 0.44);
                }
                // Inner helical — brand colour ramp taken from /home/cta-glow.svg
                // (#0E58F8 vivid blue → #6092FF medium blue → #7A33F3 purple →
                // #CDB1FF light lavender). rnd.y picks each particle's position
                // along the ramp so they smoothly span all four brand hues.
                vec3 brandA = vec3(0.055, 0.345, 0.973);
                vec3 brandB = vec3(0.376, 0.573, 1.000);
                vec3 brandC = vec3(0.478, 0.200, 0.953);
                vec3 brandD = vec3(0.804, 0.694, 1.000);
                float t = rnd.y * 3.0;
                if (t < 1.0) return mix(brandA, brandB, t);
                if (t < 2.0) return mix(brandB, brandC, t - 1.0);
                return mix(brandC, brandD, t - 2.0);
            }
            if (shape == 1) {
                float h = (id - 0.5) * 60.0;
                float rungZone = fract(h * 0.5);
                if(rungZone < 0.15 && rnd.y > 0.4) return vec3(0.0, 0.9, 0.4);
                return palette(id * 0.1, vec3(0.2, 0.6, 0.8), vec3(0.1, 0.3, 0.4), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.2, 0.4));
            }
            if (shape == 2) {
                float layer = floor(rnd.z * 3.0);
                if (layer == 2.0) return vec3(1.0, 0.6, 0.8);
                return palette(id, vec3(0.9, 0.1, 0.2), vec3(0.3, 0.0, 0.1), vec3(1.0, 0.5, 0.5), vec3(0.0, 0.0, 0.0));
            }
            return vec3(1.0);
        }

        float cubicInOut(float t) {
            return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
        }

        void main() {
            vec3 p1 = getShapePosition(uCurrentShape, aId, aRandom);
            vec3 p2 = getShapePosition(uTargetShape, aId, aRandom);
            vec3 c1 = getShapeColor(uCurrentShape, aId, aRandom);
            vec3 c2 = getShapeColor(uTargetShape, aId, aRandom);

            float easedMorph = cubicInOut(uMorphProgress);
            vec3 finalPos = mix(p1, p2, easedMorph);

            float breatheMask = sin(uMorphProgress * PI);
            finalPos += normalize(finalPos) * breatheMask * 8.0;

            float autoRot1 = (uCurrentShape == 2) ? 0.0 : uTime * 0.06;
            float autoRot2 = (uTargetShape == 2) ? 0.0 : uTime * 0.06;
            float rotY = mix(autoRot1, autoRot2, easedMorph) + uMouse.x * 0.8;
            float rotX = uMouse.y * 0.8;

            mat3 rotMatY = mat3(
                cos(rotY), 0.0, sin(rotY),
                0.0, 1.0, 0.0,
                -sin(rotY), 0.0, cos(rotY)
            );
            mat3 rotMatX = mat3(
                1.0, 0.0, 0.0,
                0.0, cos(rotX), -sin(rotX),
                0.0, sin(rotX), cos(rotX)
            );
            finalPos = rotMatY * rotMatX * finalPos;

            vColor = mix(c1, c2, easedMorph);
            vAlpha = 0.28 + 0.6 * sin(uTime * 5.0 + aId * PI * 20.0);

            // Ring particles (shape-0, aRandom.x <= 0.3) are HIDDEN here — the
            // 3 outer rings are rendered as actual TorusGeometry meshes (true
            // continuous lines) outside the points system, with their own
            // shader doing the traveling streak.
            if (uCurrentShape == 0 && aRandom.x <= 0.3) {
                vAlpha = 0.0;
            }

            vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = (2.0 + aRandom.x * 2.5) * (40.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            vec2 uv = gl_PointCoord.xy - vec2(0.5);
            float dist = length(uv);
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.1, dist);
            gl_FragColor = vec4(vColor, alpha * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particles.scale.setScalar(1.5);
    scene.add(particles);

    // DISABLED (kept for later restoration): 3 outer navy streak rings. To
    // restore, uncomment this block + the ringMeshes update in animate + the
    // dispose in cleanup. Behaviour: true line strokes (TorusGeometry) with a
    // traveling brightness/alpha wave around each ring (4 luminous arcs).
    /*
    const ringMeshes: THREE.Mesh[] = [];
    const ringVertex = `
      uniform float uTime;
      uniform float uRingIdx;
      uniform vec2 uMouse;
      varying float vU;
      void main() {
        vU = uv.x;
        vec3 p = position;
        float tilt = 0.5 + uRingIdx * 0.8;
        float ct = cos(tilt); float st = sin(tilt);
        p.yz = mat2(ct, -st, st, ct) * p.yz;
        p.xy = mat2(ct, -st, st, ct) * p.xy;
        float autoRot = uTime * 0.06;
        float rotY = autoRot + uMouse.x * 0.8;
        float rotX = uMouse.y * 0.8;
        mat3 rotMatY = mat3(
          cos(rotY), 0.0, sin(rotY),
          0.0, 1.0, 0.0,
          -sin(rotY), 0.0, cos(rotY)
        );
        mat3 rotMatX = mat3(
          1.0, 0.0, 0.0,
          0.0, cos(rotX), -sin(rotX),
          0.0, sin(rotX), cos(rotX)
        );
        p = rotMatY * rotMatX * p;
        p *= 0.85; // match getAstrolabe's overall scale
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `;
    const ringFragment = `
      uniform float uTime;
      uniform float uRingIdx;
      varying float vU;
      #define PI 3.14159265359
      void main() {
        float spinDir = (uRingIdx > 1.0) ? -1.0 : 1.0;
        // 4 luminous arcs flowing around the ring (~0.6 rad/s).
        float wave = 0.5 + 0.5 * sin(vU * PI * 2.0 * 4.0 - uTime * 2.5 * spinDir);
        float alpha = 0.35 + 0.9 * wave;
        vec3 navy = vec3(0.12, 0.18, 0.44);
        gl_FragColor = vec4(navy * (0.55 + 0.8 * wave), alpha);
      }
    `;
    for (let i = 0; i < 3; i++) {
      const radius = 24.0 + i * 4.0;
      const torusGeom = new THREE.TorusGeometry(radius, 0.25, 8, 256);
      // Default torus lies in XY plane (Z axis). Flip to XZ plane to match the
      // astrolabe ring initial orientation before the tilt rotation in shader.
      torusGeom.rotateX(Math.PI / 2);
      const ringMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uRingIdx: { value: i },
          uMouse: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const ring = new THREE.Mesh(torusGeom, ringMat);
      scene.add(ring);
      ringMeshes.push(ring);
    }
    */

    // Glass-sphere wrapper — a faint white wireframe sphere enclosing the
    // navy streak rings, suggesting a slightly translucent glass container
    // around the whole composition. Radius is sized just past the outermost
    // ring (32), then scaled by the same 0.85 the astrolabe uses.
    const glassSphere = new THREE.Mesh(
      new THREE.SphereGeometry(36, 18, 12),
      new THREE.MeshBasicMaterial({
        color: 0xc7d0e0,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    );
    glassSphere.scale.setScalar(0.85);
    scene.add(glassSphere);

    let morphProgress = 0;
    let currentShape = 0;
    const targetShape = 0;
    let isTransitioning = false;
    // const TOTAL_SHAPES = 3; // click-to-morph disabled (see triggerMorph below)

    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    // DISABLED (kept for later): click-to-morph between galaxy / DNA / heart.
    // To restore shape cycling, uncomment this fn, TOTAL_SHAPES above, and the
    // two click listeners (add here + remove in cleanup).
    // const triggerMorph = () => {
    //   if (!isTransitioning) {
    //     targetShape = (targetShape + 1) % TOTAL_SHAPES;
    //     isTransitioning = true;
    //     morphProgress = 0;
    //   }
    // };
    // Scope input to the container so it never hijacks page clicks/scroll.
    container.addEventListener('pointermove', onPointerMove);
    // container.addEventListener("click", triggerMorph);

    const ro = new ResizeObserver(applySize);
    ro.observe(container);
    applySize();

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      mouse.x += (targetMouse.x - mouse.x) * delta * 3.0;
      mouse.y += (targetMouse.y - mouse.y) * delta * 3.0;

      if (isTransitioning) {
        morphProgress += delta * 0.8;
        if (morphProgress >= 1) {
          morphProgress = 0;
          currentShape = targetShape;
          isTransitioning = false;
        }
      }

      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uMorphProgress.value = morphProgress;
      material.uniforms.uCurrentShape.value = currentShape;
      material.uniforms.uTargetShape.value = targetShape;
      material.uniforms.uMouse.value.copy(mouse);

      // DISABLED: ring mesh sync (see comment by ring creation above).
      /*
      const ringsActive = currentShape === 0 && targetShape === 0;
      for (const ring of ringMeshes) {
        ring.visible = ringsActive;
        const m = ring.material as THREE.ShaderMaterial;
        m.uniforms.uTime.value = elapsedTime;
        m.uniforms.uMouse.value.copy(mouse);
      }
      */
      // Glass sphere wrapper rotates with the same auto-spin + mouse tilt as
      // the points, so it reads as one coordinated assembly. Visible only on
      // shape 0 (currently always, since click-to-morph is disabled).
      glassSphere.visible = currentShape === 0 && targetShape === 0;
      glassSphere.rotation.y = elapsedTime * 0.01 + mouse.x * 0.8;
      glassSphere.rotation.x = mouse.y * 0.8;

      renderer.render(scene, camera);
    };
    animate();

    // Pause when the tab is hidden to save the GPU.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        clock.getDelta();
        animate();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      container.removeEventListener('pointermove', onPointerMove);
      // container.removeEventListener("click", triggerMorph);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      // DISABLED: ring mesh dispose (see comment by ring creation).
      /*
      for (const ring of ringMeshes) {
        ring.geometry.dispose();
        (ring.material as THREE.ShaderMaterial).dispose();
      }
      */
      glassSphere.geometry.dispose();
      (glassSphere.material as THREE.MeshBasicMaterial).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount]);

  return <div ref={containerRef} className={className} aria-hidden />;
}
