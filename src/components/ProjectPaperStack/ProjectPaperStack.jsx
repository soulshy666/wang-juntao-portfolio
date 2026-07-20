import { Award, Maximize2, MessageSquareText, Play, ScrollText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import UnityGameEmbed from "../UnityGameEmbed/UnityGameEmbed";
import "./ProjectPaperStack.css";

function getProjectPapers(project) {
  const featuredAwards = project.featuredAwards || (project.featuredBadge ? [project.featuredBadge] : []);

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

  const shouldShowDemoPaper = Boolean(project.demoVideo || project.pendingDemoVideo);
  const papers = shouldShowDemoPaper
    ? [
        {
          id: "demo",
          label: "游戏实机演示视频",
          kicker: "GAMEPLAY VIDEO",
          icon: Play,
          text: project.pendingDemoVideo && !project.demoVideo
            ? "实机演示视频位置已预留，后续会替换为项目的真实试玩视频。"
            : "查看项目的核心玩法、操作流程和当前可玩版本表现。",
        },
      ]
    : [
        {
          id: "release",
          label: "发布成果",
          kicker: "RELEASE RESULT",
          icon: Award,
          text: project.feedbackText || project.desc,
        },
      ];

  if (project.tag !== "RECREATION") {
    papers.push({
      id: "feedback",
      label: "玩家体验与反馈",
      kicker: "PLAYER FEEDBACK",
      icon: MessageSquareText,
      text: project.feedbackText || "整理试玩中出现的关键问题、玩家感受和后续迭代方向。",
    });
  }

  if (featuredAwards.length && !project.hideAwardPaper) {
    papers.push({
      id: "awards",
      label: "获得奖项",
      kicker: "AWARDS",
      icon: Award,
      text: project.featuredBadge,
      awards: featuredAwards,
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
  const [expandedImage, setExpandedImage] = useState(null);
  const videoRefs = useRef(new Map());
  const activeIndex = Math.max(0, papers.findIndex((paper) => paper.id === activeId));

  useEffect(() => {
    setActiveId(papers[0].id);
    setLoadedVideos({});
    setExpandedImage(null);
  }, [project.slug]);

  useEffect(() => {
    if (!expandedImage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setExpandedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedImage]);

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
          const feedbackGallery = Array.isArray(project.feedbackGallery) ? project.feedbackGallery : [];
          const isFeedbackImagePaper = paper.id === "feedback" && Boolean(project.feedbackImage || feedbackGallery.length);
          const paperExternalLink = paper.id === "notes" ? project.breakdownLink : null;
          const demoVideo = isDemoPaper ? project.demoVideo : null;
          const demoVideoKey = `${project.slug}:${paper.id}`;
          const isVideoLoaded = Boolean(demoVideo && loadedVideos[demoVideoKey]);
          const offset = (index - activeIndex + papers.length) % papers.length;

          const loadDemoVideo = () => {
            if (!demoVideo) return;
            setLoadedVideos((current) => ({ ...current, [demoVideoKey]: true }));

            const player = videoRefs.current.get(demoVideoKey);
            if (player) {
              player.load();
              player.play().catch(() => {});
            }
          };

          const selectPaper = () => {
            setActiveId(paper.id);
            if (demoVideo) loadDemoVideo();
          };

          return (
            <article
              role="button"
              tabIndex={0}
              className={`projectPaper${isActive ? " isActive" : ""}${isDemoPaper ? " projectPaper--media" : ""}${isPlayablePaper ? " projectPaper--playable" : ""}${isFeedbackImagePaper ? " projectPaper--feedbackImage" : ""}${paper.id === "awards" ? " projectPaper--awards" : ""}${feedbackGallery.length ? " projectPaper--feedbackGallery" : ""}`}
              style={{ "--paper-offset": offset, "--paper-index": index }}
              key={`${project.slug}:${paper.id}`}
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
                  {feedbackGallery.length ? (
                    <div className={`projectPaperFeedbackGallery projectPaperFeedbackGallery--count${feedbackGallery.length}`}>
                      {feedbackGallery.map((image, galleryIndex) => (
                        <figure className={galleryIndex === 0 ? "isLarge" : ""} key={image}>
                          <button
                            type="button"
                            className="projectPaperGalleryButton"
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpandedImage({
                                src: image,
                                title: `${project.title} 现场反馈 ${galleryIndex + 1}`,
                              });
                            }}
                          >
                            <img src={image} alt={`${project.title} 现场反馈 ${galleryIndex + 1}`} loading="lazy" />
                            <span>
                              <Maximize2 size={14} aria-hidden="true" />
                              查看大图
                            </span>
                          </button>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <div className="projectPaperFeedbackFrame">
                      <img src={project.feedbackImage} alt={`${project.title} 玩家反馈截图`} loading="lazy" />
                    </div>
                  )}
                </>
              ) : demoVideo && isActive ? (
                <>
                  <div className="projectPaperMediaTitle">
                    <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                    <h3>{paper.label}</h3>
                  </div>
                  <div className="projectPaperVideoFrame">
                    <video
                      ref={(node) => {
                        if (node) videoRefs.current.set(demoVideoKey, node);
                        else videoRefs.current.delete(demoVideoKey);
                      }}
                      className="projectPaperVideo"
                      muted
                      loop
                      playsInline
                      autoPlay={isVideoLoaded}
                      preload="none"
                      poster={project.image}
                    >
                      <source src={demoVideo} type="video/mp4" />
                    </video>
                    {!isVideoLoaded && (
                      <button
                        type="button"
                        className="projectPaperPlayPrompt"
                        onClick={(event) => {
                          event.stopPropagation();
                          loadDemoVideo();
                        }}
                      >
                        <Play size={18} fill="currentColor" aria-hidden="true" />
                        点击播放
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                  <h3>{paper.label}</h3>
                  {paper.id === "awards" && paper.awards?.length ? (
                    <div className="projectPaperAwardList">
                      {paper.awards.map((award, awardIndex) => (
                        <div className="projectPaperAwardItem" key={award}>
                          <span>{String(awardIndex + 1).padStart(2, "0")}</span>
                          <strong>{award}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{paper.text}</p>
                  )}
                  {paperExternalLink && (
                    <a
                      className="projectPaperExternalLink"
                      href={paperExternalLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      打开飞书拆解文档
                    </a>
                  )}
                </>
              )}
              <small>{demoVideo && isActive && !isVideoLoaded ? "点击播放后才会加载视频" : isDemoPaper && !demoVideo ? "视频素材待补充" : isPlayablePaper ? "WebGL 会在进入后自动加载" : "点击抽取这份档案"}</small>
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
            onClick={() => {
              setActiveId(paper.id);
              if (paper.id === "demo" && project.demoVideo) {
                setLoadedVideos((current) => ({ ...current, [`${project.slug}:demo`]: true }));
              }
            }}
          >
            {paper.label}
          </button>
        ))}
      </div>
      {expandedImage && (
        <div className="projectImageLightbox" role="dialog" aria-modal="true" aria-label={expandedImage.title} onClick={() => setExpandedImage(null)}>
          <div className="projectImageLightboxPanel" onClick={(event) => event.stopPropagation()}>
            <div className="projectVideoLightboxTop">
              <span>{expandedImage.title}</span>
              <button type="button" onClick={() => setExpandedImage(null)} aria-label="关闭图片预览">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <img className="projectImageLightboxPicture" src={expandedImage.src} alt={expandedImage.title} />
          </div>
        </div>
      )}
    </aside>
  );
}
