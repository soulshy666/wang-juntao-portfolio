import PixelTransition from "../PixelTransition/PixelTransition";
import "./ProjectRouteTransition.css";

export default function ProjectRouteTransition({ transition, settings, onMidpoint, onComplete }) {
  const scaleX = Math.max(0.02, transition.width / window.innerWidth);
  const scaleY = Math.max(0.02, transition.height / window.innerHeight);
  const direction = transition.direction === "reverse" ? "reverse" : "forward";
  const backgroundStyle = transition.image
    ? { backgroundImage: `url("${transition.image}")` }
    : { background: transition.backgroundColor };

  return (
    <div
      className={`projectRouteTransition is${direction === "reverse" ? "Reverse" : "Forward"}`}
      style={{
        "--route-origin-x": `${transition.left}px`,
        "--route-origin-y": `${transition.top}px`,
        "--route-scale-x": scaleX,
        "--route-scale-y": scaleY,
      }}
      aria-hidden="true"
    >
      <PixelTransition
        firstContent={<div className="projectRouteTransparent" />}
        secondContent={
          direction === "reverse"
            ? <div className="projectRouteTransparent" />
            : <div className="projectRouteSolid" style={backgroundStyle} />
        }
        gridSize={settings.gridSize}
        pixelColor={transition.backgroundColor}
        pixelColors={transition.pixelColors}
        animationStepDuration={settings.animationDuration}
        once
        autoPlay
        onMidpoint={() => onMidpoint?.(transition)}
        onComplete={() => onComplete?.(transition)}
        aspectRatio="0%"
        className="projectRoutePixels"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
