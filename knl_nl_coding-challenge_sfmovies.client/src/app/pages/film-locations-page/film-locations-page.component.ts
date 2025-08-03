import { AfterViewInit, Component, ElementRef, inject, signal, viewChild, effect, computed } from '@angular/core';

import { MapLayerConfig, MapService, PopupConfig } from '../../core/services/map.service';
import { FilmingLocation, FilmLocationsSfService } from '../../core/services/film-locations-sf.service';

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    releaseYear: string;
    locations: string;
  };
}

@Component({
  selector: 'app-film-locations-page',
  imports: [],
  templateUrl: './film-locations-page.component.html',
  styles: [],
})
export class FilmLocationsPageComponent implements AfterViewInit {
  private mapService = inject(MapService);
  private filmLocationsSfService = inject(FilmLocationsSfService);
  private divElement = viewChild<ElementRef>('map');
  private map = signal<mapboxgl.Map | null>(null);

  locations = this.filmLocationsSfService.items;
  loading = this.filmLocationsSfService.loading;
  error = this.filmLocationsSfService.error;

  searchQuery = signal<string>('');
  filteredLocations = computed(() => {
    const currentLocations = this.locations() || [];
    const query = this.searchQuery().trim().toLowerCase();

    if (query.length < 3) {
      return [];
    }

    const filtered = currentLocations.filter(
      (location) =>
        location.title.toLowerCase().includes(query) ||
        location.locations.toLowerCase().includes(query) ||
        location.releaseYear.toLowerCase().includes(query)
    );

    return filtered;
  });

  constructor() {
    effect(() => {
      const currentMap = this.map();
      const query = this.searchQuery().trim();
      const filteredData = this.filteredLocations();

      if (!currentMap) return;

      if (filteredData && filteredData.length > 0) {
        const geoJsonData = this.createGeoJSONData(filteredData);
        this.mapService.updateMapData(currentMap, 'film-locations', geoJsonData);
      } else if (query.length === 0) {
        const geoJsonData = this.createGeoJSONData(this.locations() || []);
        this.mapService.updateMapData(currentMap, 'film-locations', geoJsonData);
      }
    });
  }

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((resolve) => setTimeout(resolve, 80));

    const element = this.divElement()!.nativeElement;
    const coordinatesSF: [number, number] = [-122.40985, 37.793085];
    const map = this.mapService.createMap(element, coordinatesSF);

    this.mapService.addControls(map);

    map.on('load', () => {
      const layerConfig = this.getFilmLocationsMapConfig();
      const popupConfig = this.getFilmLocationsPopupConfig();

      this.mapService.setupLayers(map, layerConfig);
      this.mapService.setupMapInteractions(map, layerConfig.circleLayerId, popupConfig);
    });

    this.map.set(map);
  }

  flyToLocation(longitude: number, latitude: number) {
    const currentMap = this.map();
    if (!currentMap) return;

    this.mapService.flyToLocation(currentMap, longitude, latitude);
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  highlightMatch(text: string): string {
    const query = this.searchQuery().trim().toLowerCase();
    if (query.length < 3 || !text) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }

  retryLoading() {
    this.filmLocationsSfService.refreshData();
  }

  private getFilmLocationsMapConfig(): MapLayerConfig {
    return {
      sourceId: 'film-locations',
      circleLayerId: 'film-locations-circles',
      labelLayerId: 'film-locations-labels',
    };
  }

  private getFilmLocationsPopupConfig(): PopupConfig {
    return {
      className: 'text-black',
      formatContent: (properties: any) => {
        const { title, releaseYear, locations } = properties;
        return `<h1>${title}</h1><p>${locations}</p><p>Año de estreno: ${releaseYear}</p>`;
      },
    };
  }

  private createGeoJSONData(locations: FilmingLocation[]) {
    const features: GeoJSONFeature[] = locations.map((location) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      properties: {
        id: location.id,
        title: location.title,
        releaseYear: location.releaseYear,
        locations: location.locations,
      },
    }));

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }
}
