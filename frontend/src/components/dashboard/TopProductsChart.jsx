import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
const BRAND_HEX = "#16a34a";
const BRAND_HEX_MUTED = "#86efac";
export function TopProductsChart({
  data
}) {
  const chartData = data.map(d => ({
    name: d.productName,
    revenue: d.totalRevenue
  }));
  return <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{
        top: 4,
        right: 24,
        left: 0,
        bottom: 0
      }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={110} tick={{
          fill: "#898781",
          fontSize: 12
        }} />
          <Tooltip cursor={{
          fill: "rgba(22,163,74,0.06)"
        }} contentStyle={{
          borderRadius: 12,
          border: "1px solid rgba(148,163,184,0.25)",
          fontSize: 12,
          boxShadow: "0 8px 24px rgba(15,23,42,0.12)"
        }} formatter={value => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {chartData.map((_, index) => <Cell key={index} fill={index === 0 ? BRAND_HEX : BRAND_HEX_MUTED} />)}
            <LabelList dataKey="revenue" position="right" formatter={value => `₹${value.toLocaleString("en-IN")}`} style={{
            fill: "#52514e",
            fontSize: 11,
            fontWeight: 600
          }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>;
}