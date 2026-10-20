// Read-only catalog exports: { category: { id }, courses: [...] }, one <ID>.json per block.
// Usage: node scripts/refresh-block-route-counts.mjs /path/to/catalog-exports
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const exportDirectory = process.argv[2];
if (!exportDirectory) throw new Error("Indica la carpeta de exportaciones del catálogo.");
const configDirectory = path.resolve("src/courses/campaigns/config/bloques");
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "block-route-counts-"));
const modules = new Map();
function compileModule(file) {
  const source = path.resolve(file);
  if (modules.has(source)) return modules.get(source);
  const output = path.join(temporaryDirectory, `${modules.size}.mjs`);
  const url = pathToFileURL(output).href;
  modules.set(source, url);
  const contents = fs.readFileSync(source, "utf8");
  const javascript = source.endsWith(".json") ? `export default ${contents};` : ts.transpileModule(contents, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  fs.writeFileSync(output, javascript.replace(/from ["'](\.[^"']+)["']/g, (_, specifier) => {
    const target = path.resolve(path.dirname(source), specifier);
    return `from ${JSON.stringify(compileModule(fs.existsSync(target) ? target : target + ".ts"))} `;
  }));
  return url;
}
try {
  const { blockRouteDefinitions } = await import(compileModule("src/courses/campaigns/config/blockCampaigns.ts"));
  const { coursesForStudyRoute } = await import(compileModule("src/courses/campaigns/routes/studyRoutes.ts"));
  const updates = [];
  const errors = [];
  for (const file of fs.readdirSync(configDirectory).filter((file) => /^\d+\.json$/.test(file)).sort()) {
    const configPath = path.join(configDirectory, file);
    const definition = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const data = JSON.parse(fs.readFileSync(path.join(exportDirectory, file), "utf8"));
    const courses = data.courses;
    if (data.category.id !== definition.categoryId || !Array.isArray(courses) || !courses.length
      || new Set(courses.map((course) => course.id)).size !== courses.length
      || data.category.cantidad_cursos !== courses.length) throw new Error(`Exportación incompleta: ${file}`);
    const counts = {};
    for (const route of blockRouteDefinitions(definition)) {
      const matches = coursesForStudyRoute(courses, route);
      if (!matches.length) continue;
      const missing = matches.filter((course) => course.name_del_curso
        && !route.queryTerms?.some((q) => course.name_del_curso.toLowerCase().includes(q.toLowerCase())));
      if (missing.length) errors.push(`Consultas incompletas en ${route.id}: ${missing.map((c) => c.name_del_curso).join("; ")}`);
      counts[route.id] = matches.length;
    }
    if (!Object.keys(counts).length) throw new Error(`Bloque sin rutas: ${file}`);
    definition.snapshot = { updatedAt: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()), catalogTotal: courses.length, counts };
    updates.push([configPath, JSON.stringify(definition, null, 2) + "\n"]);
    console.log(`${definition.categoryId}: ${courses.length} cursos; ${Object.keys(counts).length} rutas`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
  // Write only after every catalog and query has passed validation.
  for (const [file, contents] of updates) fs.writeFileSync(file, contents);
} finally { fs.rmSync(temporaryDirectory, { recursive: true, force: true }); }
