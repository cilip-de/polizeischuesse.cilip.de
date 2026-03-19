import { useRef, useEffect, useState, ReactNode } from "react";

interface MobileTooltipState<T> {
  active: T | null;
  setActive: (item: T | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerProps: {
    ref: React.RefObject<HTMLDivElement | null>;
    onClick: () => void;
  };
}

export function useMobileTooltip<T>(mobile: boolean): MobileTooltipState<T> {
  const [active, setActive] = useState<T | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActive(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobile]);

  return {
    active,
    setActive,
    containerRef,
    containerProps: {
      ref: containerRef,
      onClick: () => setActive(null),
    },
  };
}

interface MobileTooltipOverlayProps {
  mobile: boolean;
  visible: boolean;
  children: ReactNode;
}

export function MobileTooltipOverlay({ mobile, visible, children }: MobileTooltipOverlayProps) {
  if (!mobile || !visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        padding: "0.5rem 0.75rem",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 1000,
        fontSize: "0.85rem",
        maxWidth: "90%",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}
