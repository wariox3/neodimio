import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../../../shared';

@Component({
  selector: 'app-anticipo-nomina-list',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  templateUrl: './anticipo-nomina-list.component.html',
  styleUrl: './anticipo-nomina-list.component.scss',
})
export class AnticipoNominaListComponent {}
