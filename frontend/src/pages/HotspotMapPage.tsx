import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { api } from '../api/client';
import { HotspotArea } from '../types';
import { MapPin, Filter, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Minus, Info, RefreshCw } from 'lucide-react';

export const HotspotMapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [hotspots, setHotspots] = useState<HotspotArea[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotArea | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hotspots from FastAPI backend
  useEffect(() => {
    setIsLoading(true);
    api.getHotspots()
      .then((data) => {
        setHotspots(data);
        if (data.length > 0) {
          setSelectedHotspot(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load hotspots', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on India
      const map = L.map(mapContainerRef.current, {
        center: [22.9734, 78.6569],
        zoom: 5,
        minZoom: 4,
        maxZoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filter hotspots and update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    const filtered = hotspots.filter((h) => {
      const matchState = stateFilter === 'all' || h.state.toLowerCase() === stateFilter.toLowerCase();
      const matchCat = categoryFilter === 'all' || h.dominant_categories.some(c => c.toLowerCase().includes(categoryFilter.toLowerCase()));
      return matchState && matchCat;
    });

    filtered.forEach((h) => {
      let color = '#ea580c'; // High risk orange
      if (h.risk_index >= 85) color = '#dc2626'; // Very high red
      else if (h.risk_index < 75) color = '#d97706'; // Caution amber

      // Radius scaled by report volume (10 to 24px)
      const radius = Math.min(26, Math.max(12, Math.sqrt(h.report_count) * 2));

      const circle = L.circleMarker([h.latitude, h.longitude], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.65,
      });

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${h.district}, ${h.state}</h4>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            <strong>${h.report_count}</strong> reported incidents (${h.verified_count} verified)
          </div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">
            Risk Index: <strong style="color: ${color}">${h.risk_index} / 100</strong>
          </div>
          <div style="font-size: 10px; color: #0369a1; font-weight: 500;">
            ${h.dominant_categories[0] || 'Reported Scam Cluster'}
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      circle.on('click', () => {
        setSelectedHotspot(h);
      });

      if (markersRef.current) {
        circle.addTo(markersRef.current);
      }
    });
  }, [hotspots, categoryFilter, stateFilter]);

  const uniqueStates = Array.from(new Set(hotspots.map(h => h.state)));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <MapPin size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Reported Scam Activity & Hotspot Cluster Map
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Aggregate crowdsourced cyber fraud reporting clusters across Indian districts. Minimum 5 verified reports required for display.
            </p>
          </div>
        </div>

        {/* Responsible Terminology & Ethics Notice */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <Info size={16} className="text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block">Privacy & Objective Attribution Policy:</strong>
            <p className="leading-relaxed">
              This map visualizes <strong>reported scam activity patterns</strong>, not the criminality of residents. No victim addresses or exact device coordinates are ever stored or displayed. Data represents aggregate community submissions corroborated by moderation.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-surface-400" />
            <span className="font-semibold text-surface-700">Filter by State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-surface-50 border border-surface-300 rounded-lg text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All States ({uniqueStates.length})</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-surface-700">Scam Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-surface-50 border border-surface-300 rounded-lg text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Categories</option>
              <option value="KYC">Bank KYC Phishing</option>
              <option value="Arrest">Digital Arrest Threat</option>
              <option value="Electricity">Electricity Bill Disconnection</option>
              <option value="Task">Prepaid Tasks & Jobs</option>
              <option value="OLX">OLX Impersonation</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-surface-500 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>Very High Risk (Index ≥ 85)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High Risk (75–84)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Moderate / Caution (&lt; 75)</span>
          </div>
        </div>
      </div>

      {/* Map & Cluster Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm relative min-h-[500px] h-[580px]">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-2xs flex items-center justify-center gap-2 text-xs text-surface-600 font-semibold">
              <RefreshCw size={18} className="animate-spin text-brand-600" />
              <span>Loading geographic hotspot telemetry...</span>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Selected Cluster Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedHotspot ? (
            <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm space-y-4">
              <div className="pb-3 border-b border-surface-100 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 block">
                    Selected Reporting Area
                  </span>
                  <h3 className="text-lg font-bold text-surface-900 mt-0.5">
                    {selectedHotspot.district}
                  </h3>
                  <span className="text-xs text-surface-500">
                    State: {selectedHotspot.state}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                      selectedHotspot.risk_index >= 85
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    Index: {selectedHotspot.risk_index}
                  </span>
                </div>
              </div>

              {/* Volume Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                  <span className="text-surface-500 block text-[11px]">Total Reports</span>
                  <strong className="text-base text-surface-900 font-mono">
                    {selectedHotspot.report_count}
                  </strong>
                </div>

                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                  <span className="text-surface-500 block text-[11px]">Verified Cases</span>
                  <strong className="text-base text-emerald-700 font-mono">
                    {selectedHotspot.verified_count}
                  </strong>
                </div>
              </div>

              {/* Dominant Scam Categories */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-surface-700 block">
                  Dominant Modus Operandi Vectors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHotspot.dominant_categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-brand-50 text-brand-800 border border-brand-200 font-medium text-[11px]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trend & Status */}
              <div className="pt-3 border-t border-surface-100 space-y-2 text-xs text-surface-600">
                <div className="flex items-center justify-between">
                  <span>Reporting Trend:</span>
                  <span className="flex items-center gap-1 font-semibold text-surface-900 capitalize">
                    {selectedHotspot.trend === 'increasing' && <TrendingUp size={14} className="text-rose-600" />}
                    {selectedHotspot.trend === 'decreasing' && <TrendingDown size={14} className="text-emerald-600" />}
                    {selectedHotspot.trend === 'stable' && <Minus size={14} className="text-surface-400" />}
                    <span>{selectedHotspot.trend}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Evidence Integrity:</span>
                  <strong className="text-surface-800">{selectedHotspot.evidence_status}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 text-[11px] text-surface-500">
                Click any hotspot circle on the map to switch inspection areas.
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-xl border border-surface-200 text-center text-xs text-surface-500">
              Select a cluster on the map to view regional telemetry.
            </div>
          )}

          {/* Quick List of Active Clusters */}
          <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-surface-600 mb-2">
              All Active Clusters ({hotspots.length})
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setSelectedHotspot(h);
                    mapInstanceRef.current?.setView([h.latitude, h.longitude], 8);
                  }}
                  className={`w-full p-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                    selectedHotspot?.id === h.id
                      ? 'bg-brand-50 text-brand-900 border border-brand-200'
                      : 'hover:bg-surface-50 border border-transparent'
                  }`}
                >
                  <div>
                    <strong className="block text-surface-900">{h.district}</strong>
                    <span className="text-[11px] text-surface-500">{h.state} • {h.report_count} reports</span>
                  </div>
                  <span className="font-mono font-bold text-surface-600">{h.risk_index}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
