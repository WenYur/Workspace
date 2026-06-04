// feat(demo-app): add ResourceModal component using UiCard and UiButton from ui-lib

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { UiButtonComponent, UiCardComponent } from 'ui-lib';
import { Character, Episode, Location } from '../../models/rick-morty.models';

/** Unión de los tres tipos de recursos que puede mostrar el modal */
export type ModalRow = Character | Episode | Location;

/**
 * Verifica en runtime si la fila es un Character (tiene campo 'status').
 * Necesario porque en el template no podemos usar instanceof con interfaces.
 */
function isCharacter(row: ModalRow): row is Character {
  return 'status' in row && 'species' in row;
}

function isEpisode(row: ModalRow): row is Episode {
  return 'episode' in row && 'air_date' in row;
}

function isLocation(row: ModalRow): row is Location {
  return 'type' in row && 'dimension' in row;
}

/**
 * Modal de detalle para un registro de la API de Rick & Morty.
 * Se activa cuando el usuario pulsa "Ver" en la tabla.
 *
 * Usa ui-card como contenedor y ui-button para la acción de cierre.
 * Solo importa desde 'ui-lib' (public-api), nunca desde rutas internas.
 *
 * @example
 * <app-resource-modal
 *   [row]="selectedRow"
 *   (closeModal)="selectedRow = null"
 * />
 */
@Component({
  selector: 'app-resource-modal',
  imports: [UiCardComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop oscuro: clic fuera cierra el modal -->
    <div
      class="fixed inset-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-sm flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
      role="dialog"
      [attr.aria-modal]="true"
      [attr.aria-label]="'Detalle de ' + row().name"
    >
      <!-- Contenedor del modal — stopPropagation evita que el clic llegue al backdrop -->
      <div
        class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl z-50"
        (click)="$event.stopPropagation()"
      >
        <ui-card [title]="row().name" [subtitle]="cardSubtitle()" elevation="raised">

          <!-- Contenido según el tipo de recurso -->
          <div class="space-y-3 text-sm text-[#e0e0e0]">

            @if (character(); as c) {
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Estado</span>
                  <span [class]="statusClass(c.status)">{{ c.status }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Especie</span>
                  <span>{{ c.species }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Género</span>
                  <span>{{ c.gender }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Origen</span>
                  <span>{{ c.origin.name }}</span>
                </div>
                <div class="col-span-2 flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Ubicación actual</span>
                  <span>{{ c.location.name }}</span>
                </div>
                <div class="col-span-2 flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Episodios</span>
                  <span>{{ c.episode.length }} apariciones</span>
                </div>
              </div>
              <img [src]="c.image" [alt]="c.name" class="w-full rounded-lg mt-2 border border-[#00ff41]/20" />
            }

            @if (episode(); as e) {
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Código</span>
                  <span class="text-[#00ff41] font-mono">{{ e.episode }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Emisión</span>
                  <span>{{ e.air_date }}</span>
                </div>
                <div class="col-span-2 flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Personajes</span>
                  <span>{{ e.characters.length }} apariciones</span>
                </div>
              </div>
            }

            @if (location(); as l) {
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Tipo</span>
                  <span>{{ l.type || 'Desconocido' }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Dimensión</span>
                  <span>{{ l.dimension || 'Desconocida' }}</span>
                </div>
                <div class="col-span-2 flex flex-col gap-1">
                  <span class="text-[#8892b0] text-xs uppercase tracking-wider">Residentes</span>
                  <span>{{ l.residents.length }} personajes</span>
                </div>
              </div>
            }
          </div>

          <!-- Footer proyectado en el named slot de ui-card -->
          <div card-footer class="flex justify-end">
            <ui-button
              label="Cerrar"
              variant="secondary"
              size="sm"
              (clicked)="closeModal.emit()"
            />
          </div>
        </ui-card>
      </div>
    </div>
  `,
})
export class ResourceModalComponent {
  /**
   * Fila del recurso seleccionado en la tabla.
   * El tipo ModalRow cubre Character, Episode y Location.
   */
  row = input.required<ModalRow>();

  /** Emite cuando el usuario solicita cerrar el modal */
  closeModal = output<void>();

  /** Computed signals para type narrowing en el template */
  protected character = computed(() => {
    const r = this.row();
    return isCharacter(r) ? r : null;
  });

  protected episode = computed(() => {
    const r = this.row();
    return isEpisode(r) ? r : null;
  });

  protected location = computed(() => {
    const r = this.row();
    return isLocation(r) ? r : null;
  });

  /** Subtítulo dinámico según el tipo de recurso */
  protected cardSubtitle = computed<string>(() => {
    const r = this.row();
    if (isCharacter(r)) return `${r.species} · ${r.status}`;
    if (isEpisode(r)) return r.episode;
    if (isLocation(r)) return r.type || 'Ubicación';
    return '';
  });

  /** Color del badge de estado del personaje */
  protected statusClass(status: Character['status']): string {
    const map: Record<Character['status'], string> = {
      Alive: 'text-[#00ff41] font-semibold',
      Dead: 'text-[#e94560] font-semibold',
      unknown: 'text-[#8892b0]',
    };
    return map[status];
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }
}
