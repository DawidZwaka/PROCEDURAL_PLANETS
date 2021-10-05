import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetSpecComponent } from './planet-spec.component';

describe('PlanetSpecComponent', () => {
  let component: PlanetSpecComponent;
  let fixture: ComponentFixture<PlanetSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanetSpecComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanetSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
