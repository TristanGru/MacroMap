import React, { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "onboarding_seen";
const DISMISS_DELAY_MS = 5000;

function shouldShow(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return false;
  }
}

export default function OnboardingTooltip() {
  // Lazy initializer checks localStorage at mount — avoids setState-in-effect
  const [visible, setVisible] = useState(shouldShow);
  const [progress, setProgress] = useState(100);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    const start = Date.now();
    let handle: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DISMISS_DELAY_MS) * 100);
      setProgress(remaining);
      if (elapsed < DISMISS_DELAY_MS) {
        handle = requestAnimationFrame(tick);
      } else {
        dismiss();
      }
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "60%",
        transform: "translate(-50%, -50%)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "14px 18px 6px",
        maxWidth: "320px",
        width: "calc(100% - 32px)",
        textAlign: "center",
        zIndex: 80,
        pointerEvents: "auto",
        overflow: "hidden",
      }}
      role="status"
      aria-live="polite"
    >
      <p
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--color-text)",
          margin: "0 0 4px 0",
        }}
      >
        Live resource flows — oil, grain, gas.
      </p>
      <p
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "13px",
          color: "var(--color-text-muted)",
          margin: "0 0 10px 0",
        }}
      >
        Red = disrupted. Click any marker for the news.
      </p>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: "var(--color-accent)",
          width: `${progress}%`,
          transition: "none",
        }}
      />

      <button
        onClick={dismiss}
        style={{
          position: "absolute",
          top: "6px",
          right: "8px",
          background: "none",
          border: "none",
          color: "var(--color-text-dim)",
          fontSize: "16px",
          cursor: "pointer",
          padding: "4px",
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
