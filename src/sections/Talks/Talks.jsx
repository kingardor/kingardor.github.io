import React from "react";
import { Section } from "../../shared/components/Primitives";

const nvidiaTalk = {
  title: "NVIDIA GTC 2025 — Session S74465",
  url: "https://www.nvidia.com/en-us/on-demand/session/gtc25-s74465/",
  image: "/nvidia.jpg",
  description: "Watch my invited talk at NVIDIA GTC 2025, where I discuss cutting-edge AI, robotics, and real-world deployment stories.",
};

export default function Talks() {
  return (
    <Section id="talks" className="pt-12">
      <h2 className="text-xl font-semibold text-zinc-100 mb-6 flex items-center gap-3">
        <span role="img" aria-label="microphone">🎤</span> Invited Talks
      </h2>
      <div className="flex flex-col items-center">
        <a
          href={nvidiaTalk.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group max-w-xl w-full rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 shadow-xl hover:scale-[1.02] transition-transform"
        >
          <div className="relative aspect-video w-full bg-black/40">
            <img
              src={nvidiaTalk.image}
              alt="NVIDIA GTC Talk"
              className="h-full w-full object-cover object-center"
              style={{ minHeight: 200 }}
            />
            <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
              Featured
            </span>
          </div>
          <div className="p-5">
            <div className="text-lg font-bold text-zinc-100 mb-1">{nvidiaTalk.title}</div>
            <div className="text-sm text-zinc-300">{nvidiaTalk.description}</div>
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-green-400 group-hover:underline">
              <span>Watch Talk</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </a>
      </div>
    </Section>
  );
}
