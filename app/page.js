
"use client";
import { useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Home() {
  const [classified, setClassified] = useState({ con: [], sin: [] });

  async function analyze(files) {
    const withFeatures = [];
    const withoutFeatures = [];

    for (const file of files) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await img.decode();

      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({ refineLandmarks: true });

      let detected = false;

      faceMesh.onResults((res) => {
        if (res.multiFaceLandmarks?.length) {
          detected = true;
        }
      });

      await faceMesh.send({ image: img });

      if (detected) withFeatures.push(file);
      else withoutFeatures.push(file);
    }

    setClassified({ con: withFeatures, sin: withoutFeatures });
  }

  async function exportZip() {
    const zip = new JSZip();
    const conFolder = zip.folder("con_maquillaje_o_joyeria");
    const sinFolder = zip.folder("sin_maquillaje_ni_joyeria");

    for (const f of classified.con) {
      conFolder.file(f.name, f);
    }
    for (const f of classified.sin) {
      sinFolder.file(f.name, f);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "imagenes_clasificadas.zip");
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", background: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.08)" }}>
      <h1 style={{ marginBottom: 10 }}>Clasificador de Imágenes</h1>
      <p style={{ color: "#555" }}>Detección local con IA (MediaPipe)</p>

      <input type="file" multiple accept="image/*"
        onChange={(e) => analyze(e.target.files)} />

      <section style={{ marginTop: 30 }}>
        <h3>Con maquillaje o joyería</h3>
        <ul>{classified.con.map(f => <li key={f.name}>{f.name}</li>)}</ul>

        <h3>Sin maquillaje ni joyería</h3>
        <ul>{classified.sin.map(f => <li key={f.name}>{f.name}</li>)}</ul>
      </section>

      <button onClick={exportZip}
        style={{ marginTop: 20, padding: "12px 18px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 8 }}>
        Exportar ZIP
      </button>
    </main>
  );
}
