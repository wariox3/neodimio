import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const copiar = () => el().querySelector<HTMLElement>('.breadcrumb__copy')?.click();

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Transporte', routerLink: '/transporte' },
      { label: 'Guías', routerLink: '/guias' },
      { label: 'Guía 1' },
    ]);
    fixture.detectChanges();
  });

  it('enlaza las migajas y marca la última como página actual', () => {
    expect(el().querySelectorAll('a.breadcrumb__link').length).toBe(2);
    expect(el().querySelector('[aria-current="page"]')?.textContent).toBe('Guía 1');
  });

  it('confirma la copia y vuelve al ícono inicial', fakeAsync(() => {
    spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    copiar();
    flushMicrotasks();
    fixture.detectChanges();
    expect(el().querySelector('.breadcrumb__copy .pi-check')).not.toBeNull();

    tick(1500);
    fixture.detectChanges();
    expect(el().querySelector('.breadcrumb__copy .pi-copy')).not.toBeNull();
  }));

  it('no confirma una copia que el navegador rechazó', fakeAsync(() => {
    spyOn(navigator.clipboard, 'writeText').and.rejectWith(new Error('denegado'));
    copiar();
    flushMicrotasks();
    fixture.detectChanges();
    expect(el().querySelector('.breadcrumb__copy .pi-check')).toBeNull();
  }));
});
