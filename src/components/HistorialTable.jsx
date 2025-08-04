import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

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

  return (
    <div>
      <h3>Historial</h3>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Entrada Mañana</th>
            <th>Salida Almuerzo</th>
            <th>Entrada Tarde</th>
            <th>Salida Final</th>
            <th>Horas normales</th>
            <th>Horas extra</th>
            <th>Monto normal</th>
            <th>Monto extra</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(r => (
            <tr key={r.fecha}>
              <td>{r.fecha}</td>
              <td>{r.entradaManana || ""}</td>
              <td>{r.salidaAlmuerzo || ""}</td>
              <td>{r.entradaTarde || ""}</td>
              <td>{r.salidaFinal || ""}</td>
              <td>{r.horasTrabajadas || 0}</td>
              <td>{r.horasExtras || 0}</td>
              <td>${r.montoNormal || 0}</td>
              <td>${r.montoExtra || 0}</td>
              <td>${r.monto || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}