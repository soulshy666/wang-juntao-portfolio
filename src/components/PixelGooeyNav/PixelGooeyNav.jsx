import { useMemo, useRef, useState } from "react";
import "./PixelGooeyNav.css";

const DEFAULT_PARTICLES = 14;

function buildParticles(seed, count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((Math.PI * 2) / count) * index + ((seed + index * 17) % 9) * 0.035;
    const distance = 46 + ((seed + index * 23) % 32);
    const inner = 6 + ((seed + index * 11) % 12);
    const size = 4 + ((seed + index * 7) % 4) * 2;

    return {
      id: `${seed}-${index}`,
      size,
      delay: index * 12,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      fromX: Math.cos(angle) * inner,
      fromY: Math.sin(angle) * inner,
      colorIndex: (index % 4) + 1,
    };
  });
}

export default function PixelGooeyNav({ items, initialActiveIndex = 0, activeIndex: controlledActiveIndex, particleCount = DEFAULT_PARTICLES, onNavigate }) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(initialActiveIndex);
  const activeIndex = Number.isInteger(controlledActiveIndex) ? controlledActiveIndex : internalActiveIndex;
  const [burstSeed, setBurstSeed] = useState(1);
  const navRef = useRef(null);
  const particles = useMemo(() => buildParticles(burstSeed, particleCount), [burstSeed, particleCount]);

  const activate = (index) => {
    if (index === activeIndex) return;
    if (!Number.isInteger(controlledActiveIndex)) {
      setInternalActiveIndex(index);
    }
    setBurstSeed((value) => value + 1);
  };

  const handleClick = (event, index) => {
    activate(index);
    if (onNavigate?.(event, items[index], index)) return;

    const href = items[index]?.href;
    if (!href?.startsWith("#")) return;
    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "auto" });
  };

  return (
    <nav
      className="pixelGooeyNav"
      ref={navRef}
      style={{ "--pixel-active-index": activeIndex }}
      aria-label="像素粒子导航"
    >
      <span className="pixelGooeyTrack" aria-hidden="true" />
      <span className="pixelGooeyHighlight" aria-hidden="true">
        <span className="pixelGooeyHighlightCore" />
        <span className="pixelGooeyBurst" key={burstSeed}>
          {particles.map((particle) => (
            <i
              key={particle.id}
              style={{
                "--pixel-x": `${particle.x}px`,
                "--pixel-y": `${particle.y}px`,
                "--pixel-from-x": `${particle.fromX}px`,
                "--pixel-from-y": `${particle.fromY}px`,
                "--pixel-size": `${particle.size}px`,
                "--pixel-delay": `${particle.delay}ms`,
                "--pixel-color": `var(--pixel-particle-${particle.colorIndex})`,
              }}
            />
          ))}
        </span>
      </span>

      <ul>
        {items.map((item, index) => (
          <li key={item.href}>
            <a
              className={activeIndex === index ? "isActive" : ""}
              href={item.href}
              onClick={(event) => handleClick(event, index)}
              onMouseEnter={() => activate(index)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
