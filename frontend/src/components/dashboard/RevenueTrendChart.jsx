import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/context/ThemeContext";
const BRAND_HEX = "#16a34a";
export function RevenueTrendChart({
  data
}) {
  const {
    theme
  } = useTheme();
  const gridColor = theme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const axisColor = "#898781";
  return <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{
        top: 8,
        right: 8,
        left: -12,
        bottom: 0
      }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_HEX} stopOpacity={0.22} />
              <stop offset="100%" stopColor={BRAND_HEX} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{
          fill: axisColor,
          fontSize: 12
        }} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{
          fill: axisColor,
          fontSize: 12
        }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)} />
          <Tooltip cursor={{
          stroke: gridColor,
          strokeWidth: 1
        }} contentStyle={{
          borderRadius: 12,
          border: "1px solid rgba(148,163,184,0.25)",
          fontSize: 12,
          boxShadow: "0 8px 24px rgba(15,23,42,0.12)"
        }} formatter={value => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke={BRAND_HEX} strokeWidth={2} fill="url(#revenueFill)" activeDot={{
          r: 4,
          strokeWidth: 2,
          stroke: "#fff"
        }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>;
}