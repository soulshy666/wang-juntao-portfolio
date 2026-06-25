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

export default function VisualEditor({ settings, defaultSettings, password, onChange, onClose }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activePanel, setActivePanel] = useState("terminal");
  const passwordInputRef = useRef(null);

  const panelTitle = useMemo(() => {
    return activePanel === "terminal" ? "故障终端背景" : "ASCII 字体";
  }, [activePanel]);

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
            <button
              type="button"
              className={activePanel === "terminal" ? "isActive" : ""}
              onClick={() => setActivePanel("terminal")}
            >
              <SlidersHorizontal size={16} />
              故障终端背景
            </button>
            <button
              type="button"
              className={activePanel === "ascii" ? "isActive" : ""}
              onClick={() => setActivePanel("ascii")}
            >
              ASCII 字体
            </button>
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
          ) : (
            <div className="visualControlGrid">
              <TextControl label="显示文字" value={settings.ascii.text} onChange={(value) => updateGroup("ascii", "text", value)} />
              <ColorControl label="文字颜色" value={settings.ascii.textColor} onChange={(value) => updateGroup("ascii", "textColor", value)} />
              <NumberControl label="ASCII 字号" value={settings.ascii.asciiFontSize} min={3} max={16} step={1} onChange={(value) => updateGroup("ascii", "asciiFontSize", value)} />
              <NumberControl label="文字字号" value={settings.ascii.textFontSize} min={48} max={260} step={1} onChange={(value) => updateGroup("ascii", "textFontSize", value)} />
              <NumberControl label="平面高度" value={settings.ascii.planeBaseHeight} min={2} max={18} step={0.1} onChange={(value) => updateGroup("ascii", "planeBaseHeight", value)} />
              <ToggleControl label="波浪动效" checked={settings.ascii.enableWaves} onChange={(value) => updateGroup("ascii", "enableWaves", value)} />
            </div>
          )}

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
