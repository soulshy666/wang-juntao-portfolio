import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

function splitText(text, splitType) {
  if (splitType.includes("chars")) {
    return Array.from(text).map((char, index) => ({
      key: `${char}-${index}`,
      value: char === " " ? "\u00a0" : char,
      className: "split-char",
    }));
  }

  const segments = typeof Intl.Segmenter === "function"
    ? Array.from(new Intl.Segmenter("zh-CN", { granularity: "word" }).segment(text), (item) => item.segment)
    : Array.from(text);

  return segments.map((word, index) => ({
    key: `${word}-${index}`,
    value: /^\s+$/.test(word) ? "\u00a0" : word,
    className: "split-word",
  }));
}

function resolveToValues(from, to) {
  const resolved = { ...to };
  const neutralTransformValues = {
    x: 0,
    y: 0,
    z: 0,
    xPercent: 0,
    yPercent: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    skewX: 0,
    skewY: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
  };

  Object.entries(neutralTransformValues).forEach(([property, value]) => {
    if (property in from && !(property in resolved)) {
      resolved[property] = value;
    }
  });

  return resolved;
}

export default function SplitText({
  text,
  className = "",
  delay = 42,
  duration = 1.05,
  startDelay = 0,
  play = true,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 36 },
  to = { opacity: 1, y: 0 },
  textAlign = "left",
  tag = "p",
  onLetterAnimationComplete,
}) {
  const ref = useRef(null);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const parts = useMemo(() => splitText(text, splitType), [text, splitType]);
  const fromKey = JSON.stringify(from);
  const toKey = JSON.stringify(to);
  const resolvedTo = useMemo(() => resolveToValues(from, to), [fromKey, toKey]);
  const Tag = tag || "p";

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll(".split-char, .split-word");
    if (!targets.length) return undefined;

    if (!play) {
      gsap.set(targets, { ...from, transformOrigin: "50% 80%" });
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(targets, { opacity: 1, transform: "none", willChange: "auto" });
      onCompleteRef.current?.();
      return undefined;
    }

    const tween = gsap.fromTo(
      targets,
      { ...from, transformOrigin: "50% 80%", willChange: "transform, opacity" },
      {
        ...resolvedTo,
        delay: startDelay,
        duration,
        ease,
        stagger: delay / 1000,
        force3D: true,
        onComplete: () => {
          gsap.set(targets, { transform: "none", willChange: "auto" });
          onCompleteRef.current?.();
        },
      },
    );

    return () => {
      tween.kill();
      gsap.killTweensOf(targets);
    };
  }, [delay, duration, ease, fromKey, play, resolvedTo, splitType, startDelay, text, toKey]);

  return (
    <Tag
      ref={ref}
      style={{
        textAlign,
        overflow: "hidden",
        display: "block",
        whiteSpace: "normal",
        wordWrap: "break-word",
        "--split-start-y": `${from.y ?? 36}px`,
        "--split-start-rotate-x": `${from.rotateX ?? 0}deg`,
        "--split-start-scale": from.scale ?? 1,
      }}
      className={`split-parent ${className}`}
      aria-label={text}
    >
      <span aria-hidden="true">
        {parts.map((part) => (
          <span key={part.key} className={part.className}>
            {part.value}
          </span>
        ))}
      </span>
    </Tag>
  );
}
