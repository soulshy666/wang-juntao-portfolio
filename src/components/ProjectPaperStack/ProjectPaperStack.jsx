import { Award, Maximize2, MessageSquareText, Play, ScrollText, X } from "lucide-react";
import { useEffect, useState } from "react";
import UnityGameEmbed from "../UnityGameEmbed/UnityGameEmbed";
import "./ProjectPaperStack.css";

function getProjectPapers(project) {
  if (project.slug === "balatro-shader") {
    return [
      {
        id: "playable",
        label: "在线试玩",
        kicker: "PLAYABLE WEBGL BUILD",
        icon: Play,
        text: "直接运行 Unity WebGL 版本，查看小丑牌 Shader 复刻的可交互展示。",
      },
      {
        id: "notes",
        label: "拆解笔记",
        kicker: "BREAKDOWN NOTES",
        icon: ScrollText,
        text: "记录卡面发光、噪声扰动、流体背景和像素化视觉效果的拆解与实现思路。",
      },
    ];
  }

  const papers = [
    {
      id: "demo",
      label: "游戏实机演示视频",
      kicker: "GAMEPLAY VIDEO",
      icon: Play,
      text: "查看项目的核心玩法、操作流程和当前可玩版本表现。",
    },
  ];

  if (project.tag !== "RECREATION") {
    papers.push({
      id: "feedback",
      label: "玩家体验与反馈",
      kicker: "PLAYER FEEDBACK",
      icon: MessageSquareText,
      text: "整理试玩中出现的关键问题、玩家感受和后续迭代方向。",
    });
  }

  if (project.slug === "beast-incarnation") {
    papers.push({
      id: "awards",
      label: "获得奖项",
      kicker: "AWARDS",
      icon: Award,
      text: "记录项目参与赛事、评审结果和阶段性成果。",
    });
  }

  if (project.tag === "RECREATION") {
    papers.push({
      id: "notes",
      label: "复刻拆解笔记",
      kicker: "BREAKDOWN NOTES",
      icon: ScrollText,
      text: "查看视觉、操作或系统效果的拆解过程与关键实现思路。",
    });
  }

  return papers;
}

