// feat(demo-app): add typed interfaces for Rick & Morty API resources

/**
 * Representa un personaje de Rick & Morty.
 * @see https://rickandmortyapi.com/documentation/#character
 */
export interface Character {
  id: number;
  name: string;
  /** Estado vital del personaje — union type estricto, sin strings arbitrarios */
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: string;
  /** Lugar de origen, incluye URL al objeto Location */
  origin: { name: string; url: string };
  /** Última ubicación conocida */
  location: { name: string; url: string };
  image: string;
  /** URLs de los episodios en los que aparece */
  episode: string[];
  url: string;
  created: string;
}

/**
 * Representa un episodio de la serie.
 * @see https://rickandmortyapi.com/documentation/#episode
 */
export interface Episode {
  id: number;
  name: string;
  air_date: string;
  /** Código de episodio en formato S01E01 */
  episode: string;
  /** URLs de personajes que aparecen en el episodio */
  characters: string[];
  url: string;
  created: string;
}

/**
 * Representa una ubicación del universo Rick & Morty.
 * @see https://rickandmortyapi.com/documentation/#location
 */
export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
  /** URLs de los personajes que residen en esta ubicación */
  residents: string[];
  url: string;
  created: string;
}

/** Discriminador para seleccionar el endpoint de la API */
export type ResourceType = 'character' | 'episode' | 'location';

/** Filtro de estado — solo aplica al recurso 'character' */
export type StatusFilter = 'alive' | 'dead' | 'unknown' | '';

/**
 * Envuelve cualquier respuesta paginada de la API de Rick & Morty.
 * El tipo genérico T permite reutilizarla para Character, Episode y Location.
 */
export interface ApiResponse<T> {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: T[];
}
