import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;

      &__text {
        min-width: 0;
      }

      &__title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1.3;
        color: var(--p-text-color);
      }

      &__subtitle {
        margin: 0.15rem 0 0;
        color: var(--p-text-muted-color);
        font-size: 0.8rem;
      }

      &__actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
