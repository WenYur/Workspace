# Development Log

## Decisiones de arquitectura

### 1. Angular 21 en lugar de Angular 17 exacto

**Decisión:** Se usó Angular CLI 21.2.13 (la versión disponible en el entorno).

**Justificación:** El enunciado dice "Angular 17+" — Angular 21 cumple este requisito
y tiene soporte completo de Signals API (`input()`, `output()`, `model()`, `computed()`).
Angular 21 también adopta componentes standalone por defecto (sin necesidad de
declarar `standalone: true`), reduciendo el boilerplate.

**Diferencias notables vs Angular 17:**
- El componente raíz se genera como `app.ts` / `app.html` (sin `.component.` en el nombre)
- La clase se llama `App` en lugar de `AppComponent`
- `provideBrowserGlobalErrorListeners()` reemplaza el handler de errores manual

---

### 2. Signals API sobre RxJS para estado del servicio

**Decisión:** `ResourceService` usa `signal()`, `computed()` y `.asReadonly()` en lugar
de `BehaviorSubject` + `Observable`.

**Justificación:**
- Integración nativa con `ChangeDetectionStrategy.OnPush`: cuando una señal cambia,
  Angular sabe exactamente qué componente re-renderizar sin marcar el árbol completo.
- Sin riesgo de memory leaks: los componentes no se subscriben, simplemente leen
  la señal en el template con `()`.
- Código más legible: `resourceService.loading()` es más claro que
  `resourceService.loading$ | async`.

**Trade-off:** RxJS operators (`switchMap`, `debounceTime`) serían más potentes para
casos complejos como cancelación de peticiones. Para este ejercicio, la simplicidad
de signals es la elección correcta.

---

### 3. Tabla genérica con `T extends Record<string, unknown>`

**Decisión:** `UiTableComponent<T extends Record<string, unknown>>` en lugar de
una tabla específica para cada recurso.

**Justificación:** Si la tabla conociera Character, Episode y Location, habría que
modificar `ui-lib` cada vez que se añada un nuevo recurso en `demo-app`. Con el
genérico, la tabla es reutilizable en cualquier proyecto del workspace.

**Reto encontrado:** TypeScript con strict mode no permite asignar `unknown[]` a `T[]`
directamente. Solución: el servicio expone `rows` como `Record<string, unknown>[]`
(cast seguro desde los resultados de la API), que satisface el constraint `T extends
Record<string, unknown>`.

---

### 4. `model()` en UiSelect para two-way binding

**Decisión:** `value = model<string | null>(null)` en lugar del patrón clásico
`@Input() value` + `@Output() valueChange`.

**Justificación:** `model()` elimina el boilerplate y comunica la intención al lector:
este campo es bidireccional. El padre usa `[(value)]="miSeñal"` de forma idiomática.

**Explicación interna:** `model()` genera internamente un `InputSignal` y un output
`valueChange`. Cuando el hijo hace `this.value.set(x)`, Angular emite `valueChange`
hacia el padre, actualizando su señal. No hay `EventEmitter` ni `Subject`.

---

### 5. public-api.ts como contrato de la librería

**Decisión:** `demo-app` solo importa desde `'ui-lib'` (que resuelve a `public-api.ts`),
nunca desde rutas internas como `'ui-lib/src/lib/button/...'`.

**Justificación:** Si la librería refactoriza su estructura interna (mover archivos,
renombrar carpetas), los consumidores no se ven afectados — solo cambia lo interno
de `ui-lib`, no el contrato público. Angular CLI enforza esto en build de producción
a través de `ng-package.json`.

---

### 6. Tailwind con content scan de ui-lib

**Decisión:** `tailwind.config.js` en la raíz del workspace escanea tanto
`projects/demo-app/src/**/*.{html,ts}` como `projects/ui-lib/src/**/*.{html,ts}`.

**Justificación:** Los componentes de `ui-lib` usan clases Tailwind en sus templates.
Sin incluirlos en el content scan, Tailwind no generaría esas clases y los estilos
quedarían rotos. En monorepos Angular, es el patrón estándar.

**Trade-off:** Si `ui-lib` se publicara como paquete npm independiente, necesitaría
su propia estrategia de CSS (CSS nativo, variables CSS, o bundling de Tailwind).
Para este workspace esto no es necesario.

---

### 7. Ruta dual en tsconfig.json para ui-lib

**Decisión:**
```json
"paths": {
  "ui-lib": ["./dist/ui-lib", "./projects/ui-lib/src/public-api"]
}
```

**Justificación:** Con solo `./dist/ui-lib`, el desarrollador necesita ejecutar
`ng build ui-lib` antes de `ng serve demo-app`. Agregando el source como segundo
path, TypeScript resuelve los tipos directamente desde el código fuente durante
desarrollo. En producción, `./dist/ui-lib` tiene prioridad.

---

## Retos encontrados y soluciones

| Reto | Solución |
|---|---|
| Angular 21 genera `app.ts` sin `.component.` | Adaptar al nuevo naming convention, mantener todo el comportamiento requerido |
| `unknown[]` no asignable a `T[]` con strict mode | Cast explícito en el servicio: `results as unknown as Record<string, unknown>[]` |
| Tailwind arbitrarios en ui-lib no generados | Incluir `projects/ui-lib/src/**/*.{html,ts}` en el content array del config |
| `model()` necesita que el padre también use señales | El `selectedStatus` y `selectedResource` en App son `signal()`, permitiendo `[(value)]` |
| Type narrowing de `ModalRow` en templates | `computed()` signals para each type: `character()`, `episode()`, `location()` |

---

## Uso de IA (Claude)

**Prompt base:** Revision del codigo de la prueba con respecto al enunciado
 completo de la prueba técnica con las 12 fases, reglas
absolutas, estructura de archivos y especificación de cada componente.
Adicional apoyo en el desarrollo del Readme y develoment_LOG

**Lo que se aceptó tal cual:**
- Estructura de carpetas y nombres de archivo
- Interfaces de modelos (SelectOption, TableColumn, TableAction, ApiResponse, etc.)
- Patrón signals-service (servicio como única fuente de verdad HTTP)
- La lógica de `getCellValue` con soporte de notación de punto

**Lo que se adaptó:**
- Naming de componentes: `app.component.ts` → `app.ts` (Angular 21 convention)
- `tailwind.config.js` en raíz del workspace en lugar de `projects/demo-app/src/`
  (ubicación correcta para que el build de Angular lo detecte automáticamente)
- Ruta dual en tsconfig.json (no estaba en el enunciado, pero necesaria para DX)
- `provideBrowserGlobalErrorListeners()` en app.config.ts (nuevo en Angular 21)
- Type guards para narrowing en el modal (`isCharacter`, `isEpisode`, `isLocation`)

**Por qué se aceptaron esas adaptaciones:**
Cada cambio tiene una justificación técnica concreta: convenio del framework, ubicación
correcta de config, compatibilidad con el modo strict. No se aceptó ningún cambio
que relajara las reglas del enunciado (no se usó `any`, no se usó `@Input`/@Output`,
todos los componentes tienen `OnPush`).
