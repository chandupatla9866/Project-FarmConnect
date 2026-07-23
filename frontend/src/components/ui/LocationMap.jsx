import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPinOff } from "lucide-react";
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
function Placeholder({
  height,
  children
}) {
  return <div style={{
    height
  }} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/50">
      {children}
    </div>;
}
export function LocationMap({
  markers,
  height = 260,
  zoom = 12
}) {
  const {
    isLoaded,
    loadError
  } = useJsApiLoader({
    id: "farmconnect-google-maps",
    googleMapsApiKey: MAPS_API_KEY
  });
  if (!MAPS_API_KEY) {
    return <Placeholder height={height}>
        <MapPinOff className="h-4 w-4" /> Map unavailable
      </Placeholder>;
  }
  if (loadError) {
    return <Placeholder height={height}>Failed to load map</Placeholder>;
  }
  if (!isLoaded) {
    return <Placeholder height={height}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Placeholder>;
  }
  if (markers.length === 0) {
    return <Placeholder height={height}>No location set yet</Placeholder>;
  }
  const center = {
    lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
    lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
  };
  return <div style={{
    height
  }} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <GoogleMap mapContainerStyle={{
      width: "100%",
      height: "100%"
    }} center={center} zoom={zoom} options={{
      disableDefaultUI: true,
      zoomControl: true
    }}>
        {markers.map((m, i) => <MarkerF key={i} position={{
        lat: m.lat,
        lng: m.lng
      }} label={m.label} title={m.title ?? m.label} />)}
      </GoogleMap>
    </div>;
}