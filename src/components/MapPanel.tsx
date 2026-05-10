import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

interface MapPanelProps {
  center: { lat: number; lng: number };
  zoom?: number;
}

const StreetView = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  const streetViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map || !streetViewRef.current) return;

    const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
      position: center,
      pov: { heading: 165, pitch: 0 },
      zoom: 1,
    });

    map.setStreetView(panorama);
  }, [map, center]);

  return <div ref={streetViewRef} className="w-full h-full rounded-lg overflow-hidden border border-zinc-800" />;
};

export const MapPanel: React.FC<MapPanelProps> = ({ center, zoom = 15 }) => {
  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";

  if (!API_KEY) return (
    <div className="flex items-center justify-center h-full bg-zinc-900 text-zinc-400 p-8 text-center border border-zinc-800 rounded-lg">
      <div className="space-y-4">
        <p className="text-lg font-medium text-white">Google Maps API Key Missing</p>
        <p className="text-sm">Please add GOOGLE_MAPS_PLATFORM_KEY to your secrets to enable mapping and street view.</p>
      </div>
    </div>
  );

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex flex-col h-full gap-4">
        <div className="h-1/2 min-h-[300px]">
          <Map
            defaultCenter={center}
            center={center}
            defaultZoom={zoom}
            mapId="GEO_FORENSICS_MAP"
            className="w-full h-full rounded-lg border border-zinc-800"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <AdvancedMarker position={center} />
          </Map>
        </div>
        <div className="h-1/2 min-h-[300px]">
          <StreetView center={center} />
        </div>
      </div>
    </APIProvider>
  );
};
