import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Crosshair,
  Dice5,
  FolderKanban,
  Gamepad2,
  Gauge,
  Goal,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Mountain,
  Phone,
  Skull,
  Sparkles,
  Trophy,
  UserRound,
  Wand2,
} from "lucide-react";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ASCIIText from "./components/ASCIIText";
import FaultyTerminal from "./components/FaultyTerminal";
import GooeyNav from "./components/GooeyNav/GooeyNav";
import PixelGooeyNav from "./components/PixelGooeyNav/PixelGooeyNav";
import BorderGlow from "./components/BorderGlow/BorderGlow";
import ProjectDetail from "./components/ProjectDetail/ProjectDetail";
import ProjectFanStack from "./components/ProjectFanStack/ProjectFanStack";
import ProjectRouteTransition from "./components/ProjectRouteTransition/ProjectRouteTransition";
import FavoriteTimeline from "./components/FavoriteTimeline/FavoriteTimeline";
import VisualEditor from "./components/VisualEditor";

const ActivityLanyardBoard = lazy(() => import("./components/ActivityLanyardBoard/ActivityLanyardBoard"));

const EDITOR_PASSWORD = "838485";
const VISUAL_SETTINGS_KEY = "wjt-portfolio-visual-settings-v1";
const LEGACY_ASCII_BLEED_X_BASE = 10.8;
const LEGACY_ASCII_BLEED_Y_BASE = 2.7;
const HERO_DISPLAY_NAME = "羊哞哞";
const PROJECT_ROUTE_GRID_SIZE = 12;

const PROJECT_ROUTE_FALLBACKS = {
  "beast-incarnation": "#10162d",
  "wood-cat": "#27320f",
  "endless-rush-hour": "#26292f",
  "headhunter-company": "#241810",
  "balatro-shader": "#24103d",
  "ue5-jett-3c": "#241810",
};

function sampleProjectRouteColors(project, sourceElement) {
  const fallbackColor = PROJECT_ROUTE_FALLBACKS[project.slug] || "#07040c";
  const fallbackColors = Array(PROJECT_ROUTE_GRID_SIZE ** 2).fill(fallbackColor);
  const source = sourceElement?.querySelector(project.slug === "balatro-shader" ? "canvas" : "img");

  if (!source) return fallbackColors;

  const sourceWidth = source.tagName === "IMG" ? source.naturalWidth : source.width;
  const sourceHeight = source.tagName === "IMG" ? source.naturalHeight : source.height;
  if (!sourceWidth || !sourceHeight) return fallbackColors;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = PROJECT_ROUTE_GRID_SIZE;
    canvas.height = PROJECT_ROUTE_GRID_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return fallbackColors;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    context.drawImage(
      source,
      (canvas.width - drawWidth) / 2,
      (canvas.height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );

    const verticalScrim = context.createLinearGradient(0, 0, 0, canvas.height);
    verticalScrim.addColorStop(0, "rgba(5, 2, 7, 0.34)");
    verticalScrim.addColorStop(1, "rgba(5, 2, 7, 0.7)");
    context.fillStyle = verticalScrim;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const horizontalScrim = context.createLinearGradient(0, 0, canvas.width, 0);
    horizontalScrim.addColorStop(0, "rgba(5, 2, 7, 0.93)");
    horizontalScrim.addColorStop(0.42, "rgba(5, 2, 7, 0.76)");
    horizontalScrim.addColorStop(0.76, "rgba(5, 2, 7, 0.24)");
    horizontalScrim.addColorStop(1, "rgba(5, 2, 7, 0.48)");
    context.fillStyle = horizontalScrim;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = [];
    let sampledBrightness = 0;

    for (let index = 0; index < imageData.length; index += 4) {
      const red = imageData[index];
      const green = imageData[index + 1];
      const blue = imageData[index + 2];
      sampledBrightness += red + green + blue;
      colors.push(`rgb(${red}, ${green}, ${blue})`);
    }

    return sampledBrightness > 0 ? colors : fallbackColors;
  } catch {
    return fallbackColors;
  }
}

const defaultVisualSettings = {
  terminal: {
    scale: 1.48,
    gridX: 2.2,
    gridY: 1,
    digitSize: 1.18,
    timeScale: 0.72,
    scanlineIntensity: 0.5,
    glitchAmount: 1.08,
    flickerAmount: 0.72,
    noiseAmp: 0.74,
    chromaticAberration: 1.45,
    dither: 0.42,
    curvature: 0.16,
    tint: "#7c3aed",
    mouseReact: true,
    mouseStrength: 0.28,
    pageLoadAnimation: true,
    brightness: 0.78,
  },
  ascii: {
    text: HERO_DISPLAY_NAME,
    asciiFontSize: 7,
    textFontSize: 138,
    textColor: "#ffffff",
    planeBaseHeight: 8,
    enableWaves: true,
    enableMouseFollow: true,
    bleedX: 180,
    bleedY: 72,
    bleedUnit: "px",
    heroTextVersion: 2,
  },
  screen: {
    slotLeft: 40.1,
    slotTop: 41.3,
    slotWidth: 28.2,
    slotHeight: 24.5,
    frameWidthVw: 132,
    frameHeightVh: 100,
    frameScale: 0.245,
    frameOffsetX: 0,
    frameOffsetY: 0,
    cameraScale: 4.08,
    cameraOriginX: 54.2,
    cameraOriginY: 54.7,
  },
  nav: {
    variant: "classic",
    particleCount: 8,
    animationTime: 600,
    animationVariance: 500,
    radiusFactor: 400,
    particleOuterDistance: 90,
    particleInnerDistance: 10,
    navVersion: 3,
    particleOne: "#ffffff",
    particleTwo: "#c4b5fd",
    particleThree: "#8b5cf6",
    particleFour: "#22ff88",
  },
  hero: {
    introSize: 86,
    welcomeSize: 56,
    eyebrowSize: 18,
    leftOffset: 420,
  },
  glow: {
    edgeSensitivity: 28,
    backgroundColor: "#120f17",
    borderRadius: 22,
    glowRadius: 36,
    glowIntensity: 0.95,
    coneSpread: 24,
    fillOpacity: 0.5,
    animated: false,
    colorOne: "#c084fc",
    colorTwo: "#f472b6",
    colorThree: "#38bdf8",
  },
  balatro: {
    spinRotation: -2,
    spinSpeed: 7,
    offsetX: 0,
    offsetY: 0,
    colorOne: "#de443b",
    colorTwo: "#006bb4",
    colorThree: "#162325",
    contrast: 3.5,
    lighting: 0.4,
    spinAmount: 0.25,
    pixelFilter: 745,
    spinEase: 1,
    isRotate: true,
    mouseInteraction: true,
  },
  transition: {
    gridSize: 12,
    animationDuration: 0.68,
  },
  splitText: {
    titleDelay: 58,
    titleDuration: 0.95,
    titleOffsetY: 88,
    bodyDelay: 22,
    bodyDuration: 0.78,
    bodyOffsetY: 46,
  },
  folder: {
    color: "#3b82f6",
    size: 1.25,
    gap: 28,
  },
};

function cloneSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

let pageScrollAnimationFrame = 0;

function animateToScrollPosition(top, duration = 480) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  const startTop = window.scrollY;
  const distance = top - startTop;

  window.cancelAnimationFrame(pageScrollAnimationFrame);
  root.style.scrollBehavior = "auto";
  root.classList.add("is-page-scrolling");
  window.__portfolioPageScrolling = true;
  window.dispatchEvent(new Event("portfolio-page-scroll-start"));

  if (Math.abs(distance) < 2) {
    window.scrollTo({ top, left: 0, behavior: "auto" });
    root.classList.remove("is-page-scrolling");
    window.__portfolioPageScrolling = false;
    root.style.scrollBehavior = previousScrollBehavior;
    window.dispatchEvent(new Event("portfolio-page-scroll-end"));
    return;
  }

  const startTime = performance.now();
  const easeInOutCubic = (progress) =>
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const tick = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo({ top: startTop + distance * eased, left: 0, behavior: "auto" });

    if (progress < 1) {
      pageScrollAnimationFrame = window.requestAnimationFrame(tick);
      return;
    }

    window.scrollTo({ top, left: 0, behavior: "auto" });
    root.classList.remove("is-page-scrolling");
    window.__portfolioPageScrolling = false;
    root.style.scrollBehavior = previousScrollBehavior;
    pageScrollAnimationFrame = 0;
    window.dispatchEvent(new Event("portfolio-page-scroll-end"));
  };

  pageScrollAnimationFrame = window.requestAnimationFrame(tick);
}

function mergeKnownGroup(defaults, source = {}) {
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, source[key] ?? defaults[key]]),
  );
}

