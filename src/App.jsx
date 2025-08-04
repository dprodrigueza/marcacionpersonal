import React, { useState } from "react";
import MarcacionButton from "./components/MarcacionButton";
import HistorialTable from "./components/HistorialTable";

export default function App() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div style={{maxWidth: 900, margin: "auto", padding: 10}}>
      <h1>Control de Marcación de Horas</h1>
      <MarcacionButton onRegistro={() => setRefresh(r => r+1)} />
      <hr/>
      <HistorialTable key={refresh} />
    </div>
  );
}