import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../../shared/contexts/ThemeContext'

const BASE_YEAR = 2020

function getColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    accent:   (s.getPropertyValue('--nm-accent')   || '#dc2626').trim(),
    accent2:  (s.getPropertyValue('--nm-accent-2') || '#db2777').trim(),
    surface:  (s.getPropertyValue('--nm-surface')  || '#111116').trim(),
    textMuted:(s.getPropertyValue('--nm-text-muted')|| '#6b7280').trim(),
    border:   (s.getPropertyValue('--nm-border')   || '#1f1f2e').trim(),
  }
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  if (!entry) return null
  const colors = getColors()
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: 11,
      maxWidth: 220,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 2, color: '#fff' }}>{entry.role}</div>
      <div style={{ color: colors.accent, marginBottom: 4 }}>{entry.company}</div>
      <div style={{ color: colors.textMuted, fontSize: 10 }}>{entry.period}</div>
    </div>
  )
}

export default function CareerTimeline({ data }) {
  const { theme } = useTheme()
  const colors = React.useMemo(() => getColors(), [theme])
  const career = data?.career ?? []
  if (!career.length) return null

  const chartData = career.map((c, i) => ({
    ...c,
    offset:   c.start_year - BASE_YEAR,
    duration: Math.max(0.5, c.end_year - c.start_year),
    colorIdx: i,
  }))

  const tickYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div
        className="hud-text"
        style={{ fontSize: '0.55rem', color: colors.textMuted, letterSpacing: '0.12em', marginBottom: '0.5rem' }}
      >
        CAREER TIMELINE
      </div>
      <ResponsiveContainer width="100%" height={career.length * 36 + 30}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            domain={[0, 2026 - BASE_YEAR + 1]}
            ticks={tickYears.map(y => y - BASE_YEAR)}
            tickFormatter={v => BASE_YEAR + v}
            tick={{ fill: colors.textMuted, fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="company"
            width={100}
            tick={{ fill: colors.textMuted, fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />

          {/* Invisible offset bar */}
          <Bar dataKey="offset" stackId="g" fill="transparent" />

          {/* Colored duration bar */}
          <Bar dataKey="duration" stackId="g" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={i % 2 === 0 ? colors.accent : colors.accent2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
