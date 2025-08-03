import { TestBed } from '@angular/core/testing';
import { MapService, MapLayerConfig, PopupConfig } from './map.service';

// Mock Mapbox GL
const mockMap = {
  addControl: jasmine.createSpy('addControl'),
  addSource: jasmine.createSpy('addSource'),
  addLayer: jasmine.createSpy('addLayer'),
  on: jasmine.createSpy('on'),
  getSource: jasmine.createSpy('getSource'),
  setFeatureState: jasmine.createSpy('setFeatureState'),
  flyTo: jasmine.createSpy('flyTo'),
  getCanvas: jasmine.createSpy('getCanvas').and.returnValue({
    style: { cursor: '' },
  }),
};

const mockPopup = {
  setLngLat: jasmine.createSpy('setLngLat').and.returnValue({
    setHTML: jasmine.createSpy('setHTML').and.returnValue({
      addTo: jasmine.createSpy('addTo').and.returnValue({}),
    }),
  }),
  remove: jasmine.createSpy('remove'),
};

const mockGeoJSONSource = {
  setData: jasmine.createSpy('setData'),
};

const mockControl = {};

const mockMapboxgl = {
  Map: jasmine.createSpy('Map').and.returnValue(mockMap),
  Popup: jasmine.createSpy('Popup').and.returnValue(mockPopup),
  FullscreenControl: jasmine.createSpy('FullscreenControl').and.returnValue(mockControl),
  NavigationControl: jasmine.createSpy('NavigationControl').and.returnValue(mockControl),
  ScaleControl: jasmine.createSpy('ScaleControl').and.returnValue(mockControl),
  accessToken: '',
};

