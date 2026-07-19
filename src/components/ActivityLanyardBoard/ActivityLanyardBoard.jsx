import { useEffect, useRef, useState } from "react";
import { LanyardCluster } from "../Lanyard/Lanyard";
import "./ActivityLanyardBoard.css";

const lanyardCards = [
  {
    title: "全能 Solo",
    frontTextureUrl: "/assets/activities/solo-lanyard-card-web.png",
    backTextureUrl: "/assets/activities/solo-lanyard-card-back-web.png",
  },
  {
    title: "策划",
    frontTextureUrl: "/assets/activities/lanyard-planner-web.png",
    backTextureUrl: "/assets/activities/solo-lanyard-card-back-web.png",
  },
  {
    title: "创作者",
    frontTextureUrl: "/assets/activities/lanyard-creator-web.png",
    backTextureUrl: "/assets/activities/solo-lanyard-card-back-web.png",
  },
  {
    title: "开发者",
    frontTextureUrl: "/assets/activities/lanyard-developer-web.png",
    backTextureUrl: "/assets/activities/solo-lanyard-card-back-web.png",
  },
  {
    title: "参展同学",
    frontTextureUrl: "/assets/activities/lanyard-exhibitor-web.png",
    backTextureUrl: "/assets/activities/solo-lanyard-card-back-web.png",
  },
];

export default function ActivityLanyardBoard({ items, resetKey = 0 }) {
  const [revealed, setRevealed] = useState(false);
  const [retracting, setRetracting] = useState(false);
  const [lanyardInstanceKey, setLanyardInstanceKey] = useState(0);
  const timersRef = useRef([]);

  const queueTimer = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setRevealed(false);
    setRetracting(false);
    setLanyardInstanceKey((key) => key + 1);
  }, [resetKey]);

  const revealActivities = () => {
    if (revealed || retracting) return;
    setRetracting(true);
    queueTimer(() => setRevealed(true), 260);
  };

  const resetLanyard = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setRevealed(false);
    setRetracting(false);
  };

  return (
    <div className={`activityLanyardScene${revealed ? " isRevealed" : ""}`}>
      <div className="activityLanyardIntro">
        <p>Events & Communities</p>
        <h2>参加过的活动</h2>
      </div>

      {!revealed ? (
        <div className="activityOfficialLanyard">
          <LanyardCluster key={lanyardInstanceKey} cards={lanyardCards} onRelease={revealActivities} retracting={retracting} />
          <div className="activityLanyardHint">拖动水牌，松手后打开活动页</div>
        </div>
      ) : (
        <div className="activityRevealPage">
          <button type="button" className="activityResetButton" onClick={resetLanyard}>
            重新拉动水牌
          </button>
          <div className="activityRevealGrid">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <article className="activityRevealCard" key={item.title} style={{ "--activity-delay": `${index * 90}ms` }}>
                  <div className="activityRevealTop">
                    <Icon size={26} strokeWidth={2.2} />
                    <span>{item.type}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <strong>{item.period}</strong>
                </article>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
