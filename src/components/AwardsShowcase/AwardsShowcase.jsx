import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDown, Trophy } from "lucide-react";
import ScrollStack, { ScrollStackItem } from "../ScrollStack/ScrollStack";
import "./AwardsShowcase.css";

// Presentation priority is explicit; changing this list changes the display order.
const awardEntries = [
  { slug: "cat-shadow-stealth", result: "一等奖", event: "网易游戏高校 MINI-GAME", scope: "决赛", year: "2026", accent: "#e5c780", description: "以潜行搜打撤玩法参赛，完成玩法系统、关卡设计与游戏内编辑器工具。" },
  { slug: "beast-incarnation", result: "三等奖", event: "莉莉丝高校游戏创作大赛", scope: "全国高校赛事", year: "2026", accent: "#c7b7ff", description: "围绕多形态切换与能力驱动关卡，完成精准平台跳跃玩法的设计和验证。" },
  { slug: "anchor-cat", result: "第一名", event: "CIGA Game Jam", scope: "广州万物破元站 · 现场投票", year: "2026", accent: "#a9d8b1", description: "在限时创作中完成主题表达与可玩版本，获得广州站现场投票第一名。" },
  { slug: "chrono-chick", result: "晋级决赛", event: "京造 6h Game Jam", scope: "限时游戏创作", year: "2026", accent: "#d7e58b", description: "独立开发像素生存游戏，用时空倒流与霸王龙变身构建攻守逆转体验。" },
  { slug: "apple-falls-up", result: "制作新星", event: "制造新星 Game Jam 第 2 期", scope: "高校专场 · 奖项", year: "2026", accent: "#9acbfa", description: "获得「制作新星」奖项。负责策划与程序，以反重力采集、技能成长与连锁效果构建竖屏休闲游戏。" },
  { slug: "job-hop-life", result: "编辑推荐", event: "TapTap 制造", scope: "平台推荐 · 玩家成绩", year: "2026", accent: "#b8db9d", description: "获得 TapTap 制造编辑推荐，48 小时内完成并上线，4 天下载量突破 5000，新品榜进入前 40。" },
  { slug: "headhunter-company", result: "4000+ 下载", event: "TapTap 玩家成绩", scope: "上线表现", year: "2026", accent: "#e4b69a", description: "上线后获得 4000+ 下载。独立完成玩法与程序，以 AI 语义评分驱动求职者探查、包装售卖和经营扩张。" },
];

export default function AwardsShowcase({ projects, onOpenProject, resetKey }) {
  const regionRef = useRef(null);
  useEffect(() => {
    regionRef.current?.querySelector(".scroll-stack")?.scrollTo({ top: 0, behavior: "instant" });
  }, [resetKey]);

  return (
    <div className="awardsShowcase" ref={regionRef}>
      <header className="awardsIntro">
        <span className="awardsIcon"><Trophy size={24} aria-hidden="true" /></span>
        <h2>奖项与荣誉<span>从创意，到被看见。</span></h2>
        <p>游戏创作中的奖项、平台推荐与下载成绩。<br />向下滚动，查看每一份作品的成绩。</p>
        <span className="awardsScrollHint"><ArrowDown size={16} aria-hidden="true" /> 向下滚动叠放</span>
      </header>
      <div className="awardsViewport" data-awards-scroll="">
        <ScrollStack ariaLabel="奖项列表，按展示优先顺序排列，可滚动查看" itemDistance={70} itemStackDistance={18} stackPosition="12px" itemScale={0.035} baseScale={0.86} dimAmount={0.12} smoothScroll={false} holdDistance={60}>
          {awardEntries.map((award, index) => {
            const project = projects.find(item => item.slug === award.slug);
            if (!project) return null;
            return (
              <ScrollStackItem key={award.slug} itemClassName="awardStackCard" style={{ "--award-accent": award.accent }}>
                <article className="awardContent" aria-label={`${award.event} ${award.scope} ${award.result}`}>
                  <div className="awardCopy">
                    <div className="awardMeta"><span>{award.year} / {String(index + 1).padStart(2, "0")}</span><span>{award.scope}</span></div>
                    <p className="awardResult">{award.result}</p>
                    <h3>{award.event}</h3>
                    <p className="awardProject">《{project.title}》</p>
                    <p className="awardDescription">{award.description}</p>
                    <a href={`/?project=${award.slug}`} onClick={event => {
                      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      onOpenProject(project, event.currentTarget.closest("article"));
                    }}>查看项目 <ArrowUpRight size={18} aria-hidden="true" /></a>
                  </div>
                  {project.awardImage ? (
                    <a className="awardCertificate" href={project.awardImage} target="_blank" rel="noreferrer" aria-label={`${project.title}获奖证书，打开完整图片`}>
                      <img src={project.awardImage} alt="2026 网易游戏高校 MINI-GAME 挑战赛《三脚猫行动》一等奖获奖证书" loading="lazy" />
                      <span>点击查看完整证书 ↗</span>
                    </a>
                  ) : <img className="awardVisual" src={project.image} alt={`${project.title}项目封面`} loading="lazy" />}
                </article>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
      </div>
    </div>
  );
}
