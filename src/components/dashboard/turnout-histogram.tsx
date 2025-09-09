"use client"

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { PrecinctData } from '@/lib/types';

interface TurnoutHistogramProps {
  data: PrecinctData[];
}

export function TurnoutHistogram({ data }: TurnoutHistogramProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const bins = Array.from({ length: 10 }, (_, i) => ({
      name: `${i * 10}-${(i + 1) * 10}%`,
      count: 0,
    }));

    data.forEach(precinct => {
      const turnoutPercent = precinct.turnout * 100;
      const binIndex = Math.floor(turnoutPercent / 10);
      if (binIndex >= 0 && binIndex < 10) {
        bins[binIndex].count++;
      } else if (turnoutPercent === 100) {
        bins[9].count++;
      }
    });

    return bins;
  }, [data]);

  if (chartData.length === 0) {
    return (
        <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
            No data to display.
        </div>
    );
  }

  const chartConfig = {
    count: {
      label: 'Precincts',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent labelKey="name" />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
