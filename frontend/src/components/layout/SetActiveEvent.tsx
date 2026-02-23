"use client";

import { useEffect } from "react";
import { useActiveEvent } from "./ActiveEventContext";

export function SetActiveEvent({ title, slug }: { title: string; slug: string }) {
  const { setActiveEvent } = useActiveEvent();

  useEffect(() => {
    setActiveEvent({ title, slug });
    return () => setActiveEvent(null);
  }, [title, slug, setActiveEvent]);

  return null;
}
