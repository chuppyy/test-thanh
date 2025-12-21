/**
 * This context is the global ads state management
 */

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AdsStateContextType = {
  adsMoved: boolean;
  setAdsMoved: (moved: boolean) => void;
};

const AdsStateContext = createContext<AdsStateContextType | undefined>(
  undefined
);

export const AdsStateProvider = ({ children }: { children: ReactNode }) => {
  const [adsMoved, setAdsMoved] = useState(false);

  return (
    <AdsStateContext.Provider
      value={{
        adsMoved,
        setAdsMoved,
      }}
    >
      {children}
    </AdsStateContext.Provider>
  );
};

export const useAdsState = () => {
  const context = useContext(AdsStateContext);
  if (!context) {
    throw new Error("useAdsState must be used within AdsStateProvider");
  }
  return context;
};
