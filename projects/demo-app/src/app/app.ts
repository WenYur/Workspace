// feat(demo-app): implement App component with resource filtering and modal

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  SelectOption,
  TableAction,
  TableColumn,
  UiSelectComponent,
  UiTableComponent,
} from 'ui-lib';
import { ResourceModalComponent, ModalRow } from './components/resource-modal/resource-modal.component';
import { ResourceService } from './core/services/resource.service';
import { ResourceType, StatusFilter } from './models/rick-morty.models';

/** Opciones fijas del selector de recurso */
const RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Characters', value: 'character' },
  { label: 'Episodes', value: 'episode' },
  { label: 'Locations', value: 'location' },
];

/** Opciones del filtro de status — solo aplica a Characters */
const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Alive', value: 'alive' },
  { label: 'Dead', value: 'dead' },
  { label: 'Unknown', value: 'unknown' },
];

/** Columnas por tipo de recurso — definen qué mostrar en la tabla genérica */
const COLUMNS_BY_RESOURCE: Record<ResourceType, TableColumn[]> = {
  character: [
    { key: 'name', header: 'Nombre' },
    { key: 'status', header: 'Estado' },
    { key: 'species', header: 'Especie' },
    { key: 'origin.name', header: 'Origen' },
  ],
  episode: [
    { key: 'name', header: 'Nombre' },
    { key: 'episode', header: 'Código' },
    { key: 'air_date', header: 'Emisión' },
  ],
  location: [
    { key: 'name', header: 'Nombre' },
    { key: 'type', header: 'Tipo' },
    { key: 'dimension', header: 'Dimensión' },
  ],
};

/**
 * Componente raíz de demo-app.
 *
 * Orquesta la interacción entre el servicio de datos (ResourceService)
 * y los componentes de UI (ui-lib). No contiene lógica HTTP.
 *
 * Todos los imports son exclusivamente desde 'ui-lib' (public-api),
 * nunca desde rutas internas de la librería.
 */
@Component({
  selector: 'app-root',
  imports: [
    UiSelectComponent,
    UiTableComponent,
    ResourceModalComponent,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly resourceService = inject(ResourceService);

  // ─── Opciones estáticas ───────────────────────────────────────────────────
  protected readonly resourceOptions = RESOURCE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  // ─── Estado local del componente ─────────────────────────────────────────

  /** Valor del select de recurso — sincronizado con el servicio */
  protected selectedResource = signal<string | null>('character');

  /** Valor del select de status — se resetea al cambiar el recurso */
  protected selectedStatus = signal<string | null>(null);

  /** Fila seleccionada para el modal — null cuando el modal está cerrado */
  protected selectedRow = signal<ModalRow | null>(null);

  // ─── Computeds ───────────────────────────────────────────────────────────

  /** Columnas dinámicas según el recurso activo en el servicio */
  protected activeColumns = computed<TableColumn[]>(
    () => COLUMNS_BY_RESOURCE[this.resourceService.resource()],
  );

  /** Controla si el filtro de status está habilitado */
  protected isStatusEnabled = computed(
    () => this.resourceService.isStatusFilterActive(),
  );

  ngOnInit(): void {
    // El servicio ya inicia el fetch en su constructor — no es necesario llamar fetchData aquí
  }

  /** Cambia el recurso activo y resetea el filtro de status en la UI */
  protected onResourceChange(option: SelectOption): void {
    this.selectedStatus.set(null);
    this.resourceService.setResource(option.value as ResourceType);
  }

  /** Aplica el filtro de status solo cuando el recurso es 'character' */
  protected onStatusChange(option: SelectOption): void {
    this.resourceService.setStatus(option.value as StatusFilter);
  }

  /**
   * Maneja las acciones emitidas por la tabla (Ver / Eliminar).
   * El componente no conoce el tipo concreto de la fila — el servicio lo gestiona.
   */
  protected handleAction(event: TableAction<Record<string, unknown>>): void {
    if (event.action === 'view') {
      this.selectedRow.set(event.row as unknown as ModalRow);
    }

    if (event.action === 'delete') {
      const name = (event.row['name'] as string | undefined) ?? 'este elemento';
      if (confirm(`¿Eliminar ${name}?`)) {
        console.log('[demo-app] Eliminar:', event.row);
      }
    }
  }

  protected closeModal(): void {
    this.selectedRow.set(null);
  }
}
