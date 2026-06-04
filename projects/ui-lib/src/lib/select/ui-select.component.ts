// feat(ui-lib): add UiSelectComponent with model() two-way binding and OnPush

import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { SelectOption } from '../models';

/**
 * Select desplegable temático Rick & Morty con soporte de skeleton, dos-way binding y filtrado.
 *
 * @example
 * <!-- Two-way binding con model() -->
 * <ui-select
 *   label="Recurso"
 *   [options]="resourceOptions"
 *   [(value)]="selectedResource"
 *   (selectionChange)="onResourceChange($event)"
 * />
 */
@Component({
  selector: 'ui-select',
  imports: [],
  templateUrl: './ui-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelectComponent {
  /**
   * Lista de opciones renderizadas en el desplegable.
   * Cada opción es `{ label: string; value: string }`.
   * @required
   */
  options = input.required<SelectOption[]>();

  /**
   * Etiqueta visible sobre el select, describe qué se está filtrando.
   * @required
   */
  label = input.required<string>();

  /**
   * Texto mostrado cuando ninguna opción está seleccionada.
   * Corresponde a `value = null`.
   */
  placeholder = input<string>('Seleccionar...');

  /**
   * Cuando es `true`, oculta el select nativo y muestra un skeleton animado
   * para indicar que las opciones se están cargando.
   */
  loading = input<boolean>(false);

  /**
   * Cuando es `true`, el select queda inaccesible: opacity-50 + cursor-not-allowed.
   */
  disabled = input<boolean>(false);

  /**
   * Señal bidireccional del valor seleccionado actualmente.
   * Usar con `[(value)]` en el padre para sincronización automática.
   *
   * ¿Por qué model() y no input() + output()?
   * model() crea internamente el par input/output y gestiona la sincronización
   * automáticamente, eliminando el boilerplate de un intermediario en el padre.
   */
  value = model<string | null>(null);

  /**
   * Emite el objeto SelectOption completo al cambiar la selección.
   * A diferencia de `value` (que solo emite el string), este output entrega
   * el label y el value para que el padre pueda mostrar o procesar el nombre.
   */
  selectionChange = output<SelectOption>();

  /** Sincroniza model y emite selectionChange cuando el usuario cambia la selección */
  protected onSelectChange(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    const newValue = selectEl.value !== '' ? selectEl.value : null;

    // Actualizar la señal bidireccional — propaga automáticamente al padre
    this.value.set(newValue);

    if (newValue !== null) {
      const selectedOption = this.options().find((opt) => opt.value === newValue);
      if (selectedOption) {
        this.selectionChange.emit(selectedOption);
      }
    }
  }
}