function mergeVisualSettings(settings) {
  const sourceAscii = settings?.ascii || {};
  const ascii = mergeKnownGroup(defaultVisualSettings.ascii, sourceAscii);
  const sourceNav = settings?.nav || {};
  const nav = mergeKnownGroup(defaultVisualSettings.nav, sourceNav);

  if (sourceAscii.bleedUnit !== "px") {
    ascii.bleedX = Math.round((sourceAscii.bleedX ?? 16) * LEGACY_ASCII_BLEED_X_BASE);
    ascii.bleedY = Math.round((sourceAscii.bleedY ?? 26) * LEGACY_ASCII_BLEED_Y_BASE);
    ascii.bleedUnit = "px";
  }

  if (sourceAscii.heroTextVersion !== defaultVisualSettings.ascii.heroTextVersion) {
    ascii.text = HERO_DISPLAY_NAME;
    ascii.heroTextVersion = defaultVisualSettings.ascii.heroTextVersion;
  }

  if (sourceNav.navVersion !== defaultVisualSettings.nav.navVersion) {
    nav.particleCount = defaultVisualSettings.nav.particleCount;
    nav.animationVariance = defaultVisualSettings.nav.animationVariance;
    nav.radiusFactor = defaultVisualSettings.nav.radiusFactor;
    nav.particleOuterDistance = defaultVisualSettings.nav.particleOuterDistance;
    nav.particleInnerDistance = defaultVisualSettings.nav.particleInnerDistance;
    nav.animationTime = defaultVisualSettings.nav.animationTime;
    nav.navVersion = defaultVisualSettings.nav.navVersion;
  }

  return {
    terminal: mergeKnownGroup(defaultVisualSettings.terminal, settings?.terminal),
    ascii,
    screen: mergeKnownGroup(defaultVisualSettings.screen, settings?.screen),
    nav,
    hero: mergeKnownGroup(defaultVisualSettings.hero, settings?.hero),
    glow: mergeKnownGroup(defaultVisualSettings.glow, settings?.glow),
    balatro: mergeKnownGroup(defaultVisualSettings.balatro, settings?.balatro),
    transition: mergeKnownGroup(defaultVisualSettings.transition, settings?.transition),
    splitText: mergeKnownGroup(defaultVisualSettings.splitText, settings?.splitText),
    folder: mergeKnownGroup(defaultVisualSettings.folder, settings?.folder),
  };
}

function loadVisualSettings() {
  if (typeof window === "undefined") return cloneSettings(defaultVisualSettings);
  try {
    const saved = window.localStorage.getItem(VISUAL_SETTINGS_KEY);
    return saved ? mergeVisualSettings(JSON.parse(saved)) : cloneSettings(defaultVisualSettings);
  } catch {
    return cloneSettings(defaultVisualSettings);
  }
}

function ViewportVideo({ className, src, type = "video/mp4" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState !== "hidden" && !window.__portfolioPageScrolling) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );

    const handleVisibilityChange = () => {
      const rect = video.getBoundingClientRect();
      const nearViewport = rect.bottom > -240 && rect.top < window.innerHeight + 240;
      if (document.visibilityState === "hidden" || !nearViewport || window.__portfolioPageScrolling) video.pause();
      else video.play().catch(() => {});
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("portfolio-page-scroll-end", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("portfolio-page-scroll-end", handleVisibilityChange);
      video.pause();
    };
  }, []);

  return (
    <video ref={videoRef} className={className} muted loop playsInline preload="none" aria-hidden="true">
      <source src={src} type={type} />
    </video>
  );
}

function HeroVisual({ terminalSettings, terminalGrid, asciiSettings, onExplore, variant = "full" }) {
  const asciiWrapStyle = {
    "--ascii-bleed-x": `${asciiSettings.bleedX}px`,
    "--ascii-bleed-y": `${asciiSettings.bleedY}px`,
  };

  return (
    <>
      <div className={variant === "mini" ? "terminalBackdrop miniTerminalBackdrop" : "terminalBackdrop"} aria-hidden="true">
        <FaultyTerminal
          scale={terminalSettings.scale}
          gridMul={terminalGrid}
          digitSize={terminalSettings.digitSize}
          timeScale={terminalSettings.timeScale}
          scanlineIntensity={terminalSettings.scanlineIntensity}
          glitchAmount={terminalSettings.glitchAmount}
          flickerAmount={terminalSettings.flickerAmount}
          noiseAmp={terminalSettings.noiseAmp}
          chromaticAberration={terminalSettings.chromaticAberration}
          dither={terminalSettings.dither}
          curvature={terminalSettings.curvature}
          tint={terminalSettings.tint}
          mouseReact={terminalSettings.mouseReact}
          mouseStrength={terminalSettings.mouseStrength}
          pageLoadAnimation={terminalSettings.pageLoadAnimation}
          brightness={terminalSettings.brightness}
        />
      </div>

      <div className={variant === "mini" ? "heroContent miniHeroContent" : "heroContent shell"}>
        <div className="heroGreeting" aria-label="你好，我是羊哞哞。欢迎来到我的主页。">
          <div className="heroIdentity">
            <span className="heroGreetingText">你好，我是：</span>
            <div className={variant === "mini" ? "asciiTitleWrap miniAsciiTitleWrap" : "asciiTitleWrap"} style={asciiWrapStyle}>
              <ASCIIText
                text={asciiSettings.text}
                enableWaves={asciiSettings.enableWaves}
                asciiFontSize={asciiSettings.asciiFontSize}
                textFontSize={asciiSettings.textFontSize}
                textColor={asciiSettings.textColor}
                planeBaseHeight={asciiSettings.planeBaseHeight * 1.55}
                enableRotation={asciiSettings.enableMouseFollow}
              />
            </div>
            <span className="heroWelcome">欢迎来到我的主页。</span>
            {onExplore && (
              <button className="heroExploreButton" type="button" onClick={onExplore}>
                了解更多
              </button>
            )}
          </div>
          <blockquote className="heroQuote">
            <p>
              “世界上只有一种真正的英雄主义，那就是在认清生活的真相之后依然热爱生活。”
            </p>
            <cite>——罗曼-罗兰</cite>
          </blockquote>
        </div>
      </div>
    </>
  );
}

const stats = [
  { value: "5+", label: "可展示游戏项目" },
  { value: "7天", label: "AI Native Demo 闭环" },
  { value: "Top 3", label: "高校创作大赛三等奖" },
  { value: "5天/周", label: "可实习时间" },
];

const awards = [
  { result: "三等奖", name: "莉莉丝高校游戏创作大赛" },
  { result: "优胜奖", name: "网易 MiniGame 初赛" },
  { result: "第一名", name: "2026 CIGA 万物破元站" },
];

