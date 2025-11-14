import { Title, TitleProps } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconLink } from "@tabler/icons-react";
import { useState } from "react";

interface AnchorHeadingProps extends TitleProps {
  id: string;
  children: React.ReactNode;
}

const AnchorHeading = ({ id, children, style, ...titleProps }: AnchorHeadingProps) => {
  const clipboard = useClipboard({ timeout: 2000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    clipboard.copy(url);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: titleProps.align === "center" ? "center" : "flex-start",
        alignItems: "center",
        width: "100%",
        gap: "0.5rem",
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Title id={id} {...titleProps} style={{ margin: 0 }}>
        {children}
      </Title>
      <div
        onClick={handleClick}
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
        }}
        title={clipboard.copied ? "Link kopiert!" : "Link kopieren"}
      >
        <IconLink size={20} />
        {clipboard.copied && (
          <span style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            Kopiert!
          </span>
        )}
      </div>
    </div>
  );
};

export default AnchorHeading;
