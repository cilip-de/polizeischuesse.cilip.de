import { useClipboard } from "@/lib/hooks/useClipboard";
import { IconLink } from "@tabler/icons-react";
import { CSSProperties, useState } from "react";

interface AnchorHeadingProps {
  id: string;
  children: React.ReactNode;
  order?: 1 | 2 | 3 | 4 | 5 | 6;
  ta?: "center" | "left" | "right";
  style?: CSSProperties;
}

const headingClasses: Record<number, string> = {
  1: "text-3xl font-bold tracking-tight",
  2: "text-xl font-semibold",
  3: "text-lg font-semibold",
  4: "text-base font-semibold",
  5: "text-sm font-semibold",
  6: "text-xs font-semibold",
};

const AnchorHeading = ({ id, children, order = 2, ta, style }: AnchorHeadingProps) => {
  const clipboard = useClipboard({ timeout: 2000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    clipboard.copy(url);
  };

  const containerStyle: CSSProperties = {
    display: "flex",
    justifyContent: ta === "center" ? "center" : "flex-start",
    alignItems: "center",
    width: "100%",
    gap: "0.5rem",
    ...(typeof style === 'object' && !Array.isArray(style) ? style : {}),
  };

  const renderHeading = () => {
    const className = headingClasses[order];
    const props = { id, className, style: { margin: 0 } as CSSProperties };
    switch (order) {
      case 1: return <h1 {...props}>{children}</h1>;
      case 3: return <h3 {...props}>{children}</h3>;
      case 4: return <h4 {...props}>{children}</h4>;
      case 5: return <h5 {...props}>{children}</h5>;
      case 6: return <h6 {...props}>{children}</h6>;
      default: return <h2 {...props}>{children}</h2>;
    }
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderHeading()}
      <button
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        style={{
          opacity: isHovered || clipboard.copied ? 1 : 0,
          transition: "opacity 0.2s",
          cursor: "pointer",
          color: clipboard.copied ? "#228be6" : "#868e96",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          fontSize: "0.875rem",
          userSelect: "none",
          flexShrink: 0,
          background: "none",
          border: "none",
          padding: "0.25rem",
        }}
        title={clipboard.copied ? "Link kopiert!" : "Link kopieren"}
        aria-label={clipboard.copied ? "Link kopiert" : "Link zur Überschrift kopieren"}
      >
        <IconLink size={20} aria-hidden="true" />
        {clipboard.copied && (
          <span style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            Kopiert!
          </span>
        )}
      </button>
    </div>
  );
};

export default AnchorHeading;