const projects = [
  {
    slug: "beast-incarnation",
    title: "万兽化身",
    meta: "Unity / 关卡策划 / 程序",
    period: "2026.03 - 2026.06",
    image: "/assets/project-beast.png",
    feedbackGallery: [
      "/assets/projects/beast-feedback/beast-feedback-01.jpg",
      "/assets/projects/beast-feedback/beast-feedback-02.jpg",
      "/assets/projects/beast-feedback/beast-feedback-03.jpg",
      "/assets/projects/beast-feedback/beast-feedback-04.jpg",
      "/assets/projects/beast-feedback/beast-feedback-05.jpg",
      "/assets/projects/beast-feedback/beast-feedback-06.jpg",
      "/assets/projects/beast-feedback/beast-feedback-07.jpg",
      "/assets/projects/beast-feedback/beast-feedback-08.jpg",
      "/assets/projects/beast-feedback/beast-feedback-09.jpg",
    ],
    feedbackMetric: "现场试玩反馈",
    feedbackText: "莉莉丝高校游戏创作大赛现场试玩与获奖记录，包含展位体验、玩家试玩、展示交流和奖项留影。",
    tag: "GAME JAM",
    featuredBadge: "莉莉丝全国游戏创作大赛三等奖",
    desc: "2D 像素风硬核精准平台跳跃游戏。围绕多形态无缝切换与底层物理法则重构，验证狼、蛙、猫、羊等动物动能规律带来的操作心流。",
    contributions: ["设计多动物形态切换与差异化动能规则", "完成关卡白盒、路线节奏与难度迭代", "参与 Unity 核心机制实现和物理参数调优"],
    link: "https://www.bilibili.com/video/BV14L5d66EHm/",
  },
  {
    slug: "wood-cat",
    title: "木头喵",
    meta: "TapTap 制造 / 主策划",
    period: "2026.05",
    image: "/assets/project-woodcat-web.webp",
    demoVideo: "/assets/projects/wood-cat-demo.mp4",
    feedbackGallery: [
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-01.jpg",
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-02.jpg",
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-03.jpg",
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-04.jpg",
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-05.jpg",
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-06.jpg",
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-07.jpg",
      "/assets/projects/wood-cat-feedback/wood-cat-feedback-08.jpg",
    ],
    feedbackMetric: "现场试玩反馈",
    feedbackText: "聚光灯 TapTap 48H 游戏创作挑战广州场现场试玩记录，包含展位展示、玩家体验、贴纸反馈和现场交流过程。",
    tag: "GAME JAM",
    desc: "双人欢乐乱斗派对游戏。以物理碰撞、载具机制、地形博弈为核心，在短周期内完成创意提出、核心乐趣验证和可玩版本交付。",
    contributions: ["担任主策划并确定双人乱斗的核心玩法", "设计载具、碰撞与地形博弈机制", "组织试玩反馈并推进短周期版本迭代"],
    link: "https://www.taptap.cn/app/864971",
  },
  {
    slug: "endless-rush-hour",
    title: "无尽早高峰",
    meta: "像素 / 多角色 / 关卡节奏设计",
    period: "待补充",
    image: "/assets/project-peakrush.png",
    demoVideo: "/assets/projects/endless-rush-hour-demo.mp4",
    tag: "COMPETITION",
    desc: "一款高密度关卡推进的像素动作项目。通过持续障碍、路线分流与节奏压迫，测试玩家在短时间内做决策的爽感曲线。",
    contributions: ["设计多角色能力与切换时机", "规划障碍密度、路线分流和关卡节奏", "根据试玩结果调整操作反馈与难度曲线"],
    link: "#contact",
  },
  {
    slug: "headhunter-company",
    title: "神人猎头公司",
    meta: "Solo Developer / AI Agent / 经营模拟",
    period: "2026.06 - 至今",
    image: "/assets/project-agent-web.webp",
    demoVideo: "/assets/projects/headhunter-company-demo.mp4",
    feedbackImage: "/assets/projects/headhunter-feedback.png",
    feedbackMetric: "4000+ 下载",
    feedbackText: "上线后获得 4000+ 下载，说明作品已经有真实玩家触达与试玩反馈。",
    tag: "COMPETITION",
    desc: "基于 AI Agent 工作流构建的黑色幽默模拟经营游戏。接入 Qwen 模型完成语义评分，驱动求职者探查、包装售卖与经营扩张循环。",
    contributions: ["独立完成玩法、程序与整体产品闭环", "接入 Qwen 模型并设计语义评分规则", "搭建求职者探查、包装售卖和经营扩张循环"],
    link: "https://www.taptap.cn/moment/813589271922344237",
  },
  {
    slug: "balatro-shader",
    title: "小丑牌 Shader 复刻",
    meta: "Shader / VFX / 画面复刻",
    period: "待补充",
    image: "/assets/project-beast.png",
    demoVideo: "/assets/projects/balatro-shader-demo.mp4",
    breakdownLink: "https://tcnundy0sz1l.feishu.cn/wiki/OzalwxHXLicIkwkYnRLcxr8anCf",
    tag: "RECREATION",
    desc: "用于展示对小丑牌视觉风格的 Shader 复刻、卡面发光与整体特效还原。后续可替换为真实过程截图或动图。",
    contributions: ["拆解小丑牌卡面形变和色彩流动效果", "实现卡面发光、噪声扰动与像素化 Shader", "完成 Unity WebGL 展示版本和交互调试"],
    link: "#contact",
  },
  {
    slug: "ue5-jett-3c",
    title: "UE5 复刻捷丰 3C",
    meta: "UE5 / 角色控制 / 技能系统",
    period: "待补充",
    image: "/assets/project-ue5-valorant-web.webp",
    demoVideo: "/assets/projects/ue5-jett-demo.mp4",
    breakdownLink: "https://tcnundy0sz1l.feishu.cn/wiki/DCc2wyfKUiWhWekqZ0GcXuIQnie",
    tag: "RECREATION",
    desc: "在 UE5 中复刻捷丰的移动、跳跃、冲刺与技能框架，重点展示 3C 手感、输入响应和技能连招结构。",
    contributions: ["复刻移动、跳跃、冲刺与空中控制", "调试镜头、输入响应和角色 3C 手感", "搭建技能状态、冷却与连招框架"],
    link: "#contact",
  },
  {
    slug: "anchor-cat",
    title: "锚了个猫",
    meta: "2026 CIGA / 主题创作 / 第一名",
    period: "2026",
    image: "/assets/project-anchor-cat.png",
    demoVideo: "/assets/projects/anchor-cat-demo.mp4",
    feedbackGallery: [
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-01.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-02.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-03.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-04.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-05.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-06.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-07.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-08.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-09.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-10.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-11.jpg",
      "/assets/projects/anchor-cat-feedback/anchor-cat-feedback-12.jpg",
    ],
    feedbackMetric: "现场试玩反馈",
    feedbackText: "2026 CIGA 广州万物破元站现场试玩记录，包含玩家排队体验、实机试玩、展位交流和反馈收集过程。",
    tag: "COMPETITION",
    featuredBadge: "2026 CIGA 广州万物破元站第一名",
    desc: "2026 CIGA 广州万物破元站第一名作品。围绕主题限制完成创意发散、核心玩法验证与短周期 Demo 交付，突出轻量机制与清晰互动反馈。",
    contributions: ["参与主题拆解与核心玩法方向确定", "推进短周期 Demo 的规则验证和交互节奏打磨", "整理现场试玩反馈并优化展示版本表达"],
    link: "#contact",
  },
];

const FIRST_PROJECT_PAGE = 2;
const LAST_PROJECT_PAGE = FIRST_PROJECT_PAGE + projects.length - 1;
const FAVORITE_PAGE_COUNT = 6;
const STRENGTHS_PAGE = LAST_PROJECT_PAGE + 1;
const LAST_FAVORITE_PAGE = STRENGTHS_PAGE + FAVORITE_PAGE_COUNT - 1;
const ACTIVITIES_PAGE = LAST_FAVORITE_PAGE + 1;
const CONTACT_PAGE = ACTIVITIES_PAGE + 1;
const PROFILE_PAGE = CONTACT_PAGE;
const PAGE_COUNT = PROFILE_PAGE + 1;

function getNavIndexForPage(page) {
  if (page >= CONTACT_PAGE) return 4;
  if (page === ACTIVITIES_PAGE) return 3;
  if (page >= STRENGTHS_PAGE && page <= LAST_FAVORITE_PAGE) return 2;
  if (page >= FIRST_PROJECT_PAGE && page <= LAST_PROJECT_PAGE) return 1;
  return 0;
}

const strengths = [
  {
    icon: Gamepad2,
    title: "玩法推演与白盒验证",
    text: "能从核心心流出发拆解机制，用低成本原型快速证明玩法是否成立。",
  },
  {
    icon: Code2,
    title: "Unity / UE 快速原型开发",
    text: "结合 Cursor、Copilot 与自然语言工作流，高速搭建 3C、物理交互与系统框架。",
  },
  {
    icon: Wand2,
    title: "AI Native 创作闭环",
    text: "熟悉从需求拆解、代码实现、美术资源生产到部署排障的 AI 协作研发流程。",
  },
  {
    icon: Sparkles,
    title: "产品拆解与商业洞察",
    text: "长期玩家视角与竞品分析能力并行，能判断题材包装、美术基调和受众亲和力。",
  },
];

const favoriteGameModules = [
  {
    slug: "sports-fc",
    icon: Goal,
    label: "Sports",
    video: "/assets/favorites/fc26/favorite-fc26-full.mp4",
    backgroundImage: "/assets/favorites/fc26/messi-world-cup-trophy.jpg",
    poster: "/assets/favorites/fc26/favorite-fc26-full.jpg",
    title: "体育类",
    playtime: "1500h+",
    games: ["EA SPORTS FC 26", "Career Mode", "Ultimate Team"],
    text: "喜欢足球游戏中观察空间、调整阵型与把握进攻节奏的过程，每一次攻防转换都是一场即时战术博弈。",
  },
  {
    slug: "soulslike-elden-ring",
    icon: Skull,
    label: "Soulslike",
    video: "/assets/favorites/fc26/favorite-soulslike.mp4",
    poster: "/assets/favorites/fc26/favorite-soulslike.jpg",
    title: "魂类",
    playtime: "500h+",
    games: ["Elden Ring", "Dark Souls", "Sekiro"],
    text: "享受观察敌人、理解招式并在一次次失败中掌握战斗节奏，最终靠判断与执行跨过强敌。",
  },
  {
    slug: "action-celeste",
    icon: Mountain,
    label: "Action Platformer",
    video: "/assets/favorites/fc26/favorite-action-celeste.mp4",
    poster: "/assets/favorites/fc26/favorite-action-celeste.jpg",
    title: "动作类",
    playtime: "500h+",
    games: ["Celeste", "Super Meat Boy", "Katana ZERO"],
    text: "喜欢精准操作、快速重试和清晰反馈共同形成的心流，让困难关卡成为不断理解动作与路线的过程。",
  },
  {
    slug: "roguelike-balatro",
    icon: Dice5,
    label: "Roguelike Deckbuilder",
    video: "/assets/favorites/fc26/favorite-roguelike-balatro.mp4",
    poster: "/assets/favorites/fc26/favorite-roguelike-balatro.jpg",
    title: "肉鸽类",
    playtime: "500h+",
    games: ["Balatro", "Slay the Spire", "Hades"],
    text: "偏爱简单规则与高上限组合，让数字、概率和构筑在每一局中产生不同的策略故事。",
  },
  {
    slug: "fps-call-of-duty",
    icon: Crosshair,
    label: "First-Person Shooter",
    video: "/assets/favorites/fc26/favorite-fps.mp4",
    poster: "/assets/favorites/fc26/favorite-fps.jpg",
    title: "FPS 类",
    playtime: "500h+",
    games: ["Call of Duty", "Titanfall 2", "Valorant"],
    text: "关注枪械反馈、移动节奏、空间控制与瞬间决策，喜欢高速对抗中信息和操作共同带来的压迫感。",
  },
  {
    slug: "racing",
    icon: Gauge,
    label: "Open-World Racing",
    video: "/assets/favorites/fc26/favorite-racing-lego.mp4",
    poster: "/assets/favorites/fc26/favorite-racing-lego.jpg",
    title: "竞速类",
    playtime: "100h+",
    games: ["Forza Horizon", "Need for Speed", "The Crew"],
    text: "喜欢速度、路线选择和开放世界探索结合的自由感，也关注车辆操控反馈与场景节奏带来的沉浸体验。",
  },
];

