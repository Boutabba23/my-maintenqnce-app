
export enum View {
  MACHINE_LIST = 'MACHINE_LIST',
  MACHINE_DETAIL = 'MACHINE_DETAIL',
  FILTER_MANAGEMENT = 'FILTER_MANAGEMENT',
  SETTINGS = 'SETTINGS',
}

export type Theme = 'default-light' | 'default-dark' | 'vscode-dark' | 'solarized-light' | 'nord' | 'github-dark';


export interface FilterReference {
  id: string;
  reference: string;
  manufacturer: string;
}

export interface FilterGroup {
  id: string;
  name: string;
  description: string;
  references: FilterReference[];
}

export interface FilterType {
  id: string;
  name: string; // e.g., "Filtre à huile", "Filtre à air cabine"
}

export interface AssignedFilter {
  filterTypeId: string;
  filterGroupId: string | null; // Can be unassigned
}

export interface Machine {
  id:string;
  name: string; // e.g., "Pelle sur chenilles 320"
  brand: string; // "Caterpillar"
  model: string; // "320D2"
  assignedFilters: AssignedFilter[];
}