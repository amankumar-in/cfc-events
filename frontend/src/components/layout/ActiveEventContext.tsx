"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ActiveEvent {
  title: string;
  slug: string;
}

const ActiveEventContext = createContext<{
  activeEvent: ActiveEvent | null;
  setActiveEvent: (event: ActiveEvent | null) => void;
}>({ activeEvent: null, setActiveEvent: () => {} });

export function ActiveEventProvider({ children }: { children: ReactNode }) {
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  const set = useCallback((event: ActiveEvent | null) => setActiveEvent(event), []);
  return (
    <ActiveEventContext.Provider value={{ activeEvent, setActiveEvent: set }}>
      {children}
    </ActiveEventContext.Provider>
  );
}

export function useActiveEvent() {
  return useContext(ActiveEventContext);
}
