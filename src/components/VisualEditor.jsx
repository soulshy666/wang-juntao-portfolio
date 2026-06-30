import { Lock, RotateCcw, Save, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./VisualEditor.css";

function formatValue(value) {
  if (typeof value === "number") return Number(value.toFixed(3)).toString();
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function NumberControl({ label, value, min, max, step, onChange }) {
  return (
    <label className="visualControl">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>{formatValue(value)}</output>
    </label>
  );
}

function ColorControl({ label, value, onChange }) {
  return (
    <label className="visualControl visualColorControl">
      <span>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextControl({ label, value, onChange }) {
  return (
    <label className="visualControl visualTextControl">
      <span>{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ToggleControl({ label, checked, onChange }) {
  return (
    <label className="visualControl visualToggleControl">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}

function ChoiceControl({ label, value, options, onChange }) {
  return (
    <fieldset className="visualControl visualChoiceControl">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? "isSelected" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const editorPanels = [
  { id: "terminal", label: "故障终端背景" },
  { id: "ascii", label: "ASCII 字体" },
  { id: "screen", label: "电视屏幕" },
  { id: "hero", label: "首页文字" },
  { id: "nav", label: "Gooey 导航" },
  { id: "glow", label: "Border Glow" },
  { id: "transition", label: "Pixel Transition" },
  { id: "splitText", label: "Split Text" },
  { id: "balatro", label: "Balatro 背景" },
  { id: "folder", label: "Folder 文件夹" },
];

export default function VisualEditor({ settings, defaultSettings, password, onChange, onClose }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activePanel, setActivePanel] = useState("terminal");
  const passwordInputRef = useRef(null);

  const panelTitle = useMemo(
    () => editorPanels.find((panel) => panel.id === activePanel)?.label ?? "组件设置",
    [activePanel],
  );

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      requestExit();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const updateGroup = (group, key, value) => {
    onChange({
      ...settings,
      [group]: {
        ...settings[group],
        [key]: value,
      },
    });
  };

  const resetActivePanel = () => {
    onChange({
      ...settings,
      [activePanel]: clone(defaultSettings[activePanel]),
    });
  };

  const submitPassword = (event) => {
    event.preventDefault();
    if (passwordValue === password) {
      setUnlocked(true);
      setPasswordError("");
      return;
    }

    setPasswordError("密码不对");
  };

  const requestExit = () => {
    if (!unlocked) {
      onClose({ save: false });
      return;
    }

    const shouldSave = window.confirm("是否保存当前调节？\n确定：保存并退出\n取消：不保存并还原");
    onClose({ save: shouldSave });
  };

  const saveAndExit = () => {
    onClose({ save: true });
  };

  const discardAndExit = () => {
    onClose({ save: false });
  };

  return (
    <div className="visualEditorLayer" role="dialog" aria-modal="true" aria-label="视觉调参编辑器">
      {!unlocked ? (
        <form className="visualPasswordPanel" onSubmit={submitPassword}>
          <div className="visualPasswordIcon">
            <Lock size={24} />
          </div>
          <h2>输入密码</h2>
          <p>按 Tab 呼出的视觉编辑器需要密码才能修改参数。</p>
          <input
            ref={passwordInputRef}
            type="password"
            inputMode="numeric"
            value={passwordValue}
            onChange={(event) => setPasswordValue(event.target.value)}
            placeholder="Password"
          />
          {passwordError && <span className="visualPasswordError">{passwordError}</span>}
          <div className="visualPasswordActions">
            <button type="submit">进入编辑器</button>
            <button type="button" onClick={() => onClose({ save: false })}>
              关闭
            </button>
          </div>
        </form>
      ) : (
        <aside className="visualEditorPanel">
          <header className="visualEditorHeader">
            <div>
              <p>Customize</p>
              <h2>{panelTitle}</h2>
            </div>
            <div className="visualEditorTools">
              <button type="button" onClick={resetActivePanel} title="恢复当前组件默认值">
                <RotateCcw size={16} />
                默认
              </button>
              <button type="button" onClick={saveAndExit} title="保存并退出">
                <Save size={16} />
                保存
              </button>
              <button type="button" onClick={requestExit} title="退出时询问是否保存">
                <X size={17} />
              </button>
            </div>
          </header>

          <div className="visualPanelSwitch" role="tablist" aria-label="选择调节组件">
            {editorPanels.map((panel, index) => (
              <button
                key={panel.id}
                type="button"
                className={activePanel === panel.id ? "isActive" : ""}
                onClick={() => setActivePanel(panel.id)}
              >
                {index === 0 && <SlidersHorizontal size={16} />}
                {panel.label}
              </button>
            ))}
          </div>

          {activePanel === "terminal" ? (
            <div className="visualControlGrid">
              <ColorControl label="色调颜色" value={settings.terminal.tint} onChange={(value) => updateGroup("terminal", "tint", value)} />
              <NumberControl label="整体缩放" value={settings.terminal.scale} min={0.6} max={2.6} step={0.01} onChange={(value) => updateGroup("terminal", "scale", value)} />
              <NumberControl label="字符尺寸" value={settings.terminal.digitSize} min={0.4} max={2.6} step={0.01} onChange={(value) => updateGroup("terminal", "digitSize", value)} />
              <NumberControl label="动画速度" value={settings.terminal.timeScale} min={0} max={2} step={0.01} onChange={(value) => updateGroup("terminal", "timeScale", value)} />
              <NumberControl label="噪点强度" value={settings.terminal.noiseAmp} min={0} max={2} step={0.01} onChange={(value) => updateGroup("terminal", "noiseAmp", value)} />
              <NumberControl label="亮度" value={settings.terminal.brightness} min={0.1} max={1.8} step={0.01} onChange={(value) => updateGroup("terminal", "brightness", value)} />
              <NumberControl label="扫描线强度" value={settings.terminal.scanlineIntensity} min={0} max={1.5} step={0.01} onChange={(value) => updateGroup("terminal", "scanlineIntensity", value)} />
              <NumberControl label="屏幕弯曲" value={settings.terminal.curvature} min={0} max={0.6} step={0.01} onChange={(value) => updateGroup("terminal", "curvature", value)} />
              <NumberControl label="鼠标影响" value={settings.terminal.mouseStrength} min={0} max={1.2} step={0.01} onChange={(value) => updateGroup("terminal", "mouseStrength", value)} />
              <NumberControl label="故障强度" value={settings.terminal.glitchAmount} min={0} max={3} step={0.01} onChange={(value) => updateGroup("terminal", "glitchAmount", value)} />
              <NumberControl label="闪烁强度" value={settings.terminal.flickerAmount} min={0} max={2} step={0.01} onChange={(value) => updateGroup("terminal", "flickerAmount", value)} />
              <NumberControl label="色差强度" value={settings.terminal.chromaticAberration} min={0} max={4} step={0.01} onChange={(value) => updateGroup("terminal", "chromaticAberration", value)} />
              <NumberControl label="抖色强度" value={settings.terminal.dither} min={0} max={1} step={0.01} onChange={(value) => updateGroup("terminal", "dither", value)} />
              <NumberControl label="横向网格" value={settings.terminal.gridX} min={0.5} max={4} step={0.01} onChange={(value) => updateGroup("terminal", "gridX", value)} />
              <NumberControl label="纵向网格" value={settings.terminal.gridY} min={0.5} max={4} step={0.01} onChange={(value) => updateGroup("terminal", "gridY", value)} />
              <ToggleControl label="鼠标响应" checked={settings.terminal.mouseReact} onChange={(value) => updateGroup("terminal", "mouseReact", value)} />
              <ToggleControl label="入场动画" checked={settings.terminal.pageLoadAnimation} onChange={(value) => updateGroup("terminal", "pageLoadAnimation", value)} />
            </div>
          ) : activePanel === "ascii" ? (
            <div className="visualControlGrid">
              <TextControl label="显示文字" value={settings.ascii.text} onChange={(value) => updateGroup("ascii", "text", value)} />
              <ColorControl label="文字颜色" value={settings.ascii.textColor} onChange={(value) => updateGroup("ascii", "textColor", value)} />
              <NumberControl label="ASCII 字号" value={settings.ascii.asciiFontSize} min={3} max={16} step={1} onChange={(value) => updateGroup("ascii", "asciiFontSize", value)} />
              <NumberControl label="文字字号" value={settings.ascii.textFontSize} min={48} max={260} step={1} onChange={(value) => updateGroup("ascii", "textFontSize", value)} />
              <NumberControl label="平面高度" value={settings.ascii.planeBaseHeight} min={2} max={18} step={0.1} onChange={(value) => updateGroup("ascii", "planeBaseHeight", value)} />
              <NumberControl label="左右扩展范围 px" value={settings.ascii.bleedX} min={0} max={720} step={4} onChange={(value) => updateGroup("ascii", "bleedX", value)} />
              <NumberControl label="上下扩展范围 px" value={settings.ascii.bleedY} min={0} max={260} step={4} onChange={(value) => updateGroup("ascii", "bleedY", value)} />
              <ToggleControl label="鼠标跟随" checked={settings.ascii.enableMouseFollow} onChange={(value) => updateGroup("ascii", "enableMouseFollow", value)} />
              <ToggleControl label="波浪动效" checked={settings.ascii.enableWaves} onChange={(value) => updateGroup("ascii", "enableWaves", value)} />
            </div>
          ) : activePanel === "screen" ? (
            <div className="visualControlGrid">
              <NumberControl label="屏幕左侧位置 %" value={settings.screen.slotLeft} min={32} max={48} step={0.1} onChange={(value) => updateGroup("screen", "slotLeft", value)} />
              <NumberControl label="屏幕顶部位置 %" value={settings.screen.slotTop} min={34} max={48} step={0.1} onChange={(value) => updateGroup("screen", "slotTop", value)} />
              <NumberControl label="屏幕宽度 %" value={settings.screen.slotWidth} min={22} max={38} step={0.1} onChange={(value) => updateGroup("screen", "slotWidth", value)} />
              <NumberControl label="屏幕高度 %" value={settings.screen.slotHeight} min={18} max={32} step={0.1} onChange={(value) => updateGroup("screen", "slotHeight", value)} />
              <NumberControl label="嵌入画面宽度 vw" value={settings.screen.frameWidthVw} min={90} max={170} step={1} onChange={(value) => updateGroup("screen", "frameWidthVw", value)} />
              <NumberControl label="嵌入画面高度 vh" value={settings.screen.frameHeightVh} min={80} max={130} step={1} onChange={(value) => updateGroup("screen", "frameHeightVh", value)} />
              <NumberControl label="嵌入画面缩放" value={settings.screen.frameScale} min={0.2} max={0.34} step={0.001} onChange={(value) => updateGroup("screen", "frameScale", value)} />
              <NumberControl label="嵌入画面水平偏移 px" value={settings.screen.frameOffsetX} min={-260} max={260} step={1} onChange={(value) => updateGroup("screen", "frameOffsetX", value)} />
              <NumberControl label="嵌入画面垂直偏移 px" value={settings.screen.frameOffsetY} min={-180} max={180} step={1} onChange={(value) => updateGroup("screen", "frameOffsetY", value)} />
              <NumberControl label="镜头缩放" value={settings.screen.cameraScale} min={3.4} max={4.8} step={0.01} onChange={(value) => updateGroup("screen", "cameraScale", value)} />
              <NumberControl label="镜头中心 X %" value={settings.screen.cameraOriginX} min={48} max={60} step={0.1} onChange={(value) => updateGroup("screen", "cameraOriginX", value)} />
              <NumberControl label="镜头中心 Y %" value={settings.screen.cameraOriginY} min={48} max={60} step={0.1} onChange={(value) => updateGroup("screen", "cameraOriginY", value)} />
            </div>
          ) : activePanel === "hero" ? (
            <div className="visualControlGrid">
              <NumberControl label="你好字号 px" value={settings.hero.introSize} min={54} max={128} step={1} onChange={(value) => updateGroup("hero", "introSize", value)} />
              <NumberControl label="欢迎文字字号 px" value={settings.hero.welcomeSize} min={34} max={92} step={1} onChange={(value) => updateGroup("hero", "welcomeSize", value)} />
              <NumberControl label="提示文字字号 px" value={settings.hero.eyebrowSize} min={12} max={28} step={1} onChange={(value) => updateGroup("hero", "eyebrowSize", value)} />
              <NumberControl label="整体左侧偏移 px" value={settings.hero.leftOffset} min={160} max={680} step={4} onChange={(value) => updateGroup("hero", "leftOffset", value)} />
            </div>
          ) : activePanel === "nav" ? (
            <div className="visualControlGrid">
              <ChoiceControl
                label="导航栏版本"
                value={settings.nav.variant}
                options={[
                  { label: "原版 Gooey", value: "classic" },
                  { label: "像素粒子", value: "pixel" },
                ]}
                onChange={(value) => updateGroup("nav", "variant", value)}
              />
              <NumberControl label="粒子数量" value={settings.nav.particleCount} min={4} max={24} step={1} onChange={(value) => updateGroup("nav", "particleCount", value)} />
              <NumberControl label="动画时长 ms" value={settings.nav.animationTime} min={200} max={1200} step={20} onChange={(value) => updateGroup("nav", "animationTime", value)} />
              <NumberControl label="时间随机量 ms" value={settings.nav.animationVariance} min={0} max={1000} step={20} onChange={(value) => updateGroup("nav", "animationVariance", value)} />
              <NumberControl label="粒子旋转半径" value={settings.nav.radiusFactor} min={50} max={600} step={10} onChange={(value) => updateGroup("nav", "radiusFactor", value)} />
              <NumberControl label="粒子外圈距离" value={settings.nav.particleOuterDistance} min={20} max={180} step={2} onChange={(value) => updateGroup("nav", "particleOuterDistance", value)} />
              <NumberControl label="粒子内圈距离" value={settings.nav.particleInnerDistance} min={0} max={80} step={2} onChange={(value) => updateGroup("nav", "particleInnerDistance", value)} />
              <ColorControl label="粒子颜色 1" value={settings.nav.particleOne} onChange={(value) => updateGroup("nav", "particleOne", value)} />
              <ColorControl label="粒子颜色 2" value={settings.nav.particleTwo} onChange={(value) => updateGroup("nav", "particleTwo", value)} />
              <ColorControl label="粒子颜色 3" value={settings.nav.particleThree} onChange={(value) => updateGroup("nav", "particleThree", value)} />
              <ColorControl label="粒子颜色 4" value={settings.nav.particleFour} onChange={(value) => updateGroup("nav", "particleFour", value)} />
            </div>
          ) : activePanel === "glow" ? (
            <div className="visualControlGrid">
              <ColorControl label="UI 框背景" value={settings.glow.backgroundColor} onChange={(value) => updateGroup("glow", "backgroundColor", value)} />
              <ColorControl label="渐变颜色 1" value={settings.glow.colorOne} onChange={(value) => updateGroup("glow", "colorOne", value)} />
              <ColorControl label="渐变颜色 2" value={settings.glow.colorTwo} onChange={(value) => updateGroup("glow", "colorTwo", value)} />
              <ColorControl label="渐变颜色 3" value={settings.glow.colorThree} onChange={(value) => updateGroup("glow", "colorThree", value)} />
              <NumberControl label="边缘感应范围" value={settings.glow.edgeSensitivity} min={5} max={60} step={1} onChange={(value) => updateGroup("glow", "edgeSensitivity", value)} />
              <NumberControl label="圆角 px" value={settings.glow.borderRadius} min={0} max={36} step={1} onChange={(value) => updateGroup("glow", "borderRadius", value)} />
              <NumberControl label="发光范围 px" value={settings.glow.glowRadius} min={8} max={80} step={1} onChange={(value) => updateGroup("glow", "glowRadius", value)} />
              <NumberControl label="发光强度" value={settings.glow.glowIntensity} min={0} max={2} step={0.05} onChange={(value) => updateGroup("glow", "glowIntensity", value)} />
              <NumberControl label="光锥角度" value={settings.glow.coneSpread} min={5} max={60} step={1} onChange={(value) => updateGroup("glow", "coneSpread", value)} />
              <NumberControl label="填充透明度" value={settings.glow.fillOpacity} min={0} max={1} step={0.05} onChange={(value) => updateGroup("glow", "fillOpacity", value)} />
              <ToggleControl label="自动扫光入场" checked={settings.glow.animated} onChange={(value) => updateGroup("glow", "animated", value)} />
            </div>
          ) : activePanel === "transition" ? (
            <div className="visualControlGrid">
              <NumberControl label="像素网格数量" value={settings.transition.gridSize} min={4} max={20} step={1} onChange={(value) => updateGroup("transition", "gridSize", value)} />
              <NumberControl label="翻转动画时长 s" value={settings.transition.animationDuration} min={0.12} max={1.2} step={0.02} onChange={(value) => updateGroup("transition", "animationDuration", value)} />
            </div>
          ) : activePanel === "splitText" ? (
            <div className="visualControlGrid">
              <NumberControl label="标题字符间隔 ms" value={settings.splitText.titleDelay} min={0} max={120} step={2} onChange={(value) => updateGroup("splitText", "titleDelay", value)} />
              <NumberControl label="标题动画时长 s" value={settings.splitText.titleDuration} min={0.2} max={2} step={0.05} onChange={(value) => updateGroup("splitText", "titleDuration", value)} />
              <NumberControl label="标题起始位移 px" value={settings.splitText.titleOffsetY} min={0} max={180} step={2} onChange={(value) => updateGroup("splitText", "titleOffsetY", value)} />
              <NumberControl label="正文词语间隔 ms" value={settings.splitText.bodyDelay} min={0} max={90} step={2} onChange={(value) => updateGroup("splitText", "bodyDelay", value)} />
              <NumberControl label="正文动画时长 s" value={settings.splitText.bodyDuration} min={0.2} max={1.8} step={0.05} onChange={(value) => updateGroup("splitText", "bodyDuration", value)} />
              <NumberControl label="正文起始位移 px" value={settings.splitText.bodyOffsetY} min={0} max={120} step={2} onChange={(value) => updateGroup("splitText", "bodyOffsetY", value)} />
            </div>
          ) : activePanel === "balatro" ? (
            <div className="visualControlGrid">
              <ColorControl label="主颜色" value={settings.balatro.colorOne} onChange={(value) => updateGroup("balatro", "colorOne", value)} />
              <ColorControl label="次颜色" value={settings.balatro.colorTwo} onChange={(value) => updateGroup("balatro", "colorTwo", value)} />
              <ColorControl label="暗部颜色" value={settings.balatro.colorThree} onChange={(value) => updateGroup("balatro", "colorThree", value)} />
              <NumberControl label="旋转方向" value={settings.balatro.spinRotation} min={-5} max={5} step={0.1} onChange={(value) => updateGroup("balatro", "spinRotation", value)} />
              <NumberControl label="流动速度" value={settings.balatro.spinSpeed} min={0} max={15} step={0.1} onChange={(value) => updateGroup("balatro", "spinSpeed", value)} />
              <NumberControl label="水平偏移" value={settings.balatro.offsetX} min={-0.5} max={0.5} step={0.01} onChange={(value) => updateGroup("balatro", "offsetX", value)} />
              <NumberControl label="垂直偏移" value={settings.balatro.offsetY} min={-0.5} max={0.5} step={0.01} onChange={(value) => updateGroup("balatro", "offsetY", value)} />
              <NumberControl label="对比度" value={settings.balatro.contrast} min={1} max={6} step={0.1} onChange={(value) => updateGroup("balatro", "contrast", value)} />
              <NumberControl label="光照强度" value={settings.balatro.lighting} min={0} max={1} step={0.02} onChange={(value) => updateGroup("balatro", "lighting", value)} />
              <NumberControl label="旋涡强度" value={settings.balatro.spinAmount} min={0} max={1} step={0.02} onChange={(value) => updateGroup("balatro", "spinAmount", value)} />
              <NumberControl label="像素密度" value={settings.balatro.pixelFilter} min={100} max={1200} step={10} onChange={(value) => updateGroup("balatro", "pixelFilter", value)} />
              <NumberControl label="旋转缓动" value={settings.balatro.spinEase} min={0} max={2} step={0.05} onChange={(value) => updateGroup("balatro", "spinEase", value)} />
              <ToggleControl label="持续旋转" checked={settings.balatro.isRotate} onChange={(value) => updateGroup("balatro", "isRotate", value)} />
              <ToggleControl label="鼠标互动" checked={settings.balatro.mouseInteraction} onChange={(value) => updateGroup("balatro", "mouseInteraction", value)} />
            </div>
          ) : activePanel === "folder" ? (
            <div className="visualControlGrid">
              <ColorControl label="文件夹颜色" value={settings.folder.color} onChange={(value) => updateGroup("folder", "color", value)} />
              <NumberControl label="文件夹大小" value={settings.folder.size} min={0.7} max={1.8} step={0.05} onChange={(value) => updateGroup("folder", "size", value)} />
              <NumberControl label="文件夹水平间距 px" value={settings.folder.gap} min={8} max={80} step={2} onChange={(value) => updateGroup("folder", "gap", value)} />
            </div>
          ) : null}

          <footer className="visualEditorFooter">
            <span>Tab 打开编辑器，Esc 退出。退出会询问是否保存；不保存会还原本次调节。</span>
            <button type="button" onClick={discardAndExit}>
              不保存退出
            </button>
          </footer>
        </aside>
      )}
    </div>
  );
}
