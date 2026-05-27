"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

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
  particleCount = 50000,
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const applySize = () => {
      const { w, h } = size();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      updateCameraZ();
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
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
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aId", new THREE.BufferAttribute(ids, 1));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));

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
                float ringIdx = floor(rnd.y * 3.0);
                float angle = id * PI * 2.0 * 1000.0 + uTime * 0.2 * (ringIdx > 1.0 ? -1.0 : 1.0);
                float r = 24.0 + ringIdx * 4.0 + (rnd.z * 0.5);
                pos = vec3(r * cos(angle), (rnd.x - 0.15) * 2.0, r * sin(angle));
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
            if (shape == 0) return palette(id + uTime*0.05, vec3(0.46, 0.50, 0.60), vec3(0.16, 0.15, 0.18), vec3(1.0, 1.0, 1.0), vec3(0.48, 0.60, 0.78));
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

            float autoRot1 = (uCurrentShape == 2) ? 0.0 : uTime * 0.08;
            float autoRot2 = (uTargetShape == 2) ? 0.0 : uTime * 0.08;
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
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let morphProgress = 0;
    let currentShape = 0;
    let targetShape = 0;
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
    container.addEventListener("pointermove", onPointerMove);
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
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      container.removeEventListener("pointermove", onPointerMove);
      // container.removeEventListener("click", triggerMorph);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount]);

  return <div ref={containerRef} className={className} aria-hidden />;
}
