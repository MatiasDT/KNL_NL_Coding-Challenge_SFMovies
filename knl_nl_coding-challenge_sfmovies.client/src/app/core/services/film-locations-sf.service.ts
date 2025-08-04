import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { catchError, of, finalize, timeout, retry } from 'rxjs';

export interface FilmingLocation {
  id: string;
  title: string;
  releaseYear: string;
  locations: string;
  longitude: number;
  latitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class FilmLocationsSfService {
  private http = inject(HttpClient);

  private itemsSignal = signal<FilmingLocation[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly items = this.itemsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    this.loadItems();
  }

  loadItems() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<FilmingLocation[]>('/api/filmLocationsSanFrancisco')
      .pipe(
        timeout(30000),
        retry(2),
        catchError((error: HttpErrorResponse) => {
          console.error('Error loading film locations:', error);

          let errorMessage = 'Failed to load film locations. Please try again.';

          if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
          } else if (error.status === 404) {
            errorMessage = 'API endpoint not found. Please contact support.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          this.errorSignal.set(errorMessage);
          return of([]);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe((data) => {
        if (!Array.isArray(data)) {
          console.warn('Expected array but received:', data);
          this.errorSignal.set('Invalid data format received from server.');
          return;
        }

        console.log(`Loaded ${data.length} locations`);
        this.itemsSignal.set(data);
      });
  }

  refreshData() {
    this.loadItems();
  }
}
