import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { FilmLocationsSfService, FilmingLocation } from './film-locations-sf.service';

describe('FilmLocationsSfService', () => {
  let service: FilmLocationsSfService;
  let httpMock: HttpTestingController;

  const mockFilmingLocations: FilmingLocation[] = [
    {
      id: '1',
      title: 'The Matrix',
      releaseYear: '1999',
      locations: 'Chinatown',
      longitude: -122.4056,
      latitude: 37.7937,
    },
    {
      id: '2',
      title: 'Inception',
      releaseYear: '2010',
      locations: 'Financial District',
      longitude: -122.3986,
      latitude: 37.7929,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilmLocationsSfService, provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    const pendingRequests = httpMock.match(() => true);
    pendingRequests.forEach((req) => {
      if (!req.cancelled) {
        req.flush([]);
      }
    });
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(FilmLocationsSfService);
      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(mockFilmingLocations);

      expect(service).toBeTruthy();
    });

    it('should call loadItems on initialization', () => {
      service = TestBed.inject(FilmLocationsSfService);

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      expect(req.request.method).toBe('GET');
      req.flush(mockFilmingLocations);
    });

    it('should initialize signals with correct default values', () => {
      service = TestBed.inject(FilmLocationsSfService);

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(true);
      expect(service.error()).toBeNull();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(mockFilmingLocations);
    });
  });

  describe('loadItems()', () => {
    beforeEach(() => {
      service = TestBed.inject(FilmLocationsSfService);
      const initialReq = httpMock.expectOne('/filmLocationsSanFrancisco');
      initialReq.flush([]);
    });

    it('should set loading to true and clear error when starting request', () => {
      service.loadItems();

      expect(service.loading()).toBe(true);
      expect(service.error()).toBeNull();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(mockFilmingLocations);
    });

    it('should successfully load film locations', () => {
      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(mockFilmingLocations);

      expect(service.items()).toEqual(mockFilmingLocations);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
    });

    it('should set loading to false after successful request', () => {
      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(mockFilmingLocations);

      expect(service.loading()).toBe(false);
    });

    it('should handle empty array response', () => {
      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush([]);

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
    });

    it('should handle invalid data format and set appropriate error', () => {
      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush('invalid data');

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Invalid data format received from server.');
    });

    it('should handle null response and set appropriate error', () => {
      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(null);

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Invalid data format received from server.');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      service = TestBed.inject(FilmLocationsSfService);
      const initialReq = httpMock.expectOne('/filmLocationsSanFrancisco');
      initialReq.flush([]);
    });

    it('should handle network error (status 0)', fakeAsync(() => {
      spyOn(console, 'error');
      service.loadItems();

      // This is because the service will retry twice before giving up

      // First attempt fails
      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Network error'), { status: 0, statusText: 'Unknown Error' });

      // First retry fails
      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Network error'), { status: 0, statusText: 'Unknown Error' });

      // Second retry succeeds
      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.error(new ProgressEvent('Network error'), { status: 0, statusText: 'Unknown Error' });

      tick();

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Network error. Please check your connection.');
      expect(console.error).toHaveBeenCalled();
    }));

    it('should handle 404 error', fakeAsync(() => {
      spyOn(console, 'error');
      service.loadItems();

      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Not Found'), { status: 404, statusText: 'Not Found' });

      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Not Found'), { status: 404, statusText: 'Not Found' });

      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.error(new ProgressEvent('Not Found'), { status: 404, statusText: 'Not Found' });

      tick();

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('API endpoint not found. Please contact support.');
      expect(console.error).toHaveBeenCalled();
    }));

    it('should handle 500 server error', fakeAsync(() => {
      spyOn(console, 'error');
      service.loadItems();

      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Server Error'), { status: 500, statusText: 'Internal Server Error' });

      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Server Error'), { status: 500, statusText: 'Internal Server Error' });

      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.error(new ProgressEvent('Server Error'), { status: 500, statusText: 'Internal Server Error' });

      tick();

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Server error. Please try again later.');
      expect(console.error).toHaveBeenCalled();
    }));

    it('should handle 503 server error', fakeAsync(() => {
      spyOn(console, 'error');
      service.loadItems();

      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Service Unavailable'), { status: 503, statusText: 'Service Unavailable' });

      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Service Unavailable'), { status: 503, statusText: 'Service Unavailable' });

      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.error(new ProgressEvent('Service Unavailable'), { status: 503, statusText: 'Service Unavailable' });

      tick();

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Server error. Please try again later.');
      expect(console.error).toHaveBeenCalled();
    }));

    it('should handle generic HTTP error', fakeAsync(() => {
      spyOn(console, 'error');
      service.loadItems();

      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Bad Request'), { status: 400, statusText: 'Bad Request' });

      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Bad Request'), { status: 400, statusText: 'Bad Request' });

      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.error(new ProgressEvent('Bad Request'), { status: 400, statusText: 'Bad Request' });

      tick();

      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Failed to load film locations. Please try again.');
      expect(console.error).toHaveBeenCalled();
    }));

    it('should set loading to false even when error occurs', fakeAsync(() => {
      service.loadItems();

      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.error(new ProgressEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

      tick();

      expect(service.loading()).toBe(false);
    }));
  });

  describe('refreshData()', () => {
    beforeEach(() => {
      service = TestBed.inject(FilmLocationsSfService);
      const initialReq = httpMock.expectOne('/filmLocationsSanFrancisco');
      initialReq.flush([]);
    });

    it('should call loadItems when refreshData is called', () => {
      spyOn(service, 'loadItems');

      service.refreshData();

      expect(service.loadItems).toHaveBeenCalled();
    });

    it('should make HTTP request when refreshData is called', () => {
      service.refreshData();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      expect(req.request.method).toBe('GET');
      req.flush(mockFilmingLocations);
    });

    it('should update items when refreshData succeeds', () => {
      service.refreshData();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(mockFilmingLocations);

      expect(service.items()).toEqual(mockFilmingLocations);
    });
  });

  describe('HTTP Request Configuration', () => {
    beforeEach(() => {
      service = TestBed.inject(FilmLocationsSfService);
      const initialReq = httpMock.expectOne('/filmLocationsSanFrancisco');
      initialReq.flush([]);
    });

    it('should make request to correct endpoint', () => {
      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      expect(req.request.url).toBe('/filmLocationsSanFrancisco');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should retry failed requests and succeed on final attempt', fakeAsync(() => {
      service.loadItems();

      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Timeout'), { status: 408, statusText: 'Request Timeout' });

      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Timeout'), { status: 408, statusText: 'Request Timeout' });

      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.flush(mockFilmingLocations);

      tick();

      expect(service.items()).toEqual(mockFilmingLocations);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
    }));
  });

  describe('Signal Readonly Properties', () => {
    beforeEach(() => {
      service = TestBed.inject(FilmLocationsSfService);
      const initialReq = httpMock.expectOne('/filmLocationsSanFrancisco');
      initialReq.flush([]);
    });

    it('should expose readonly items signal', () => {
      expect(service.items).toBeDefined();
      expect(typeof service.items).toBe('function');
    });

    it('should expose readonly loading signal', () => {
      expect(service.loading).toBeDefined();
      expect(typeof service.loading).toBe('function');
    });

    it('should expose readonly error signal', () => {
      expect(service.error).toBeDefined();
      expect(typeof service.error).toBe('function');
    });
  });

  describe('Console Logging', () => {
    beforeEach(() => {
      service = TestBed.inject(FilmLocationsSfService);
      const initialReq = httpMock.expectOne('/filmLocationsSanFrancisco');
      initialReq.flush([]);
    });

    it('should log successful data loading', () => {
      spyOn(console, 'log');

      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush(mockFilmingLocations);

      expect(console.log).toHaveBeenCalledWith('Loaded 2 locations');
    });

    it('should log errors', fakeAsync(() => {
      spyOn(console, 'error');

      service.loadItems();

      const req1 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req1.error(new ProgressEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

      const req2 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req2.error(new ProgressEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

      const req3 = httpMock.expectOne('/filmLocationsSanFrancisco');
      req3.error(new ProgressEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

      tick();

      expect(console.error).toHaveBeenCalled();
    }));

    it('should warn about invalid data format', () => {
      spyOn(console, 'warn');

      service.loadItems();

      const req = httpMock.expectOne('/filmLocationsSanFrancisco');
      req.flush('invalid data');

      expect(console.warn).toHaveBeenCalledWith('Expected array but received:', 'invalid data');
    });
  });
});
