// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;

    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

Math.map = function (n, start, stop, start2, stop2) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

const PX_RATIO = typeof window !== "undefined" ? window.devicePixelRatio : 1;

class AsciiFilter {
  constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "absolute";
    this.domElement.style.top = "0";
    this.domElement.style.left = "0";
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";

    this.pre = document.createElement("pre");
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset = charset ?? " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    this.pointerElement = null;
    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener("pointermove", this.onMouseMove);
  }

  setPointerElement(element) {
    this.pointerElement = element;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText("A").width;

    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = "0";
    this.pre.style.padding = "0";
    this.pre.style.lineHeight = "1em";
    this.pre.style.position = "absolute";
    this.pre.style.left = "0";
    this.pre.style.top = "0";
    this.pre.style.zIndex = "9";
    this.pre.style.backgroundAttachment = "fixed";
    this.pre.style.mixBlendMode = "difference";
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (this.context && w && h) {
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    }

    this.asciify(this.context, w, h);
    this.hue();
  }

  onMouseMove(e) {
    if (this.pointerElement) {
      const bounds = this.pointerElement.getBoundingClientRect();
      const renderedWidth = bounds.width || this.width;
      const renderedHeight = bounds.height || this.height;
      const x = ((e.clientX - bounds.left) / renderedWidth) * this.width;
      const y = ((e.clientY - bounds.top) / renderedHeight) * this.height;
      this.mouse = {
        x: Math.min(Math.max(x, 0), this.width),
        y: Math.min(Math.max(y, 0), this.height),
      };
      return;
    }

    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() {
    return this.mouse.x - this.center.x;
  }

  get dy() {
    return this.mouse.y - this.center.y;
  }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx, w, h) {
    if (w && h) {
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let str = "";
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = x * 4 + y * 4 * w;
          const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

          if (a === 0) {
            str += " ";
            continue;
          }

          const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          let idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += "\n";
      }
      this.pre.innerHTML = str;
    }
  }

  dispose() {
    document.removeEventListener("pointermove", this.onMouseMove);
  }
}

class CanvasTxt {
  constructor(txt, { fontSize = 200, fontFamily = "Arial", color = "#fdf9f3" } = {}) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;

    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    this.context.font = this.font;
    const metrics = this.context.measureText(this.txt);

    const textWidth = Math.ceil(metrics.width) + 20;
    const textHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 20;

    this.canvas.width = textWidth;
    this.canvas.height = textHeight;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;

    const metrics = this.context.measureText(this.txt);
    const yPos = 10 + metrics.actualBoundingBoxAscent;

    this.context.fillText(this.txt, 10, yPos);
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

class CanvAscii {
  constructor({ text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves, enableRotation }, containerElem, width, height) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;
    this.enableRotation = enableRotation;
    this.active = true;
    this.lastRenderTime = 0;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();
    this.mouse = { x: this.width / 2, y: this.height / 2 };

    this.onMouseMove = this.onMouseMove.bind(this);
  }

