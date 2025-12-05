import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropuestaOptima } from './propuesta-optima';

describe('PropuestaOptima', () => {
  let component: PropuestaOptima;
  let fixture: ComponentFixture<PropuestaOptima>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropuestaOptima]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropuestaOptima);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
