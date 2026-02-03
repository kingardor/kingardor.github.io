import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WandSparkles } from "lucide-react";

export default function ChatFAB({ onClick, label = "ask veronica" }) {
  const [hovered, setHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Touch detection in effect to avoid SSR hydration mismatches
  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse =
      window.matchMedia?.("(pointer: coarse)")?.matches || "ontouchstart" in window;
    setIsTouchDevice(Boolean(coarse));
  }, []);

  const showLabel = hovered && !isTouchDevice;

  return (
    <motion.button
      type="button"
      aria-label={label}
      className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 flex items-center outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
      initial={{ opacity: 0, scale: 0.7, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: 40 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      <motion.div
        className="shadow-xl rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-500 to-indigo-500 p-0.5"
        whileHover={{ scale: 1.08, boxShadow: "0 8px 32px 0 rgba(99,102,241,0.25)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ position: "relative" }}
      >
        <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-zinc-900/90">
          <WandSparkles size={28} aria-hidden="true" />
        </div>

        <AnimatePresence>
          {showLabel && (
            <motion.div
              className="absolute left-1/2 -top-4 -translate-x-1/2 -translate-y-full pointer-events-none"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              style={{ zIndex: 100 }}
            >
              <div className="px-4 py-2 rounded-full bg-zinc-900/90 text-pink-200 font-semibold text-base shadow-lg border border-pink-400/20 whitespace-nowrap select-none">
                {label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
