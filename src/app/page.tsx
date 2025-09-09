import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="rounded-lg border bg-card p-8 text-center text-card-foreground">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="mt-2 text-muted-foreground">
            Google Maps API key is missing.
          </p>
          <p className="mt-4 text-sm">
            Please add <code className="rounded bg-muted px-1 py-0.5 font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <DashboardPage />
    </APIProvider>
  );
}
