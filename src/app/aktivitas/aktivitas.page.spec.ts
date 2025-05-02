import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AktivitasPage } from './aktivitas.page';

describe('AktivitasPage', () => {
  let component: AktivitasPage;
  let fixture: ComponentFixture<AktivitasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AktivitasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
