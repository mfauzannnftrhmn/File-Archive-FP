import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PengajuansuratPage } from './pengajuansurat.page';

describe('PengajuansuratPage', () => {
  let component: PengajuansuratPage;
  let fixture: ComponentFixture<PengajuansuratPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PengajuansuratPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
