import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, CssBaseline, Container, Grid } from '@mui/material';
import TableCreator from './components/TableCreator/TableCreator';
import TableList from './components/TableList/TableList';
import DataTable from './components/DataTable/DataTable';

const App: React.FC = observer(() => {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TableList />
            </Grid>
            <Grid item xs={12} md={8}>
              <TableCreator />
              <DataTable />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
});

export default App;