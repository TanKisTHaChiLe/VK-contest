export interface TableColumn {
  id: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface TableConfig {
  id: string;
  name: string;
  columns: TableColumn[];
}

export interface TableData {
  [tableId: string]: Array<{ [key: string]: any }>;
}