const favoriteDetailArchives = {
  "sports-fc": {
    playtime: "1500h+",
    playedGames: [
      "EA SPORTS FC 系列",
      "FIFA 15 至 FIFA 23",
      "实况足球 / eFootball 系列",
      "NBA 2K 系列",
      "NBA Live 系列",
      "麦登橄榄球系列",
      "上旋高手系列",
      "VR 网球系列",
      "网球世界巡回赛系列",
      "经理生涯模式",
      "终极球队模式",
    ],
    achievements: [
      { title: "Power Shot", text: "EA SPORTS FC 26 Steam 成就：Score a goal，完成一次进球。" },
      { title: "PlayStyles+", text: "EA SPORTS FC 26 Steam 成就：Score a goal with an active PlayStyle+，使用激活的 PlayStyle+ 完成进球。" },
      { title: "Tactical Designer", text: "EA SPORTS FC 26 Steam 成就：Create your own custom Tactic in Football Ultimate Team，创建自定义战术。" },
    ],
    story: [
      "我是足球项目国家二级运动员，也一直很喜欢足球和各种体育运动。真实训练和比赛经历让我对空间、身体对抗、跑位选择和团队节奏有更直接的感受。",
      "体育给我的性格里留下了很明显的一部分：开朗、阳光、愿意协作，也愿意在一次次训练和比赛里不断复盘自己。这种热爱也延伸到了我玩体育类游戏的方式里。",
      "FC 系列对我来说不是单纯的足球操作游戏，更像一个长期经营和即时战术结合的系统。我最喜欢的部分，是在经理生涯里从低级别联赛开始，用青训、转会和战术调整一点点把球队带上去。",
      "在这个过程中，我会研究球员动作模组、比赛风格和战术板之间的关系：什么样的球员适合高压逼抢，什么样的边路配置能制造空间，什么样的中场组合能让球队稳定推进。这些经验也让我更敏感于游戏系统如何把现实运动抽象成可操作的规则。",
    ],
    images: [
      { src: "/assets/favorites/sports/football-medals.png", alt: "足球比赛奖牌照" },
      { src: "/assets/favorites/sports/national-level-2-certificate.png", alt: "足球项目国家二级运动员证书" },
    ],
  },
  "soulslike-elden-ring": {
    playtime: "500h+",
    playedGames: [
      "艾尔登法环",
      "黑暗之魂 3",
      "只狼",
      "匹诺曹的谎言",
      "仁王系列",
      "卧龙：苍天陨落",
      "遗迹系列",
      "黑神话：悟空",
    ],
    achievements: [
      { title: "Shardbearer Malenia", text: "ELDEN RING Steam 成就：Defeated Shardbearer Malenia，击败碎片君王玛莲妮亚。" },
      { title: "Age of the Stars", text: "ELDEN RING Steam 成就：Achieved the “Age of the Stars” ending，达成星星时代结局。" },
      { title: "Elden Lord", text: "ELDEN RING Steam 成就：Achieved the “Elden Lord” ending，达成艾尔登之王结局。" },
    ],
    story: [
      "在数百小时的游玩中，我不仅享受跨越极高难度的成就感，更习惯以专业视角拆解其底层逻辑。",
      "我深度研究了魂类游戏的 3C 设计，特别是复杂的角色输入缓存机制、受击硬直的精确计算，以及面对巨型多动症 Boss 时，镜头锁定逻辑与空间感处理的优劣势。",
      "此外，我对游戏内的高精视觉特效与动作表现有极高的关注度。我经常复盘其如何通过材质更迭、粒子系统与动作前摇的配合，来塑造史诗级张力和精确的打击反馈。",
      "我也会尝试在底层引擎中逆向推导或复现这些特效与角色控制器的实现逻辑。对复杂 Boss AI 状态机、基于动量的物理反馈等硬核机制的偏爱，让我不仅是在体验内容，更是在持续积累动作游戏开发的实战化参考库。",
    ],
  },
  "action-celeste": {
    playtime: "500h+",
    playedGames: [
      "蔚蓝",
      "超级肉肉哥",
      "武士零",
      "空洞骑士",
      "奥日系列",
      "死亡细胞",
      "茶杯头",
      "铲子骑士",
      "信使",
    ],
    achievements: [
      { title: "Celeste Mountain", text: "Celeste Steam 成就：Complete Chapter 7，完成第 7 章并登上山顶。" },
      { title: "Heart of the Mountain", text: "Celeste Steam 成就：Collect the Crystal Heart in Chapter 8，收集第 8 章水晶之心。" },
      { title: "Farewell", text: "Celeste Steam 成就：Complete Chapter 9，完成第 9 章 Farewell。" },
    ],
    story: [
      "在超过 500 小时的硬核平台跳跃游戏体验中，我不仅追求操作的极限，更习惯于逆向拆解这些顶尖作品的底层 3C 设计。",
      "我极度关注角色控制器的调优，特别是针对基于动量的复杂物理反馈、不同形态与状态切换时的惯性保留，以及土狼时间和跳跃输入缓冲的精确帧数设置。",
      "我经常深入复盘《蔚蓝》中极其严苛但又绝对公平的微操手感是如何通过底层代码实现的，并把这种拆解方式反向应用到自己的动作系统设计里。",
    ],
  },
  "roguelike-balatro": {
    playtime: "500h+",
    playedGames: [
      "小丑牌",
      "杀戮尖塔",
      "哈迪斯",
      "死亡细胞",
      "以撒的结合",
      "雨中冒险 2",
      "挺进地牢",
      "吸血鬼幸存者",
      "盗贼遗产系列",
    ],
    achievements: [
      { title: "Ante Upper!", text: "Balatro Steam 成就：Reach Ante 8，进入 Ante 8。" },
      { title: "Heads Up", text: "Balatro Steam 成就：Win a Run，完成并赢下一局。" },
      { title: "Legendary", text: "Balatro Steam 成就：Discover a Legendary Joker，发现一张传奇小丑牌。" },
    ],
    story: [
      "在超过 500 小时的肉鸽类游戏体验中，我最关注的不是单局通关结果，而是随机性、构筑路线和玩家决策之间如何形成可重复但不雷同的系统循环。",
      "我会拆解《小丑牌》《杀戮尖塔》等作品如何通过少量基础规则，叠加倍率、牌组压缩、遗物协同和风险收益选择，制造出极高的策略上限。",
      "在体验过程中，我尤其关注数值成长曲线、奖励池设计、稀有度分布和失败后的再开局动机。好的肉鸽系统不是简单堆随机，而是让玩家在不确定性里持续做有意义的判断。",
      "这种偏好也直接影响我对系统设计的理解：我会把每一次构筑看作一个可验证的玩法假设，并思考如何通过反馈、动画、音效和视觉刺激，把复杂数值变化转化成玩家能感知到的爽感。",
    ],
  },
  "fps-call-of-duty": {
    playtime: "500h+",
    playedGames: [
      "使命召唤系列",
      "泰坦陨落 2",
      "无畏契约",
      "Apex 英雄",
      "战地系列",
      "反恐精英系列",
      "彩虹六号：围攻",
      "守望先锋系列",
      "绝地求生",
    ],
    achievements: [
      { title: "Legendary Pilot", text: "Titanfall 2 Steam 成就：Complete the Campaign on Master，以大师难度完成战役。" },
      { title: "...Becomes the Master", text: "Titanfall 2 Steam 成就：Place in the top 3 on the Gauntlet scoreboard，在铁驭试炼排行榜进入前三。" },
      { title: "Every Nook and Cranny", text: "Titanfall 2 Steam 成就：Find All Collectibles，收集全部收藏品。" },
    ],
    story: [
      "在超过 500 小时的 FPS 类游戏体验中，我不仅关注对枪结果，更习惯拆解移动、瞄准、开火、受击和击杀反馈之间的完整 3C 链路。",
      "我会重点观察枪械后坐力曲线、开镜速度、镜头晃动、命中音效和击杀提示如何共同构成“枪感”。一次击杀是否爽快，往往不是单个数值决定，而是多层反馈在极短时间内完成了正确叠加。",
      "在《使命召唤》《泰坦陨落 2》《无畏契约》等游戏中，我会复盘地图动线、交火距离、掩体分布和转点节奏，理解关卡空间如何引导玩家做出战术选择。",
      "这种长期体验让我更关注射击游戏中输入响应与信息表达的平衡：玩家必须能在高速对抗里快速读懂空间、敌人状态和自身风险，这对 UI、音画反馈和角色控制器都有很高要求。",
    ],
  },
  racing: {
    playtime: "100h+",
    playedGames: [
      "极限竞速：地平线系列",
      "极限竞速系列",
      "极品飞车系列",
      "飙酷车神系列",
      "乐高 2K 竞速",
      "F1 系列",
      "尘埃拉力赛系列",
      "神力科莎",
    ],
    achievements: [
      { title: "Welcome to México", text: "Forza Horizon 5 Steam 成就：Arrive at Horizon Festival México，抵达墨西哥 Horizon 嘉年华。" },
      { title: "Race into Action", text: "Forza Horizon 5 Steam 成就：Complete any Horizon Race Event，完成任意 Horizon 赛事。" },
      { title: "Adaptable", text: "Forza Horizon 5 Steam 成就：Complete the On a Wing and a Prayer Showcase Event，完成展示赛事。" },
    ],
    story: [
      "在 100 小时以上的竞速类游戏体验中，我最关注的是速度感如何被拆解成可控的驾驶反馈，而不是单纯依赖画面模糊或速度数值。",
      "我会观察车辆转向响应、漂移入弯、抓地力变化、碰撞反馈和镜头跟随逻辑如何共同塑造驾驶手感。不同竞速游戏之间的差异，往往藏在油门响应、刹车距离和车身惯性这些细节里。",
      "在《极限竞速：地平线》《极品飞车》《飙酷车神》等作品中，我也会研究开放世界道路设计如何服务驾驶节奏：长直道制造速度释放，连续弯道提供操作密度，地标和天气变化则强化探索动机。",
      "这种体验让我理解到，竞速游戏的核心并不只是“快”，而是让玩家在高速移动中依然拥有清晰判断、路线选择和可预期反馈。这对相机、物理参数和场景节奏设计都有很强的参考价值。",
    ],
  },
};

