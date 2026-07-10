import { useCallback, useEffect, useRef, useState } from "react";
import "./FavoriteTimeline.css";

export default function FavoriteTimeline({
  items,
  activeIndex,
  onSelect,
  onOpenDetails,
  sectionRef,
}) {
  const videoRefs = useRef([]);
  const sectionElementRef = useRef(null);
  const previousIndexRef = useRef(activeIndex);
  const previousVisibilityRef = useRef(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  const setSectionNode = useCallback((node) => {
    sectionElementRef.current = node;
    if (typeof sectionRef === "function") sectionRef(node);
    else if (sectionRef) sectionRef.current = node;
  }, [sectionRef]);

  const syncPlayback = useCallback(() => {
    const canPlay =
      isSectionVisible &&
      document.visibilityState !== "hidden" &&
      !window.__portfolioPageScrolling;
    const enteredSection = isSectionVisible && !previousVisibilityRef.current;

    if (!canPlay) {
      videoRefs.current.forEach((video) => video?.pause());
      previousVisibilityRef.current = isSectionVisible;
      return;
    }

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index !== activeIndex) {
        video.pause();
        return;
      }

      if (previousIndexRef.current !== activeIndex || enteredSection || video.ended) {
        video.currentTime = 0;
      }
      video.play().catch(() => {});
    });

    previousIndexRef.current = activeIndex;
    previousVisibilityRef.current = isSectionVisible;
  }, [activeIndex, isSectionVisible]);

  useEffect(() => {
    const section = sectionElementRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSectionVisible(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    syncPlayback();
  }, [syncPlayback]);

  useEffect(() => {
    const pauseAll = () => videoRefs.current.forEach((video) => video?.pause());
    const handleVisibility = () => syncPlayback();

    window.addEventListener("portfolio-page-scroll-start", pauseAll);
    window.addEventListener("portfolio-page-scroll-end", syncPlayback);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("portfolio-page-scroll-start", pauseAll);
      window.removeEventListener("portfolio-page-scroll-end", syncPlayback);
      document.removeEventListener("visibilitychange", handleVisibility);
      pauseAll();
    };
  }, [syncPlayback]);

  const progress = items.length > 1 ? activeIndex / (items.length - 1) : 0;

  return (
    <section
      ref={setSectionNode}
      className="favoriteTimelineSection pageSection"
      id="strengths"
      style={{ "--favorite-count": items.length, "--favorite-progress": progress }}
    >
      <div className="favoriteTimelineSticky">
        <div className="favoriteVideoStage" aria-hidden="true">
          {items.map((item, index) => item.video ? (
            <video
              key={item.video}
              ref={(element) => {
                videoRefs.current[index] = element;
              }}
              className={`favoriteVideo${index === activeIndex ? " isActive" : ""}`}
              muted
              loop
              playsInline
              preload={index === activeIndex ? "auto" : "none"}
              poster={item.poster || undefined}
            >
              <source src={item.video} type="video/mp4" />
            </video>
          ) : null)}
          <div className="favoriteVideoScrim" />
        </div>

        <header className="projectFanHeading favoriteTimelineHeading">
          <div>
            <p>Favorite Games</p>
            <h2>我的最爱</h2>
          </div>
          <span>
            {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </header>

        <div className="favoriteTimelineRail" aria-label="选择喜欢的游戏">
          <span className="favoriteTimelineTrack" aria-hidden="true" />
          <span className="favoriteTimelineProgress" aria-hidden="true" />
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.title}
                className={`favoriteTimelineNode${index < activeIndex ? " isComplete" : ""}${index === activeIndex ? " isActive" : ""}`}
                style={{ "--node-position": items.length > 1 ? index / (items.length - 1) : 0 }}
                onClick={() => onSelect?.(index)}
                aria-label={`查看${item.title}`}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                <Icon size={18} strokeWidth={2.3} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="favoriteTimelineSteps">
        {items.map((item, index) => (
          <div
            className={`favoriteTimelineStep${index % 2 ? " isRight" : " isLeft"}${index === activeIndex ? " isActive" : ""}`}
            style={{ "--favorite-step": index }}
            key={item.title}
          >
            <article className="favoriteTimelineCard">
              <div className="favoriteTimelineCopy">
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                {item.playtime ? (
                  <div className="favoriteTimelinePlaytime">
                    <small>游玩时长</small>
                    <strong>{item.playtime}</strong>
                  </div>
                ) : null}
                <p>{item.text}</p>
                <div className="favoriteTimelineTags">
                  {item.games.map((game) => (
                    <b key={game}>{game}</b>
                  ))}
                </div>
                <button
                  type="button"
                  className="favoriteDetailButton"
                  onClick={() => onOpenDetails?.(item)}
                >
                  查看详情
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
