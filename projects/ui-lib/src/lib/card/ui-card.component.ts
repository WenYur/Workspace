// feat(ui-lib): add UiCardComponent with content projection and OnPush

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Tarjeta contenedora temática Rick & Morty.
 * Soporta proyección de contenido en el body y en el footer (named slot).
 *
 * @example
 * <ui-card title="Rick Sanchez" subtitle="Personaje" elevation="raised">
 *   <p>Especie: Human</p>
 *   <ui-button slot="card-footer" label="Cerrar" variant="secondary" />
 * </ui-card>
 */
@Component({
  selector: 'ui-card',
  imports: [],
  templateUrl: './ui-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {
  /**
   * Título principal mostrado en el header de la card.
   * @required
   */
  title = input.required<string>();

  /**
   * Subtítulo opcional bajo el título principal.
   * Cuando es `null`, el elemento subtitle no se renderiza.
   */
  subtitle = input<string | null>(null);

  /**
   * Nivel de elevación visual:
   * - `flat`:     sin sombra, fondo oscuro #1a1a2e — para información secundaria
   * - `raised`:   sombra verde suave, fondo #16213e — card principal (default)
   * - `outlined`: solo borde 1px verde, fondo transparente — variante discreta
   */
  elevation = input<'flat' | 'raised' | 'outlined'>('raised');

  /**
   * Emite void cuando el usuario hace clic sobre el header de la card.
   * Útil para casos de selección o expansión.
   */
  headerClicked = output<void>();

  protected get elevationClasses(): string {
    const map: Record<'flat' | 'raised' | 'outlined', string> = {
      flat: 'bg-[#1a1a2e] shadow-none',
      raised: 'bg-[#16213e] shadow-[0_4px_20px_rgba(0,255,65,0.15)]',
      outlined: 'bg-transparent border border-[#00ff41]',
    };
    return map[this.elevation()];
  }
}
