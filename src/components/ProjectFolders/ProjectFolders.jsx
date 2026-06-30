import Folder from "../Folder/Folder";
import "./ProjectFolders.css";

const baseFolders = [
  { id: "demo", label: "游戏实机演示视频" },
  { id: "screenshots", label: "游戏截图" },
];

const paperItems = ["01", "02", "03"].map(number => (
  <span className="projectFolderPaper" key={number}>{number}</span>
));

export default function ProjectFolders({ project, compact = false, settings }) {
  const folders = [...baseFolders];
  const folderColor = settings?.color ?? "#3b82f6";
  const folderSize = settings?.size ?? 1.25;
  const folderGap = settings?.gap ?? 28;

  if (project.tag !== "RECREATION") {
    folders.push({ id: "feedback", label: "玩家体验与反馈" });
  }

  if (project.slug === "beast-incarnation") {
    folders.push({ id: "awards", label: "获得奖项" });
  }

  return (
    <aside
      className={`projectFolders${compact ? " isCompact" : ""}`}
      style={{ "--project-folder-gap": `${folderGap}px` }}
      aria-label="项目资料"
    >
      {folders.map(folder => (
        <div className="projectFolderItem" key={folder.id}>
          <Folder
            className="projectFolderVisual"
            color={folderColor}
            size={compact ? 0.82 : folderSize}
            items={paperItems}
          />
          <span>{folder.label}</span>
        </div>
      ))}
    </aside>
  );
}
