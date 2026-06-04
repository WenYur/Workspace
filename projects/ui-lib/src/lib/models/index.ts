// feat(ui-lib): add shared model interfaces for ui-lib components

/**
 * Representa una opción en un select desplegable.
 * @example { label: 'Characters', value: 'character' }
 */
export interface SelectOption {
  /** Texto visible en la lista desplegable */
  label: string;
  /** Valor interno enviado al cambiar la selección */
  value: string;
}

/**
 * Define la metadata de una columna en la tabla genérica.
 * Desacopla la estructura de datos del renderizado visual.
 */
export interface TableColumn {
  /** Clave del objeto fuente; soporta notación de punto para propiedades anidadas (ej. 'origin.name') */
  key: string;
  /** Encabezado visible en la cabecera de la columna */
  header: string;
}

/**
 * Evento emitido por ui-table al hacer clic en Ver o Eliminar.
 * El tipo genérico T permite a la tabla permanecer agnóstica al dominio.
 *
 * @example
 * handleAction(event: TableAction<Character>): void {
 *   if (event.action === 'view') openModal(event.row);
 * }
 */
export interface TableAction<T = unknown> {
  /** Tipo de acción ejecutada por el usuario */
  action: 'view' | 'delete';
  /** Fila completa sobre la que se ejecutó la acción */
  row: T;
}
