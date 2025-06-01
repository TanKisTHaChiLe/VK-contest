import { makeAutoObservable, runInAction } from "mobx";
import { TableConfig, TableColumn } from "../types/table";
import {
  fetchTables,
  createTable,
  fetchTableData,
  addTableRow,
  deleteTable,
} from "../api/tableApi";

class TableStore {
  tables: TableConfig[] = [];
  currentTable: TableConfig | null = null;
  tableData: Record<string, any[]> = {};
  isLoading = false;
  error: string | null = null;
  currentPage: number = 1;
  pageSize: number = 15;
  isLoadingMore = false;
  hasMore = true;

  constructor() {
    makeAutoObservable(this);
    this.loadTables();
  }

  async loadTables() {
    this.isLoading = true;
    try {
      const tables = await fetchTables();
      runInAction(() => {
        this.tables = tables;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to load tables";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createNewTable(name: string, columns: TableColumn[]) {
    this.isLoading = true;
    try {
      const newTable = await createTable({
        id: Date.now().toString(),
        name,
        columns,
      });
      runInAction(() => {
        this.tables.push(newTable);
        this.currentTable = newTable;
        this.tableData[newTable.id] = [];
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to create table";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteTable(tableId: string) {
    this.isLoading = true;
    try {
      await deleteTable(tableId);

      runInAction(() => {
        this.tables = this.tables.filter((t) => t.id !== tableId);
        if (this.currentTable?.id === tableId) {
          this.currentTable = null;
        }
        delete this.tableData[tableId];
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to delete table";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async loadTableData(tableId: string, loadMore = false) {
    if (loadMore) {
      if (!this.hasMore || this.isLoadingMore) return;
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
      this.currentPage = 1;
      this.hasMore = true;
    }

    try {
      const { data, total } = await fetchTableData(
        tableId,
        this.currentPage,
        this.pageSize
      );

      runInAction(() => {
        if (loadMore) {
          this.tableData[tableId] = [
            ...(this.tableData[tableId] || []),
            ...data,
          ];
        } else {
          this.tableData[tableId] = data;
        }

        const currentDataLength = this.tableData[tableId]?.length || 0;
        this.hasMore = currentDataLength < total;

        if (data.length > 0) {
          this.currentPage += 1;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to load table data";
      });
    } finally {
      runInAction(() => {
        if (loadMore) {
          this.isLoadingMore = false;
        } else {
          this.isLoading = false;
        }
      });
    }
  }

  resetPagination() {
    this.currentPage = 1;
    this.hasMore = true;
  }

  async addDataRow(tableId: string, rowData: any) {
    try {
      const newRow = await addTableRow(tableId, rowData);
      runInAction(() => {
        this.tableData[tableId] = [newRow, ...(this.tableData[tableId] || [])];
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to add row";
      });
    }
  }

  setCurrentTable(table: TableConfig | null) {
    this.currentTable = table;
    if (table) {
      this.loadTableData(table.id);
    }
  }
}

const tableStore = new TableStore();
export default tableStore;
