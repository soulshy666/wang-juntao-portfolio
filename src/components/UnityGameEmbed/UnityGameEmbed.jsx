import { Maximize2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import "./UnityGameEmbed.css";

export default function UnityGameEmbed({ autoStart = false, active = true, compact = false }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!autoStart || !active || started) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setStarted(true), reduceMotion ? 240 : 1800);
    return () => window.clearTimeout(timer);
  }, [active, autoStart, started]);

  return (
    <section className={`unityGameSection${compact ? " isCompact" : ""}`} aria-labelledby="unity-game-title">
      <div className="unityGameHeading">
        <div>
          <p>PLAYABLE WEBGL BUILD</p>
          <h2 id="unity-game-title">在线试玩</h2>
        </div>
        <span>Unity WebGL / 约 39 MB</span>
      </div>

      <div className={`unityGameViewport${started ? " isStarted" : ""}`}>
        {started ? (
          <iframe
            className="unityGameFrame"
            src="/games/balatro/index.html"
            title="小丑牌 Shader 复刻在线试玩"
            allow="fullscreen; autoplay"
            allowFullScreen
          />
        ) : (
          <div className="unityGameLaunch">
            <span className="unityGameLaunchIcon" aria-hidden="true">
              <Play size={28} fill="currentColor" />
            </span>
            <div>
              <strong>运行游戏原型</strong>
              <p>点击后加载 WebGL 版本，推荐使用桌面浏览器。</p>
            </div>
            {autoStart ? (
              <span className="unityGameAutoload" role="status">
                <i aria-hidden="true" />
                介绍展示完成后自动加载
              </span>
            ) : (
              <button type="button" onClick={() => setStarted(true)}>
                <Play size={18} fill="currentColor" />
                启动游戏
              </button>
            )}
          </div>
        )}

        <div className="unityGameCorner" aria-hidden="true">
          <Maximize2 size={18} />
        </div>
      </div>
    </section>
  );
}
