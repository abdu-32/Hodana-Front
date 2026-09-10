"use client";

import React from "react";

export const KBSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-5 rounded-xl bg-surface border border-black/10 space-y-3 shadow-xs"
        >
          <div className="h-4 bg-surface-alt rounded w-1/4" />
          <div className="h-5 bg-surface-alt rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};
