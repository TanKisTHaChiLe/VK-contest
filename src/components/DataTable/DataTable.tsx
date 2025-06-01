import React, { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  CircularProgress,
  Stack,
  Grid,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import tableStore from "../../store/TableStore";

const DataTable: React.FC = observer(() => {
  const [tableContainerRef, setTableContainerRef] =
    useState<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [selectedFields, setSelectedFields] = useState<
    Array<{
      fieldId: string;
      value: string;
      error?: string;
    }>
  >([]);
  const [currentField, setCurrentField] = useState<string>("");
  const [currentValue, setCurrentValue] = useState<string>("");
  const [currentError, setCurrentError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tableStore.currentTable) {
      tableStore.loadTableData(tableStore.currentTable.id);
    }
  }, [tableStore.currentTable?.id]);

  const handleScroll = useCallback(() => {
    if (
      !tableContainerRef ||
      !tableStore.currentTable ||
      tableStore.isLoading ||
      tableStore.isLoadingMore ||
      !tableStore.hasMore
    )
      return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    console.log("1141");
    if (isNearBottom) {
      console.log("1111");
      tableStore.loadTableData(tableStore.currentTable.id, true);
    }
  }, [
    tableContainerRef,
    tableStore.currentTable?.id,
    tableStore.isLoading,
    tableStore.isLoadingMore,
    tableStore.hasMore,
  ]);

  useEffect(() => {
    if (!tableContainerRef) return;

    tableContainerRef.addEventListener("scroll", handleScroll);
    return () => tableContainerRef.removeEventListener("scroll", handleScroll);
  }, [tableContainerRef, handleScroll]);

  if (!tableStore.currentTable) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Please select or create a table</Typography>
      </Box>
    );
  }

  const tableId = tableStore.currentTable.id;
  const data = tableStore.tableData[tableId] || [];
  const columns = tableStore.currentTable.columns;
  const validateField = (fieldId: string, value: string): string => {
    const column = tableStore.currentTable?.columns.find(
      (c) => c.id === fieldId
    );
    if (!column) return "Unknown field";

    if (column.type && !value.trim()) return "Field is required";

    switch (column.type) {
      case "number":
        if (isNaN(Number(value))) return "Must be a number";
        break;
      case "date":
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
          return "Date format: YYYY-MM-DD";
        break;
      default:
        if (value.length > 255) return "Max length 255 characters";
    }

    return "";
  };

  const handleAddClick = () => {
    setNewRowData({});
    setSelectedFields([]);
    setCurrentField("");
    setCurrentValue("");
    setCurrentError("");
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    if (currentField && !currentError) {
      const error = validateField(currentField, currentValue);
      if (error) {
        setCurrentError(error);
        return;
      }

      const newField = {
        fieldId: currentField,
        value: currentValue,
        error: "",
      };

      setSelectedFields((prev) => [...prev, newField]);
      setNewRowData((prev) => ({
        ...prev,
        [currentField]: currentValue,
      }));

      setCurrentField("");
      setCurrentValue("");
      setCurrentError("");
    }
  };

  const handleRemoveField = (fieldId: string) => {
    if (isSaving) return;
    setSelectedFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
    setNewRowData((prev) => {
      const newData = { ...prev };
      delete newData[fieldId];
      return newData;
    });
  };

  const handleCurrentValueChange = (value: string) => {
    setCurrentValue(value);
    if (currentField) {
      setCurrentError(validateField(currentField, value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validatedFields = selectedFields.map((field) => ({
      ...field,
      error: validateField(field.fieldId, field.value),
    }));

    setSelectedFields(validatedFields);

    const hasErrors = validatedFields.some((field) => field.error);
    if (hasErrors || validatedFields.length < 5) return;

    try {
      setIsSaving(true);
      await tableStore.addDataRow(tableId, newRowData);
      await tableStore.loadTableData(tableId);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add row:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const availableFields = tableStore.currentTable.columns.filter(
    (col) => !selectedFields.some((f) => f.fieldId === col.id)
  );

  const minFieldsRequired = 5;
  const fieldsMissing = Math.max(minFieldsRequired - selectedFields.length, 0);
  const hasErrors = selectedFields.some((field) => field.error) || currentError;
  const canSubmit = selectedFields.length >= minFieldsRequired && !hasErrors;

  return (
    <Paper sx={{ p: 3, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">{tableStore.currentTable.name}</Typography>
        <Button
          variant="contained"
          onClick={handleAddClick}
          disabled={tableStore.isLoading}
          startIcon={
            tableStore.isLoading ? <CircularProgress size={20} /> : null
          }
        >
          Add Record
        </Button>
      </Box>

      {tableStore.isLoading && !tableStore.isLoadingMore ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : tableStore.error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {tableStore.error}
        </Alert>
      ) : (
        <>
          {data.length ? (
            <TableContainer
              component={Paper}
              ref={setTableContainerRef}
              sx={{ maxHeight: "600px", overflow: "auto" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id}>{column.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row: any) => (
                    <TableRow key={row.id}>
                      {columns.map((column) => (
                        <TableCell key={`${row?.id}-${column?.id}`}>
                          {row[column.id] !== undefined &&
                          row[column.id] !== null
                            ? String(row[column.id])
                            : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {tableStore.isLoadingMore && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ p: 3, textAlign: "center" }}>
              No data to display
            </Typography>
          )}
        </>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Record</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => !isSaving && setIsModalOpen(false)}
          disabled={isSaving}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={5}>
                  <FormControl fullWidth>
                    <InputLabel>Select Field</InputLabel>
                    <Select
                      value={currentField}
                      onChange={(e) => {
                        setCurrentField(e.target.value as string);
                        setCurrentError(
                          validateField(e.target.value as string, currentValue)
                        );
                      }}
                      label="Select Field"
                      disabled={availableFields.length === 0 || isSaving}
                    >
                      {availableFields.map((column) => (
                        <MenuItem key={column.id} value={column.id}>
                          {column.label} ({column.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={5} sx={{ position: "relative" }}>
                  <TextField
                    label="Value"
                    value={currentValue}
                    onChange={(e) => handleCurrentValueChange(e.target.value)}
                    fullWidth
                    disabled={!currentField || isSaving}
                    error={!!currentError}
                    helperText={currentError || " "}
                    sx={{
                      "& .MuiFormHelperText-root": {
                        position: "absolute",
                        bottom: -22,
                        width: "100%",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    onClick={handleAddField}
                    disabled={!currentField || !!currentError || isSaving}
                    fullWidth
                    sx={{ height: "56px" }}
                  >
                    Add Field
                  </Button>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Fields ({selectedFields.length}):
                </Typography>

                {selectedFields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No fields selected
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {selectedFields.map((field, index) => {
                      const column = tableStore.currentTable?.columns.find(
                        (c) => c.id === field.fieldId
                      );
                      return (
                        <Paper
                          key={index}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderColor: field.error ? "error.main" : "divider",
                            position: "relative",
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography fontWeight="medium">
                                {column?.label}:{" "}
                                <Typography component="span">
                                  {field.value}
                                </Typography>
                              </Typography>
                              {field.error && (
                                <Typography variant="caption" color="error">
                                  {field.error}
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveField(field.fieldId)}
                              color="error"
                              disabled={isSaving}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {fieldsMissing > 0 && (
                <Alert severity="warning">
                  Need to add {fieldsMissing} more fields (minimum{" "}
                  {minFieldsRequired})
                </Alert>
              )}
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => setIsModalOpen(false)}
              color="inherit"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit || isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
            >
              {isSaving ? "Saving..." : "Save Record"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
});

export default DataTable;
