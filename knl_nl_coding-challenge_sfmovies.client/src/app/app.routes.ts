import { Routes } from '@angular/router';

import { FilmLocationsPageComponent } from './pages/film-locations-page/film-locations-page.component';

export const routes: Routes = [
  {
    path: 'film-locations-sf',
    component: FilmLocationsPageComponent,
    title: 'Film Locations in San Francisco',
  },
  {
    path: '**',
    redirectTo: 'film-locations-sf',
  },
];
