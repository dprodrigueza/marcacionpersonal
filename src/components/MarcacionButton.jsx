import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import {
  Button, Grid, Typography, Paper, Box, CircularProgress
} from "@mui/material";

const PAGA_HORA = 2.25;

function horaAminutos(hora) {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function calcularHorasExtras({ entradaManana, salidaAlmuerzo, entradaTarde, salidaFinal, salidaPermiso, entradaPermiso }) {
  let minutos = 0;
  if (entradaManana && salidaAlmuerzo) {
    minutos += horaAminutos(salidaAlmuerzo) - horaAminutos(entradaManana);
  }
  if (entradaTarde && salidaFinal) {
    minutos += horaAminutos(salidaFinal) - horaAminutos(entradaTarde);
  }
  let minutosPermiso = 0;
  if (salidaPermiso && entradaPermiso) {
    minutosPermiso = horaAminutos(entradaPermiso) - horaAminutos(salidaPermiso);
    minutos -= minutosPermiso;
  }
  minutos = Math.max(minutos, 0);
  let horas = Math.round((minutos / 60) * 100) / 100;
  let horasExtras = 0;
  if (horas > 8) {
    horasExtras = Math.round((horas - 8) * 100) / 100;
    horas = 8;
  }
  const montoNormal = Math.round(horas * PAGA_HORA * 100) / 100;
  const montoExtra = Math.round(horasExtras * PAGA_HORA * 100) / 100;
  return { horas, horasExtras, montoNormal, montoExtra, monto: montoNormal + montoExtra, minutosPermiso };
}

export default function MarcacionButton({ onRegistro }) {
  const [registro, setRegistro] = useState({});
  const [loading, setLoading] = useState(false);

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const ref = doc(db, "registros", fechaHoy);

  // Cierra automáticamente el día anterior si falta salidaFinal
  useEffect(() => {
    async function cerrarDiaAnteriorSinSalida() {
      const q = query(collection(db, "registros"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const anterior = docs.find(d => d.fecha !== fechaHoy);
        if (anterior && !anterior.salidaFinal) {
          // Marcar salida final como 18:00 y recalcular
          const actualizado = { ...anterior, salidaFinal: "18:00" };
          const {
            horas, horasExtras, montoNormal, montoExtra, monto, minutosPermiso
          } = calcularHorasExtras(actualizado);
          actualizado.horasTrabajadas = horas;
          actualizado.horasExtras = horasExtras;
          actualizado.montoNormal = montoNormal;
          actualizado.montoExtra = montoExtra;
          actualizado.monto = monto;
          actualizado.minutosPermiso = minutosPermiso;
          // Guardar en Firebase
          await setDoc(doc(db, "registros", anterior.fecha), actualizado);
        }
      }
    }

    async function fetchData() {
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) setRegistro(docSnap.data());
    }

    cerrarDiaAnteriorSinSalida().then(fetchData);
    // eslint-disable-next-line
  }, []);

  async function marcar(tipo) {
    setLoading(true);
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5);
    const nuevo = { ...registro, [tipo]: hora };
    const { horas, horasExtras, montoNormal, montoExtra, monto, minutosPermiso } = calcularHorasExtras(nuevo);
    nuevo.horasTrabajadas = horas;
    nuevo.horasExtras = horasExtras;
    nuevo.montoNormal = montoNormal;
    nuevo.montoExtra = montoExtra;
    nuevo.monto = monto;
    nuevo.minutosPermiso = minutosPermiso;
    await setDoc(ref, { ...nuevo, fecha: fechaHoy });
    setRegistro(nuevo);
    setLoading(false);
    if (onRegistro) onRegistro();
  }

  const permisoActivo = registro.salidaPermiso && !registro.entradaPermiso;

  const buttonProps = [
    {
      text: "Marcar Entrada Mañana",
      disabled: !!registro.entradaManana || loading || permisoActivo,
      onClick: () => marcar("entradaManana"),
    },
    {
      text: "Marcar Salida Almuerzo",
      disabled: !registro.entradaManana || !!registro.salidaAlmuerzo || loading || permisoActivo,
      onClick: () => marcar("salidaAlmuerzo"),
    },
    {
      text: "Marcar Entrada Tarde",
      disabled: !registro.salidaAlmuerzo || !!registro.entradaTarde || loading || permisoActivo,
      onClick: () => marcar("entradaTarde"),
    },
    {
      text: "Marcar Salida Final",
      disabled: !registro.entradaTarde || !!registro.salidaFinal || loading || permisoActivo,
      onClick: () => marcar("salidaFinal"),
    },
    {
      text: "Salir con permiso",
      disabled: permisoActivo || !registro.entradaManana || !!registro.salidaFinal || loading,
      onClick: () => marcar("salidaPermiso"),
      color: "warning"
    },
    {
      text: "Terminar permiso",
      disabled: !permisoActivo || loading,
      onClick: () => marcar("entradaPermiso"),
      color: "success"
    },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Marcación del día {fechaHoy}
      </Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}><b>Entrada mañana:</b> {registro.entradaManana || "--:--"}</Grid>
        <Grid item xs={6} sm={3}><b>Salida almuerzo:</b> {registro.salidaAlmuerzo || "--:--"}</Grid>
        <Grid item xs={6} sm={3}><b>Entrada tarde:</b> {registro.entradaTarde || "--:--"}</Grid>
        <Grid item xs={6} sm={3}><b>Salida final:</b> {registro.salidaFinal || "--:--"}</Grid>
        <Grid item xs={6} sm={6}><b>Salida permiso:</b> {registro.salidaPermiso || "--:--"}</Grid>
        <Grid item xs={6} sm={6}><b>Entrada permiso:</b> {registro.entradaPermiso || "--:--"}</Grid>
      </Grid>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        {buttonProps.map((btn, idx) =>
          <Button key={idx}
            variant="contained"
            color={btn.color || "primary"}
            disabled={btn.disabled}
            onClick={btn.onClick}
            sx={{ minWidth: 180 }}>
            {btn.text}
          </Button>
        )}
        {loading && <CircularProgress size={28} color="primary" />}
      </Box>
      <Paper elevation={1} sx={{ p: 2, background: "#f8f8f8" }}>
        <Typography variant="subtitle1"><b>Horas normales:</b> {registro.horasTrabajadas || 0}</Typography>
        <Typography variant="subtitle1"><b>Horas extra:</b> {registro.horasExtras || 0}</Typography>
        <Typography variant="subtitle1"><b>Monto normal:</b> ${registro.montoNormal || 0}</Typography>
        <Typography variant="subtitle1"><b>Monto extra:</b> ${registro.montoExtra || 0}</Typography>
        <Typography variant="subtitle1"><b>Total ganado:</b> ${registro.monto || 0}</Typography>
        <Typography variant="subtitle1"><b>Minutos permiso descontados:</b> {registro.minutosPermiso || 0}</Typography>
      </Paper>
    </Paper>
  );
}