import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LupapasswordPage } from './lupapassword.page';

describe('LupapasswordPage', () => {
  let component: LupapasswordPage;
  let fixture: ComponentFixture<LupapasswordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LupapasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
