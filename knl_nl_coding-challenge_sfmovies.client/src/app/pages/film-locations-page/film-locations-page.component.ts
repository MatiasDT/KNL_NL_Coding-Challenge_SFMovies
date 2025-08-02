import { Component } from '@angular/core';
import { MapComponent } from 'ngx-mapbox-gl';

@Component({
  selector: 'app-film-locations-page',
  imports: [MapComponent],
  templateUrl: './film-locations-page.component.html',
  styles: `
    mgl-map {
          height: 100%;
          width: 100%;
        }
  `,
})
export class FilmLocationsPageComponent {}
