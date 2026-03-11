import * as React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { cn } from "@/lib/utils";

interface ReadabilityGaugeProps {
  score: number;
  className?: string;
}

export function ReadabilityGauge({ score, className }: ReadabilityGaugeProps) {
  const data = [
    {
      name: "score",
      value: score,
      fill: "url(#gradient)",
    },
  ];

  return (
    <div className={cn("flex justify-center w-full", className)}>
      <div className="w-[700px] h-[400px]">
        <RadialBarChart
          width={700}
          height={400}
          innerRadius="65%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
          barSize={35}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={30}
            fill="url(#gradient)"
            className="fill-muted stroke-none"
          />
          <text
            x={350}
            y={160}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-lg font-bold"
          >
            {score}
          </text>
          <text
            x={350}
            y={190}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs"
          >
            Readability Score
          </text>
        </RadialBarChart>
      </div>
    </div>
  );
}
