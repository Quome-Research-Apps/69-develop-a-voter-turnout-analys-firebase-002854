"use client";

import { useEffect, useState, useRef } from 'react';
import { Map, useMap, useAdvancedMarker } from '@vis.gl/react-google-maps';
import type { PrecinctData } from '@/lib/types';

interface ChoroplethMapProps {
  data: PrecinctData[];
}

const InfoWindow = ({ precinct }: { precinct: PrecinctData | null }) => {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement>(null);
  const infoWindow = useAdvancedMarker(markerRef);

  useEffect(() => {
    if (!precinct) return;
    
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-2 font-sans">
        <h3 class="font-bold text-base text-primary">${precinct.precinct_id}</h3>
        <p class="text-sm text-foreground">Turnout: <span class="font-semibold">${(precinct.turnout * 100).toFixed(2)}%</span></p>
        <p class="text-xs text-muted-foreground">Registered: ${precinct.total_registered_voters.toLocaleString()}</p>
        <p class="text-xs text-muted-foreground">Votes Cast: ${precinct.votes_cast.toLocaleString()}</p>
      </div>
    `;
    
    infoWindow.content = content;
    const geo = precinct.geojson_boundary.geometry;
    if (geo.type === 'Polygon') {
      const coords = geo.coordinates[0];
      const bounds = new google.maps.LatLngBounds();
      coords.forEach(p => bounds.extend({ lat: p[1], lng: p[0] }));
      infoWindow.position = bounds.getCenter();
    }
    
    infoWindow.open(useMap()!);

  }, [precinct, infoWindow]);

  return <div ref={markerRef as any} />;
};

export function ChoroplethMap({ data }: ChoroplethMapProps) {
  const map = useMap();
  const [hoveredPrecinct, setHoveredPrecinct] = useState<PrecinctData | null>(null);
  const dataLayerRef = useRef<google.maps.Data | null>(null);

  const getTurnoutColor = (turnout: number) => {
    const percentage = turnout * 100;
    if (percentage > 80) return '#3F51B5'; // Deep Blue
    if (percentage > 70) return '#5C6BC0';
    if (percentage > 60) return '#7986CB';
    if (percentage > 50) return '#9FA8DA';
    if (percentage > 40) return '#C5CAE9';
    if (percentage > 30) return '#E8EAF6';
    return '#FFEB3B'; // Fallback color, a light yellow
  };

  useEffect(() => {
    if (!map) return;

    if (!dataLayerRef.current) {
        dataLayerRef.current = new google.maps.Data({ map });
    }
    const dataLayer = dataLayerRef.current;

    // Clear previous data
    dataLayer.forEach(feature => dataLayer.remove(feature));

    if (data.length === 0) return;

    const features = data.map(d => ({
        ...d.geojson_boundary,
        id: d.precinct_id,
        properties: { ...d.geojson_boundary.properties, ...d }
    }));
    
    dataLayer.addGeoJson({ type: "FeatureCollection", features });

    dataLayer.setStyle(feature => {
      const turnout = feature.getProperty('turnout') || 0;
      const color = getTurnoutColor(turnout);
      return {
        fillColor: color,
        strokeColor: '#3F51B5',
        strokeWeight: 1,
        fillOpacity: 0.75,
        zIndex: 1
      };
    });

    const mouseoverListener = dataLayer.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
        const precinct = event.feature.getProperty('precinct_id');
        const precinctData = data.find(d => d.precinct_id === precinct);
        if (precinctData) setHoveredPrecinct(precinctData);
        dataLayer.overrideStyle(event.feature, { strokeWeight: 3, zIndex: 2 });
    });

    const mouseoutListener = dataLayer.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
        setHoveredPrecinct(null);
        dataLayer.revertStyle();
    });
    
    const overallBounds = new google.maps.LatLngBounds();
    dataLayer.forEach(feature => {
        feature.getGeometry()?.forEachLatLng(latlng => overallBounds.extend(latlng));
    });
    
    if (!overallBounds.isEmpty()) {
        map.fitBounds(overallBounds, 100);
    }

    return () => {
      google.maps.event.removeListener(mouseoverListener);
      google.maps.event.removeListener(mouseoutListener);
    };

  }, [map, data]);


  return (
    <div className="w-full h-full relative">
      <Map
        defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
        defaultZoom={10}
        mapId="a3b3b3b3b3b3b3b3"
        disableDefaultUI={true}
        gestureHandling={'cooperative'}
        className="w-full h-full rounded-lg"
      />
      {hoveredPrecinct && <InfoWindow precinct={hoveredPrecinct} />}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md">
        <h4 className="text-xs font-bold mb-1">Turnout %</h4>
        <div className="flex flex-col gap-1">
          {['> 80', '70-80', '60-70', '50-60', '40-50', '30-40'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getTurnoutColor((85 - i * 10)/100) }}></div>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
