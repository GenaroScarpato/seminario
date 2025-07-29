import React, { useEffect, useRef } from 'react';
import { useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const basePosition = [-34.58402190, -58.46702480];

const HeatmapZonasLayer = ({ zonas }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Limpia capa heatmap y marcadores previos
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    if (!zonas || zonas.length === 0) return;

    const heatData = zonas.map(z => {
      const lat = parseFloat(z.lat) || basePosition[0];
      const lng = parseFloat(z.lon) || basePosition[1];
      const intensity = Math.min(Math.max(z.congestion, 0.1), 1.0);
      return [lat, lng, intensity];
    });

    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      minOpacity: 0.4,
      gradient: {
        0.3: 'green',
        0.5: 'yellow',
        0.7: 'orange',
        1.0: 'red',
      },
    });

    heatLayerRef.current.addTo(map);

    // Crear marcadores invisibles con tooltip para cada zona
    zonas.forEach(z => {
      const lat = parseFloat(z.lat) || basePosition[0];
      const lng = parseFloat(z.lon) || basePosition[1];
      const marker = L.marker([lat, lng], {
        opacity: 0, // invisible
        interactive: true,
      });

      const congestionPercent = Math.round(z.congestion * 100);
      const popupContent = `
        <div style="font-weight:bold; text-align:center;">
          ${z.nombre || 'Zona desconocida'}<br/>
          Congestión: ${congestionPercent}%<br/>
          Velocidad actual: ${z.currentSpeed || 'N/A'} km/h<br/>
          Velocidad libre: ${z.freeFlowSpeed || 'N/A'} km/h
        </div>
      `;

      marker.bindTooltip(popupContent, { direction: 'top', opacity: 0.9, permanent: false, className: 'custom-tooltip' });
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];
    };
  }, [zonas, map]);

  return null;
};

export default HeatmapZonasLayer;
