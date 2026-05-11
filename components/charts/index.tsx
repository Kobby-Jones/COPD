"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PolarRadiusAxis,
} from "recharts";

// ─── Color Palette ─────────────────────────────────────────────────────────
export const CHART_COLORS = {
  blue: "#1B6CA8",
  blueLight: "#0EA5E9",
  red: "#E53935",
  green: "#16A34A",
  amber: "#F59E0B",
  purple: "#7C3AED",
  teal: "#0D9488",
  gray: "#64748B",
};

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-medium text-muted-foreground mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          {entry.unit ?? ""}
        </p>
      ))}
    </div>
  );
};

// ─── Trend Line Chart ──────────────────────────────────────────────────────
interface TrendChartProps {
  data: { date: string; predictions: number; highRisk: number }[];
  height?: number;
}
export function TrendLineChart({ data, height = 220 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="grad-pred" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.15} />
            <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-high" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.red} stopOpacity={0.1} />
            <stop offset="95%" stopColor={CHART_COLORS.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8EF" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A9BAB" }} axisLine={false} tickLine={false} interval={5} />
        <YAxis tick={{ fontSize: 11, fill: "#8A9BAB" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="predictions" name="Predictions" stroke={CHART_COLORS.blue} strokeWidth={2} fill="url(#grad-pred)" dot={false} />
        <Area type="monotone" dataKey="highRisk" name="High Risk" stroke={CHART_COLORS.red} strokeWidth={2} fill="url(#grad-high)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Risk Distribution Pie ─────────────────────────────────────────────────
const RISK_PIE_COLORS = ["#22C55E", "#F59E0B", "#E53935", "#7C3AED"];
const RISK_PIE_LABELS = ["Low", "Moderate", "High", "Critical"];

interface RiskPieChartProps {
  data: { name: string; value: number }[];
  height?: number;
}
export function RiskPieChart({ data, height = 180 }: RiskPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={RISK_PIE_COLORS[i]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Horizontal Bar Chart ──────────────────────────────────────────────────
interface HBarChartProps {
  data: { factor: string; prevalence: number }[];
  height?: number;
  color?: string;
}
export function HBarChart({ data, height = 200, color = CHART_COLORS.blue }: HBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8EF" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#8A9BAB" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="factor" tick={{ fontSize: 11, fill: "#5A6A7A" }} axisLine={false} tickLine={false} width={90} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="prevalence" name="Prevalence" fill={color} radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => {
            const colors = [CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];
            return <Cell key={i} fill={colors[i % colors.length]} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Vertical Bar Chart ────────────────────────────────────────────────────
interface VBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  unit?: string;
}
export function VBarChart({ data, height = 200, color = CHART_COLORS.blue, unit = "" }: VBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8EF" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5A6A7A" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#8A9BAB" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}${unit}`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => {
            const colors = ["#93C5FD", "#60A5FA", "#2563EB", "#1D4ED8", "#1E3A8A"];
            return <Cell key={i} fill={colors[Math.min(i, colors.length - 1)]} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Radar / Spider Chart ──────────────────────────────────────────────────
interface RadarChartProps {
  data: { subject: string; value: number }[];
  height?: number;
}
export function FeatureRadarChart({ data, height = 240 }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="#E2E8EF" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#5A6A7A" }} />
        <PolarRadiusAxis tick={{ fontSize: 9, fill: "#8A9BAB" }} />
        <Radar name="Importance" dataKey="value" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.15} strokeWidth={2} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── SHAP Feature Importance Bar ──────────────────────────────────────────
interface ShapBarChartProps {
  data: { feature: string; importance: number; color: string }[];
  height?: number;
}
export function ShapBarChart({ data, height = 300 }: ShapBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8EF" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#8A9BAB" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: "#5A6A7A" }} axisLine={false} tickLine={false} width={130} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="importance" name="Mean |SHAP|" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Donut Chart ───────────────────────────────────────────────────────────
interface DonutChartProps {
  data: { name: string; value: number }[];
  colors: string[];
  height?: number;
}
export function DonutChart({ data, colors, height = 160 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={2} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Performance Gauge Bar ─────────────────────────────────────────────────
interface MetricRowProps {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}
export function MetricBar({ label, value, color, suffix = "%" }: MetricRowProps) {
  const displayVal = suffix === "" ? value.toFixed(3) : `${value}%`;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value * (suffix === "" ? 100 : 1), 100)}%`, background: color }}
        />
      </div>
      <span className="text-sm font-semibold text-foreground w-14 text-right">{displayVal}</span>
    </div>
  );
}
