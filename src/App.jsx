import {
  ArrowUpRight,
  Code2,
  FolderKanban,
  Gamepad2,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Trophy,
  UserRound,
  Wand2,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ASCIIText from "./components/ASCIIText";
import FaultyTerminal from "./components/FaultyTerminal";
import GooeyNav from "./components/GooeyNav/GooeyNav";
import PixelGooeyNav from "./components/PixelGooeyNav/PixelGooeyNav";
import BorderGlow from "./components/BorderGlow/BorderGlow";
import ProjectDetail from "./components/ProjectDetail/ProjectDetail";
import ProjectFanStack from "./components/ProjectFanStack/ProjectFanStack";
import ProjectRouteTransition from "./components/ProjectRouteTransition/ProjectRouteTransition";
import VisualEditor from "./components/VisualEditor";

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

const projects = [
  {
    slug: "beast-incarnation",
    title: "万兽化身",
    meta: "Unity / 关卡策划 / 程序",
    period: "2026.03 - 2026.06",
    image: "/assets/project-beast.png",
    tag: "GAME JAM",
    desc: "2D 像素风硬核精准平台跳跃游戏。围绕多形态无缝切换与底层物理法则重构，验证狼、蛙、猫、羊等动物动能规律带来的操作心流。",
    link: "https://www.bilibili.com/video/BV14L5d66EHm/",
  },
  {
    slug: "wood-cat",
    title: "木头喵",
    meta: "TapTap 制造 / 主策划",
    period: "2026.05",
    image: "/assets/project-woodcat.png",
    tag: "GAME JAM",
    desc: "双人欢乐乱斗派对游戏。以物理碰撞、载具机制、地形博弈为核心，在短周期内完成创意提出、核心乐趣验证和可玩版本交付。",
    link: "https://www.taptap.cn/app/864971",
  },
  {
    slug: "endless-rush-hour",
    title: "无尽早高峰",
    meta: "像素 / 多角色 / 关卡节奏设计",
    period: "待补充",
    image: "/assets/project-peakrush.png",
    tag: "COMPETITION",
    desc: "一款高密度关卡推进的像素动作项目。通过持续障碍、路线分流与节奏压迫，测试玩家在短时间内做决策的爽感曲线。",
    link: "#contact",
  },
  {
    slug: "headhunter-company",
    title: "神人猎头公司",
    meta: "Solo Developer / AI Agent / 经营模拟",
    period: "2026.06 - 至今",
    image: "/assets/project-agent.png",
    tag: "COMPETITION",
    desc: "基于 AI Agent 工作流构建的黑色幽默模拟经营游戏。接入 Qwen 模型完成语义评分，驱动求职者探查、包装售卖与经营扩张循环。",
    link: "https://www.taptap.cn/moment/813589271922344237",
  },
  {
    slug: "balatro-shader",
    title: "小丑牌 Shader 复刻",
    meta: "Shader / VFX / 画面复刻",
    period: "待补充",
    image: "/assets/project-beast.png",
    tag: "RECREATION",
    desc: "用于展示对小丑牌视觉风格的 Shader 复刻、卡面发光与整体特效还原。后续可替换为真实过程截图或动图。",
    link: "#contact",
  },
  {
    slug: "ue5-jett-3c",
    title: "UE5 复刻捷丰 3C",
    meta: "UE5 / 角色控制 / 技能系统",
    period: "待补充",
    image: "/assets/project-agent.png",
    tag: "RECREATION",
    desc: "在 UE5 中复刻捷丰的移动、跳跃、冲刺与技能框架，重点展示 3C 手感、输入响应和技能连招结构。",
    link: "#contact",
  },
];

const FIRST_PROJECT_PAGE = 2;
const LAST_PROJECT_PAGE = FIRST_PROJECT_PAGE + projects.length - 1;
const STRENGTHS_PAGE = LAST_PROJECT_PAGE + 1;
const CONTACT_PAGE = STRENGTHS_PAGE + 1;
const PROFILE_PAGE = CONTACT_PAGE + 1;
const PAGE_COUNT = PROFILE_PAGE + 1;

function getNavIndexForPage(page) {
  if (page === PROFILE_PAGE) return 2;
  if (page >= FIRST_PROJECT_PAGE && page < PROFILE_PAGE) return 1;
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
  { label: "优势", href: "#strengths", icon: Sparkles },
  { label: "联系", href: "#contact", icon: Mail },
];

function PortfolioApp({
  initialProjectIndex = 0,
  isActive = true,
  onOpenProject,
  routeTransitionActive = false,
  visualSettings,
  editorOpen = false,
}) {
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [activeProjectIndex, setActiveProjectIndex] = useState(() =>
    Math.min(projects.length - 1, Math.max(0, initialProjectIndex)),
  );
  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const transitionRef = useRef(null);
  const transitionProgressRef = useRef(0);
  const transitionAnimatingRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const activePageRef = useRef(0);
  const profileRef = useRef(null);
  const projectsRef = useRef(null);
  const strengthsRef = useRef(null);
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

    if (!shouldRestoreProjects) return undefined;

    const projectTop = projectsRef.current?.offsetTop;
    if (typeof projectTop !== "number") return undefined;

    const restoredProjectIndex = Math.min(projects.length - 1, Math.max(0, initialProjectIndex));

    transitionProgressRef.current = 1;
    setTransitionProgress(1);
    setTransitionPhase("idle");
    activePageRef.current = FIRST_PROJECT_PAGE + restoredProjectIndex;
    setActiveProjectIndex(restoredProjectIndex);
    setActiveNavIndex(1);

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, projectTop + restoredProjectIndex * window.innerHeight);
    root.style.scrollBehavior = previousScrollBehavior;
    window.history.replaceState(null, "", "/#projects");

    return undefined;
  }, [initialProjectIndex, isActive]);

  useEffect(() => {
    if (isActive && !routeTransitionActive) {
      transitionAnimatingRef.current = false;
    }
  }, [isActive, routeTransitionActive]);

  useEffect(() => {
    if (!isActive) return undefined;

    const transitionDuration = 1500;
    const sectionDuration = 720;
    const projectSectionDuration = 520;

    const getPageTop = (page) => {
      if (page <= 1) return 0;
      if (page >= FIRST_PROJECT_PAGE && page <= LAST_PROJECT_PAGE) {
        return (projectsRef.current?.offsetTop ?? 0) + (page - FIRST_PROJECT_PAGE) * window.innerHeight;
      }
      if (page === STRENGTHS_PAGE) return strengthsRef.current?.offsetTop ?? 0;
      if (page === CONTACT_PAGE) return contactRef.current?.offsetTop ?? 0;
      if (page === PROFILE_PAGE) return profileRef.current?.offsetTop ?? 0;
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

      let closestPage = STRENGTHS_PAGE;
      let closestDistance = Number.POSITIVE_INFINITY;

      [STRENGTHS_PAGE, CONTACT_PAGE, PROFILE_PAGE].forEach((page) => {
        const distance = Math.abs(getPageTop(page) - window.scrollY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPage = page;
        }
      });

      return closestPage;
    };

    const scrollToSection = (section) => {
      if (!section) return;
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    };

    const triggerPage = (targetPage) => {
      transitionAnimatingRef.current = true;
      activePageRef.current = targetPage;
      setActiveNavIndex(getNavIndexForPage(targetPage));

      if (targetPage >= FIRST_PROJECT_PAGE && targetPage <= LAST_PROJECT_PAGE) {
        setActiveProjectIndex(targetPage - FIRST_PROJECT_PAGE);
      }

      if (targetPage <= 1) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTransitionPhase(targetPage === 1 ? "enter-tv" : "leave-tv");
        const targetProgress = targetPage === 1 ? 1 : 0;
        transitionProgressRef.current = targetProgress;
        setTransitionProgress(targetProgress);
      } else {
        setTransitionPhase("idle");
        transitionProgressRef.current = 1;
        setTransitionProgress(1);
        window.scrollTo({
          top: getPageTop(targetPage),
          behavior: "smooth",
        });
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
    window.scrollTo({ top: 0, behavior: "smooth" });

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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (index >= projects.length) {
      activePageRef.current = STRENGTHS_PAGE;
      setActiveNavIndex(1);
      window.scrollTo({
        top: strengthsRef.current?.offsetTop ?? 0,
        behavior: "smooth",
      });
      return;
    }

    setActiveProjectIndex(index);
    activePageRef.current = index + FIRST_PROJECT_PAGE;
    setActiveNavIndex(1);
    window.scrollTo({
      top: (projectsRef.current?.offsetTop ?? 0) + index * window.innerHeight,
      behavior: "smooth",
    });
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

      <section ref={strengthsRef} className="section strengths pageSection" id="strengths">
        <div className="shell sectionHeader split">
          <div>
            <p className="sectionKicker">Capability</p>
            <h2>个人优势</h2>
          </div>
          <p>更擅长把抽象想法快速落成可玩版本，再通过数据、手感和玩家反馈继续收敛。</p>
        </div>
        <div className="shell strengthGrid">
          {strengths.map((item) => {
            const Icon = item.icon;
            return (
              <BorderGlow key={item.title} className="strengthGlow" {...glowProps}>
                <article className="strengthCard">
                  <div className="iconBox">
                    <Icon size={24} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </BorderGlow>
            );
          })}
        </div>
      </section>

      <section ref={contactRef} className="contactFinal pageSection" id="contact">
        <div className="shell contactLayout">
          <BorderGlow className="contactGlow contactIntroGlow" {...glowProps}>
            <div>
              <p className="sectionKicker">Contact</p>
              <h2>想一起做一个更快成型、更好玩的游戏原型吗？</h2>
              <p>
                我正在寻找游戏策划、游戏程序或 AI Native 创作相关实习机会。可参与玩法原型、关卡白盒、3C 手感、AI 工具链和 Demo 交付。
              </p>
            </div>
          </BorderGlow>
          <BorderGlow className="contactGlow contactPanelGlow" {...glowProps}>
            <div className="contactPanel">
              <Trophy size={28} />
              <a href="mailto:3414884729@qq.com">3414884729@qq.com</a>
              <a href="tel:18359795479">18359795479</a>
              <span>QQ 3414884729</span>
              <a className="primaryButton" href="mailto:3414884729@qq.com">
                发送邮件
                <ArrowUpRight size={20} />
              </a>
            </div>
          </BorderGlow>
        </div>
      </section>

      <section ref={profileRef} className="profile section pageSection" id="profile">
        <video className="profileVideoBg" autoPlay muted loop playsInline aria-hidden="true">
          <source src="/assets/profile-room-video.mp4" type="video/mp4" />
        </video>
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

    </main>
  );
}

function App() {
  const initialProjectSlug = new URLSearchParams(window.location.search).get("project");
  const [savedVisualSettings, setSavedVisualSettings] = useState(loadVisualSettings);
  const [draftVisualSettings, setDraftVisualSettings] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [projectSlug, setProjectSlug] = useState(initialProjectSlug);
  const [projectRouteTransition, setProjectRouteTransition] = useState(null);
  const [returnProjectIndex, setReturnProjectIndex] = useState(() =>
    Math.max(0, projects.findIndex((project) => project.slug === initialProjectSlug)),
  );
  const selectedProject = projects.find((project) => project.slug === projectSlug);
  const visualSettings = draftVisualSettings || savedVisualSettings;

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
        isActive={!selectedProject}
        onOpenProject={openProject}
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
