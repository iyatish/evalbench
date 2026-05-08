import { useRef, useEffect, useMemo, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { CountryEvent } from '../types';

interface Props {
  events: CountryEvent[];
  onCountrySelect: (event: CountryEvent | null) => void;
  panelOpen: boolean;
}

function heatColor(ratio: number): string {
  if (ratio < 0.15) return '#22d3ee';
  if (ratio < 0.35) return '#4ade80';
  if (ratio < 0.55) return '#facc15';
  if (ratio < 0.75) return '#f97316';
  return '#ef4444';
}

function pointLabel(d: CountryEvent): string {
  return `
    <div style="
      background: rgba(3,7,18,0.85);
      border: 1px solid rgba(255,255,255,0.15);
      padding: 6px 10px;
      border-radius: 6px;
      color: white;
      font-family: sans-serif;
      font-size: 12px;
      line-height: 1.4;
      pointer-events: none;
    ">
      <strong style="font-size:13px">${d.countryName}</strong><br/>
      ${d.count} news event${d.count !== 1 ? 's' : ''}
    </div>
  `;
}

export function GlobeView({ events, onCountrySelect, panelOpen }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const maxCount = useMemo(
    () => Math.max(...events.map((e) => e.count), 1),
    [events]
  );

  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableZoom = true;
    globe.pointOfView({ altitude: 2.5 }, 0);
  }, []);

  // Pause rotation when panel opens so the user can orient
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = !panelOpen;
  }, [panelOpen]);

  return (
    <Globe
      ref={globeRef}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      atmosphereColor="lightskyblue"
      atmosphereAltitude={0.15}
      pointsData={events}
      pointLat={(d) => (d as CountryEvent).lat}
      pointLng={(d) => (d as CountryEvent).lng}
      pointAltitude={(d) => {
        const ratio = (d as CountryEvent).count / maxCount;
        return 0.01 + ratio * 0.08;
      }}
      pointRadius={(d) => {
        const ratio = (d as CountryEvent).count / maxCount;
        return 0.4 + ratio * 2.6;
      }}
      pointColor={(d) => heatColor((d as CountryEvent).count / maxCount)}
      pointLabel={(d) => pointLabel(d as CountryEvent)}
      onPointClick={(point) => onCountrySelect(point as CountryEvent)}
    />
  );
}
