import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SceneComponent } from './components/scene/scene.component';
import { PlanetSpecComponent } from './components/planet-spec/planet-spec.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    PlanetSpecComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
