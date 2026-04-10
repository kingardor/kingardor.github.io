import React from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { useTheme } from '../../../shared/contexts/ThemeContext'

function getColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    accent:   (s.getPropertyValue('--nm-accent')      || '#dc2626').trim(),
    accent2:  (s.getPropertyValue('--nm-accent-2')    || '#db2777').trim(),
    surface:  (s.getPropertyValue('--nm-surface')     || '#111116').trim(),
    textMuted:(s.getPropertyValue('--nm-text-muted')  || '#6b7280').trim(),
    border:   (s.getPropertyValue('--nm-border')      || '#1f1f2e').trim(),
  }
}

export default function SkillCharts({ data }) {
  const { theme } = useTheme()
  const colors = React.useMemo(() => getColors(), [theme])

  const radarData  = data?.radar    ?? []
  const techData   = data?.tech_bars ?? []

  if (!radarData.length && !techData.length) return null

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Skill Radar ── */}
      {radarData.length > 0 && (
        <div>
          <div className="hud-text" style={{ fontSize: '0.55rem', color: colors.textMuted, letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
            DOMAIN PROFICIENCY
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke={colors.border} />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fill: colors.textMuted, fontSize: 10, fontFamily: 'var(--font-mono)' }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={colors.accent}
                fill={colors.accent}
                fillOpacity={0.25}
                dot={{ fill: colors.accent, r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Tech Experience Bars ── */}
      {techData.length > 0 && (
        <div>
          <div className="hud-text" style={{ fontSize: '0.55rem', color: colors.textMuted, letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
            YEARS OF EXPERIENCE
          </div>
          <ResponsiveContainer width="100%" height={techData.length * 28 + 20}>
            <BarChart
              data={techData}
              layout="vertical"
              margin={{ top: 0, right: 40, bottom: 0, left: 10 }}
            >
              <XAxis
                type="number"
                domain={[0, 6]}
                tick={{ fill: colors.textMuted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="tech"
                width={90}
                tick={{ fill: colors.textMuted, fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 11 }}
                formatter={(v, _, { payload }) => {
                  const lvl = payload.level ? ` · ${payload.level}` : ''
                  return [`${v} yr${v !== 1 ? 's' : ''}${lvl}`, 'Experience']
                }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="years" radius={[0, 4, 4, 0]} maxBarSize={14}>
                {techData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i % 2 === 0 ? colors.accent : colors.accent2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
