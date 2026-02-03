import React, { useEffect, useState } from 'react'
import { Section } from '../../shared/components/Primitives'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'

// Neon gradient and glow via SVG defs
const NeonDefs = () => (
  <defs>
    <radialGradient id="neon-fill" cx="50%" cy="50%" r="80%">
      <stop offset="0%" stopColor="#00fff7" stopOpacity="0.8" />
      <stop offset="60%" stopColor="#00ff85" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#0ff" stopOpacity="0.2" />
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

const BASE_SKILLS = [
  { skill: 'AI/ML', value: 95 },
  { skill: 'Backend', value: 85 },
  { skill: 'DevOps', value: 70 },
  { skill: 'Vision', value: 90 },
  { skill: 'NLP', value: 80 },
  { skill: 'Cloud', value: 75 },
  { skill: 'Leadership', value: 88 }
];

export default function SkillsChart() {
  // Animate radar values from 0 to target
  const [animatedSkills, setAnimatedSkills] = useState(
    BASE_SKILLS.map(s => ({ ...s, value: 0 }))
  );

  useEffect(() => {
    let frame = 0;
    const duration = 900; // ms
    const steps = 30;
    const animate = () => {
      frame++;
      setAnimatedSkills(BASE_SKILLS.map((s, i) => ({
        ...s,
        value: Math.round(s.value * Math.min(1, frame / steps))
      })));
      if (frame < steps) {
        setTimeout(animate, duration / steps);
      }
    };
    animate();
    // eslint-disable-next-line
  }, []);

  return (
    <Section id="skills" className="pt-8 relative">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center">
        <div className="w-80 h-80 md:w-[32rem] md:h-[32rem] rounded-full bg-gradient-to-tr from-[#00fff7] via-[#00ff85] to-[#0ff] opacity-30 blur-3xl animate-spin-slow"></div>
      </div>
      <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00fff7] via-[#00ff85] to-[#0ff] mb-4 tracking-widest drop-shadow-[0_0_8px_#00fff7cc] font-mono uppercase">
        Skill Radar
      </h3>
      <div className="w-full max-w-xs h-60 md:max-w-xl md:h-[28rem] flex items-center justify-center mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={animatedSkills}>
            <NeonDefs />
            <PolarGrid stroke="#fff2" />
            <PolarAngleAxis
              dataKey="skill"
              stroke="#00fff7"
              fontSize={14}
              tickLine={false}
              style={{ fontFamily: 'monospace', textShadow: '0 0 8px #00fff7' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skill"
              dataKey="value"
              stroke="#00fff7"
              fill="url(#neon-fill)"
              fillOpacity={0.7}
              strokeWidth={4}
              filter="url(#glow)"
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0, 255, 247, 0.9)',
                color: '#111',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: 14,
                boxShadow: '0 0 16px #00fff7'
              }}
              itemStyle={{ color: '#111' }}
              labelStyle={{ color: '#111' }}
              formatter={(value, name, props) => [`${value}/100`, 'Skill']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <style>
        {`
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </Section>
  )
}