  async init() {
    try {
      await document.fonts.load('600 200px "IBM Plex Mono"');
      await document.fonts.load('500 12px "IBM Plex Mono"');
    } catch (e) {
      // Font loading failed, continue with fallback.
    }
    await document.fonts.ready;

    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: "IBM Plex Mono",
      color: this.textColor,
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: "IBM Plex Mono",
      fontSize: this.asciiFontSize,
      invert: true,
    });
    this.filter.setPointerElement(this.container);

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    document.addEventListener("pointermove", this.onMouseMove);
    document.addEventListener("touchmove", this.onMouseMove, { passive: true });
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.filter.setSize(w, h);

    this.center = { x: w / 2, y: h / 2 };
  }

  load() {
    this.animate();
  }

  onMouseMove(evt) {
    const e = evt.touches ? evt.touches[0] : evt;
    const bounds = this.container.getBoundingClientRect();
    const renderedWidth = bounds.width || this.width;
    const renderedHeight = bounds.height || this.height;
    const x = ((e.clientX - bounds.left) / renderedWidth) * this.width;
    const y = ((e.clientY - bounds.top) / renderedHeight) * this.height;
    this.mouse = {
      x: Math.min(Math.max(x, 0), this.width),
      y: Math.min(Math.max(y, 0), this.height),
    };
  }

  animate() {
    const animateFrame = (time) => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      if (!this.active || window.__portfolioPageScrolling || time - this.lastRenderTime < 1000 / 30) return;
      this.lastRenderTime = time;
      this.render();
    };
    this.animationFrameId = requestAnimationFrame(animateFrame);
  }

  setActive(active) {
    this.active = active;
    if (active) this.lastRenderTime = 0;
  }

  render() {
    const time = new Date().getTime() * 0.001;

    this.textCanvas.render();
    this.texture.needsUpdate = true;

    this.mesh.material.uniforms.uTime.value = Math.sin(time);

    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    if (!this.enableRotation) {
      this.mesh.rotation.x += (0 - this.mesh.rotation.x) * 0.14;
      this.mesh.rotation.y += (0 - this.mesh.rotation.y) * 0.14;
      return;
    }

    const x = Math.map(this.mouse.y, 0, this.height, 0.5, -0.5);
    const y = Math.map(this.mouse.x, 0, this.width, -0.5, 0.5);

    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
  }

  clear() {
    this.scene.traverse((obj) => {
      if (obj.isMesh && typeof obj.material === "object" && obj.material !== null) {
        Object.keys(obj.material).forEach((key) => {
          const matProp = obj.material[key];
          if (matProp !== null && typeof matProp === "object" && typeof matProp.dispose === "function") {
            matProp.dispose();
          }
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.filter) {
      this.filter.dispose();
      if (this.filter.domElement.parentNode) {
        this.container.removeChild(this.filter.domElement);
      }
    }
    document.removeEventListener("pointermove", this.onMouseMove);
    document.removeEventListener("touchmove", this.onMouseMove);
    this.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}

export default function ASCIIText({
  text = "David!",
  asciiFontSize = 8,
  textFontSize = 200,
  textColor = "#fdf9f3",
  planeBaseHeight = 8,
  enableWaves = true,
  enableRotation = true,
}) {
  const containerRef = useRef(null);
  const asciiRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let observer = null;
    let visibilityObserver = null;
    let ro = null;
    let isIntersecting = true;

    const updateActivity = () => {
      asciiRef.current?.setActive(isIntersecting && document.visibilityState !== "hidden");
    };

    const handleVisibilityChange = () => updateActivity();

    const observeActivity = (container) => {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isIntersecting = entry.isIntersecting;
          updateActivity();
        },
        { rootMargin: "160px 0px", threshold: 0.01 },
      );
      visibilityObserver.observe(container);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    };

    const createAndInit = async (container, w, h) => {
      const instance = new CanvAscii(
        { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves, enableRotation },
        container,
        w,
        h,
      );
      await instance.init();
      return instance;
    };

    const setup = async () => {
      const { width, height } = containerRef.current.getBoundingClientRect();

      if (width === 0 || height === 0) {
        observer = new IntersectionObserver(
          async ([entry]) => {
            if (cancelled) return;
            if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
              const { width: w, height: h } = entry.boundingClientRect;
              observer.disconnect();
              observer = null;

              if (!cancelled) {
                asciiRef.current = await createAndInit(containerRef.current, w, h);
                if (!cancelled && asciiRef.current) {
                  asciiRef.current.load();
                  observeActivity(containerRef.current);
                }
              }
            }
          },
          { threshold: 0.1 },
        );
        observer.observe(containerRef.current);
        return;
      }

      asciiRef.current = await createAndInit(containerRef.current, width, height);
      if (!cancelled && asciiRef.current) {
        asciiRef.current.load();
        observeActivity(containerRef.current);

        ro = new ResizeObserver((entries) => {
          if (!entries[0] || !asciiRef.current) return;
          const { width: w, height: h } = entries[0].contentRect;
          if (w > 0 && h > 0) {
            asciiRef.current.setSize(w, h);
          }
        });
        ro.observe(containerRef.current);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (visibilityObserver) visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (ro) ro.disconnect();
      if (asciiRef.current) {
        asciiRef.current.dispose();
        asciiRef.current = null;
      }
    };
  }, [text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves, enableRotation]);

  return (
    <div
      ref={containerRef}
      className="ascii-text-container"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&display=swap');

        .ascii-text-container canvas {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }

        .ascii-text-container pre {
          margin: 0;
          user-select: none;
          padding: 0;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          background-image: radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%);
          background-attachment: fixed;
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          z-index: 9;
          mix-blend-mode: difference;
        }
      `}</style>
    </div>
  );
}
