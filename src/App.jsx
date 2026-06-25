import {
  ArrowUpRight,
  Code2,
  Gamepad2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Trophy,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ASCIIText from "./components/ASCIIText";
import FaultyTerminal from "./components/FaultyTerminal";
import VisualEditor from "./components/VisualEditor";

const EDITOR_PASSWORD = "838485";
const VISUAL_SETTINGS_KEY = "wjt-portfolio-visual-settings-v1";

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
    text: "WangJuntao",
    asciiFontSize: 7,
    textFontSize: 138,
    textColor: "#ffffff",
    planeBaseHeight: 8,
    enableWaves: true,
  },
};

function cloneSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

function mergeVisualSettings(settings) {
  return {
    terminal: { ...defaultVisualSettings.terminal, ...(settings?.terminal || {}) },
    ascii: { ...defaultVisualSettings.ascii, ...(settings?.ascii || {}) },
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

function HeroVisual({ terminalSettings, terminalGrid, asciiSettings, variant = "full" }) {
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
        <div className={variant === "mini" ? "asciiTitleWrap miniAsciiTitleWrap" : "asciiTitleWrap"}>
          <ASCIIText
            text={asciiSettings.text}
            enableWaves={asciiSettings.enableWaves}
            asciiFontSize={asciiSettings.asciiFontSize}
            textFontSize={asciiSettings.textFontSize}
            textColor={asciiSettings.textColor}
            planeBaseHeight={asciiSettings.planeBaseHeight}
          />
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
    title: "万兽化身",
    meta: "Unity / 关卡策划 / 程序",
    period: "2026.03 - 2026.06",
    image: "/assets/project-beast.png",
    tag: "Lilith Game Jam",
    desc: "2D 像素风硬核精准平台跳跃游戏。围绕多形态无缝切换与底层物理法则重构，验证狼、蛙、猫、羊等动物动能规律带来的操作心流。",
    link: "https://www.bilibili.com/video/BV14L5d66EHm/",
  },
  {
    title: "神人猎头公司",
    meta: "Solo Developer / AI Agent / 经营模拟",
    period: "2026.06 - 至今",
    image: "/assets/project-agent.png",
    tag: "AgentLand Fortnight",
    desc: "基于 AI Agent 工作流构建的黑色幽默模拟经营游戏。接入 Qwen 模型完成语义评分，驱动求职者探查、包装售卖与经营扩张循环。",
    link: "https://www.taptap.cn/moment/813589271922344237",
  },
  {
    title: "木头喵",
    meta: "TapTap 制造 / 主策划",
    period: "2026.05",
    image: "/assets/project-woodcat.png",
    tag: "GameJam",
    desc: "双人欢乐乱斗派对游戏。以物理碰撞、载具机制、地形博弈为核心，在短周期内完成创意提出、核心乐趣验证和可玩版本交付。",
    link: "https://www.taptap.cn/app/864971",
  },
];

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

function App() {
  const [savedVisualSettings, setSavedVisualSettings] = useState(loadVisualSettings);
  const [draftVisualSettings, setDraftVisualSettings] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const transitionRef = useRef(null);
  const visualSettings = draftVisualSettings || savedVisualSettings;
  const terminalSettings = visualSettings.terminal;
  const asciiSettings = visualSettings.ascii;

  const terminalGrid = useMemo(
    () => [terminalSettings.gridX, terminalSettings.gridY],
    [terminalSettings.gridX, terminalSettings.gridY],
  );

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

  useEffect(() => {
    const updateTransitionProgress = () => {
      const section = transitionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollRange = Math.max(1, rect.height - window.innerHeight);
      const nextProgress = Math.min(1, Math.max(0, -rect.top / scrollRange));
      setTransitionProgress(nextProgress);
    };

    updateTransitionProgress();
    window.addEventListener("scroll", updateTransitionProgress, { passive: true });
    window.addEventListener("resize", updateTransitionProgress);
    return () => {
      window.removeEventListener("scroll", updateTransitionProgress);
      window.removeEventListener("resize", updateTransitionProgress);
    };
  }, []);

  const closeVisualEditor = ({ save }) => {
    if (save && draftVisualSettings) {
      const nextSettings = mergeVisualSettings(draftVisualSettings);
      setSavedVisualSettings(nextSettings);
      window.localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(nextSettings));
    }

    setDraftVisualSettings(null);
    setEditorOpen(false);
  };

  return (
    <main>
      <section
        ref={transitionRef}
        className="heroTvTransition"
        id="top"
        style={{ "--scene-progress": transitionProgress }}
        aria-label="主页进入电视机的场景转场"
      >
        <div className="heroTvSticky">
          <div className="transitionHeroLayer">
            <HeroVisual terminalSettings={terminalSettings} terminalGrid={terminalGrid} asciiSettings={asciiSettings} />
          </div>

          <div className="tvSceneLayer">
            <div className="tvSceneArt" aria-hidden="true" />
            <div className="tvSceneVignette" aria-hidden="true" />
            <div className="tvScreenSlot" aria-label="电视机中的主页预览">
              <div className="tvScreenContent">
                <HeroVisual terminalSettings={terminalSettings} terminalGrid={terminalGrid} asciiSettings={asciiSettings} variant="mini" />
              </div>
              <div className="tvScreenGlass" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
      {editorOpen && draftVisualSettings && (
        <VisualEditor
          settings={draftVisualSettings}
          defaultSettings={defaultVisualSettings}
          password={EDITOR_PASSWORD}
          onChange={setDraftVisualSettings}
          onClose={closeVisualEditor}
        />
      )}
      <section className="profile section" id="profile">
        <div className="shell profileLayout">
          <div className="portraitWrap">
            <img src="/assets/portrait.png" alt="王俊涛人物图" />
            <div className="statusLine">
              <span />
              6月底可到岗 / 每周可实习5天
            </div>
          </div>

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
        </div>

        <div className="shell statGrid" aria-label="项目数据">
          {stats.map((stat) => (
            <div className="statCard" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section projects" id="projects">
        <div className="shell sectionHeader">
          <p className="sectionKicker">Selected Work</p>
          <h2>精选项目</h2>
        </div>
        <div className="shell projectGrid">
          {projects.map((project) => (
            <article className="projectCard" key={project.title}>
              <a className="projectImage" href={project.link} target="_blank" rel="noreferrer" aria-label={`打开${project.title}`}>
                <img src={project.image} alt={`${project.title}作品图`} />
                <span>{project.tag}</span>
              </a>
              <div className="projectBody">
                <div>
                  <p>{project.meta}</p>
                  <h3>{project.title}</h3>
                </div>
                <span className="period">{project.period}</span>
                <p className="projectDesc">{project.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section strengths" id="strengths">
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
              <article className="strengthCard" key={item.title}>
                <div className="iconBox">
                  <Icon size={24} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="contactFinal" id="contact">
        <div className="shell contactLayout">
          <div>
            <p className="sectionKicker">Contact</p>
            <h2>想一起做一个更快成型、更好玩的游戏原型吗？</h2>
            <p>
              我正在寻找游戏策划、游戏程序或 AI Native 创作相关实习机会。可参与玩法原型、关卡白盒、3C 手感、AI 工具链和 Demo 交付。
            </p>
          </div>
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
        </div>
      </section>
    </main>
  );
}

export default App;