function getFavoriteDetailArchive(favorite) {
  return (
    favoriteDetailArchives[favorite.slug] || {
      playtime: "500h+",
      playedGames: favorite.games,
      achievements: favorite.games.map((game) => ({
        title: game,
        text: "这个条目可以后续替换成你的具体游玩记录、截图或成就。",
      })),
      story: [favorite.text],
    }
  );
}

const activityExperiences = [
  {
    icon: Gamepad2,
    type: "Game Jam",
    title: "限时游戏创作",
    period: "2026",
    text: "参与短周期 GameJam，从玩法提案、白盒验证到可玩版本交付，完成《万兽化身》等项目。",
  },
  {
    icon: Sparkles,
    type: "TapTap Creator",
    title: "TapTap 制造活动",
    period: "2026.05",
    text: "参与多人协作创作活动，负责《木头喵》的核心玩法策划、体验验证和版本推进。",
  },
  {
    icon: Trophy,
    type: "Competition",
    title: "高校游戏创作赛事",
    period: "Top 3",
    text: "围绕玩法创新与完整 Demo 交付参与高校创作比赛，并获得三等奖。",
  },
];

const identityTags = [
  { label: "#游戏开发", icon: Code2 },
  { label: "#技术策划", icon: FolderKanban },
  { label: "#Unity", icon: Gamepad2 },
  { label: "#UE5", icon: Wand2 },
  { label: "#独立游戏", icon: Gamepad2 },
  { label: "#GameJam", icon: Trophy },
  { label: "#AI Native", icon: Sparkles },
  { label: "#像素风", icon: Wand2 },
  { label: "#Roguelike", icon: Gamepad2 },
  { label: "#关卡设计", icon: MapPin },
];

const navItems = [
  { label: "首页", href: "#top", icon: Home },
  { label: "经历", href: "#profile", icon: UserRound },
  { label: "项目", href: "#projects", icon: FolderKanban },
  { label: "最爱", href: "#strengths", icon: Sparkles },
  { label: "联系", href: "#contact", icon: Mail },
];

