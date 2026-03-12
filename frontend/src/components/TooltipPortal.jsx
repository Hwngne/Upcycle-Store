import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function TooltipPortal({
  targetRef,
  visible,
  children,
  offset = 8,
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!visible || !targetRef?.current) return;

    const rect = targetRef.current.getBoundingClientRect();

    setPos({
      top: rect.top + window.scrollY - offset,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, [visible, targetRef, offset]);

  if (!visible) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>,
    document.body
  );
}
