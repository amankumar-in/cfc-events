"use client";

import { useState, useEffect, useRef } from "react";

interface ScaleWrapperProps {
  children: React.ReactNode;
  designWidth?: number;
}

export function ScaleWrapper({ children, designWidth = 800 }: ScaleWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      if (wrapperRef.current) {
        const currentWidth = wrapperRef.current.offsetWidth;
        const newScale = currentWidth / designWidth;
        setScale(newScale);
      }
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [designWidth]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", overflow: "hidden" }}>
      <div
        style={{
          width: designWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
