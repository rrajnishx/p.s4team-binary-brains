import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  setLat?: (lat: number) => void;
  setLng?: (lng: number) => void;
}

const MapClickHandler = ({ setLat, setLng }: { setLat?: (lat: number) => void, setLng?: (lng: number) => void }) => {
  useMapEvents({
    click(e) {
      if (setLat && setLng) {
        setLat(parseFloat(e.latlng.lat.toFixed(4)));
        setLng(parseFloat(e.latlng.lng.toFixed(4)));
      }
    }
  });
  return null;
};

export default function MapComponent({ lat, lng, area, setLat, setLng }: MapProps) {
  const radius = area ? Math.sqrt((area * 10000) / Math.PI) : 500;

  const customIcon = new L.DivIcon({
    className: 'custom-glow-marker',
    html: `<div style="width: 20px; height: 20px; background-color: #22c55e; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 15px 5px rgba(34, 197, 94, 0.6);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-[#1f2d22] shadow-lg relative z-0">
      <MapContainer 
        center={[lat, lng]} 
        zoom={15} 
        style={{ height: '100%', width: '100%', background: '#0a0f0d' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        {setLat && setLng && <MapClickHandler setLat={setLat} setLng={setLng} />}
        {lat && lng && (
          <Marker position={[lat, lng]} icon={customIcon}>
            <Popup>
              <div className="font-body text-sm font-semibold text-[#111a14]">Selected Farm Location</div>
              <div className="font-data text-xs text-gray-500">{lat.toFixed(4)}, {lng.toFixed(4)}</div>
            </Popup>
          </Marker>
        )}
        {lat && lng && (
          <Circle 
            center={[lat, lng]} 
            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.2, weight: 2 }} 
            radius={radius > 0 ? radius : 500} 
          />
        )}
      </MapContainer>
      <style jsx global>{`
        .leaflet-container {
          filter: brightness(0.8) contrast(1.2);
        }
      `}</style>
    </div>
  );
}