function PortfolioApp({
  initialProjectIndex = 0,
  initialFavoriteIndex = 0,
  isActive = true,
  onOpenProject,
  onOpenFavorite,
  routeTransitionActive = false,
  visualSettings,
  editorOpen = false,
}) {
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [activeProjectIndex, setActiveProjectIndex] = useState(() =>
    Math.min(projects.length - 1, Math.max(0, initialProjectIndex)),
  );
  const [activeFavoriteIndex, setActiveFavoriteIndex] = useState(0);
  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const transitionRef = useRef(null);
  const transitionProgressRef = useRef(0);
  const transitionAnimatingRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const activePageRef = useRef(0);
  const profileRef = useRef(null);
  const projectsRef = useRef(null);
  const strengthsRef = useRef(null);
  const activitiesRef = useRef(null);
  const contactRef = useRef(null);
  const terminalSettings = visualSettings.terminal;
  const asciiSettings = visualSettings.ascii;
  const screenSettings = visualSettings.screen;
  const heroSettings = visualSettings.hero;
  const navSettings = visualSettings.nav;
  const glowSettings = visualSettings.glow;
  const balatroSettings = visualSettings.balatro;
  const glowProps = {
    edgeSensitivity: glowSettings.edgeSensitivity,
    backgroundColor: glowSettings.backgroundColor,
    borderRadius: glowSettings.borderRadius,
    glowRadius: glowSettings.glowRadius,
    glowIntensity: glowSettings.glowIntensity,
    coneSpread: glowSettings.coneSpread,
    fillOpacity: glowSettings.fillOpacity,
    animated: glowSettings.animated,
    colors: [glowSettings.colorOne, glowSettings.colorTwo, glowSettings.colorThree],
  };
  const gooeyDemoItems = useMemo(
    () => [
      { label: "主页", href: "#top" },
      { label: "项目", href: "#projects" },
      { label: "最爱", href: "#strengths" },
      { label: "活动", href: "#activities" },
      { label: "关于我", href: "#profile" },
    ],
    [],
  );

  const terminalGrid = useMemo(
    () => [terminalSettings.gridX, terminalSettings.gridY],
    [terminalSettings.gridX, terminalSettings.gridY],
  );

  useEffect(() => {
    transitionProgressRef.current = transitionProgress;
  }, [transitionProgress]);

  useLayoutEffect(() => {
    if (!isActive) return undefined;

    const params = new URLSearchParams(window.location.search);
    const shouldRestoreProjects = params.get("return") === "projects" || window.location.hash === "#projects";
    const shouldRestoreFavorites = window.location.hash === "#strengths";

    if (!shouldRestoreProjects && !shouldRestoreFavorites) return undefined;

    transitionProgressRef.current = 1;
    setTransitionProgress(1);
    setTransitionPhase("idle");

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    if (shouldRestoreProjects) {
      const projectTop = projectsRef.current?.offsetTop;
      if (typeof projectTop !== "number") {
        root.style.scrollBehavior = previousScrollBehavior;
        return undefined;
      }

      const restoredProjectIndex = Math.min(projects.length - 1, Math.max(0, initialProjectIndex));
      const restoredProjectPage = FIRST_PROJECT_PAGE + restoredProjectIndex;
      activePageRef.current = restoredProjectPage;
      setActiveProjectIndex(restoredProjectIndex);
      setActiveNavIndex(getNavIndexForPage(restoredProjectPage));
      window.scrollTo(0, projectTop + restoredProjectIndex * window.innerHeight);
      window.history.replaceState(null, "", "/#projects");
    }

    if (shouldRestoreFavorites) {
      const favoriteTop = strengthsRef.current?.offsetTop;
      if (typeof favoriteTop !== "number") {
        root.style.scrollBehavior = previousScrollBehavior;
        return undefined;
      }

      const restoredFavoriteIndex = Math.min(favoriteGameModules.length - 1, Math.max(0, initialFavoriteIndex));
      const restoredFavoritePage = STRENGTHS_PAGE + restoredFavoriteIndex;
      activePageRef.current = restoredFavoritePage;
      setActiveFavoriteIndex(restoredFavoriteIndex);
      setActiveNavIndex(getNavIndexForPage(restoredFavoritePage));
      window.scrollTo(0, favoriteTop + restoredFavoriteIndex * window.innerHeight);
      window.history.replaceState(null, "", "/#strengths");
    }

    root.style.scrollBehavior = previousScrollBehavior;

    return undefined;
  }, [initialFavoriteIndex, initialProjectIndex, isActive]);

  useEffect(() => {
    if (isActive && !routeTransitionActive) {
      transitionAnimatingRef.current = false;
    }
  }, [isActive, routeTransitionActive]);

  useEffect(() => {
    if (!isActive) return undefined;

    const transitionDuration = 1500;
    const sectionDuration = 520;
    const projectSectionDuration = 520;

    const getPageTop = (page) => {
      if (page <= 1) return 0;
      if (page >= FIRST_PROJECT_PAGE && page <= LAST_PROJECT_PAGE) {
        return (projectsRef.current?.offsetTop ?? 0) + (page - FIRST_PROJECT_PAGE) * window.innerHeight;
      }
      if (page >= STRENGTHS_PAGE && page <= LAST_FAVORITE_PAGE) {
        return (strengthsRef.current?.offsetTop ?? 0) + (page - STRENGTHS_PAGE) * window.innerHeight;
      }
      if (page === ACTIVITIES_PAGE) return activitiesRef.current?.offsetTop ?? 0;
      if (page === CONTACT_PAGE || page === PROFILE_PAGE) return contactRef.current?.offsetTop ?? 0;
      return 0;
    };

    const getCurrentPage = () => {
      if (window.scrollY <= Math.max(4, window.innerHeight * 0.25)) {
        return transitionProgressRef.current >= 0.5 ? 1 : 0;
      }

      const projectSection = projectsRef.current;
      if (projectSection) {
        const projectTop = projectSection.offsetTop;
        const projectBottom = projectTop + projectSection.offsetHeight - window.innerHeight;
        if (window.scrollY >= projectTop - 4 && window.scrollY <= projectBottom + 4) {
          return Math.min(
            LAST_PROJECT_PAGE,
            Math.max(
              FIRST_PROJECT_PAGE,
              FIRST_PROJECT_PAGE + Math.round((window.scrollY - projectTop) / window.innerHeight),
            ),
          );
        }
      }

      const favoriteSection = strengthsRef.current;
      if (favoriteSection) {
        const favoriteTop = favoriteSection.offsetTop;
        const favoriteBottom = favoriteTop + favoriteSection.offsetHeight - window.innerHeight;
        if (window.scrollY >= favoriteTop - 4 && window.scrollY <= favoriteBottom + 4) {
          return Math.min(
            LAST_FAVORITE_PAGE,
            Math.max(
              STRENGTHS_PAGE,
              STRENGTHS_PAGE + Math.round((window.scrollY - favoriteTop) / window.innerHeight),
            ),
          );
        }
      }

      let closestPage = ACTIVITIES_PAGE;
      let closestDistance = Number.POSITIVE_INFINITY;

      [ACTIVITIES_PAGE, CONTACT_PAGE].forEach((page) => {
        const distance = Math.abs(getPageTop(page) - window.scrollY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPage = page;
        }
      });

      return closestPage;
    };

    const triggerPage = (targetPage) => {
      transitionAnimatingRef.current = true;
      activePageRef.current = targetPage;
      setActiveNavIndex(getNavIndexForPage(targetPage));

      if (targetPage >= FIRST_PROJECT_PAGE && targetPage <= LAST_PROJECT_PAGE) {
        setActiveProjectIndex(targetPage - FIRST_PROJECT_PAGE);
      }
      if (targetPage >= STRENGTHS_PAGE && targetPage <= LAST_FAVORITE_PAGE) {
        setActiveFavoriteIndex(targetPage - STRENGTHS_PAGE);
      }

      if (targetPage <= 1) {
        animateToScrollPosition(0);
        setTransitionPhase(targetPage === 1 ? "enter-tv" : "leave-tv");
        const targetProgress = targetPage === 1 ? 1 : 0;
        transitionProgressRef.current = targetProgress;
        setTransitionProgress(targetProgress);
      } else {
        setTransitionPhase("idle");
        transitionProgressRef.current = 1;
        setTransitionProgress(1);
        animateToScrollPosition(getPageTop(targetPage));
      }

      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }

      const releasePageLock = () => {
        setTransitionPhase("idle");
        transitionAnimatingRef.current = false;
        transitionTimerRef.current = null;
      };

      const isProjectPage = targetPage >= FIRST_PROJECT_PAGE && targetPage <= LAST_PROJECT_PAGE;

      transitionTimerRef.current = window.setTimeout(
        releasePageLock,
        targetPage <= 1 ? transitionDuration : isProjectPage ? projectSectionDuration : sectionDuration,
      );
    };

    const onWheel = (event) => {
      if (editorOpen) return;

      const wantsForward = event.deltaY > 0;
      const wantsBackward = event.deltaY < 0;
      if (!wantsForward && !wantsBackward) return;

      event.preventDefault();

      if (transitionAnimatingRef.current) return;

      const lastPage = PAGE_COUNT - 1;
      const lastPageTop = getPageTop(lastPage);
      if (
        wantsForward &&
        (activePageRef.current >= lastPage || window.scrollY >= lastPageTop - 4)
      ) {
        activePageRef.current = lastPage;
        setActiveNavIndex(getNavIndexForPage(lastPage));
        return;
      }

      const currentPage = getCurrentPage();
      activePageRef.current = currentPage;

      const wheelDirection = wantsForward ? 1 : -1;
      const targetPage = Math.min(PAGE_COUNT - 1, Math.max(0, currentPage + wheelDirection));

      if (targetPage === currentPage) {
        return;
      }

      triggerPage(targetPage);
    };

    window.__portfolioNavigateToPage = triggerPage;

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      if (window.__portfolioNavigateToPage === triggerPage) {
        delete window.__portfolioNavigateToPage;
      }
      window.removeEventListener("wheel", onWheel);
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [editorOpen, isActive]);

  const enterTvScene = () => {
    if (transitionAnimatingRef.current || transitionProgressRef.current >= 1) return;

    transitionAnimatingRef.current = true;
    activePageRef.current = 1;
    setActiveNavIndex(0);
    setTransitionPhase("enter-tv");
    transitionProgressRef.current = 1;
    setTransitionProgress(1);
    animateToScrollPosition(0);

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setTransitionPhase("idle");
      transitionAnimatingRef.current = false;
      transitionTimerRef.current = null;
    }, 1500);
  };

  const navigateFromNav = (event, item) => {
    const pageByHref = {
      "#top": 0,
      "#projects": FIRST_PROJECT_PAGE,
      "#strengths": STRENGTHS_PAGE,
      "#activities": ACTIVITIES_PAGE,
      "#profile": PROFILE_PAGE,
    };
    const targetPage = pageByHref[item?.href];

    if (typeof targetPage !== "number") return false;

    event.preventDefault();
    window.__portfolioNavigateToPage?.(targetPage);
    return true;
  };

  const selectProject = (index) => {
    if (index < 0) {
      activePageRef.current = 1;
      setActiveNavIndex(0);
      transitionProgressRef.current = 1;
      setTransitionProgress(1);
      setTransitionPhase("enter-tv");
      animateToScrollPosition(0);
      return;
    }

    if (index >= projects.length) {
      activePageRef.current = STRENGTHS_PAGE;
      setActiveFavoriteIndex(0);
      setActiveNavIndex(getNavIndexForPage(STRENGTHS_PAGE));
      animateToScrollPosition(strengthsRef.current?.offsetTop ?? 0);
      return;
    }

    setActiveProjectIndex(index);
    activePageRef.current = index + FIRST_PROJECT_PAGE;
    setActiveNavIndex(1);
    animateToScrollPosition((projectsRef.current?.offsetTop ?? 0) + index * window.innerHeight);
  };

  const selectFavorite = (index) => {
    const targetIndex = Math.min(favoriteGameModules.length - 1, Math.max(0, index));
    const targetPage = STRENGTHS_PAGE + targetIndex;
    setActiveFavoriteIndex(targetIndex);
    activePageRef.current = targetPage;
    setActiveNavIndex(getNavIndexForPage(targetPage));
    animateToScrollPosition(
      (strengthsRef.current?.offsetTop ?? 0) + targetIndex * window.innerHeight,
    );
  };

  const openProjectDetails = (project, sourceElement) => {
    if (routeTransitionActive) return;

    const rect = sourceElement?.getBoundingClientRect();
    const pixelColors = sampleProjectRouteColors(project, sourceElement);
    transitionAnimatingRef.current = true;
    onOpenProject?.({
      slug: project.slug,
      image: project.slug === "balatro-shader" ? null : project.image,
      backgroundColor: PROJECT_ROUTE_FALLBACKS[project.slug] || "#07040c",
      pixelColors,
      direction: "forward",
      left: rect?.left ?? window.innerWidth / 2,
      top: rect?.top ?? window.innerHeight / 2,
      width: rect?.width ?? 1,
      height: rect?.height ?? 1,
    });
  };

  return (
    <main
      className={`${navSettings.variant === "pixel" ? "usePixelNav" : "useClassicNav"}${isActive ? "" : " portfolioRouteHidden"}`}
      aria-hidden={!isActive}
    >
      <div
        className="portfolioPixelGooeyNav"
        aria-label="像素粒子导航示例"
        style={{
          "--pixel-particle-1": navSettings.particleOne,
          "--pixel-particle-2": navSettings.particleTwo,
          "--pixel-particle-3": navSettings.particleThree,
          "--pixel-particle-4": navSettings.particleFour,
        }}
      >
        <PixelGooeyNav items={gooeyDemoItems} initialActiveIndex={0} activeIndex={activeNavIndex} particleCount={navSettings.particleCount} onNavigate={navigateFromNav} />
      </div>
      <div
        className="portfolioGooeyNav"
        aria-label="React Bits Gooey Nav 原始示例"
        style={{
          "--color-1": navSettings.particleOne,
          "--color-2": navSettings.particleTwo,
          "--color-3": navSettings.particleThree,
          "--color-4": navSettings.particleFour,
        }}
      >
        <GooeyNav
          items={gooeyDemoItems}
          particleCount={navSettings.particleCount}
          particleDistances={[navSettings.particleOuterDistance, navSettings.particleInnerDistance]}
          particleR={navSettings.radiusFactor}
          initialActiveIndex={0}
          animationTime={navSettings.animationTime}
          timeVariance={navSettings.animationVariance}
          colors={[1, 2, 3, 4, 2, 3, 1, 4]}
          activeIndex={activeNavIndex}
          onNavigate={navigateFromNav}
        />
      </div>

      <section
        ref={transitionRef}
        className={`heroTvTransition${transitionProgress >= 1 ? " isTvSettled" : ""}${transitionPhase === "leave-tv" ? " isLeavingTv" : ""}${transitionPhase === "enter-tv" ? " isEnteringTv" : ""}${editorOpen ? " isRangePreview" : ""}`}
        id="top"
        style={{
          "--scene-progress": transitionProgress,
          "--tv-screen-left": `${screenSettings.slotLeft}%`,
          "--tv-screen-top": `${screenSettings.slotTop}%`,
          "--tv-screen-width": `${screenSettings.slotWidth}%`,
          "--tv-screen-height": `${screenSettings.slotHeight}%`,
          "--tv-frame-width": `${screenSettings.frameWidthVw}vw`,
          "--tv-frame-height": `${screenSettings.frameHeightVh}vh`,
          "--tv-frame-scale": screenSettings.frameScale,
          "--tv-frame-offset-x": `${screenSettings.frameOffsetX}px`,
          "--tv-frame-offset-y": `${screenSettings.frameOffsetY}px`,
          "--tv-camera-scale": screenSettings.cameraScale,
          "--tv-camera-origin-x": `${screenSettings.cameraOriginX}%`,
          "--tv-camera-origin-y": `${screenSettings.cameraOriginY}%`,
          "--hero-intro-size": `${heroSettings.introSize}px`,
          "--hero-welcome-size": `${heroSettings.welcomeSize}px`,
          "--hero-eyebrow-size": `${heroSettings.eyebrowSize}px`,
          "--hero-left-offset": `${heroSettings.leftOffset}px`,
        }}
        aria-label="主页进入电视机的场景转场"
      >
        <div className="heroTvSticky">
          <div className="tvSceneLayer">
            <div className="tvSceneArt" aria-hidden="true" />
            <div className="tvSceneVignette" aria-hidden="true" />
            <div className="tvScreenSlot" aria-label="电视机中的主页预览">
              <div className="tvScreenContent">
                <div className="tvScreenFrame">
                  <HeroVisual
                    terminalSettings={terminalSettings}
                    terminalGrid={terminalGrid}
                    asciiSettings={asciiSettings}
                    onExplore={enterTvScene}
                  />
                </div>
              </div>
              <div className="tvScreenGlass" aria-hidden="true" />
            </div>
          </div>
          <aside className="tvTagPanel" aria-label="个人标签">
            <div className="tvTagTitle" aria-hidden="true">
              <i />
              <strong>我的 Tag</strong>
              <i />
            </div>
            <ul className="tvIdentityTags">
              {identityTags.map((tag, index) => {
                const Icon = tag.icon;
                return (
                  <li className="tvPixelTag" style={{ "--tag-index": index }} key={tag.label}>
                    <div className="tvPixelTagInner">
                      <span className="tvIdentityIcon">
                        <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                      </span>
                      <strong>{tag.label}</strong>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="tvTagMotto">
              <Sparkles size={18} aria-hidden="true" />
              <span>持续学习 · 不断创造</span>
              <b aria-hidden="true">›</b>
            </div>
          </aside>
        </div>
      </section>
      <section
        ref={projectsRef}
        className="projectFanSection pageSection"
        id="projects"
        style={{ "--project-count": projects.length }}
      >
        <div className="projectFanSticky">
          <div className="projectFanHeading">
            <div>
              <p>Selected Work</p>
              <h2>游戏项目</h2>
            </div>
            <span>
              {String(activeProjectIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
          </div>
          <ProjectFanStack
            items={projects}
            activeIndex={activeProjectIndex}
            onChange={selectProject}
            onOpenProject={openProjectDetails}
            balatroSettings={balatroSettings}
          />
        </div>
      </section>

      <FavoriteTimeline
        sectionRef={strengthsRef}
        items={favoriteGameModules}
        activeIndex={activeFavoriteIndex}
        onSelect={selectFavorite}
        onOpenDetails={onOpenFavorite}
      />

      <section ref={activitiesRef} className="activitySection pageSection" id="activities">
        <Suspense fallback={<div className="activityLoading">Loading lanyard...</div>}>
          <ActivityLanyardBoard items={activityExperiences} />
        </Suspense>
      </section>

      {false && (
      <section className="section favorites pageSection">
        <div className="projectFanHeading favoriteHeading">
          <div>
            <p>Favorite Games</p>
            <h2>我的最爱</h2>
          </div>
        </div>
        <div className="shell favoriteGrid">
          {favoriteGameModules.map((item, index) => {
            const Icon = item.icon;
            return (
              <BorderGlow key={item.title} className="favoriteGlow" {...glowProps}>
                <article className="favoriteCard" style={{ "--favorite-index": index }}>
                  <div className="favoriteCardTop">
                    <div className="favoriteIconBox">
                      <Icon size={24} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <div className="favoriteGameList" aria-label={`${item.title}代表游戏`}>
                    {item.games.map((game) => (
                      <span key={game}>{game}</span>
                    ))}
                  </div>
                  <p>{item.text}</p>
                </article>
              </BorderGlow>
            );
          })}
        </div>
      </section>
      )}

      <section ref={contactRef} className="aboutFinal pageSection" id="profile">
        <div className="aboutFinalGrid">
          <article className="aboutPixelPanel aboutIntroPanel">
            <p className="aboutEyebrow"><span />ABOUT ME</p>
            <h2>关于我</h2>
            <p>
              你好，我是王俊涛，也可以叫我羊哞哞。我是一名游戏策划与游戏程序开发者，目前就读于广东技术师范大学软件工程专业。
              我喜欢从玩法推演出发，用 Unity、UE5 和 AI 工具快速完成原型、验证手感，并把想法真正做成可以玩的 Demo。
            </p>
          </article>

          <article className="aboutPixelPanel aboutContactPanel">
            <h3>求职意向 & 联系方式</h3>
            <div className="aboutInfoRows">
              <div><span>求职方向</span><strong>游戏策划 / 游戏程序</strong></div>
              <div><span>专业背景</span><strong>软件工程</strong></div>
              <div><span>实习时间</span><strong>每周 5 天 / 6 月底可到岗</strong></div>
              <div><span>联系邮箱</span><a href="mailto:3414884729@qq.com">3414884729@qq.com</a></div>
              <div><span>联系电话</span><a href="tel:18359795479">18359795479</a></div>
            </div>
          </article>

          <article className="aboutPixelPanel aboutToolPanel">
            <h3>技能与工具集</h3>
            <div className="aboutToolTags">
              {[
                "Unity",
                "UE5",
                "C# / C++",
                "玩法原型",
                "关卡白盒",
                "3C 手感",
                "Shader / VFX",
                "AI Native",
                "Cursor",
                "ChatGPT / Gemini",
              ].map((tool) => <span key={tool}>{tool}</span>)}
            </div>
          </article>

          <article className="aboutPixelPanel aboutAwardsPanel" aria-label="我的奖项">
            <div className="aboutAwardsBox">
              {awards.map((award) => (
                <div className="aboutAwardItem" key={award.name}>
                  <strong>{award.result}</strong>
                  <span>{award.name}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {false && (
      <section ref={profileRef} className="profile section pageSection">
        <ViewportVideo className="profileVideoBg" src="/assets/profile-room-video.mp4" />
        <div className="shell profileLayout">
          <BorderGlow className="profileGlow portraitGlow" {...glowProps}>
            <div className="portraitWrap">
              <img src="/assets/portrait.png" alt="王俊涛人物图" />
              <div className="statusLine">
                <span />
                6月底可到岗 / 每周可实习5天
              </div>
            </div>
          </BorderGlow>

          <BorderGlow className="profileGlow profileCopyGlow" {...glowProps}>
            <div className="profileCopy">
              <p className="sectionKicker">Profile</p>
              <h2>游戏策划与程序开发双栈，偏向 AI Native 快速创作。</h2>
              <p>
                我目前就读于广东技术师范大学软件工程专业，方向是玩法策划、关卡验证、Unity / UE 原型开发和 AI 辅助内容生产。
                在多个 GameJam 与高校赛事中，我负责从创意推演、系统拆解、程序实现到 Demo 交付的完整链路。
              </p>
              <div className="infoGrid">
                <a href="tel:18359795479">
                  <Phone size={18} />
                  18359795479
                </a>
                <a href="mailto:3414884729@qq.com">
                  <Mail size={18} />
                  3414884729@qq.com
                </a>
                <span>
                  <MessageCircle size={18} />
                  QQ 3414884729
                </span>
                <span>
                  <MapPin size={18} />
                  广东技术师范大学
                </span>
              </div>
            </div>
          </BorderGlow>
        </div>

        <div className="shell statGrid" aria-label="项目数据">
          {stats.map((stat) => (
            <BorderGlow key={stat.label} className="statGlow" {...glowProps}>
              <div className="statCard">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </BorderGlow>
          ))}
        </div>
      </section>
      )}

    </main>
  );
}

function FavoriteDetail({ favorite, onBack }) {
  const Icon = favorite.icon;
  const archive = getFavoriteDetailArchive(favorite);

  return (
    <main className="favoriteDetailPage">
      <div className="favoriteDetailScene" aria-hidden="true">
        {favorite.video ? (
          <video className="favoriteDetailVideo" muted loop playsInline autoPlay preload="metadata" poster={favorite.poster || undefined}>
            <source src={favorite.video} type="video/mp4" />
          </video>
        ) : favorite.backgroundImage || favorite.poster ? (
          <img className="favoriteDetailImage" src={favorite.backgroundImage || favorite.poster} alt="" />
        ) : null}
        <div className="favoriteDetailOverlay" />
      </div>

      <header className="favoriteDetailHeader">
        <a href="/#strengths" className="favoriteBackButton" onClick={onBack}>
          <ArrowLeft size={18} />
          返回最爱列表
        </a>
        <span>羊哞哞 / FAVORITE GAMES</span>
      </header>

      <section className="favoriteDetailHero">
        <div className="favoriteDetailContent">
          <div className="favoriteDetailKicker">
            <div className="favoriteDetailIcon" aria-hidden="true">
              <Icon size={30} strokeWidth={2.2} />
            </div>
            <p>{favorite.label}</p>
          </div>
          <h1>{favorite.title}</h1>
          <div className="favoriteDetailSummary">
            <div className="favoritePlaytime">
              <span>游玩时间</span>
              <strong>{archive.playtime}</strong>
            </div>
            <p className="favoriteDetailLead">{favorite.text}</p>
          </div>
        </div>
      </section>

      <section className="favoriteDetailArchive" aria-label={`${favorite.title} 详细档案`}>
        <article className="favoriteArchivePanel favoriteArchiveGames">
          <p>PLAYED GAMES</p>
          <h2>这个品类我玩过什么游戏</h2>
          <div className="favoriteArchiveGameGrid">
            {archive.playedGames.map((game) => (
              <span key={game}>{game}</span>
            ))}
          </div>
        </article>

        <article className="favoriteArchivePanel favoriteArchiveAchievements">
          <p>ACHIEVEMENTS</p>
          <h2>我的一些游戏成就</h2>
          <div className="favoriteAchievementList">
            {archive.achievements.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={`favoriteArchivePanel favoriteArchiveStory${archive.images?.length ? "" : " hasNoImages"}`}>
          <div>
            <p>STORY</p>
            <h2>我和这个游戏类型的故事</h2>
            {archive.story.map((paragraph) => (
              <span key={paragraph}>{paragraph}</span>
            ))}
          </div>
          {archive.images?.length ? (
            <figure className={archive.images?.length > 1 ? "favoriteStoryGallery" : undefined}>
              {archive.images.map((image) => (
                <img key={image.src} src={image.src} alt={image.alt} />
              ))}
            </figure>
          ) : null}
        </article>
      </section>
    </main>
  );
}

function App() {
  const initialProjectSlug = new URLSearchParams(window.location.search).get("project");
  const initialFavoriteSlug = new URLSearchParams(window.location.search).get("favorite");
  const [savedVisualSettings, setSavedVisualSettings] = useState(loadVisualSettings);
  const [draftVisualSettings, setDraftVisualSettings] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [projectSlug, setProjectSlug] = useState(initialProjectSlug);
  const [favoriteSlug, setFavoriteSlug] = useState(initialFavoriteSlug);
  const [projectRouteTransition, setProjectRouteTransition] = useState(null);
  const [returnProjectIndex, setReturnProjectIndex] = useState(() =>
    Math.max(0, projects.findIndex((project) => project.slug === initialProjectSlug)),
  );
  const [returnFavoriteIndex, setReturnFavoriteIndex] = useState(() =>
    Math.max(0, favoriteGameModules.findIndex((favorite) => favorite.slug === initialFavoriteSlug)),
  );
  const selectedProject = projects.find((project) => project.slug === projectSlug);
  const selectedFavorite = favoriteGameModules.find((favorite) => favorite.slug === favoriteSlug);
  const visualSettings = draftVisualSettings || savedVisualSettings;

  useLayoutEffect(() => {
    if (!selectedFavorite) return;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    root.style.scrollBehavior = previousScrollBehavior;
  }, [selectedFavorite?.slug]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (editorOpen || event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isTyping) {
        return;
      }

      event.preventDefault();
      setDraftVisualSettings(cloneSettings(savedVisualSettings));
      setEditorOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorOpen, savedVisualSettings]);

  const closeVisualEditor = ({ save }) => {
    if (save && draftVisualSettings) {
      const nextSettings = mergeVisualSettings(draftVisualSettings);
      setSavedVisualSettings(nextSettings);
      window.localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(nextSettings));
    }

    setDraftVisualSettings(null);
    setEditorOpen(false);
  };

  useEffect(() => {
    const syncRoute = () => {
      setProjectRouteTransition(null);
      setProjectSlug(new URLSearchParams(window.location.search).get("project"));
      setFavoriteSlug(new URLSearchParams(window.location.search).get("favorite"));
    };

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const openProject = (transition) => {
    if (projectRouteTransition) return;

    const projectIndex = projects.findIndex((project) => project.slug === transition.slug);
    setReturnProjectIndex(Math.max(0, projectIndex));
    setProjectRouteTransition(transition);
  };

  const openFavorite = (favorite) => {
    if (!favorite?.slug) return;

    const favoriteIndex = favoriteGameModules.findIndex((item) => item.slug === favorite.slug);
    setReturnFavoriteIndex(Math.max(0, favoriteIndex));
    window.history.pushState(null, "", `/?favorite=${encodeURIComponent(favorite.slug)}`);
    setFavoriteSlug(favorite.slug);
  };

  const returnToFavorites = (event) => {
    event?.preventDefault();
    window.history.replaceState(null, "", "/#strengths");
    setFavoriteSlug(null);
  };

  const returnToProjects = (event) => {
    event?.preventDefault();
    if (!selectedProject || projectRouteTransition) return;

    const projectIndex = projects.findIndex((project) => project.slug === selectedProject.slug);

    setReturnProjectIndex(Math.max(0, projectIndex));
    setProjectRouteTransition({
      slug: selectedProject.slug,
      image: null,
      backgroundColor: "#000000",
      pixelColors: Array(PROJECT_ROUTE_GRID_SIZE ** 2).fill("#000000"),
      direction: "reverse",
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  const handleRouteTransitionMidpoint = (transition) => {
    if (transition.direction === "reverse") {
      window.history.replaceState(null, "", "/#projects");
      setProjectSlug(null);
      return;
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
    window.history.pushState(null, "", `/?project=${encodeURIComponent(transition.slug)}`);
    setProjectSlug(transition.slug);
  };

  const handleRouteTransitionComplete = () => {
    setProjectRouteTransition(null);
  };

  return (
    <>
      <PortfolioApp
        initialProjectIndex={returnProjectIndex}
        initialFavoriteIndex={returnFavoriteIndex}
        isActive={!selectedProject && !selectedFavorite}
        onOpenProject={openProject}
        onOpenFavorite={openFavorite}
        routeTransitionActive={Boolean(projectRouteTransition)}
        visualSettings={visualSettings}
        editorOpen={editorOpen}
      />
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onBack={returnToProjects}
          animateText={!projectRouteTransition}
          visualSettings={visualSettings}
        />
      )}
      {selectedFavorite && <FavoriteDetail favorite={selectedFavorite} onBack={returnToFavorites} />}
      {projectRouteTransition && (
        <ProjectRouteTransition
          transition={projectRouteTransition}
          settings={visualSettings.transition}
          onMidpoint={handleRouteTransitionMidpoint}
          onComplete={handleRouteTransitionComplete}
        />
      )}
      {editorOpen && draftVisualSettings && (
        <VisualEditor
          settings={draftVisualSettings}
          defaultSettings={defaultVisualSettings}
          password={EDITOR_PASSWORD}
          onChange={setDraftVisualSettings}
          onClose={closeVisualEditor}
        />
      )}
    </>
  );
}

export default App;