describe('MapService', () => {
  let service: MapService;
  let container: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapService],
    });

    service = TestBed.inject(MapService);
    container = document.createElement('div');

    (mockMap.addControl as jasmine.Spy).calls.reset();
    (mockMap.addSource as jasmine.Spy).calls.reset();
    (mockMap.addLayer as jasmine.Spy).calls.reset();
    (mockMap.on as jasmine.Spy).calls.reset();
    (mockMap.getSource as jasmine.Spy).calls.reset();
    (mockMap.flyTo as jasmine.Spy).calls.reset();
    (mockPopup.remove as jasmine.Spy).calls.reset();
    (mockGeoJSONSource.setData as jasmine.Spy).calls.reset();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('createMap()', () => {
    it('should create a map with correct configuration', () => {
      const coordinates: [number, number] = [-122.4194, 37.7749];

      const result = service.createMap(container, coordinates);

      expect(result).toBeDefined();
    });

    it('should create map with different coordinates', () => {
      const coordinates: [number, number] = [-122.3986, 37.7929];

      const result = service.createMap(container, coordinates);

      expect(result).toBeDefined();
    });
  });

  describe('addControls()', () => {
    it('should add all map controls', () => {
      service.addControls(mockMap as any);

      expect(mockMap.addControl).toHaveBeenCalledTimes(3);
    });
  });

  describe('setupLayers()', () => {
    let config: MapLayerConfig;

    beforeEach(() => {
      config = {
        sourceId: 'test-source',
        circleLayerId: 'test-circles',
        labelLayerId: 'test-labels',
      };
    });

    it('should add source to map', () => {
      service.setupLayers(mockMap as any, config);

      expect(mockMap.addSource).toHaveBeenCalledWith(config.sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    });

    it('should add circle layer', () => {
      service.setupLayers(mockMap as any, config);

      expect(mockMap.addLayer).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: config.circleLayerId,
          type: 'circle',
          source: config.sourceId,
        })
      );
    });

    it('should add label layer', () => {
      service.setupLayers(mockMap as any, config);

      expect(mockMap.addLayer).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: config.labelLayerId,
          type: 'symbol',
          source: config.sourceId,
        })
      );
    });

    it('should add both layers', () => {
      service.setupLayers(mockMap as any, config);

      expect(mockMap.addLayer).toHaveBeenCalledTimes(2);
    });
  });

  describe('setupMapInteractions()', () => {
    let popupConfig: PopupConfig;

    beforeEach(() => {
      popupConfig = {
        className: 'custom-popup',
        formatContent: (properties: any) => `<div>${properties.title}</div>`,
      };
    });

    it('should set up click event listener', () => {
      const circleLayerId = 'test-circles';

      service.setupMapInteractions(mockMap as any, circleLayerId, popupConfig);

      expect(mockMap.on).toHaveBeenCalledWith('click', circleLayerId, jasmine.any(Function));
    });

    it('should set up mouse event listeners', () => {
      const circleLayerId = 'test-circles';

      service.setupMapInteractions(mockMap as any, circleLayerId, popupConfig);

      expect(mockMap.on).toHaveBeenCalledWith('mouseenter', circleLayerId, jasmine.any(Function));
      expect(mockMap.on).toHaveBeenCalledWith('mouseleave', circleLayerId, jasmine.any(Function));
      expect(mockMap.on).toHaveBeenCalledWith('mousemove', circleLayerId, jasmine.any(Function));
    });

    it('should set up all event listeners', () => {
      const circleLayerId = 'test-circles';

      service.setupMapInteractions(mockMap as any, circleLayerId, popupConfig);

      expect(mockMap.on).toHaveBeenCalledTimes(5);
    });
  });

  describe('updateMapData()', () => {
    it('should update map source data when source exists', () => {
      const sourceId = 'test-source';
      const geoJsonData = { type: 'FeatureCollection', features: [] };

      (mockMap.getSource as jasmine.Spy).and.returnValue(mockGeoJSONSource);

      service.updateMapData(mockMap as any, sourceId, geoJsonData);

      expect(mockMap.getSource).toHaveBeenCalledWith(sourceId);
      expect(mockGeoJSONSource.setData).toHaveBeenCalledWith(geoJsonData);
    });

    it('should handle missing source gracefully', () => {
      const sourceId = 'missing-source';
      const geoJsonData = { type: 'FeatureCollection', features: [] };

      (mockMap.getSource as jasmine.Spy).and.returnValue(null);

      expect(() => {
        service.updateMapData(mockMap as any, sourceId, geoJsonData);
      }).not.toThrow();

      expect(mockMap.getSource).toHaveBeenCalledWith(sourceId);
    });
  });

  describe('flyToLocation()', () => {
    it('should fly to specified coordinates', () => {
      const longitude = -122.4194;
      const latitude = 37.7749;

      service.flyToLocation(mockMap as any, longitude, latitude);

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [longitude, latitude],
        zoom: 15,
      });
    });

    it('should handle different coordinates', () => {
      const longitude = -122.3986;
      const latitude = 37.7929;

      service.flyToLocation(mockMap as any, longitude, latitude);

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [longitude, latitude],
        zoom: 15,
      });
    });
  });

  describe('Popup Management', () => {
    beforeEach(() => {
      (service as any).popups.clear();
    });

    describe('closePopup()', () => {
      it('should close specific popup when it exists', () => {
        const layerId = 'test-layer';
        const testPopup = { remove: jasmine.createSpy('remove') };

        // Manually add popup to the service's internal map
        (service as any).popups.set(layerId, testPopup);

        service.closePopup(layerId);

        expect(testPopup.remove).toHaveBeenCalled();
        expect((service as any).popups.has(layerId)).toBe(false);
      });

      it('should handle non-existent popup gracefully', () => {
        const layerId = 'non-existent-layer';

        expect(() => {
          service.closePopup(layerId);
        }).not.toThrow();
      });
    });

    describe('closeAllPopups()', () => {
      it('should close all popups when multiple exist', () => {
        const mockPopup1 = { remove: jasmine.createSpy('remove1') };
        const mockPopup2 = { remove: jasmine.createSpy('remove2') };

        (service as any).popups.set('layer1', mockPopup1);
        (service as any).popups.set('layer2', mockPopup2);

        service.closeAllPopups();

        expect(mockPopup1.remove).toHaveBeenCalled();
        expect(mockPopup2.remove).toHaveBeenCalled();
        expect((service as any).popups.size).toBe(0);
      });

      it('should handle empty popup map gracefully', () => {
        expect(() => {
          service.closeAllPopups();
        }).not.toThrow();

        expect((service as any).popups.size).toBe(0);
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should handle valid layer configuration', () => {
      const config: MapLayerConfig = {
        sourceId: 'valid-source',
        circleLayerId: 'valid-circles',
        labelLayerId: 'valid-labels',
      };

      expect(() => {
        service.setupLayers(mockMap as any, config);
      }).not.toThrow();
    });

    it('should handle valid popup configuration', () => {
      const config: PopupConfig = {
        className: 'test-popup',
        formatContent: (props) => `<div>${props.title}</div>`,
      };

      expect(() => {
        service.setupMapInteractions(mockMap as any, 'test-layer', config);
      }).not.toThrow();
    });

    it('should handle popup configuration without className', () => {
      const config: PopupConfig = {
        formatContent: (props) => `<div>${props.title}</div>`,
      };

      expect(() => {
        service.setupMapInteractions(mockMap as any, 'test-layer', config);
      }).not.toThrow();
    });
  });

  describe('Method Parameter Validation', () => {
    it('should handle valid parameters in createMap', () => {
      const coordinates: [number, number] = [-122.4194, 37.7749];

      expect(() => {
        service.createMap(container, coordinates);
      }).not.toThrow();
    });

    it('should handle valid parameters in flyToLocation', () => {
      const longitude = -122.4194;
      const latitude = 37.7749;

      expect(() => {
        service.flyToLocation(mockMap as any, longitude, latitude);
      }).not.toThrow();
    });

    it('should handle valid GeoJSON data in updateMapData', () => {
      const geoJsonData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
            properties: { title: 'Test Location' },
          },
        ],
      };

      (mockMap.getSource as jasmine.Spy).and.returnValue(mockGeoJSONSource);

      expect(() => {
        service.updateMapData(mockMap as any, 'test-source', geoJsonData);
      }).not.toThrow();
    });
  });
});
