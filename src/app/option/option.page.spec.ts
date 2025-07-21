import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionPage } from './option.page';

describe('OptionPage', () => {
  let component: OptionPage;
  let fixture: ComponentFixture<OptionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
