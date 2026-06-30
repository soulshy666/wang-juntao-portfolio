import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './PixelTransition.css';

function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = 'currentColor',
  pixelColors = null,
  animationStepDuration = 0.3,
  once = false,
  autoPlay = false,
  onMidpoint,
  onComplete,
  aspectRatio = '100%',
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const pixelGridRef = useRef(null);
  const activeRef = useRef(null);
  const delayedCallRef = useRef(null);
  const completionCallRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const activeStateRef = useRef(false);
  const onMidpointRef = useRef(onMidpoint);
  const onCompleteRef = useRef(onComplete);

  const [isActive, setIsActive] = useState(false);

  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    onMidpointRef.current = onMidpoint;
    onCompleteRef.current = onComplete;
  }, [onComplete, onMidpoint]);

  useEffect(() => {
    const pixelGridEl = pixelGridRef.current;
    if (!pixelGridEl) return;

    pixelGridEl.innerHTML = '';

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixelated-image-card__pixel');
        pixel.style.backgroundColor = pixelColors?.[row * gridSize + col] || pixelColor;

        const size = 100 / gridSize;
        pixel.style.width = `${size}%`;
        pixel.style.height = `${size}%`;
        pixel.style.left = `${col * size}%`;
        pixel.style.top = `${row * size}%`;
        pixelGridEl.appendChild(pixel);
      }
    }
  }, [gridSize, pixelColor, pixelColors]);

  const animatePixels = useCallback(activate => {
    if (isAnimatingRef.current || activeStateRef.current === activate) return;

    isAnimatingRef.current = true;
    activeStateRef.current = activate;
    setIsActive(activate);

    const pixelGridEl = pixelGridRef.current;
    const activeEl = activeRef.current;
    if (!pixelGridEl || !activeEl) {
      isAnimatingRef.current = false;
      return;
    }

    const pixels = pixelGridEl.querySelectorAll('.pixelated-image-card__pixel');
    if (!pixels.length) {
      isAnimatingRef.current = false;
      return;
    }

    gsap.killTweensOf(pixels);
    if (delayedCallRef.current) {
      delayedCallRef.current.kill();
    }
    if (completionCallRef.current) {
      completionCallRef.current.kill();
    }

    gsap.set(pixels, { display: 'none' });

    const totalPixels = pixels.length;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stepDuration = prefersReducedMotion ? 0.01 : animationStepDuration;
    const staggerDuration = stepDuration / totalPixels;

    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: {
        each: staggerDuration,
        from: 'random'
      }
    });

    delayedCallRef.current = gsap.delayedCall(stepDuration, () => {
      activeEl.style.display = activate ? 'block' : 'none';
      activeEl.style.pointerEvents = activate ? 'none' : '';
      onMidpointRef.current?.(activate);
    });

    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: stepDuration,
      stagger: {
        each: staggerDuration,
        from: 'random'
      }
    });

    completionCallRef.current = gsap.delayedCall(stepDuration * 2, () => {
      isAnimatingRef.current = false;
      onCompleteRef.current?.(activate);
    });
  }, [animationStepDuration]);

  useEffect(() => {
    if (autoPlay) animatePixels(true);
  }, [animatePixels, autoPlay]);

  useEffect(
    () => () => {
      delayedCallRef.current?.kill();
      completionCallRef.current?.kill();
      const pixels = pixelGridRef.current?.querySelectorAll('.pixelated-image-card__pixel');
      if (pixels?.length) {
        gsap.killTweensOf(pixels);
        gsap.set(pixels, { clearProps: 'display' });
      }
      activeRef.current?.style.removeProperty('display');
      activeRef.current?.style.removeProperty('pointer-events');
      isAnimatingRef.current = false;
      activeStateRef.current = false;
    },
    []
  );

  const handleEnter = () => {
    if (!activeStateRef.current) animatePixels(true);
  };
  const handleLeave = () => {
    if (activeStateRef.current && !once) animatePixels(false);
  };
  const handleClick = () => {
    if (!activeStateRef.current) animatePixels(true);
    else if (activeStateRef.current && !once) animatePixels(false);
  };

  return (
    <div
      ref={containerRef}
      className={`pixelated-image-card ${className}`}
      style={style}
      onMouseEnter={!isTouchDevice ? handleEnter : undefined}
      onMouseLeave={!isTouchDevice ? handleLeave : undefined}
      onClick={isTouchDevice ? handleClick : undefined}
      onFocus={!isTouchDevice ? handleEnter : undefined}
      onBlur={!isTouchDevice ? handleLeave : undefined}
      tabIndex={0}
    >
      <div style={{ paddingTop: aspectRatio }} />
      <div className="pixelated-image-card__default" aria-hidden={isActive}>
        {firstContent}
      </div>
      <div className="pixelated-image-card__active" ref={activeRef} aria-hidden={!isActive}>
        {secondContent}
      </div>
      <div className="pixelated-image-card__pixels" ref={pixelGridRef} />
    </div>
  );
}

export default PixelTransition;
