"use client";

import type { FilterOptions } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FiltersProps {
  options: FilterOptions;
  activeFilters: Record<string, string>;
  onFilterChange: (filters: Record<string, string>) => void;
}

export function Filters({ options, activeFilters, onFilterChange }: FiltersProps) {
  const handleFilterChange = (filterKey: string, value: string) => {
    onFilterChange({
      ...activeFilters,
      [filterKey]: value,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Data Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(options).map(([key, values]) => (
          <div key={key} className="grid w-full items-center gap-1.5">
            <Label htmlFor={`filter-${key}`} className="capitalize">
              {key.replace(/_/g, ' ')}
            </Label>
            <Select
              value={activeFilters[key] || 'All'}
              onValueChange={(value) => handleFilterChange(key, value)}
            >
              <SelectTrigger id={`filter-${key}`}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {values.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
