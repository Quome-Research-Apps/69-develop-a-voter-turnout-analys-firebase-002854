"use client";

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { PrecinctData } from '@/lib/types';

interface PrecinctsBarChartProps {
  data: PrecinctData[];
}

export function PrecinctsBarChart({ data }: PrecinctsBarChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length < 1) return [];

    const sortedData = [...data].sort((a, b) => a.turnout - b.turnout);
    const bottom5 = sortedData.slice(0, 5).map(d => ({ ...d, turnoutPercent: d.turnout * 100, type: 'Bottom 5' }));
    const top5 = sortedData.slice(-5).reverse().map(d => ({ ...d, turnoutPercent: d.turnout * 100, type: 'Top 5' }));

    return [...top5, ...bottom5];
  }, [data]);

  if (chartData.length === 0) {
     return (
        <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
            Not enough data to display extremes.
        </div>
    );
  }

  const chartConfig = {
    turnoutPercent: {
      label: 'Turnout %',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="turnoutPercent" unit="%" hide />
            <YAxis
              dataKey="precinct_id"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="turnoutPercent" layout="vertical" radius={4}>
                <LabelList
                    dataKey="turnoutPercent"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
