import type { Feature, Geometry } from 'geojson';

export interface PrecinctData {
  precinct_id: string;
  total_registered_voters: number;
  votes_cast: number;
  turnout: number;
  geojson_boundary: Feature<Geometry>;
  [key: string]: any;
}

export interface FilterOptions {
  [key:string]: string[];
}
