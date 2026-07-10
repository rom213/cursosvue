<script lang="ts" setup>
import { computed } from "vue";
import type { NavEdge } from "../../../services/AnalyticsService";

const props = defineProps<{
  edges: NavEdge[];
  selectedPage?: string | null;
}>();
const emit = defineEmits<{ (e: "select-page", path: string): void }>();

// Sankey De→A de un salto en SVG propio (sin librería). Columna izq = origen, der = destino;
// alto de nodo y grosor de cinta ∝ sesiones.
const W = 760;
const NODE_W = 12;
const LEFT_X = 150;
const RIGHT_X = 598;
const PAD_TOP = 16;
const PAD_BOT = 16;
const GAP = 6;
const USABLE = 360;
const MAX_EDGES = 16;

interface LayoutNode {
  path: string;
  y: number;
  height: number;
  cursor: number;
}

const layout = computed(() => {
  const edges = [...props.edges].sort((a, b) => b.sessions - a.sessions).slice(0, MAX_EDGES);
  const fromTotals: Record<string, number> = {};
  const toTotals: Record<string, number> = {};
  let totalFlow = 0;
  for (const e of edges) {
    fromTotals[e.from] = (fromTotals[e.from] ?? 0) + e.sessions;
    toTotals[e.to] = (toTotals[e.to] ?? 0) + e.sessions;
    totalFlow += e.sessions;
  }
  const scale = totalFlow ? USABLE / totalFlow : 0;

  function place(totals: Record<string, number>): Record<string, LayoutNode> {
    const nodes: Record<string, LayoutNode> = {};
    let y = PAD_TOP;
    for (const path of Object.keys(totals).sort((a, b) => totals[b] - totals[a])) {
      const height = totals[path] * scale;
      nodes[path] = { path, y, height, cursor: y };
      y += height + GAP;
    }
    return nodes;
  }
  const left = place(fromTotals);
  const right = place(toTotals);

  const links: { d: string; sessions: number; from: string; to: string }[] = [];
  for (const e of edges) {
    const w = e.sessions * scale;
    const ln = left[e.from];
    const rn = right[e.to];
    const y0 = ln.cursor;
    ln.cursor += w;
    const y1 = rn.cursor;
    rn.cursor += w;
    const x0 = LEFT_X + NODE_W;
    const x1 = RIGHT_X;
    const mid = (x0 + x1) / 2;
    links.push({
      from: e.from,
      to: e.to,
      sessions: e.sessions,
      d: `M${x0},${y0} C${mid},${y0} ${mid},${y1} ${x1},${y1} L${x1},${y1 + w} C${mid},${y1 + w} ${mid},${y0 + w} ${x0},${y0 + w} Z`,
    });
  }
  const bottom = Math.max(
    ...Object.values(left).map((n) => n.y + n.height),
    ...Object.values(right).map((n) => n.y + n.height),
    PAD_TOP
  );
  return {
    height: bottom + PAD_BOT,
    left: Object.values(left),
    right: Object.values(right),
    links,
    empty: edges.length === 0,
  };
});

const num = (v: number) => (v ?? 0).toLocaleString("es-CO");
function label(p: string): string {
  return p.length > 22 ? p.slice(0, 21) + "…" : p;
}
function nodeClass(path: string): string {
  return props.selectedPage === path ? "fill-blue-500" : "fill-gray-300 hover:fill-blue-400";
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100">
      <h3 class="text-sm font-bold text-gray-700">Flujo entre páginas (sankey)</h3>
      <p class="text-[11px] text-gray-400">Origen → destino; grosor = sesiones. Click en una página para su detalle.</p>
    </div>

    <div v-if="layout.empty" class="p-6 text-center text-sm text-gray-400">
      Sin transiciones internas en este rango.
    </div>

    <div v-else class="overflow-x-auto p-2">
      <svg :viewBox="`0 0 ${W} ${layout.height}`" class="w-full" :style="{ minWidth: '520px' }">
        <!-- Cintas -->
        <path
          v-for="(lk, idx) in layout.links"
          :key="'l' + idx"
          :d="lk.d"
          class="fill-blue-400/25 hover:fill-blue-400/50 transition-colors"
        >
          <title>{{ lk.from }} → {{ lk.to }} · {{ num(lk.sessions) }} sesiones</title>
        </path>

        <!-- Nodos origen -->
        <g v-for="(n, idx) in layout.left" :key="'L' + idx">
          <rect
            :x="LEFT_X" :y="n.y" :width="NODE_W" :height="Math.max(n.height, 1)" rx="2"
            class="cursor-pointer transition-colors" :class="nodeClass(n.path)"
            @click="emit('select-page', n.path)"
          >
            <title>{{ n.path }}</title>
          </rect>
          <text
            :x="LEFT_X - 6" :y="n.y + Math.max(n.height, 8) / 2"
            text-anchor="end" dominant-baseline="middle"
            class="text-[10px] fill-gray-500 font-mono cursor-pointer"
            @click="emit('select-page', n.path)"
          >{{ label(n.path) }}</text>
        </g>

        <!-- Nodos destino -->
        <g v-for="(n, idx) in layout.right" :key="'R' + idx">
          <rect
            :x="RIGHT_X" :y="n.y" :width="NODE_W" :height="Math.max(n.height, 1)" rx="2"
            class="cursor-pointer transition-colors" :class="nodeClass(n.path)"
            @click="emit('select-page', n.path)"
          >
            <title>{{ n.path }}</title>
          </rect>
          <text
            :x="RIGHT_X + NODE_W + 6" :y="n.y + Math.max(n.height, 8) / 2"
            text-anchor="start" dominant-baseline="middle"
            class="text-[10px] fill-gray-500 font-mono cursor-pointer"
            @click="emit('select-page', n.path)"
          >{{ label(n.path) }}</text>
        </g>
      </svg>
    </div>
  </div>
</template>
