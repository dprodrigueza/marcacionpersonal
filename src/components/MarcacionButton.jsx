import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const PAGA_HORA = 2.25;

// Utilidades
function horaAminutos(hora) {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// Cálculo de horas normales y extras
function calcularHorasExtras({ entradaManana, salidaAlmuerzo, entradaTarde, salidaFinal }) {
  let minutos = 0;
  if (entradaManana && salidaAlmuerzo) {
    minutos += horaAminutos(salidaAlmuerzo) - horaAminutos(entradaManana);
  }
  if (entradaTarde && salidaFinal) {
    minutos += horaAminutos(salidaFinal) - horaAminutos(entradaTarde);
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
  return { horas, horasExtras, montoNormal, montoExtra, monto: montoNormal + montoExtra };
}

export default function MarcacionButton({ onRegistro }) {
  const [registro, setRegistro] = useState({});
  const [loading, setLoading] = useState(false);

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const ref = doc(db, "registros", fechaHoy);

  useEffect(() => {
    async function fetchData() {
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) setRegistro(docSnap.data());
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  async function marcar(tipo) {
    setLoading(true);
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5);
    const nuevo = { ...registro, [tipo]: hora };
    const { horas, horasExtras, montoNormal, montoExtra, monto } = calcularHorasExtras(nuevo);
    nuevo.horasTrabajadas = horas;
    nuevo.horasExtras = horasExtras;
    nuevo.montoNormal = montoNormal;
    nuevo.montoExtra = montoExtra;
    nuevo.monto = monto;
    await setDoc(ref, { ...nuevo, fecha: fechaHoy });
    setRegistro(nuevo);
    setLoading(false);
    if (onRegistro) onRegistro();
  }

  return (
    <div>
      <h3>Marcación del día {fechaHoy}</h3>
      <p>Entrada mañana: {registro.entradaManana || "--:--"}</p>
      <p>Salida almuerzo: {registro.salidaAlmuerzo || "--:--"}</p>
      <p>Entrada tarde: {registro.entradaTarde || "--:--"}</p>
      <p>Salida final: {registro.salidaFinal || "--:--"}</p>
      <button disabled={!!registro.entradaManana || loading} onClick={() => marcar("entradaManana")}>
        Marcar Entrada Mañana
      </button>
      <button disabled={!registro.entradaManana || !!registro.salidaAlmuerzo || loading} onClick={() => marcar("salidaAlmuerzo")}>
        Marcar Salida Almuerzo
      </button>
      <button disabled={!registro.salidaAlmuerzo || !!registro.entradaTarde || loading} onClick={() => marcar("entradaTarde")}>
        Marcar Entrada Tarde
      </button>
      <button disabled={!registro.entradaTarde || !!registro.salidaFinal || loading} onClick={() => marcar("salidaFinal")}>
        Marcar Salida Final
      </button>
      <div style={{marginTop: 10}}>
        <b>Horas normales:</b> {registro.horasTrabajadas || 0}<br />
        <b>Horas extra:</b> {registro.horasExtras || 0}<br />
        <b>Monto normal:</b> ${registro.montoNormal || 0}<br />
        <b>Monto extra:</b> ${registro.montoExtra || 0}<br />
        <b>Total ganado:</b> ${registro.monto || 0}
      </div>
    </div>
  );
}