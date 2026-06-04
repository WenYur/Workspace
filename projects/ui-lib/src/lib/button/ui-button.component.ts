// feat(ui-lib): add UiButtonComponent with signals API and OnPush

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Botón reutilizable temático Rick & Morty.
 * Usa la Signals API (input/output) y OnPush para máxima eficiencia.
 *
 * @example
 * <ui-button
 *   label="Ver personaje"
 *   variant="primary"
 *   size="md"
 *   (clicked)="onVerClick()"
 * />
 */
@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './ui-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  /**
   * Texto visible dentro del botón.
   * @required
   */
  label = input.required<string>();

  /**
   * Variante visual que determina el esquema de colores.
   * - `primary`: fondo verde portal (#00ff41), texto negro — acción principal
   * - `secondary`: borde verde, fondo transparente — acción secundaria
   * - `danger`: fondo rojo (#e94560), texto blanco — acciones destructivas
   */
  variant = input<'primary' | 'secondary' | 'danger'>('primary');

  /**
   * Controla el padding y el tamaño de fuente del botón.
   * - `sm`: text-sm px-3 py-1
   * - `md`: text-base px-4 py-2
   * - `lg`: text-lg px-6 py-3
   */
  size = input<'sm' | 'md' | 'lg'>('md');

  /**
   * Cuando es `true`, bloquea los clics y aplica opacity-50 + cursor-not-allowed.
   * El evento `clicked` NO se emite en este estado.
   */
  disabled = input<boolean>(false);

  /**
   * Cuando es `true`, muestra un spinner SVG animado y bloquea la interacción.
   * El evento `clicked` NO se emite en este estado.
   */
  loading = input<boolean>(false);

  /**
   * Se emite al hacer clic sólo si `!disabled() && !loading()`.
   * El componente padre decide la lógica de negocio.
   */
  clicked = output<void>();

  /** Delega al output solo cuando el estado lo permite */
  protected handleClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }

  /** Clases Tailwind según variante — computed para evitar re-evaluación innecesaria */
  protected get variantClasses(): string {
    const map: Record<'primary' | 'secondary' | 'danger', string> = {
      primary:
        'bg-[#00ff41] text-[#0a0a0f] hover:brightness-90 focus-visible:ring-[#00ff41]',
      secondary:
        'bg-transparent border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10',
      danger:
        'bg-[#e94560] text-white hover:brightness-90 focus-visible:ring-[#e94560]',
    };
    return map[this.variant()];
  }

  protected get sizeClasses(): string {
    const map: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'text-sm px-3 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    };
    return map[this.size()];
  }

  protected get stateClasses(): string {
    return this.disabled() || this.loading()
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';
  }
}
