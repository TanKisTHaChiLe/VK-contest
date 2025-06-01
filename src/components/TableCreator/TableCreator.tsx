import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import tableStore from '../../store/TableStore';
import { TableColumn } from '../../types/table';

const TableCreator: React.FC = observer(() => {
  const [showForm, setShowForm] = useState(false);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<Omit<TableColumn, 'id'>[]>([
    { label: '', type: 'string' }
  ]);

  if (tableStore.tables.length > 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          You can only have one table. Delete the existing table to create a new one.
        </Alert>
        <Button 
          variant="contained"
          color="primary"
          disabled
          sx={{ mb: 2 }}
        >
          Create Table (disabled)
        </Button>
      </Box>
    );
  }

  const handleAddColumn = () => {
    if (columns.length < 15) {
      setColumns([...columns, { label: '', type: 'string' }]);
    }
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length > 1) {
      const newColumns = [...columns];
      newColumns.splice(index, 1);
      setColumns(newColumns);
    }
  };

  const handleColumnChange = (index: number, field: 'label' | 'type', value: string) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const columnsWithIds = columns.map((col, index) => ({
      ...col,
      id: (index + 1).toString()
    }));
    
    tableStore.createNewTable(tableName, columnsWithIds);
    
    setTableName('');
    setColumns([{ label: '', type: 'string' }]);
    setShowForm(false);
  };

  const handleCancel = () => {
    setTableName('');
    setColumns([{ label: '', type: 'string' }]);
    setShowForm(false);
  };

  return (
    <Box>
      {!showForm ? (
        <Button 
          variant="contained"
          color="primary"
          onClick={() => setShowForm(true)}
          sx={{ mb: 2 }}
        >
          Create Table
        </Button>
      ) : (
        <Dialog open={showForm} onClose={handleCancel} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="inherit">Create New Table</Typography>
            <IconButton
              aria-label="close"
              onClick={handleCancel}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Table Name"
                  variant="outlined"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  required
                  fullWidth
                />
              </FormControl>
              
              <Typography variant="h6" gutterBottom>
                Columns (min 5, max 15)
              </Typography>
              
              <Grid container spacing={2}>
                {columns.map((col, index) => (
                  <Grid item container spacing={2} key={index} alignItems="center">
                    <Grid item xs={5}>
                      <TextField
                        label="Column Label"
                        variant="outlined"
                        value={col.label}
                        onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                        required
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={5}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={col.type}
                          label="Type"
                          onChange={(e: SelectChangeEvent) => handleColumnChange(index, 'type', e.target.value)}
                          required
                        >
                          <MenuItem value="string">String</MenuItem>
                          <MenuItem value="number">Number</MenuItem>
                          <MenuItem value="date">Date</MenuItem>
                          <MenuItem value="boolean">Boolean</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={2}>
                      {columns.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveColumn(index)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddColumn}
                  disabled={columns.length >= 15}
                >
                  Add Column
                </Button>
                
                <Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={tableStore.isLoading || columns.length < 5}
                  >
                    Create Table
                  </Button>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
});

export default TableCreator;