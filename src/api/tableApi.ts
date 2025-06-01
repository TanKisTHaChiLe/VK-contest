// api/tableApi.ts
import axios from 'axios';
import { TableConfig } from '../types/table';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const fetchTables = async (): Promise<TableConfig[]> => {
  const response = await api.get('/tables');
  return response.data;
};

export const createTable = async (tableConfig: TableConfig): Promise<TableConfig> => {
  const response = await api.post('/tables', tableConfig);
  return response.data;
};

export const fetchTableData = async (tableId: string, page = 1, pageSize = 15) => {
  const response = await api.get(`/tableData?_page=${page}&_per_page=${pageSize}`);

 const totalResponse = await api.get(`/tableData`);

   const total = totalResponse.data.length;
  
  // Преобразуем объект данных в массив
  const data = response.data;
  const dataArray = Array.isArray(data) ? data : Object.values(data.data);
  
  return {
    data: dataArray,
    total: Number(total)
  };
};

export const deleteTable = async (tableId: string): Promise<void> => {
   await api.delete(`/tables/${tableId}?_dependent=tableData`);
};

export const addTableRow = async (tableId: string, rowData: any) => {
  const response = await api.post('/tableData', {
    tableId,
    ...rowData});
  return response.data;
};