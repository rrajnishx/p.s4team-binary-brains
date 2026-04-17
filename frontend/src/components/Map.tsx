import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  lat: number;
  lng: number;
  area: number;
}

export default function MapComponent({ lat, lng, area }: MapProps) {
  const radius = Math.sqrt((area * 10000) / Math.PI);

  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={15} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem', background: '#0a0f0d' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <div className="font-body text-sm font-semibold text-[#111a14]">Analysis Zone</div>
          <div className="font-data text-xs text-gray-500">{lat.toFixed(4)}, {lng.toFixed(4)}</div>
        </Popup>
      </Marker>
      <Circle 
        center={[lat, lng]} 
        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.2, weight: 2 }} 
        radius={radius} 
      />
    </MapContainer>
  );
}
