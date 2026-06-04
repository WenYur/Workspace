// feat(ui-lib): expose public API — single entry point for all consumers

/**
 * Public API Surface of ui-lib
 *
 * Esta es la ÚNICA forma válida de importar desde ui-lib.
 * Cualquier importación desde rutas internas (../lib/button/...) rompe
 * el encapsulamiento y acopla al consumidor con la estructura interna.
 */

// Componentes de UI
export { UiButtonComponent } from './lib/button/ui-button.component';
export { UiCardComponent } from './lib/card/ui-card.component';
export { UiSelectComponent } from './lib/select/ui-select.component';
export { UiTableComponent } from './lib/table/ui-table.component';

// Interfaces compartidas — el consumidor las necesita para tipar sus handlers
export type { SelectOption, TableColumn, TableAction } from './lib/models/index';
