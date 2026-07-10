import { useEffect, useRef, useState } from "react";
import Lanyard from "../Lanyard/Lanyard";
import "./ActivityLanyardBoard.css";

export default function ActivityLanyardBoard({ items }) {
  const [revealed, setRevealed] = useState(false);
  const [retracting, setRetracting] = useState(false);
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
          <Lanyard onRelease={revealActivities} retracting={retracting} />
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
