// feat(demo-app): add ResourceService with signals state management and HttpClient

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ApiResponse,
  Character,
  Episode,
  Location,
  ResourceType,
  StatusFilter,
} from '../../models/rick-morty.models';

/** URL base de la API pública de Rick & Morty */
const API_BASE = 'https://rickandmortyapi.com/api';

/**
 * Servicio central de datos: gestiona el recurso activo, los filtros
 * y las peticiones HTTP a la API de Rick & Morty.
 *
 * PATRÓN: Los componentes NUNCA llaman HTTP directamente.
 * Solo leen los signals públicos y llaman los métodos públicos.
 * Esto centraliza la lógica de fetching, facilita pruebas y evita
 * peticiones duplicadas si múltiples componentes necesitan los mismos datos.
 *
 * ¿Por qué signals y no BehaviorSubject?
 * - Sin operadores RxJS que aprender
 * - Integración nativa con OnPush y la plantilla Angular
 * - Computed signals derivan estado sin subscripciones manuales
 * - Sin riesgo de memory leaks por subscripciones no cerradas
 */
@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly http = inject(HttpClient);

  // ─── Estado privado — solo este servicio puede mutarlo ───────────────────

  /** Tipo de recurso actualmente activo */
  readonly #resource = signal<ResourceType>('character');

  /** Filtro de status — solo se aplica al endpoint /character */
  readonly #status = signal<StatusFilter>('');

  /** Filas devueltas por la última petición exitosa */
  readonly #rows = signal<Record<string, unknown>[]>([]);

  /** Indica si hay una petición en vuelo */
  readonly #loading = signal<boolean>(false);

  /** Mensaje de error de la última petición fallida, null si no hay error */
  readonly #error = signal<string | null>(null);

  // ─── API pública de solo lectura ─────────────────────────────────────────

  /** Recurso activo actualmente seleccionado */
  readonly resource = this.#resource.asReadonly();

  /** Filtro de status activo */
  readonly status = this.#status.asReadonly();

  /**
   * Filas del último fetch como Record<string, unknown>[].
   * La tabla las recibe y accede a sus propiedades mediante la clave de columna.
   */
  readonly rows = this.#rows.asReadonly();

  /** `true` mientras la petición HTTP está en vuelo */
  readonly loading = this.#loading.asReadonly();

  /** Mensaje de error del último fetch fallido, o `null` si fue exitoso */
  readonly error = this.#error.asReadonly();

  /**
   * Derived signal: indica si el filtro de status está activo y disponible.
   * El status solo tiene efecto en el endpoint /character.
   */
  readonly isStatusFilterActive = computed(
    () => this.#resource() === 'character',
  );

  constructor() {
    // Carga inicial al instanciar el servicio
    this.fetchData();
  }

  /**
   * Cambia el recurso activo, resetea el filtro de status y carga los datos.
   *
   * @param r - El nuevo tipo de recurso a mostrar
   */
  setResource(r: ResourceType): void {
    this.#resource.set(r);
    this.#status.set('');
    this.fetchData();
  }

  /**
   * Actualiza el filtro de status (solo para 'character') y recarga los datos.
   *
   * @param s - El nuevo filtro de status
   */
  setStatus(s: StatusFilter): void {
    this.#status.set(s);
    this.fetchData();
  }

  /**
   * Construye la URL con los parámetros actuales y realiza el fetch HTTP.
   * Actualiza #loading, #rows y #error según el resultado.
   */
  fetchData(): void {
    this.#loading.set(true);
    this.#error.set(null);

    const resource = this.#resource();
    const status = this.#status();

    let params = new HttpParams();
    if (resource === 'character' && status !== '') {
      params = params.set('status', status);
    }

    // El tipo genérico informa al compilador qué forma tienen los resultados
    this.http
      .get<ApiResponse<Character | Episode | Location>>(
        `${API_BASE}/${resource}`,
        { params },
      )
      .subscribe({
        next: (response) => {
          // Cast seguro: cada recurso es un Record<string, unknown> para la tabla
          this.#rows.set(
            response.results as unknown as Record<string, unknown>[],
          );
          this.#loading.set(false);
        },
        error: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Error al cargar los datos';
          this.#error.set(message);
          this.#rows.set([]);
          this.#loading.set(false);
        },
      });
  }
}
