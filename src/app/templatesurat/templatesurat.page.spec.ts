import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplatesuratPage } from './templatesurat.page';

describe('TemplatesuratPage', () => {
  let component: TemplatesuratPage;
  let fixture: ComponentFixture<TemplatesuratPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplatesuratPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
