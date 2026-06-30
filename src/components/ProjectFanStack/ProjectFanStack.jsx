import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Balatro from "../Balatro/Balatro";
import "./ProjectFanStack.css";

const CARD_ACCENTS = ["#9eff63", "#62e3d1", "#ff6978"];

function wrapIndex(index, length) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function signedOffset(index, activeIndex, length) {
  const rawOffset = index - activeIndex;
  const wrappedOffset = rawOffset > 0 ? rawOffset - length : rawOffset + length;
  return Math.abs(wrappedOffset) < Math.abs(rawOffset) ? wrappedOffset : rawOffset;
}

export default function ProjectFanStack({ items, activeIndex = 0, onChange, onOpenProject, balatroSettings }) {
  const reduceMotion = useReducedMotion();
  const fanRef = useRef(null);
  const isInView = useInView(fanRef, { amount: 0.28 });
  const [entranceComplete, setEntranceComplete] = useState(false);
  const active = wrapIndex(activeIndex, items.length);
  const activeProject = items[active];
  const balatroProps = balatroSettings
    ? {
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
      }
    : { isRotate: true, mouseInteraction: true };

  const cardStates = useMemo(
    () =>
      items.map((item, index) => {
        const offset = signedOffset(index, active, items.length);
        const distance = Math.abs(offset);

        return {
          item,
          index,
          offset,
          active: offset === 0,
          x: offset * 292,
          y: distance * 34,
          rotateZ: offset * 13,
          rotateX: distance ? 7 : 0,
          scale: distance ? 0.9 : 1,
          zIndex: 20 - distance,
        };
      }),
    [active, items],
  );

  const revealOrder = useMemo(() => {
    const orderedCards = [...cardStates].sort((first, second) => {
      const distanceDifference = Math.abs(first.offset) - Math.abs(second.offset);
      if (distanceDifference !== 0) return distanceDifference;
      return first.offset - second.offset;
    });

    return new Map(orderedCards.map((card, rank) => [card.index, rank]));
  }, [cardStates]);

  useEffect(() => {
    if (reduceMotion) {
      setEntranceComplete(true);
      return undefined;
    }

    if (!isInView) {
      setEntranceComplete(false);
      return undefined;
    }

    if (entranceComplete) return undefined;

    const timer = window.setTimeout(() => setEntranceComplete(true), 1500);
    return () => window.clearTimeout(timer);
  }, [entranceComplete, isInView, reduceMotion]);

  const selectProject = (index) => {
    onChange?.(index);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectProject(active - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectProject(active + 1);
    }
  };

  if (!activeProject) return null;

  return (
    <div ref={fanRef} className={`projectFan${isInView ? " isRevealed" : ""}`} onKeyDown={handleKeyDown}>
      <div className="projectFanStage" tabIndex={0} aria-label="游戏项目卡组，使用左右方向键切换">
        <AnimatePresence initial={false}>
          {cardStates.map((card) => {
            const entranceDelay = (revealOrder.get(card.index) ?? card.index) * 0.13;
            const dragProps = card.active
              ? {
                  drag: "x",
                  dragConstraints: { left: 0, right: 0 },
                  dragElastic: 0.16,
                  onDragEnd: (_event, info) => {
                    if (reduceMotion) return;
                    if (info.offset.x > 120 || info.velocity.x > 600) selectProject(active - 1);
                    if (info.offset.x < -120 || info.velocity.x < -600) selectProject(active + 1);
                  },
                }
              : {};

            return (
              <motion.article
                key={card.item.title}
                className={`projectFanCard${card.active ? " isActive" : ""}`}
                style={{
                  "--project-accent": CARD_ACCENTS[card.index % CARD_ACCENTS.length],
                  zIndex: card.zIndex,
                }}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: card.x,
                        y: card.y + 54,
                        rotateZ: card.rotateZ,
                        rotateX: card.rotateX,
                        scale: card.scale,
                      }
                }
                animate={{
                  opacity: isInView || reduceMotion ? 1 : 0,
                  x: card.x,
                  y: isInView || reduceMotion ? card.y + (card.active ? -22 : 0) : card.y + 170,
                  rotateZ: isInView || reduceMotion
                    ? card.rotateZ
                    : card.rotateZ + (card.offset < 0 ? -5 : 5),
                  rotateX: isInView || reduceMotion ? card.rotateX : 12,
                  scale: isInView || reduceMotion ? card.scale : card.scale * 0.72,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : entranceComplete
                      ? { type: "spring", stiffness: 280, damping: 28, mass: 0.9 }
                      : {
                          duration: 0.76,
                          delay: isInView ? entranceDelay : 0,
                          ease: [0.16, 1, 0.3, 1],
                        }
                }
                onClick={() => selectProject(card.index)}
                aria-current={card.active ? "true" : undefined}
                {...dragProps}
              >
                <div className="projectFanDepth">
                  {card.item.slug === "balatro-shader" ? (
                    <div className="projectFanBalatro" aria-hidden="true">
                      <Balatro {...balatroProps} />
                    </div>
                  ) : (
                    <img src={card.item.image} alt={`${card.item.title}项目视觉`} draggable="false" />
                  )}
                  <div className="projectFanShade" aria-hidden="true" />
                  <div className="projectFanCardTop">
                    <span>{card.item.tag}</span>
                    <strong>{String(card.index + 1).padStart(2, "0")}</strong>
                  </div>
                  <div className="projectFanCardCopy">
                    <p>{card.item.meta}</p>
                    <h3>{card.item.title}</h3>
                    <span>{card.item.period}</span>
                    <p className="projectFanDescription">{card.item.desc}</p>
                    <a
                      className="projectFanMore"
                      href={`/?project=${encodeURIComponent(card.item.slug)}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!onOpenProject || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault();
                        onOpenProject(card.item, event.currentTarget.closest(".projectFanCard"));
                      }}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      查看更多
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="projectFanControls">
        <button type="button" onClick={() => selectProject(active - 1)} aria-label="上一个项目">
          <ArrowLeft size={18} />
        </button>
        <div className="projectFanDots" aria-label="选择项目">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.title}
              className={index === active ? "isActive" : ""}
              onClick={() => selectProject(index)}
              aria-label={`查看${item.title}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>
        <button type="button" onClick={() => selectProject(active + 1)} aria-label="下一个项目">
          <ArrowRight size={18} />
        </button>
        <span className="projectFanGesture" aria-hidden="true">
          <MoveHorizontal size={16} />
          DRAG
        </span>
      </div>
    </div>
  );
}
