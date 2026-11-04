import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastService, trimFormValues } from '@semantica/core';
import { PageHeaderComponent, TrimInputDirective } from '@semantica/ui';
import { ROUTE_PATHS } from '../../../../core';
import {
  Ciudad,
  exigeFlete,
  GuiaTipo,
  OpcionCatalogo,
  opcionesProducto,
  PRODUCTO_VARIOS,
  Tercero,
  tiposDisponibles,
} from '../../../catalogos/models/catalogo.model';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';
import { DestinatarioBuscarComponent } from '../../../destinatarios/components/destinatario-buscar/destinatario-buscar.component';
import { DestinatarioNuevoComponent } from '../../../destinatarios/components/destinatario-nuevo/destinatario-nuevo.component';
import { Destinatario, DestinatarioNuevo } from '../../../destinatarios/models/destinatario.model';
import {
  Adquiriente,
  CondicionEspecialRequest,
  CondicionEspecialResponse,
  cuerpoGuiaNueva,
  facturadoAlSalirDelFacturado,
  facturadoAlSalirDelVolumen,
  liquidacionesDisponibles,
  LiquidarRequest,
  LiquidarResponse,
  MinimosPeso,
  operacionPorDefecto,
  parametrosCondicion,
  parametrosLiquidacion,
  pesoRealPorUnidades,
  pesosAlSalirDelReal,
  tipoIdentificacionGuia,
  TipoIdentificacion,
  TipoLiquidacion,
} from '../../models/guia.model';
import { GuiaService } from '../../services/guia.service';

/** Espera tras el último cambio antes de liquidar, para no consultar por cada tecla. */
const ESPERA_LIQUIDACION_MS = 400;

