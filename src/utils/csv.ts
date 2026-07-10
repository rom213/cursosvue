// Export CSV en cliente (P3.5): genera el archivo desde el JSON ya cargado en memoria, sin llamadas
// extra al backend. Añade BOM UTF-8 para que Excel respete tildes.

type Row = Record<string, unknown>;

function escapeCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serializa filas (objetos planos) a CSV. Las cabeceras salen de las claves de la primera fila. */
export function toCsv(rows: Row[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCell).join(",")];
  for (const r of rows) lines.push(headers.map((h) => escapeCell(r[h])).join(","));
  return lines.join("\n");
}

/** Descarga las filas como archivo .csv. No hace nada si no hay filas. */
export function downloadCsv(filename: string, rows: Row[]): void {
  if (!rows || rows.length === 0) return;
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
