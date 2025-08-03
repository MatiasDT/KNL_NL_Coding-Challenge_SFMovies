import { Injectable } from '@angular/core';

import mapboxgl from 'mapbox-gl';

import { environment } from '../../../environments/environment';

mapboxgl.accessToken = environment.mapboxToken;

export interface MapLayerConfig {
  sourceId: string;
  circleLayerId: string;
  labelLayerId: string;
}

export interface PopupConfig {
  className?: string;
  formatContent: (properties: any) => string;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private popups: Map<string, mapboxgl.Popup> = new Map();

  constructor() {}

  createMap(container: HTMLElement, coordinates: [number, number]): mapboxgl.Map {
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 10,
    });

    return map;
  }

  addControls(map: mapboxgl.Map): void {
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());
  }

  setupLayers(map: mapboxgl.Map, config: MapLayerConfig): void {
    map.addSource(config.sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    const { sourceId, circleLayerId, labelLayerId } = config;

    const circleConfig = {
      radius: 8,
      color: '#4ecdc4',
      hoverColor: '#ff6b6b',
      strokeWidth: 2,
      strokeColor: '#ffffff',
      opacity: 0.8,
    };

    map.addLayer({
      id: circleLayerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': circleConfig.radius,
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          circleConfig.hoverColor,
          circleConfig.color,
        ],
        'circle-stroke-width': circleConfig.strokeWidth,
        'circle-stroke-color': circleConfig.strokeColor,
        'circle-opacity': circleConfig.opacity,
      },
    });

    const labelConfig = {
      textField: 'title',
      textSize: 12,
      textColor: '#333',
      textHaloColor: '#fff',
      textHaloWidth: 1,
      textOffset: [0, 1.25] as [number, number],
      textAnchor: 'top',
    };

    map.addLayer({
      id: labelLayerId,
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': ['get', labelConfig.textField],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': labelConfig.textOffset,
        'text-anchor': labelConfig.textAnchor as any,
        'text-size': labelConfig.textSize,
      },
      paint: {
        'text-color': labelConfig.textColor,
        'text-halo-color': labelConfig.textHaloColor,
        'text-halo-width': labelConfig.textHaloWidth,
      },
    });
  }

  setupMapInteractions(map: mapboxgl.Map, circleLayerId: string, popupConfig: PopupConfig): void {
    map.on('click', circleLayerId, (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0] as any;
        const properties = feature.properties;
        const coordinates = feature.geometry.coordinates.slice();

        const existingPopup = this.popups.get(circleLayerId);
        if (existingPopup) {
          existingPopup.remove();
        }

        const popup = new mapboxgl.Popup({
          className: popupConfig.className || 'text-black',
        })
          .setLngLat(coordinates)
          .setHTML(popupConfig.formatContent(properties))
          .addTo(map);

        this.popups.set(circleLayerId, popup);
      }
    });

    map.on('mouseenter', circleLayerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', circleLayerId, () => {
      map.getCanvas().style.cursor = '';
    });

    let hoveredFeatureId: string | null = null;

    map.on('mousemove', circleLayerId, (e) => {
      if (e.features && e.features.length > 0) {
        if (hoveredFeatureId !== null) {
          map.setFeatureState(
            { source: circleLayerId.replace('-circles', ''), id: hoveredFeatureId },
            { hover: false }
          );
        }

        hoveredFeatureId = e.features[0].properties!['id'];
        if (hoveredFeatureId !== null) {
          map.setFeatureState({ source: circleLayerId.replace('-circles', ''), id: hoveredFeatureId }, { hover: true });
        }
      }
    });

    map.on('mouseleave', circleLayerId, () => {
      if (hoveredFeatureId !== null) {
        map.setFeatureState({ source: circleLayerId.replace('-circles', ''), id: hoveredFeatureId }, { hover: false });
      }
      hoveredFeatureId = null;
    });
  }

  updateMapData(map: mapboxgl.Map, sourceId: string, geoJsonData: any): void {
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geoJsonData);
    }
  }

  flyToLocation(map: mapboxgl.Map, longitude: number, latitude: number): void {
    map.flyTo({
      center: [longitude, latitude],
      zoom: 15,
    });
  }

  closePopup(layerId: string): void {
    const popup = this.popups.get(layerId);
    if (popup) {
      popup.remove();
      this.popups.delete(layerId);
    }
  }

  closeAllPopups(): void {
    this.popups.forEach((popup) => popup.remove());
    this.popups.clear();
  }
}
