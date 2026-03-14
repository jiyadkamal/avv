'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationMap({ lat, lng, onLocationChange }: LocationMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Custom marker icon
    const markerIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [lat, lng],
            zoom: 14,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(map);

        marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onLocationChange(pos.lat, pos.lng);
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
            marker.setLatLng(e.latlng);
            onLocationChange(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;

        // Fix map rendering
        setTimeout(() => map.invalidateSize(), 100);

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    // Update marker position when lat/lng props change
    useEffect(() => {
        if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapRef.current.setView([lat, lng], mapRef.current.getZoom());
        }
    }, [lat, lng]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full rounded-xl overflow-hidden"
            style={{ minHeight: '300px' }}
        />
    );
}
