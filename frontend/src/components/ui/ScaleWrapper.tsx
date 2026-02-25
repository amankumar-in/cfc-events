"use client";

import { useState, useEffect, useRef } from "react";

interface ScaleWrapperProps {
  children: React.ReactNode;
  designWidth?: number;
}

export function ScaleWrapper({ children, designWidth = 800 }: ScaleWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    function updateScale() {
      if (wrapperRef.current && innerRef.current) {
        const currentWidth = wrapperRef.current.offsetWidth;
        const newScale = Math.min(1, currentWidth / designWidth);
        setScale(newScale);
        setHeight(innerRef.current.offsetHeight * newScale);
      }
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [designWidth]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", overflow: "hidden", height }}>
      <div
        ref={innerRef}
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
