import { describe, expect, it } from "vitest";
import {
  buildSelector,
  extractText,
  resolveContentId,
  resolveTarget,
  resolveTrackName,
} from "./clickTracking";
import type { RouteLocationNormalized } from "vue-router";

function el(html: string): Element {
  const div = document.createElement("div");
  div.innerHTML = html.trim();
  return div.firstElementChild as Element;
}

function routeWithParams(params: Record<string, string>): RouteLocationNormalized {
  return { params } as unknown as RouteLocationNormalized;
}

describe("buildSelector", () => {
  it("incluye tag, id y hasta 2 clases semánticas", () => {
    const button = el(`<button id="comprar" class="btn-primario destacado">Comprar</button>`);
    expect(buildSelector(button)).toBe("button#comprar.btn-primario.destacado");
  });

  it("filtra clases utilitarias con dígitos (escalas de Tailwind)", () => {
    const div = el(`<div class="px-4 py-2 btn-primario">x</div>`);
    expect(buildSelector(div)).toBe("div.btn-primario");
  });

  it("filtra clases con valores arbitrarios (-[...])", () => {
    const div = el(`<div class="top-[117px] btn-primario">x</div>`);
    expect(buildSelector(div)).toBe("div.btn-primario");
  });

  it("se limita a 2 clases aunque haya más semánticas", () => {
    const div = el(`<div class="uno dos tres">x</div>`);
    expect(buildSelector(div)).toBe("div.uno.dos");
  });

  it("sin id ni clases usables devuelve solo el tag", () => {
    const div = el(`<div class="px-4">x</div>`);
    expect(buildSelector(div)).toBe("div");
  });
});

describe("extractText", () => {
  it("colapsa espacios/saltos de línea a uno solo", () => {
    const btn = el(`<button>  Comprar   ahora\n  ya  </button>`);
    expect(extractText(btn)).toBe("Comprar ahora ya");
  });

  it("trunca a 150 caracteres", () => {
    const long = "a".repeat(200);
    const btn = el(`<button>${long}</button>`);
    expect(extractText(btn)?.length).toBe(150);
  });

  it("nunca captura texto de input/textarea/select", () => {
    expect(extractText(el(`<input value="secreto" />`))).toBeUndefined();
    expect(extractText(el(`<textarea>secreto</textarea>`))).toBeUndefined();
    expect(extractText(el(`<select><option>secreto</option></select>`))).toBeUndefined();
  });

  it("devuelve undefined si el texto queda vacío", () => {
    const div = el(`<div>   </div>`);
    expect(extractText(div)).toBeUndefined();
  });
});

describe("resolveTrackName", () => {
  it("toma data-track del propio elemento", () => {
    const btn = el(`<button data-track="header-buscar">Buscar</button>`);
    expect(resolveTrackName(btn)).toBe("header-buscar");
  });

  it("toma data-track de un ancestro", () => {
    const wrapper = el(`<div data-track="promo-cerrar"><button id="x">X</button></div>`);
    const inner = wrapper.querySelector("#x") as Element;
    expect(resolveTrackName(inner)).toBe("promo-cerrar");
  });

  it("undefined si no hay data-track en la cadena", () => {
    const btn = el(`<button>Sin nombre</button>`);
    expect(resolveTrackName(btn)).toBeUndefined();
  });
});

describe("resolveContentId", () => {
  it("prioriza data-content-id del ancestro", () => {
    const wrapper = el(`<div data-content-id="99"><button id="x">X</button></div>`);
    const inner = wrapper.querySelector("#x") as Element;
    expect(resolveContentId(routeWithParams({ id: "42" }), inner)).toBe(99);
  });

  it("cae al parámetro numérico de la ruta si no hay atributo", () => {
    const btn = el(`<button>X</button>`);
    expect(resolveContentId(routeWithParams({ id: "42" }), btn)).toBe(42);
  });

  it("undefined si no hay atributo ni parámetro numérico", () => {
    const btn = el(`<button>X</button>`);
    expect(resolveContentId(routeWithParams({}), btn)).toBeUndefined();
  });
});

describe("resolveTarget", () => {
  it("sube hasta el ancestro interactivo más cercano", () => {
    const button = el(`<button id="btn"><span id="inner">Comprar</span></button>`);
    const inner = button.querySelector("#inner") as Element;
    const { el: resolved, isInteractive } = resolveTarget(inner);
    expect(resolved).toBe(button);
    expect(isInteractive).toBe(true);
  });

  it("sin ancestro interactivo devuelve el elemento crudo con is_interactive false", () => {
    const div = el(`<div id="dead"><span id="inner">texto</span></div>`);
    const inner = div.querySelector("#inner") as Element;
    const { el: resolved, isInteractive } = resolveTarget(inner);
    expect(resolved).toBe(inner);
    expect(isInteractive).toBe(false);
  });
});
