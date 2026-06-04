// feat(ui-lib): add generic UiTableComponent with skeleton, empty and error states

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableAction, TableColumn } from '../models';

/**
 * Tabla de datos genérica y agnóstica al dominio.
 *
 * El tipo genérico `T` representa la forma de cada fila. La tabla no importa
 * ningún modelo de negocio: solo renderiza columnas y emite acciones.
 *
 * ¿Por qué genérica?
 * Sin genérico, la tabla debería saber sobre Characters, Episodes, Locations, etc.
 * Con `T`, el padre pasa la forma de los datos y la tabla funciona para cualquier
 * entidad del sistema sin modificaciones.
 *
 * @example
 * <ui-table
 *   [columns]="cols"
 *   [rows]="characters"
 *   [loading]="isLoading"
 *   (actionTriggered)="handleAction($event)"
 * />
 */
@Component({
  selector: 'ui-table',
  imports: [],
  templateUrl: './ui-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableComponent<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Definición de columnas: qué clave leer del objeto y qué título mostrar.
   * Soporta notación de punto para propiedades anidadas: `key: 'origin.name'`.
   */
  columns = input<TableColumn[]>([]);

  /**
   * Arreglo de filas a renderizar. El tipo genérico T garantiza coherencia
   * con el tipo de `actionTriggered`.
   */
  rows = input<T[]>([]);

  /**
   * Cuando es `true`, muestra 5 filas skeleton en lugar de los datos reales.
   * Debe activarse antes de iniciar la petición HTTP y desactivarse al terminar.
   */
  loading = input<boolean>(false);

  /**
   * Mensaje mostrado cuando `rows` está vacío y `loading` es `false`.
   */
  emptyMessage = input<string>('No hay resultados');

  /**
   * Cuando no es `null`, muestra un banner de error rojo con el mensaje.
   * Oculta la tabla completa durante el estado de error.
   */
  errorMessage = input<string | null>(null);

  /**
   * Emite cada vez que el usuario pulsa "Ver" o "Eliminar" en una fila.
   * El tipo `TableAction<T>` incluye tanto la acción como la fila completa.
   *
   * @example
   * handleAction(event: TableAction<Character>): void {
   *   if (event.action === 'view') this.openModal(event.row);
   *   if (event.action === 'delete') this.confirmDelete(event.row);
   * }
   */
  actionTriggered = output<TableAction<T>>();

  /** Filas ficticias para el skeleton: 5 es suficiente para dar sensación de contenido */
  protected readonly skeletonRows = Array.from({ length: 5 });

  /**
   * Accede a un valor de fila de forma segura, soportando notación de punto.
   * Ej: getCellValue(row, 'origin.name') → row.origin.name
   */
  protected getCellValue(row: T, key: string): unknown {
    return key.split('.').reduce((current: unknown, segment: string): unknown => {
      if (current !== null && current !== undefined && typeof current === 'object') {
        return (current as Record<string, unknown>)[segment];
      }
      return undefined;
    }, row as unknown);
  }

  protected emitView(row: T): void {
    this.actionTriggered.emit({ action: 'view', row });
  }

  protected emitDelete(row: T): void {
    this.actionTriggered.emit({ action: 'delete', row });
  }
}
