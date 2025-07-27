# Animation Libraries Documentation

This document provides guidance on using the animation and interactive libraries installed in the project.

## Installed Libraries

### 1. GSAP (GreenSock Animation Platform)
- **Version**: 3.13.0
- **React Integration**: @gsap/react 2.1.2
- **Type Definitions**: @types/gsap 1.20.2

### 2. Locomotive Scroll
- **Version**: 4.1.4
- **Type Definitions**: @types/locomotive-scroll 4.1.4

### 3. Three.js (WebGL)
- **Version**: 0.178.0
- **React Integration**: @react-three/fiber 9.3.0, @react-three/drei 10.6.1
- **Type Definitions**: @types/three 0.178.1

### 4. PixiJS
- **Version**: 8.11.0
- **React Integration**: @pixi/react 8.0.3

### 5. Additional Utilities
- **gl-matrix**: 3.4.3 - For vector and matrix operations

## Usage Examples

### GSAP with React

```tsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins
gsap.registerPlugin(ScrollTrigger);

export function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    gsap.fromTo(".animate-element", 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1,
        scrollTrigger: {
          trigger: ".animate-element",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      <div className="animate-element">Animated content</div>
    </div>
  );
}
```

### Locomotive Scroll Implementation

```tsx
import LocomotiveScroll from 'locomotive-scroll';
import { useEffect, useRef } from 'react';

export function SmoothScrollContainer({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      multiplier: 1,
      class: 'is-revealed'
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <div ref={scrollRef} data-scroll-container>
      {children}
    </div>
  );
}
```

### Three.js WebGL Shader

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    vec3 color = 0.5 + 0.5 * cos(time + vUv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => ({
    time: { value: 0 }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function WebGLScene() {
  return (
    <Canvas>
      <ShaderMesh />
      <OrbitControls />
    </Canvas>
  );
}
```

### PixiJS Interactive Background

```tsx
import { Stage, Container, Sprite, useTick } from '@pixi/react';
import { BlurFilter } from 'pixi.js';
import { useState } from 'react';

function AnimatedSprite() {
  const [rotation, setRotation] = useState(0);
  
  useTick((delta) => {
    setRotation(r => r + 0.01 * delta);
  });

  return (
    <Sprite
      image="/particle.png"
      anchor={0.5}
      scale={0.5}
      rotation={rotation}
      filters={[new BlurFilter(2)]}
    />
  );
}

export function PixiBackground() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Container>
        <AnimatedSprite />
      </Container>
    </Stage>
  );
}
```

## Integration Tips

### Combining GSAP with Locomotive Scroll

```tsx
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";

// Sync Locomotive Scroll with GSAP ScrollTrigger
const locoScroll = new LocomotiveScroll({
  el: document.querySelector("[data-scroll-container]"),
  smooth: true
});

locoScroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy("[data-scroll-container]", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
});
```

### Performance Considerations

1. **GSAP**: Use `will-change: transform` on animated elements
2. **Locomotive Scroll**: Limit to one instance per page
3. **Three.js**: Dispose of geometries and materials when unmounting
4. **PixiJS**: Use object pooling for frequently created/destroyed sprites

### Next.js Specific Configuration

For SSR compatibility, import these libraries dynamically:

```tsx
import dynamic from 'next/dynamic';

const PixiComponent = dynamic(() => import('./PixiComponent'), { ssr: false });
const ThreeComponent = dynamic(() => import('./ThreeComponent'), { ssr: false });
```

## Common Patterns

### Glitch Effect (as per blueprint.md)
```css
.glitch {
  animation: glitch-anim 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

.glitch-2 {
  animation: glitch-anim-2 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite reverse;
}
```

These animations are already defined in `tailwind.config.ts`.