@Component({
  selector: 'app-guia-nueva',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TextareaModule,
    PageHeaderComponent,
    TrimInputDirective,
    DestinatarioBuscarComponent,
    DestinatarioNuevoComponent,
  ],
  templateUrl: './guia-nueva.component.html',
  styleUrl: './guia-nueva.component.scss',
})
export class GuiaNuevaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogoService = inject(CatalogoService);
  private readonly guiaService = inject(GuiaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly listaRoute = ROUTE_PATHS.dashboard.transporte.guias;

  readonly errorMessage = signal<string | null>(null);
  readonly guardando = signal(false);
  /** Operación por la que ingresa la guía (`codigo_operacion_fk` de la configuración). */
  private readonly operacionIngreso = signal<string | null>(null);
  /** Último destinatario elegido, para enlazar la guía con él. */
  private readonly destinatarioElegido = signal<Destinatario | null>(null);

  /** Por defecto es el tercero de la membresía del usuario, como en terbio. */
  readonly adquiriente = signal<Adquiriente | null>(null);
  readonly tipos = signal<OpcionCatalogo[]>([]);
  /** Tipos habilitados con sus reglas, para validar al guardar. */
  private readonly tiposGuia = signal<GuiaTipo[]>([]);
  readonly buscarVisible = signal(false);
  readonly nuevoDestinatarioVisible = signal(false);
  /** Lo escrito en la guía al abrir el diálogo, para no digitarlo otra vez. */
  readonly destinatarioInicial = signal<Partial<DestinatarioNuevo>>({});

  /** Formas de liquidar que tiene habilitadas el tercero. */
  readonly liquidaciones = signal<OpcionCatalogo<TipoLiquidacion>[]>([]);
  /** `VARIOS` está disponible desde el inicio y queda seleccionado, como en terbio. */
  readonly productos = signal<OpcionCatalogo[]>([PRODUCTO_VARIOS]);
  /** Operaciones del tercero del usuario (`codigo_tercero_operacion_fk`); es opcional. */
  readonly operaciones = signal<OpcionCatalogo<number>[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);

  readonly tiposIdentificacion: OpcionCatalogo<TipoIdentificacion>[] = [
    { value: 'CC', label: 'CC' },
    { value: 'NI', label: 'NI' },
  ];

  readonly form = this.fb.nonNullable.group({
    // Información general
    codigo_guia_tipo_fk: ['', Validators.required],
    tipo_liquidacion: [null as TipoLiquidacion | null, Validators.required],
    codigo_tercero_operacion_fk: [null as number | null],
    documento_cliente: [''],
    remitente: [''],
    // Destinatario
    codigo_identificacion_destinatario_fk: ['CC' as TipoIdentificacion | null, Validators.required],
    numero_identificacion_destinatario: ['', [Validators.required, Validators.maxLength(20)]],
    nombre_destinatario: ['', [Validators.required, Validators.maxLength(150)]],
    direccion_destinatario: ['', [Validators.required, Validators.maxLength(150)]],
    telefono_destinatario: ['', [Validators.required, Validators.maxLength(30)]],
    codigo_ciudad_destino_fk: [null as string | null, Validators.required],
    // Mercancía
    codigo_producto_fk: [PRODUCTO_VARIOS.value, Validators.required],
    unidades: [1, [Validators.required, Validators.min(1)]],
    // terbio exige unidades, peso real y peso facturado mayores que cero.
    peso_real: [0, [Validators.required, Validators.min(0.01)]],
    peso_volumen: [0, [Validators.required, Validators.min(0)]],
    peso_facturado: [0, [Validators.required, Validators.min(0.01)]],
    vr_declara: [0, [Validators.required, Validators.min(0)]],
    // Valores
    vr_recaudo: [0, [Validators.required, Validators.min(0)]],
    devolver_documento_cliente: [false],
    comentario: ['', Validators.maxLength(500)],
  });

  private readonly valores = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  private readonly tercero = signal<Tercero | null>(null);
  /** Ciudad de origen del usuario; `undefined` mientras se resuelve. */
  private readonly origen = signal<string | null | undefined>(undefined);

  readonly origenTexto = computed(() => {
    const origen = this.origen();
    if (!origen) return '—';
    const ciudad = this.ciudades().find((c) => c.codigo_ciudad_pk === origen);
    return ciudad?.nombre ? `${ciudad.nombre} [${origen}]` : origen;
  });

  /** Se recalcula solo cuando cambia algún dato que afecta la liquidación. */
  private readonly parametros = computed<LiquidarRequest | null>(
    () =>
      parametrosLiquidacion(this.valores(), this.tercero(), this.origen() ?? null, this.ciudades()),
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );
  private readonly parametros$ = toObservable(this.parametros);

  /** Se consulta de nuevo solo cuando cambia el tipo, el destino o el producto. */
  private readonly parametrosCondicion = computed<CondicionEspecialRequest | null>(
    () => parametrosCondicion(this.valores(), this.tercero(), this.origen() ?? null),
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );
  private readonly parametrosCondicion$ = toObservable(this.parametrosCondicion);

  /** Condiciones que se muestran arriba del formulario, como en terbio. */
  readonly condicion = signal<CondicionEspecialResponse | null>(null);

  /** Sin condiciones consultadas, los pesos se comparan sin mínimos. */
  private readonly minimosPeso = computed<MinimosPeso>(() => ({
    peso_minimo: this.condicion()?.peso_minimo ?? 0,
    peso_minimo_guia: this.condicion()?.peso_minimo_guia ?? 0,
  }));

  private readonly liquidacion = signal<LiquidarResponse | null>(null);
  /** Parámetros con los que se obtuvo `liquidacion`. */
  private readonly liquidadoCon = signal<LiquidarRequest | null>(null);
  readonly liquidando = signal(false);
  /**
   * Si los valores mostrados corresponden a los datos actuales. Se compara contra los
   * parámetros de la última liquidación y no solo con `liquidando`, que se enciende después
   * de que Angular procesa el cambio.
   */
  private readonly liquidacionAlDia = computed(() => {
    const actuales = this.parametros();
    return actuales === null || JSON.stringify(actuales) === JSON.stringify(this.liquidadoCon());
  });
  private readonly liquidacionRechazada = signal(false);

  /** Motivo por el que no se puede liquidar, si lo hay. */
  readonly avisoLiquidacion = computed(() => {
    const tercero = this.tercero();
    if (!tercero || this.origen() === undefined) return null;
    if (!this.origen()) return 'Tu usuario no tiene una ciudad de origen ni una operación.';
    if (tercero.condicion_codigo_precio_fk === null) {
      return 'El cliente no tiene una lista de precios asignada.';
    }
    return this.liquidacionRechazada() ? 'No se pudo liquidar con estos datos.' : null;
  });

  /** El que liquidó fluor; mientras tanto, el del formulario. */
  readonly pesoFacturado = computed(
    () => this.liquidacion()?.peso_facturado ?? this.valores().peso_facturado ?? 0,
  );

  /** Son informativos: en terbio también son de solo lectura y los liquida el sistema. */
  readonly flete = computed(() => this.liquidacion()?.flete ?? 0);
  readonly manejo = computed(() => this.liquidacion()?.manejo ?? 0);
  readonly total = computed(() => this.flete() + this.manejo());

  ngOnInit(): void {
    this.catalogoService
      .tercero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((t) => {
        this.tercero.set(t);
        this.adquiriente.set({
          codigo_tercero_pk: t.codigo_tercero_pk,
          codigo_identificacion_fk: t.codigo_identificacion_fk ?? '',
          numero_identificacion: t.numero_identificacion ?? '',
          nombre_corto: t.nombre_corto ?? '',
        });
        // Como en terbio, queda seleccionada la primera opción disponible.
        const liquidaciones = liquidacionesDisponibles(t);
        this.liquidaciones.set(liquidaciones);
        this.form.controls.tipo_liquidacion.setValue(liquidaciones[0]?.value ?? null);
      });
    forkJoin({ tipos: this.catalogoService.guiaTipos(), tercero: this.catalogoService.tercero() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ tipos, tercero }) => {
        const disponibles = tiposDisponibles(tipos, tercero);
        this.tiposGuia.set(disponibles);
        this.tipos.set(
          disponibles.map((t) => ({
            value: t.codigo_guia_tipo_pk,
            label: t.nombre ?? t.codigo_guia_tipo_pk,
          })),
        );
        // Como en terbio, queda seleccionado el primero; no se pisa si ya eligió uno.
        if (!this.form.controls.codigo_guia_tipo_fk.value) {
          this.form.controls.codigo_guia_tipo_fk.setValue(
            disponibles[0]?.codigo_guia_tipo_pk ?? '',
          );
        }
      });
    forkJoin({
      operaciones: this.catalogoService.operacionesTercero(),
      // Sin configuración igual se listan las operaciones, solo que sin una por defecto.
      configuracion: this.catalogoService.configuracion().pipe(catchError(() => of(null))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ operaciones, configuracion }) => {
        const opciones = operaciones.map((o) => ({
          value: o.codigo_tercero_operacion_pk,
          label: o.nombre ?? o.codigo ?? String(o.codigo_tercero_operacion_pk),
        }));
        this.operaciones.set(opciones);
        this.operacionIngreso.set(configuracion?.codigo_operacion_fk ?? null);
        this.form.controls.codigo_tercero_operacion_fk.setValue(
          operacionPorDefecto(opciones, configuracion?.codigo_tercero_operacion_fk ?? null),
        );
      });
    this.catalogoService
      .productosTercero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.productos.set(opcionesProducto(v)));
    this.catalogoService
      .ciudades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.ciudades.set(v));
    this.catalogoService
      .ciudadOrigen()
      .pipe(
        // Si falla, el interceptor avisa y se muestra que no hay origen para liquidar.
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((origen) => this.origen.set(origen));
    this.consultarCondicionAlCambiar();
    this.liquidarAlCambiar();
  }

  /** Mientras cambian los datos se ocultan las condiciones anteriores, que ya no aplican. */
  private consultarCondicionAlCambiar(): void {
    this.parametrosCondicion$
      .pipe(
        tap(() => this.condicion.set(null)),
        debounceTime(ESPERA_LIQUIDACION_MS),
        switchMap((parametros) =>
          parametros
            ? // Es informativo: si falla, la guía se puede seguir llenando sin él.
              this.guiaService.condicionEspecial(parametros).pipe(catchError(() => of(null)))
            : of(null),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((condicion) => this.condicion.set(condicion?.error ? null : condicion));
  }

  /** Liquida con cada cambio; mientras tanto los valores vuelven a 0, como en terbio. */
  private liquidarAlCambiar(): void {
    this.parametros$
      .pipe(
        tap((parametros) => {
          this.liquidacion.set(null);
          this.liquidadoCon.set(null);
          this.liquidacionRechazada.set(false);
          this.liquidando.set(parametros !== null);
        }),
        debounceTime(ESPERA_LIQUIDACION_MS),
        switchMap((parametros) => {
          if (!parametros) return of({ parametros, liquidacion: null });
          return this.guiaService.liquidar(parametros).pipe(
            map((liquidacion) => ({ parametros, liquidacion })),
            catchError((err: unknown) => {
              // 0, 403, 429 y 500+ ya los avisa el interceptor.
              if (err instanceof HttpErrorResponse && [400, 404, 422].includes(err.status)) {
                this.liquidacionRechazada.set(true);
              }
              return of({ parametros: null, liquidacion: null });
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ parametros, liquidacion }) => {
        this.liquidacion.set(liquidacion);
        this.liquidadoCon.set(liquidacion ? parametros : null);
        this.liquidando.set(false);
      });
  }

  /*
   * Los pesos se ajustan al salir de cada campo, como en terbio, y no mientras se escribe:
   * así el usuario puede digitar un valor y el ajuste aplica cuando termina.
   */

  /** Sin condiciones no hay peso mínimo con qué calcular, y no se pisa lo digitado. */
  alSalirDeUnidades(): void {
    if (!this.condicion()) return;
    const { unidades } = this.form.getRawValue();
    this.form.controls.peso_real.setValue(pesoRealPorUnidades(unidades ?? 0, this.minimosPeso()));
  }

  alSalirDelPesoReal(): void {
    const { peso_real, peso_volumen } = this.form.getRawValue();
    this.form.patchValue(
      pesosAlSalirDelReal(peso_real ?? 0, peso_volumen ?? 0, this.minimosPeso()),
    );
  }

  alSalirDelPesoVolumen(): void {
    const { peso_real, peso_volumen, peso_facturado } = this.form.getRawValue();
    this.form.controls.peso_facturado.setValue(
      facturadoAlSalirDelVolumen(
        peso_volumen ?? 0,
        peso_real ?? 0,
        peso_facturado ?? 0,
        this.minimosPeso(),
      ),
    );
  }

  alSalirDelPesoFacturado(): void {
    const { peso_facturado, unidades, peso_volumen } = this.form.getRawValue();
    this.form.controls.peso_facturado.setValue(
      facturadoAlSalirDelFacturado(
        peso_facturado ?? 0,
        unidades ?? 0,
        peso_volumen ?? 0,
        this.minimosPeso(),
      ),
    );
  }

  abrirNuevoDestinatario(): void {
    const valores = this.form.getRawValue();
    this.destinatarioInicial.set({
      codigo_identificacion_fk: valores.codigo_identificacion_destinatario_fk ?? '',
      numero_identificacion: valores.numero_identificacion_destinatario,
      nombre_corto: valores.nombre_destinatario,
      direccion: valores.direccion_destinatario,
      telefono: valores.telefono_destinatario,
      codigo_ciudad_fk: valores.codigo_ciudad_destino_fk ?? '',
    });
    this.nuevoDestinatarioVisible.set(true);
  }

  /** Llena los datos del destinatario elegido en el buscador o recién creado. */
  usarDestinatario(destinatario: Destinatario): void {
    this.destinatarioElegido.set(destinatario);
    this.form.patchValue({
      codigo_identificacion_destinatario_fk: tipoIdentificacionGuia(
        destinatario.codigo_identificacion_fk,
      ),
      numero_identificacion_destinatario: destinatario.numero_identificacion ?? '',
      nombre_destinatario: destinatario.nombre_corto ?? '',
      direccion_destinatario: destinatario.direccion ?? '',
      telefono_destinatario: destinatario.telefono ?? '',
      codigo_ciudad_destino_fk: destinatario.codigo_ciudad_fk,
    });
    // Si el tipo quedó sin elegir, se avisa de una vez en lugar de esperar a guardar.
    this.form.controls.codigo_identificacion_destinatario_fk.markAsTouched();
  }

  /** Mensaje de error de un control, o `null` si es válido o no se ha tocado. */
  errorDe(nombre: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[nombre];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('min')) return `El valor mínimo es ${control.errors?.['min'].min}.`;
    if (control.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres.`;
    }
    return 'Valor inválido.';
  }

  /** Valida el formulario. El guardado aún no está conectado a `POST /tte/guia/nuevo`. */
  onSubmit(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Revisa los campos marcados antes de guardar.');
      return;
    }

    const tipo = this.tiposGuia().find(
      (t) => t.codigo_guia_tipo_pk === this.form.controls.codigo_guia_tipo_fk.value,
    );
    if (exigeFlete(tipo) && this.flete() <= 0) {
      this.errorMessage.set('La guía debe tener un flete.');
      return;
    }

    const tercero = this.tercero();
    const origen = this.origen();
    const operacionIngreso = this.operacionIngreso();
    if (!tercero || !origen || !operacionIngreso) {
      this.errorMessage.set(
        'Tu usuario no tiene una operación de ingreso y un origen configurados.',
      );
      return;
    }
    // Se guardan los valores que ve el usuario; a medio liquidar estarían en 0 o desfasados.
    if (this.liquidando() || !this.liquidacionAlDia()) {
      this.errorMessage.set('Espera a que termine de calcular los valores.');
      return;
    }

    this.errorMessage.set(null);
    this.guardando.set(true);
    this.guiaService
      .crear(
        cuerpoGuiaNueva(this.form.getRawValue(), {
          tercero,
          operacionIngreso,
          origen,
          ciudades: this.ciudades(),
          flete: this.flete(),
          manejo: this.manejo(),
          destinatario: this.destinatarioElegido(),
        }),
      )
      .pipe(
        finalize(() => this.guardando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ codigo_guia_pk }) => {
          this.toastService.success('Guía creada', `Se creó la guía ${codigo_guia_pk}.`);
          this.router.navigateByUrl(ROUTE_PATHS.dashboard.transporte.guiaDetalle(codigo_guia_pk));
        },
        error: (err: unknown) => {
          // 0, 403, 429 y 500+ ya los avisa el interceptor.
          if (err instanceof HttpErrorResponse && [400, 404, 409, 422].includes(err.status)) {
            const detalle = err.error?.detail;
            this.errorMessage.set(
              typeof detalle === 'string' ? detalle : 'No se pudo guardar la guía con estos datos.',
            );
          }
        },
      });
  }
}
