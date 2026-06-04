# Rick & Morty Explorer — Angular Workspace

Prueba técnica de pasantía — Angular 21 + Signals API + Tailwind CSS v3

Aplicación que consume la [Rick and Morty API](https://rickandmortyapi.com/) para explorar personajes, episodios y locaciones, construida sobre un workspace Angular con una librería de componentes reutilizables (`ui-lib`) y una aplicación consumidora (`demo-app`).

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Node.js | 20.x o superior | `node -v` |
| npm | 11.x o superior | `npm -v` |
| Angular CLI | 21.x | `ng version` |

> Si no tienes Angular CLI instalado globalmente:
> ```bash
> npm install -g @angular/cli@21
> ```

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/WenYur/rick-morty-explorer.git
cd rick-morty-explorer
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar la aplicación

```bash
ng serve demo-app
```

La aplicación estará disponible en **[http://localhost:4200](http://localhost:4200)**.

> **Nota:** No es necesario compilar `ui-lib` antes de servir la aplicación.  
> El `tsconfig.json` del workspace incluye un path fallback a `./projects/ui-lib/src/public-api`  
> para que Angular resuelva los componentes de la librería directamente desde el código fuente.

---

## Build de producción

```bash
# 1. Compilar la librería primero
ng build ui-lib

# 2. Compilar la aplicación
ng build demo-app
```

Los artefactos se generan en `/dist`.

---

## Arquitectura del workspace

```
my-workspace/
├── projects/
│   ├── ui-lib/                    ← Librería de componentes reutilizables
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── button/        ui-button: botón con variantes y spinner
│   │       │   ├── card/          ui-card: tarjeta con content projection
│   │       │   ├── select/        ui-select: desplegable con skeleton y model()
│   │       │   ├── table/         ui-table: tabla genérica con 3 estados
│   │       │   └── models/        interfaces compartidas (SelectOption, etc.)
│   │       └── public-api.ts      ← ÚNICA puerta de entrada a la librería
│   │
│   └── demo-app/                  ← Aplicación consumidora
│       └── src/app/
│           ├── core/services/     resource.service.ts — HTTP + signals
│           ├── models/            rick-morty.models.ts — interfaces tipadas
│           ├── components/        resource-modal — modal de detalle
│           ├── app.ts             componente raíz
│           └── app.config.ts      proveedores (HttpClient)
│
├── angular.json
├── package.json
├── tailwind.config.js             ← Configuración Tailwind para todo el workspace
└── tsconfig.json                  ← strict: true, paths hacia ui-lib
```

### Principios de diseño

| Principio | Implementación |
|---|---|
| **Separación de responsabilidades** | `ui-lib` no conoce el dominio Rick & Morty; `demo-app` no importa desde rutas internas de ui-lib |
| **Signals API** | `input()`, `output()`, `model()`, `computed()`, `signal()` en todos los componentes y servicio |
| **OnPush en todos los componentes** | El árbol de detección de cambios solo actúa cuando una señal cambia |
| **TypeScript strict** | `strict: true`, `noImplicitAny`, sin uso de `any` |
| **HTTP solo en servicios** | `ResourceService` es el único punto de acceso a la API |

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 21.2 | Framework principal |
| TypeScript | 5.9 | Tipado estático |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| RxJS | 7.8 | Manejo de streams HTTP |
| ng-packagr | 21.2 | Compilación de la librería |
| Vitest | 4.0 | Testing unitario |

---

## API de componentes (`ui-lib`)

### `<ui-button>`

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | **required** | Texto del botón |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Esquema de colores |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `disabled` | `boolean` | `false` | Bloquea interacción |
| `loading` | `boolean` | `false` | Muestra spinner |

| Output | Tipo | Descripción |
|---|---|---|
| `clicked` | `void` | Emite solo si `!disabled && !loading` |

```html
<ui-button label="Guardar" variant="primary" (clicked)="save()" />
<ui-button label="Cargando..." [loading]="true" />
```

---

### `<ui-card>`

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | **required** | Título del header |
| `subtitle` | `string \| null` | `null` | Subtítulo opcional |
| `elevation` | `'flat' \| 'raised' \| 'outlined'` | `'raised'` | Nivel de sombra |

| Output | Tipo | Descripción |
|---|---|---|
| `headerClicked` | `void` | Emite al hacer clic en el header |

```html
<ui-card title="Rick Sanchez" subtitle="Human" elevation="raised">
  <p>Contenido proyectado aquí</p>
  <button card-footer>Footer opcional</button>
</ui-card>
```

---

### `<ui-select>`

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `options` | `SelectOption[]` | **required** | Lista de opciones |
| `label` | `string` | **required** | Etiqueta accesible |
| `placeholder` | `string` | `'Seleccionar...'` | Texto vacío |
| `loading` | `boolean` | `false` | Muestra skeleton |
| `disabled` | `boolean` | `false` | Bloquea interacción |

| Model (two-way) | Tipo | Default |
|---|---|---|
| `value` | `string \| null` | `null` |

| Output | Tipo | Descripción |
|---|---|---|
| `selectionChange` | `SelectOption` | Objeto completo seleccionado |

```html
<ui-select
  label="Recurso"
  [options]="options"
  [(value)]="selectedValue"
  (selectionChange)="onSelect($event)"
/>
```

---

### `<ui-table>`

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `columns` | `TableColumn[]` | `[]` | Definición de columnas |
| `rows` | `T[]` | `[]` | Filas de datos (genérico) |
| `loading` | `boolean` | `false` | Skeleton de 5 filas |
| `emptyMessage` | `string` | `'No hay resultados'` | Mensaje vacío |
| `errorMessage` | `string \| null` | `null` | Banner de error |

| Output | Tipo | Descripción |
|---|---|---|
| `actionTriggered` | `TableAction<T>` | `{ action: 'view' \| 'delete', row: T }` |

```html
<ui-table
  [columns]="[{ key: 'name', header: 'Nombre' }]"
  [rows]="data"
  [loading]="isLoading"
  (actionTriggered)="handleAction($event)"
/>
```

---

## Modelos compartidos

```typescript
interface SelectOption   { label: string; value: string; }
interface TableColumn    { key: string; header: string; }
interface TableAction<T> { action: 'view' | 'delete'; row: T; }

// demo-app
type ResourceType  = 'character' | 'episode' | 'location';
type StatusFilter  = 'alive' | 'dead' | 'unknown' | '';
```

---

## Flujo de datos

```
Usuario selecciona recurso/filtro
        ↓
   App (app.ts)
        ↓ setResource() / setStatus()
  ResourceService
        ↓ httpResource() — Angular HTTP + Signals
   Rick & Morty API
        ↓ datos reactivos
   ui-table (vía computed())
        ↓ click "Ver"
  ResourceModal
```

`ResourceService` usa `httpResource()` de Angular para hacer fetch reactivo.  
Cuando cambia el recurso o el filtro, la señal se actualiza y la tabla re-renderiza automáticamente sin suscripciones manuales.
