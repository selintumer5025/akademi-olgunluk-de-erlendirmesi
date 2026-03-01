"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DimensionScore } from "@/lib/scoring";

interface RadarResultsProps {
  dimensionScores: DimensionScore[];
}

export default function RadarResults({ dimensionScores }: RadarResultsProps) {
  const data = dimensionScores.map((ds) => ({
    subject: ds.name,
    value: ds.average,
    fullMark: 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 5]}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
        />
        <Radar
          name="Skor"
          dataKey="value"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value: number | string | undefined) => [`${value ?? ""}/5`, "Skor"] as [string, string]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
