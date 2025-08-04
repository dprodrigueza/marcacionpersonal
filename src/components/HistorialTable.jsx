import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box
} from "@mui/material";

export default function HistorialTable() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const q = query(collection(db, "registros"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      setRegistros(snap.docs.map(doc => doc.data()));
    }
    fetchData();
  }, []);

  const total = registros.reduce((acc, r) => acc + (Number(r.monto) || 0), 0);

  return (
    <div>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6" gutterBottom>Historial</Typography>
        <Typography variant="h6" color="primary">
          Total: <b>${total.toFixed(2)}</b>
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Entrada Mañana</TableCell>
              <TableCell>Salida Almuerzo</TableCell>
              <TableCell>Entrada Tarde</TableCell>
              <TableCell>Salida Final</TableCell>
              <TableCell>Salida Permiso</TableCell>
              <TableCell>Entrada Permiso</TableCell>
              <TableCell>Min. Permiso</TableCell>
              <TableCell>Horas normales</TableCell>
              <TableCell>Horas extra</TableCell>
              <TableCell>Monto normal</TableCell>
              <TableCell>Monto extra</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map(r => (
              <TableRow key={r.fecha}>
                <TableCell>{r.fecha}</TableCell>
                <TableCell>{r.entradaManana || ""}</TableCell>
                <TableCell>{r.salidaAlmuerzo || ""}</TableCell>
                <TableCell>{r.entradaTarde || ""}</TableCell>
                <TableCell>{r.salidaFinal || ""}</TableCell>
                <TableCell>{r.salidaPermiso || ""}</TableCell>
                <TableCell>{r.entradaPermiso || ""}</TableCell>
                <TableCell>{r.minutosPermiso || 0}</TableCell>
                <TableCell>{r.horasTrabajadas || 0}</TableCell>
                <TableCell>{r.horasExtras || 0}</TableCell>
                <TableCell>${r.montoNormal || 0}</TableCell>
                <TableCell>${r.montoExtra || 0}</TableCell>
                <TableCell><b>${r.monto || 0}</b></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}