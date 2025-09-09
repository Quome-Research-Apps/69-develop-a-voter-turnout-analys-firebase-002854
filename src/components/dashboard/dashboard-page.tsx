"use client";

import { useState, useMemo, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import type { ChangeEvent } from 'react';
import type { PrecinctData, FilterOptions } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLogo } from '@/components/icons';
import { ChoroplethMap } from './choropleth-map';
import { TurnoutHistogram } from './turnout-histogram';
import { PrecinctsBarChart } from './precincts-bar-chart';
import { AiInsights } from './ai-insights';
import { Filters } from './filters';
import { UploadCloud, RefreshCw } from 'lucide-react';

// Expected CSV columns: precinct_id, total_registered_voters, votes_cast, geojson_boundary, [optional_filter_columns...]

export function DashboardPage() {
  const [data, setData] = useState<PrecinctData[]>([]);
  const [csvString, setCsvString] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileParse = (file: File) => {
    setLoading(true);
    setError(null);
    setData([]);
    setCsvString('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      setCsvString(csv);

      Papa.parse<any>(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            setError('Failed to parse CSV. Please check the file format.');
            toast({
              variant: "destructive",
              title: "Parsing Error",
              description: results.errors.map(err => err.message).join('\n'),
            });
            setLoading(false);
            return;
          }

          const requiredColumns = ['precinct_id', 'total_registered_voters', 'votes_cast', 'geojson_boundary'];
          const headers = results.meta.fields || [];
          if (!requiredColumns.every(col => headers.includes(col))) {
            setError(`CSV must contain the following columns: ${requiredColumns.join(', ')}`);
            setLoading(false);
            return;
          }
          
          try {
            const parsedData: PrecinctData[] = results.data.map(row => {
              const total_registered_voters = parseInt(row.total_registered_voters, 10);
              const votes_cast = parseInt(row.votes_cast, 10);
              const turnout = total_registered_voters > 0 ? (votes_cast / total_registered_voters) : 0;
              const geojson_boundary = JSON.parse(row.geojson_boundary);
              
              if (isNaN(total_registered_voters) || isNaN(votes_cast)) {
                throw new Error(`Invalid number format in row with precinct_id: ${row.precinct_id}`);
              }

              return { ...row, total_registered_voters, votes_cast, turnout, geojson_boundary };
            });

            const potentialFilterKeys = headers.filter(h => !requiredColumns.includes(h) && h.trim() !== '');
            const newFilterOptions: FilterOptions = {};
            potentialFilterKeys.forEach(key => {
              const uniqueValues = Array.from(new Set(parsedData.map(d => d[key]))).filter(Boolean) as string[];
              if (uniqueValues.length > 1 && uniqueValues.length < parsedData.length * 0.5) {
                newFilterOptions[key] = ['All', ...uniqueValues.sort()];
              }
            });

            setFilterOptions(newFilterOptions);
            setData(parsedData);

          } catch (e: any) {
            setError(`Error processing data: ${e.message}. Make sure geojson_boundary is valid JSON and numbers are formatted correctly.`);
            toast({
              variant: "destructive",
              title: "Data Processing Error",
              description: `Error processing data: ${e.message}`,
            });
          } finally {
            setLoading(false);
          }
        },
        error: (err) => {
          setError(err.message);
          setLoading(false);
        }
      });
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a valid CSV file.',
        });
        return;
      }
      handleFileParse(file);
    }
  };

  const handleReset = () => {
    setData([]);
    setCsvString('');
    setFilterOptions({});
    setActiveFilters({});
    setError(null);
    setLoading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const filteredData = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) return data;
    return data.filter(d => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value || value === 'All') return true;
        return String(d[key]) === value;
      });
    });
  }, [data, activeFilters]);

  if (data.length === 0 && !loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-lg text-center shadow-2xl">
          <CardHeader>
            <div className="mx-auto mb-4 flex items-center justify-center space-x-3">
              <AppLogo className="h-10 w-10 text-primary" />
              <CardTitle className="text-4xl font-headline font-bold">Turnout Vision</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Analyze precinct-level election results with interactive visualizations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 hover:border-primary hover:bg-accent/10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-12 w-12 text-gray-400" />
              <p className="mt-2 font-semibold text-primary">Click to upload a CSV file</p>
              <p className="text-xs text-muted-foreground">or drag and drop</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <p className="mt-6 text-xs text-muted-foreground">
              All data is processed on your device and is discarded on page reload.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <AppLogo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold font-headline">Turnout Vision</h1>
        </div>
        <div className="ml-auto">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Upload New File
          </Button>
        </div>
      </header>

      {loading && <Progress value={100} className="w-full h-1 animate-pulse" />}
      
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8">
            <Card className="h-[650px] shadow-lg">
              <ChoroplethMap data={filteredData} />
            </Card>
          </div>
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
            {Object.keys(filterOptions).length > 0 && (
                <Filters 
                    options={filterOptions} 
                    activeFilters={activeFilters} 
                    onFilterChange={setActiveFilters} 
                />
            )}
            <AiInsights csvData={csvString} />
          </div>

          <div className="col-span-12 lg:col-span-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Turnout Distribution</CardTitle>
                    <CardDescription>Number of precincts by turnout percentage bracket.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TurnoutHistogram data={filteredData} />
                </CardContent>
            </Card>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Turnout Extremes</CardTitle>
                    <CardDescription>Top 5 and bottom 5 precincts by voter turnout.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PrecinctsBarChart data={filteredData} />
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
