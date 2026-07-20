import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import Balatro from "../Balatro/Balatro";
import SplitText from "../SplitText/SplitText";
import ProjectPaperStack from "../ProjectPaperStack/ProjectPaperStack";
import "./ProjectDetail.css";

export default function ProjectDetail({ project, onBack, animateText = true, visualSettings }) {
  const [entryReady, setEntryReady] = useState(false);
  const hasExternalLink = project.link?.startsWith("http");
  const isBalatro = project.slug === "balatro-shader";
  const splitSettings = visualSettings.splitText;
  const balatroSettings = visualSettings.balatro;
  const balatroProps = {
    spinRotation: balatroSettings.spinRotation,
    spinSpeed: balatroSettings.spinSpeed,
    offset: [balatroSettings.offsetX, balatroSettings.offsetY],
    color1: balatroSettings.colorOne,
    color2: balatroSettings.colorTwo,
    color3: balatroSettings.colorThree,
    contrast: balatroSettings.contrast,
    lighting: balatroSettings.lighting,
    spinAmount: balatroSettings.spinAmount,
    pixelFilter: balatroSettings.pixelFilter,
    spinEase: balatroSettings.spinEase,
    isRotate: balatroSettings.isRotate,
    mouseInteraction: balatroSettings.mouseInteraction,
  };

  useEffect(() => {
    setEntryReady(false);

    if (!animateText) return undefined;

    const frame = requestAnimationFrame(() => {
      setEntryReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [project.slug, animateText]);

  return (
    <main className={`projectDetailPage${isBalatro ? " isBalatroDetail" : ""}${animateText ? " isTextReady" : ""}${animateText && !entryReady ? " isEntryPreparing" : ""}${entryReady ? " isEntryActive" : ""}`}>
      <div className="projectDetailScene" aria-hidden="true">
        {isBalatro ? (
          <Balatro {...balatroProps} />
        ) : (
          <img src={project.image} alt="" />
        )}
        <div className="projectDetailScrim" />
      </div>

      <header className="projectDetailHeader">
        <a href="/#projects" className="projectDetailBack" onClick={onBack}>
          <ArrowLeft size={18} />
          返回项目列表
        </a>
        <span>羊哞哞 / PROJECT ARCHIVE</span>
      </header>

      <section className="projectDetailHero">
        <div className="projectDetailCopy">
          <SplitText text="PROJECT DETAIL" className="projectDetailIndex" tag="p" splitType="words" delay={34} duration={0.75} play={animateText} from={{ opacity: 0, y: 38 }} />
          <SplitText text={project.title} className="projectDetailTitle" tag="h1" splitType={isBalatro ? "words" : "chars"} delay={splitSettings.titleDelay} duration={splitSettings.titleDuration} startDelay={0.04} play={animateText} ease="power4.out" from={{ opacity: 0, y: splitSettings.titleOffsetY, scale: 0.94 }} to={{ opacity: 1, y: 0, scale: 1 }} />
          <SplitText text={project.meta} className="projectDetailMeta" tag="p" splitType="words" delay={44} duration={0.82} startDelay={0.22} play={animateText} from={{ opacity: 0, y: 52 }} />
          <SplitText text={project.desc} className="projectDetailDescription" tag="p" splitType="words" delay={splitSettings.bodyDelay} duration={splitSettings.bodyDuration} startDelay={0.36} play={animateText} from={{ opacity: 0, y: splitSettings.bodyOffsetY }} />

          <section className="projectContributionBlock projectDetailRevealBlock">
            <p>MY ROLE</p>
            <h2>我在这个项目中做了什么</h2>
            <ul>
              {(project.contributions || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <dl className="projectDetailFacts projectDetailRevealBlock">
            <div>
              <dt>项目时间</dt>
              <dd>{project.period}</dd>
            </div>
            <div>
              <dt>项目类型</dt>
              <dd>{project.tag}</dd>
            </div>
          </dl>

          {hasExternalLink && (
            <a
              className="projectDetailAction"
              href={project.link}
              target="_blank"
              rel="noreferrer"
            >
              游戏游玩链接
              <ArrowUpRight size={18} />
            </a>
          )}
        </div>

        <div className="projectDetailRight">
          <ProjectPaperStack project={project} />
        </div>
      </section>
    </main>
  );
}
