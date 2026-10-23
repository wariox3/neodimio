import { Component, inject, model, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { TextareaModule } from 'primeng/textarea';
import { StepperModule } from 'primeng/stepper';
import { ToastService } from '@semantica/core';
import { CreditosService } from '../../services/creditos.service';
import { PlanCredito, CreditoConfiguracion } from '../../models/credito.model';

@Component({
  selector: 'app-credito-solicitud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    SliderModule,
    TextareaModule,
    StepperModule,
  ],
  templateUrl: './credito-solicitud.component.html',
  styleUrl: './credito-solicitud.component.scss',
})
export class CreditoSolicitudComponent {
  private readonly fb = inject(FormBuilder);
  private readonly creditosService = inject(CreditosService);
  private readonly toastService = inject(ToastService);

  readonly visible = model(false);
  readonly created = output<void>();

  readonly activeStep = signal(1);
  readonly submitting = signal(false);
  readonly loadingConfig = signal(false);
  readonly configuracion = signal<CreditoConfiguracion | null>(null);
  readonly planes = signal<PlanCredito[]>([]);
  readonly selectedPlan = signal<PlanCredito | null>(null);
  readonly sliderValue = signal(500000);

  readonly form = this.fb.nonNullable.group({
    monto: [500000, [Validators.required, Validators.min(100000), Validators.max(2000000)]],
    num_cuotas: [0 as number, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
  });

  onShow(): void {
    if (this.configuracion()) return;
    this.loadingConfig.set(true);
    this.creditosService.getConfiguracion().subscribe({
      next: (config) => {
        this.configuracion.set(config);
        this.loadingConfig.set(false);
      },
      error: () => {
        this.loadingConfig.set(false);
      },
    });
  }

  onMontoChange(value: number | null): void {
    if (value != null) {
      this.sliderValue.set(value);
    }
  }

  onSliderChange(value: number): void {
    this.form.controls.monto.setValue(value);
  }

  goToStep2(activateCallback: (step: number) => void): void {
    if (this.form.controls.monto.invalid || !this.configuracion()) return;
    const monto = this.form.controls.monto.value;
    const tasaAnual = this.configuracion()!.tasa_interes;
    this.planes.set(this.creditosService.calcularPlanes(monto, tasaAnual));
    this.selectedPlan.set(null);
    this.form.controls.num_cuotas.setValue(0);
    activateCallback(2);
  }

  selectPlan(plan: PlanCredito): void {
    this.selectedPlan.set(plan);
    this.form.controls.num_cuotas.setValue(plan.num_cuotas);
  }

  goToStep3(activateCallback: (step: number) => void): void {
    if (!this.selectedPlan()) return;
    activateCallback(3);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedPlan()) return;

    this.submitting.set(true);
    this.creditosService
      .crearCredito({
        monto: this.form.controls.monto.value,
        plazo: this.form.controls.num_cuotas.value,
        tasa_interes: this.configuracion()!.tasa_interes,
        descripcion: this.form.controls.descripcion.value,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Solicitud enviada correctamente');
          this.submitting.set(false);
          this.resetForm();
          this.visible.set(false);
          this.created.emit();
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  onHide(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({ monto: 500000, num_cuotas: 0, descripcion: '' });
    this.sliderValue.set(500000);
    this.activeStep.set(1);
    this.planes.set([]);
    this.selectedPlan.set(null);
  }
}
