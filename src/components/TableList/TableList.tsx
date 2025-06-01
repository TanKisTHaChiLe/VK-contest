import React from 'react';
import { observer } from 'mobx-react-lite';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import tableStore from '../../store/TableStore';

const TableList: React.FC = observer(() => {
  const handleDelete = (tableId: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      tableStore.deleteTable(tableId);
    }
  };

  return (
    <div>
      <Typography variant="h6" sx={{ p: 2 }}>Available Tables</Typography>
      <List>
        {tableStore.tables.map((table) => (
          <ListItem key={table.id} disablePadding>
            <ListItemButton 
              onClick={() => tableStore.setCurrentTable(table)}
              selected={tableStore.currentTable?.id === table.id}
            >
              <ListItemText primary={table.name} />
            </ListItemButton>
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                onClick={() => handleDelete(table.id)}
                disabled={tableStore.isLoading}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
});

export default TableList;