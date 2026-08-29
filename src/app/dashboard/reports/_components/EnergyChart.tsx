"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Range } from "./ReportFilters";

interface SeriesPoint {
  timestamp: string;
  energy: number;
}

interface EnergyChartProps {
  series: SeriesPoint[];
  range: Range;
}

function formatTick(timestamp: string, range: Range) {
  const date = new Date(timestamp);
  if (range === "24h") {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "7d") {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function EnergyChart({ series, range }: EnergyChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Energia consumida por período
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => formatTick(v, range)}
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} unit="kWh" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                color: "#e2e8f0",
              }}
              labelFormatter={(v) => formatTick(String(v), range)}
              formatter={(value) => [`${Number(value).toFixed(3)} kWh`, "Energia"]}
            />
            <Bar dataKey="energy" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