export default function ProjectPaperStack({ project }) {
  const papers = getProjectPapers(project);

  const [activeId, setActiveId] = useState(papers[0].id);
  const [loadedVideos, setLoadedVideos] = useState({});
  const [expandedVideo, setExpandedVideo] = useState(null);
  const activeIndex = Math.max(0, papers.findIndex((paper) => paper.id === activeId));

  useEffect(() => {
    setActiveId(papers[0].id);
    setLoadedVideos({});
    setExpandedVideo(null);
  }, [project.slug]);

  useEffect(() => {
    if (!expandedVideo) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setExpandedVideo(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedVideo]);

  return (
    <aside className={`projectPaperArchive${project.slug === "balatro-shader" ? " isBalatroArchive" : ""}`} aria-label="项目资料档案">
      <div className="projectPaperHeading">
        <span>PROJECT FILES</span>
        <strong>{String(activeIndex + 1).padStart(2, "0")} / {String(papers.length).padStart(2, "0")}</strong>
      </div>
      <div className="projectPaperStack">
        {papers.map((paper, index) => {
          const Icon = paper.icon;
          const isActive = paper.id === activeId;
          const isDemoPaper = paper.id === "demo";
          const isPlayablePaper = paper.id === "playable";
          const isFeedbackImagePaper = paper.id === "feedback" && Boolean(project.feedbackImage);
          const demoVideo = isDemoPaper ? project.demoVideo : null;
          const demoVideoKey = `${project.slug}:${paper.id}`;
          const isVideoLoaded = Boolean(demoVideo && loadedVideos[demoVideoKey]);
          const offset = (index - activeIndex + papers.length) % papers.length;

          const loadDemoVideo = () => {
            if (!demoVideo) return;
            setLoadedVideos((current) => ({ ...current, [demoVideoKey]: true }));
          };

          const selectPaper = () => {
            setActiveId(paper.id);
            if (demoVideo && isActive) loadDemoVideo();
          };

          const openExpandedVideo = (event) => {
            event.stopPropagation();
            if (!demoVideo) return;
            loadDemoVideo();
            setExpandedVideo({
              src: demoVideo,
              poster: project.image,
              title: project.title,
            });
          };

          return (
            <article
              role="button"
              tabIndex={0}
              className={`projectPaper${isActive ? " isActive" : ""}${isDemoPaper ? " projectPaper--media" : ""}${isPlayablePaper ? " projectPaper--playable" : ""}${isFeedbackImagePaper ? " projectPaper--feedbackImage" : ""}`}
              style={{ "--paper-offset": offset, "--paper-index": index }}
              key={paper.id}
              onClick={selectPaper}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectPaper();
                }
              }}
              aria-pressed={isActive}
            >
              <div className="projectPaperTop">
                <span>{paper.kicker}</span>
                <b>{String(index + 1).padStart(2, "0")}</b>
              </div>
              {isPlayablePaper && isActive ? (
                <div className="projectPaperPlayable">
                  <UnityGameEmbed autoStart active compact />
                </div>
              ) : isFeedbackImagePaper && isActive ? (
                <>
                  <div className="projectPaperMediaTitle">
                    <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                    <h3>{project.feedbackMetric || paper.label}</h3>
                  </div>
                  <p className="projectPaperFeedbackText">{project.feedbackText || paper.text}</p>
                  <div className="projectPaperFeedbackFrame">
                    <img src={project.feedbackImage} alt={`${project.title} 玩家反馈截图`} loading="lazy" />
                  </div>
                </>
              ) : demoVideo && isActive ? (
                <>
                  <div className="projectPaperMediaTitle">
                    <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                    <h3>{paper.label}</h3>
                  </div>
                  {isVideoLoaded ? (
                    <div className="projectPaperVideoFrame">
                      <video className="projectPaperVideo" muted loop playsInline autoPlay preload="none" poster={project.image}>
                        <source src={demoVideo} type="video/mp4" />
                      </video>
                      <button type="button" className="projectPaperExpand" onClick={openExpandedVideo}>
                        <Maximize2 size={15} aria-hidden="true" />
                        放大观看
                      </button>
                    </div>
                  ) : (
                    <div className="projectPaperVideoShell">
                      <img src={project.image} alt="" loading="lazy" />
                      <span className="projectPaperPlayPrompt">
                        <Play size={18} fill="currentColor" aria-hidden="true" />
                        点击播放
                      </span>
                      <button type="button" className="projectPaperExpand" onClick={openExpandedVideo}>
                        <Maximize2 size={15} aria-hidden="true" />
                        放大观看
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                  <h3>{paper.label}</h3>
                  <p>{paper.text}</p>
                </>
              )}
              <small>{demoVideo && isActive && !isVideoLoaded ? "点击播放后才会加载视频" : isPlayablePaper ? "WebGL 会在进入后自动加载" : "点击抽取这份档案"}</small>
            </article>
          );
        })}
      </div>
      <div className="projectPaperTabs" aria-label="选择项目档案">
        {papers.map((paper) => (
          <button
            type="button"
            className={paper.id === activeId ? "isActive" : ""}
            key={paper.id}
            onClick={() => setActiveId(paper.id)}
          >
            {paper.label}
          </button>
        ))}
      </div>
      {expandedVideo && (
        <div className="projectVideoLightbox" role="dialog" aria-modal="true" aria-label={`${expandedVideo.title} 视频预览`} onClick={() => setExpandedVideo(null)}>
          <div className="projectVideoLightboxPanel" onClick={(event) => event.stopPropagation()}>
            <div className="projectVideoLightboxTop">
              <span>{expandedVideo.title}</span>
              <button type="button" onClick={() => setExpandedVideo(null)} aria-label="关闭视频预览">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <video className="projectVideoLightboxPlayer" controls autoPlay playsInline preload="metadata" poster={expandedVideo.poster || undefined}>
              <source src={expandedVideo.src} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </aside>
  );
}
