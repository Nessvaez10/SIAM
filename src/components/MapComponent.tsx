import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MunicipalitySummary, Incident, SemaforoLevel } from '../types';
import { normalizeMunicipalityName } from '../utils/semaforoLogic';
import { 
  Layers, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  Info, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface MapComponentProps {
  municipalities: MunicipalitySummary[];
  incidents: Incident[];
  selectedMunicipality: MunicipalitySummary | null;
  onSelectMunicipality: (municipality: MunicipalitySummary) => void;
  onOpenCriteria: () => void;
}

const SEMAFORO_COLORS: Record<SemaforoLevel, { fill: string; stroke: string; label: string; text: string }> = {
  rojo: { fill: '#dc2626', stroke: '#991b1b', label: 'Crítico', text: 'text-red-700 bg-red-50 border-red-200' },
  naranja: { fill: '#ea580c', stroke: '#c2410c', label: 'Alto', text: 'text-orange-700 bg-orange-50 border-orange-200' },
  amarillo: { fill: '#eab308', stroke: '#ca8a04', label: 'Moderado', text: 'text-amber-700 bg-amber-50 border-amber-200' },
  verde: { fill: '#16a34a', stroke: '#15803d', label: 'Sin afectaciones activas', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  gris: { fill: '#94a3b8', stroke: '#64748b', label: 'Información no reportada', text: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const MapComponent: React.FC<MapComponentProps> = ({
  municipalities,
  incidents,
  selectedMunicipality,
  onSelectMunicipality,
  onOpenCriteria,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  
  const [geoData, setGeoData] = useState<any>(null);
  const [loadingGeo, setLoadingGeo] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical_high' | 'with_incidents'>('all');
  const [showCriticalMarkers, setShowCriticalMarkers] = useState<boolean>(true);
  const [activeBasemap, setActiveBasemap] = useState<'blanco' | 'satellite' | 'osm' | 'google'>('blanco');

  // Map of normalized name to summary
  const summaryByNormalizedName = useMemo(() => {
    const map = new Map<string, MunicipalitySummary>();
    municipalities.forEach(m => {
      map.set(normalizeMunicipalityName(m.nombre), m);
      map.set(normalizeMunicipalityName(m.nombreOficial), m);
    });
    return map;
  }, [municipalities]);

  // Load GeoJSON once
  useEffect(() => {
    setLoadingGeo(true);
    fetch('/data/hidalgo_municipios.geojson')
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el archivo GeoJSON");
        return res.json();
      })
      .then(data => {
        setGeoData(data);
        setLoadingGeo(false);
      })
      .catch(err => {
        console.error("Error al cargar GeoJSON:", err);
        setLoadingGeo(false);
      });
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Hidalgo (20.52° N, -98.85° W)
    const map = L.map(mapContainerRef.current, {
      center: [20.52, -98.85],
      zoom: 8.4,
      zoomSnap: 0.2,
      minZoom: 7,
      maxZoom: 16,
    });

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch basemap tile layer (No CARTO watermark or API key issues)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
      currentTileLayerRef.current = null;
    }

    if (activeBasemap === 'google') {
      // Crisp Google Maps standard road and terrain map
      const layer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20
      }).addTo(map);
      currentTileLayerRef.current = layer;
    } else if (activeBasemap === 'satellite') {
      // High-resolution Google Hybrid Satellite imagery with place names
      const layer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20
      }).addTo(map);
      currentTileLayerRef.current = layer;
    } else if (activeBasemap === 'osm') {
      // OpenStreetMap community cartography
      const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      currentTileLayerRef.current = layer;
    } else if (activeBasemap === 'blanco') {
      // Clean, distraction-free neutral white background mode:
      // Focuses 100% on the 84 municipalities thematic polygons without noisy tiles
      currentTileLayerRef.current = null;
    }

    // Ensure GeoJSON and markers are re-placed on top
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.bringToFront();
    }
    if (markersLayerRef.current) {
      markersLayerRef.current.addTo(map);
    }
  }, [activeBasemap]);

  // Update GeoJSON layer styles and interactivity
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const geoLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const rawName = feature?.properties?.NAME_2 || feature?.properties?.NOMGEO || feature?.properties?.nombre || "";
        const norm = normalizeMunicipalityName(rawName);
        const mun = summaryByNormalizedName.get(norm);
        const sem = mun ? mun.semaforo : 'gris';
        const colors = SEMAFORO_COLORS[sem] || SEMAFORO_COLORS.gris;

        // Apply filter
        let isDimmed = false;
        if (activeFilter === 'critical_high' && sem !== 'rojo' && sem !== 'naranja') {
          isDimmed = true;
        } else if (activeFilter === 'with_incidents' && (!mun || mun.totalIncidentes === 0)) {
          isDimmed = true;
        }

        const isSelected = selectedMunicipality && normalizeMunicipalityName(selectedMunicipality.nombre) === norm;
        const isBlanco = activeBasemap === 'blanco';

        return {
          fillColor: colors.fill,
          weight: isSelected ? 3.5 : isDimmed ? 0.75 : (isBlanco ? 1.8 : 1.5),
          opacity: isDimmed ? 0.25 : 0.95,
          color: isSelected ? '#1e1b4b' : (isBlanco ? (sem === 'gris' ? '#cbd5e1' : '#334155') : colors.stroke),
          fillOpacity: isDimmed ? 0.08 : isSelected ? 0.85 : (sem === 'gris' ? (isBlanco ? 0.12 : 0.25) : (isBlanco ? 0.75 : 0.65)),
          dashArray: isSelected ? '4, 4' : undefined,
        };
      },
      onEachFeature: (feature, layer) => {
        const rawName = feature?.properties?.NAME_2 || feature?.properties?.NOMGEO || "";
        const norm = normalizeMunicipalityName(rawName);
        const mun = summaryByNormalizedName.get(norm);
        const sem = mun ? mun.semaforo : 'gris';
        const colorInfo = SEMAFORO_COLORS[sem];

        // Custom Tooltip
        const tooltipHtml = `
          <div class="p-2 text-xs font-sans max-w-xs">
            <div class="flex items-center justify-between gap-2 border-b pb-1 mb-1">
              <strong class="text-sm font-bold text-slate-800">${mun?.nombre || rawName}</strong>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${colorInfo.text}">
                ${colorInfo.label}
              </span>
            </div>
            <p class="text-[11px] text-slate-600 mb-1">
              <strong>Región:</strong> ${mun?.regionPC || 'Estado de Hidalgo'}
            </p>
            ${mun && mun.totalIncidentes > 0 ? `
              <div class="grid grid-cols-2 gap-1 py-1 bg-slate-50 rounded px-1.5 border border-slate-100 text-[11px] mb-1">
                <span class="text-red-700 font-semibold">● Activas: ${mun.activos}</span>
                <span class="text-emerald-700 font-semibold">✓ Atendidas: ${mun.atendidos}</span>
              </div>
              ${mun.comunidadesIncomunicadas.length > 0 ? `
                <div class="text-[10px] text-red-600 font-bold bg-red-50 p-1 rounded border border-red-200 mb-1">
                  ⚠️ Incomunicación: ${mun.comunidadesIncomunicadas.slice(0, 2).join(', ')}${mun.comunidadesIncomunicadas.length > 2 ? ` (+${mun.comunidadesIncomunicadas.length - 2})` : ''}
                </div>
              ` : ''}
              <p class="text-[10px] text-slate-500 italic line-clamp-2">
                ${mun.motivoSemaforo}
              </p>
            ` : `
              <p class="text-[11px] text-slate-500">Sin registros de afectación en este corte oficial.</p>
            `}
            <div class="mt-1 pt-1 border-t text-[10px] text-blue-700 font-semibold flex items-center justify-between">
              <span>Haga clic para ver detalle oficial</span>
              <span>→</span>
            </div>
          </div>
        `;

        layer.bindTooltip(tooltipHtml, {
          sticky: true,
          className: 'shadow-lg border border-slate-200 rounded-lg backdrop-blur-sm bg-white/95',
          opacity: 1
        });

        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              color: '#4338ca',
              fillOpacity: 0.85
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          },
          click: () => {
            if (mun) {
              onSelectMunicipality(mun);
            }
          }
        });
      }
    }).addTo(map);

    geojsonLayerRef.current = geoLayer;
  }, [geoData, summaryByNormalizedName, selectedMunicipality, activeFilter, onSelectMunicipality, activeBasemap]);

  // Update critical incident markers (Potholes, bridges, shelters, fatal events)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (!showCriticalMarkers) return;

    // Filter key landmark events from incidents
    const notableIncidents = incidents.filter(i => 
      i.tipoAfectacion === 'socavon' || 
      i.tipoAfectacion === 'persona_sin_signos' ||
      i.tipoAfectacion === 'refugios_temporales' ||
      i.afectacionDetalle.toLowerCase().includes("puente garces") ||
      i.afectacionDetalle.toLowerCase().includes("petlapixca") ||
      i.afectacionDetalle.toLowerCase().includes("planta tratadora") ||
      i.estatusOficial.includes("COMUNIDAD INCOMUNICADA")
    );

    notableIncidents.forEach(inc => {
      const munNorm = normalizeMunicipalityName(inc.municipio);
      const mun = summaryByNormalizedName.get(munNorm);
      if (!mun) return;

      // Small jitter so multiple markers in same municipality don't completely overlap
      const jitterLat = (Math.random() - 0.5) * 0.04;
      const jitterLng = (Math.random() - 0.5) * 0.04;
      const pos: [number, number] = [mun.lat + jitterLat, mun.lng + jitterLng];

      let iconColor = 'bg-rose-600 text-white';
      let iconSymbol = '!';

      if (inc.tipoAfectacion === 'socavon') {
        iconColor = 'bg-amber-600 text-white';
        iconSymbol = '▼';
      } else if (inc.tipoAfectacion === 'refugios_temporales') {
        iconColor = 'bg-blue-600 text-white';
        iconSymbol = '⌂';
      } else if (inc.tipoAfectacion === 'persona_sin_signos') {
        iconColor = 'bg-slate-900 text-white';
        iconSymbol = '✝';
      }

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white ${iconColor} transform hover:scale-125 transition-transform cursor-pointer">
            ${iconSymbol}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(pos, { icon: customIcon });
      marker.bindPopup(`
        <div class="text-xs p-1 max-w-xs">
          <div class="font-bold text-slate-800 text-sm border-b pb-1 mb-1">${inc.municipio} • ${inc.comunidadPunto}</div>
          <div class="text-[11px] font-semibold text-rose-700 mb-1">${inc.estatusOficial}</div>
          <div class="text-slate-600 mb-1">${inc.afectacionDetalle}</div>
          <div class="text-[10px] text-slate-400 mt-1 pt-1 border-t">Pág. ${inc.paginaDocumento} | Ref: ${inc.referenciaSIPDUS || inc.fechaReporte}</div>
        </div>
      `);
      markersLayer.addLayer(marker);
    });
  }, [incidents, showCriticalMarkers, summaryByNormalizedName]);

  // Center on selected municipality when it changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMunicipality) return;

    map.flyTo([selectedMunicipality.lat, selectedMunicipality.lng], 11, {
      duration: 1.2
    });
  }, [selectedMunicipality]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([20.52, -98.85], 8.4, { duration: 1 });
    }
  };

  // Filtered municipality list for search box
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return municipalities.filter(m => 
      m.nombre.toLowerCase().includes(term) ||
      m.nombreOficial.toLowerCase().includes(term) ||
      m.regionPC.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [searchTerm, municipalities]);

  return (
    <div className={`relative w-full h-[calc(100vh-145px)] min-h-[580px] ${activeBasemap === 'blanco' ? 'bg-white' : 'bg-slate-100'} overflow-hidden flex flex-col`}>
      {/* Top Map Floating Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search bar */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-300/80 p-1 flex items-center relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          <input
            type="text"
            placeholder="Buscar entre los 84 municipios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs py-1.5 px-1 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
            >
              ×
            </button>
          )}

          {/* Autocomplete dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-[1010]">
              {searchResults.map(item => {
                const colorInfo = SEMAFORO_COLORS[item.semaforo];
                return (
                  <button
                    key={item.cve_mun}
                    onClick={() => {
                      onSelectMunicipality(item);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 border-b border-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{item.nombre}</span>
                      <span className="text-[10px] text-slate-400 block">{item.regionPC}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colorInfo.text}`}>
                      {colorInfo.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters and View Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-lg shadow-lg border border-slate-300/80 text-xs font-medium">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1.5 rounded transition-all cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-[#691C32] text-white shadow-xs font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos (84)
          </button>
          <button
            onClick={() => setActiveFilter('critical_high')}
            className={`px-2.5 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'critical_high' 
                ? 'bg-rose-600 text-white shadow-xs font-semibold' 
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Crítico y Alto
          </button>
          <button
            onClick={() => setActiveFilter('with_incidents')}
            className={`px-2.5 py-1.5 rounded transition-all cursor-pointer ${
              activeFilter === 'with_incidents' 
                ? 'bg-amber-600 text-white shadow-xs font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Con Incidentes
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1"></div>

          <button
            onClick={handleResetView}
            title="Restablecer vista a Hidalgo"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {loadingGeo && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-[1000]">
          <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 flex items-center gap-3 text-slate-700 font-medium text-xs">
            <div className="w-5 h-5 border-2 border-[#691C32] border-t-transparent rounded-full animate-spin"></div>
            Cargando cartografía oficial INEGI de los 84 municipios de Hidalgo...
          </div>
        </div>
      )}

      {/* Bottom Floating Legend and Layers Panel */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-300/80 max-w-xs text-xs font-sans">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#691C32]"></span>
              Semáforo Oficial de Afectaciones
            </span>
            <button 
              onClick={onOpenCriteria}
              className="text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
            >
              <Info className="w-3 h-3" />
              <span>Ver Criterios</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-red-600 border border-red-800 shrink-0"></span>
                <span className="font-semibold text-slate-700">Rojo (Crítico)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {municipalities.filter(m => m.semaforo === 'rojo').length} mun.
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-500 border border-orange-700 shrink-0"></span>
                <span className="font-semibold text-slate-700">Naranja (Alto)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {municipalities.filter(m => m.semaforo === 'naranja').length} mun.
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-yellow-500 border border-yellow-700 shrink-0"></span>
                <span className="font-semibold text-slate-700">Amarillo (Moderado)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {municipalities.filter(m => m.semaforo === 'amarillo').length} mun.
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-800 shrink-0"></span>
                <span className="font-semibold text-slate-700">Verde (Sin afectación activa)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {municipalities.filter(m => m.semaforo === 'verde').length} mun.
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-400 border border-slate-600 shrink-0"></span>
                <span className="font-semibold text-slate-700">Gris (Información no reportada)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {municipalities.filter(m => m.semaforo === 'gris').length} mun.
              </span>
            </div>
          </div>

          {/* Quick markers toggle */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCriticalMarkers}
                onChange={(e) => setShowCriticalMarkers(e.target.checked)}
                className="rounded text-[#691C32] focus:ring-[#691C32]"
              />
              <span>Mostrar marcadores críticos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Basemap switcher on bottom right */}
      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-1.5 shadow-xl border border-slate-300/80 flex items-center gap-1 text-xs font-medium">
        <span className="text-[10px] text-slate-500 font-bold px-1.5 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-[#691C32]" />
          <span>Fondo:</span>
        </span>
        <button
          onClick={() => setActiveBasemap('blanco')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeBasemap === 'blanco' 
              ? 'bg-[#691C32] text-white shadow-xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Fondo blanco temático y limpio sin elementos distractores"
        >
          Fondo Blanco
        </button>
        <button
          onClick={() => setActiveBasemap('satellite')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeBasemap === 'satellite' 
              ? 'bg-[#691C32] text-white shadow-xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Imágenes satelitales Google con carreteras"
        >
          Satélite
        </button>
        <button
          onClick={() => setActiveBasemap('osm')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeBasemap === 'osm' 
              ? 'bg-[#691C32] text-white shadow-xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Cartografía OpenStreetMap"
        >
          OSM
        </button>
        <button
          onClick={() => setActiveBasemap('google')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeBasemap === 'google' 
              ? 'bg-[#691C32] text-white shadow-xs' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Mapa oficial de Google Maps con carreteras y localidades"
        >
          Google Maps
        </button>
      </div>
    </div>
  );
};
