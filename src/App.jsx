import React, { useState } from "react";
import { Container, Typography, Divider, Paper } from "@mui/material";
import MarcacionButton from "./components/MarcacionButton";
import HistorialTable from "./components/HistorialTable";

export default function App() {
  const [refresh, setRefresh] = useState(0);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Control de Marcación de Horas
        </Typography>
        <MarcacionButton onRegistro={() => setRefresh(r => r + 1)} />
        <Divider sx={{ my: 4 }} />
        <HistorialTable key={refresh} />
      </Paper>
    </Container>
  );
}