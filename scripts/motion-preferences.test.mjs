import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { URL } from "node:url";
import { Buffer } from "node:buffer";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = await fs.readFile(new URL("../src/lib/motion.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { resolveMotionPreference, appearanceScript } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

for (const [name, saved, systemReduced, preference, reduced] of [
  ["sin preferencias sigue el dispositivo con movimiento", {}, false, "system", false],
  ["sin preferencias respeta reducir movimiento", {}, true, "system", true],
  ["conserva una pausa guardada por la versión anterior", { reduced: true }, false, "reduced", true],
  ["un antiguo false no anula la accesibilidad del dispositivo", { reduced: false }, true, "system", true],
  ["activar explícitamente permite movimiento con reducción del dispositivo", { motion: "full", reduced: false }, true, "full", false],
  ["pausar explícitamente funciona con cualquier dispositivo", { motion: "reduced" }, false, "reduced", true],
  ["seguir el sistema prevalece sobre el campo heredado", { motion: "system", reduced: true }, false, "system", false],
  ["una preferencia inválida usa el sistema", { motion: "unknown" }, true, "system", true],
  ["un valor nulo usa el sistema", null, true, "system", true],
]) {
  test(name, () => assert.deepEqual(resolveMotionPreference(saved, systemReduced), { preference, reduced }));
}

function prepaint(savedText, reduced) {
  const dataset = {};
  runInNewContext(appearanceScript, {
    localStorage: { getItem: () => savedText },
    document: { documentElement: { dataset } },
    matchMedia: query => ({ matches: query.includes("reduced-motion") ? reduced : false }),
  });
  return dataset;
}

test("antes de pintar ya respeta el dispositivo sin preferencias", () => {
  assert.equal(prepaint(null, true).motion, "reduced");
});
test("la activación explícita se conserva al recargar antes de React", () => {
  assert.equal(prepaint(JSON.stringify({ motion: "full", reduced: false }), true).motion, "full");
});
test("el arranque no pierde las preferencias de tema", () => {
  assert.equal(prepaint(JSON.stringify({ theme: "dark", motion: "reduced" }), false).theme, "dark");
});
test("una preferencia dañada no impide respetar reducción de movimiento", () => {
  assert.equal(prepaint("contenido-no-json", true).motion, "reduced");
});
