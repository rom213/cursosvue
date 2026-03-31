<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { RouterLink } from "vue-router";
import type { ProLesson } from "./monetizar.pro-content";
import { proLessonContent } from "./monetizar.pro-content";
import { proModules } from "./monetizar.content";

// ── Active module ──────────────────────────────────────────────────────────
const activeIdx = ref(0);
const activeMod = computed(() => proModules[activeIdx.value]);
const activeLessons = computed<ProLesson[]>(
  () => proLessonContent[activeMod.value.id] ?? []
);

// ── Accordion ─────────────────────────────────────────────────────────────
const openLesson = ref<number | null>(0);
function toggleLesson(i: number) {
  openLesson.value = openLesson.value === i ? null : i;
}

// ── Progress (arrays for full reactivity) ─────────────────────────────────
const doneMap = ref<Record<string, number[]>>({});

onMounted(() => {
  proModules.forEach((m) => {
    const raw = localStorage.getItem(`pro_done_${m.id}`);
    doneMap.value[m.id] = raw ? JSON.parse(raw) : [];
  });
});

const isDone = (modId: string, i: number) =>
  doneMap.value[modId]?.includes(i) ?? false;

const pct = (modId: string) => {
  const total = (proLessonContent[modId] ?? []).length;
  const done = doneMap.value[modId]?.length ?? 0;
  return total ? Math.round((done / total) * 100) : 0;
};

const activeDone = computed(() => doneMap.value[activeMod.value.id]?.length ?? 0);
const activeTotal = computed(() => activeLessons.value.length);
const activePct = computed(() =>
  activeTotal.value ? Math.round((activeDone.value / activeTotal.value) * 100) : 0
);
const isModDone = computed(
  () => activeDone.value > 0 && activeDone.value === activeTotal.value
);

function markDone(i: number) {
  const id = activeMod.value.id;
  const current = doneMap.value[id] ?? [];
  if (!current.includes(i)) {
    doneMap.value[id] = [...current, i];
    localStorage.setItem(`pro_done_${id}`, JSON.stringify(doneMap.value[id]));
  }
  // Auto-advance to next lesson
  if (i < activeLessons.value.length - 1) {
    openLesson.value = i + 1;
  } else {
    openLesson.value = null;
    if ((doneMap.value[id]?.length ?? 0) === activeLessons.value.length) {
      nextTick(launchConfetti);
    }
  }
}

// ── Confetti ───────────────────────────────────────────────────────────────
const canvasEl = ref<HTMLCanvasElement | null>(null);
let animId: number | null = null;

interface Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; w: number; h: number; rot: number; rotV: number; life: number;
}

function launchConfetti() {
  const c = canvasEl.value;
  if (!c) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;
  c.width = c.offsetWidth;
  c.height = c.offsetHeight;

  const colors = [
    "#059669", "#D4AF37", "#34d399", "#fbbf24",
    "#6ee7b7", "#fde68a", "#a7f3d0", "#ffffff",
  ];

  const particles: Particle[] = Array.from({ length: 180 }, () => ({
    x: Math.random() * c.width,
    y: -30 - Math.random() * 120,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 3 + 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    w: Math.random() * 12 + 5,
    h: Math.random() * 6 + 3,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.18,
    life: 1,
  }));

  function draw() {
    ctx!.clearRect(0, 0, c!.width, c!.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.rot += p.rotV;
      p.life -= 0.006;
      if (p.y < c!.height && p.life > 0) alive = true;
      ctx!.save();
      ctx!.globalAlpha = Math.max(0, p.life);
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }
    if (alive) animId = requestAnimationFrame(draw);
  }
  draw();
}

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId);
});

// Reset on module switch
watch(activeIdx, () => {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  openLesson.value = 0;
});
</script>

<template>
  <div class="pro-viewer w-full">

    <!-- ── Module Navigation Tabs ─────────────────────────────────────── -->
    <div class="mb-8 -mx-1 overflow-x-auto pb-2">
      <div class="flex gap-2 px-1 min-w-max sm:min-w-0 sm:flex-wrap">
        <button
          v-for="(mod, i) in proModules"
          :key="mod.id"
          type="button"
          @click="activeIdx = i"
          class="relative flex flex-col items-start gap-1.5 rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          :class="activeIdx === i
            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
            : 'border-gray-200/80 bg-white hover:border-emerald-300 hover:shadow-sm'"
        >
          <span
            class="text-[10px] font-bold uppercase tracking-widest"
            :class="activeIdx === i ? 'text-emerald-600' : 'text-gray-400'"
          >
            M{{ i + 1 }}
          </span>
          <span
            class="max-w-[130px] text-sm font-semibold leading-tight"
            :class="activeIdx === i ? 'text-[#1A1A1A]' : 'text-gray-600'"
          >
            {{ mod.title }}
          </span>
          <!-- Progress indicator -->
          <span
            v-if="pct(mod.id) === 100"
            class="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white"
          >
            <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Listo
          </span>
          <div
            v-else-if="pct(mod.id) > 0"
            class="h-1 w-full overflow-hidden rounded-full bg-gray-100"
          >
            <div
              class="h-full rounded-full bg-emerald-400 transition-all duration-500"
              :style="{ width: pct(mod.id) + '%' }"
            />
          </div>
        </button>
      </div>
    </div>

    <!-- ── Module Card ────────────────────────────────────────────────── -->
    <div class="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">

      <!-- Gradient header -->
      <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6 sm:px-8">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Módulo {{ activeIdx + 1 }} de {{ proModules.length }}
            </p>
            <h3 class="mt-1 text-lg font-bold leading-snug text-white sm:text-xl">
              {{ activeMod.title }}
            </h3>
            <p class="mt-1.5 text-sm font-light leading-relaxed text-emerald-100">
              {{ activeMod.concept }}
            </p>
          </div>
          <span class="shrink-0 rounded-2xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            {{ activeDone }}/{{ activeTotal }} lecciones
          </span>
        </div>

        <!-- Progress bar -->
        <div class="mt-5">
          <div class="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              class="h-full rounded-full bg-white transition-all duration-700 ease-out"
              :style="{ width: activePct + '%' }"
            />
          </div>
          <div class="mt-1.5 flex justify-between text-xs font-medium text-emerald-200">
            <span>Progreso del módulo</span>
            <span>{{ activePct }}%</span>
          </div>
        </div>
      </div>

      <!-- ── Lessons Accordion ── -->
      <div class="divide-y divide-gray-100">
        <div
          v-for="(lesson, idx) in activeLessons"
          :key="idx"
          class="transition-colors duration-200"
          :class="isDone(activeMod.id, idx) ? 'bg-emerald-50/30' : 'bg-white'"
        >
          <!-- Accordion trigger -->
          <button
            type="button"
            :aria-expanded="openLesson === idx"
            class="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-gray-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
            @click="toggleLesson(idx)"
          >
            <!-- Status badge -->
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
              :class="isDone(activeMod.id, idx)
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : openLesson === idx
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-400'"
            >
              <svg v-if="isDone(activeMod.id, idx)" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else>{{ idx + 1 }}</span>
            </span>

            <!-- Title -->
            <span
              class="flex-1 text-sm font-medium leading-snug transition-colors"
              :class="isDone(activeMod.id, idx)
                ? 'text-gray-400 line-through decoration-gray-300'
                : 'text-[#1A1A1A]'"
            >
              {{ lesson.title }}
            </span>

            <!-- Chevron -->
            <svg
              class="h-4 w-4 shrink-0 transition-all duration-300"
              :class="openLesson === idx ? 'rotate-180 text-emerald-600' : 'text-gray-300'"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Lesson body -->
          <Transition name="lesson">
            <div v-show="openLesson === idx" class="lesson-panel overflow-hidden">
              <div class="px-6 pb-7 pt-1">
                <div class="ml-12 space-y-4">

                  <!-- Body paragraphs -->
                  <p
                    v-for="(para, pi) in lesson.body"
                    :key="pi"
                    class="text-sm font-light leading-relaxed text-gray-600"
                  >
                    {{ para }}
                  </p>

                  <!-- Tip Experto callout -->
                  <div
                    v-if="lesson.tipExperto"
                    class="flex gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-yellow-50 p-4"
                  >
                    <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-base leading-none">
                      ⚡
                    </div>
                    <div>
                      <p class="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                        Tip del Experto
                      </p>
                      <p class="mt-1 text-sm font-medium italic leading-relaxed text-amber-900">
                        {{ lesson.tipExperto }}
                      </p>
                    </div>
                  </div>

                  <!-- Mark complete button -->
                  <div class="pt-2">
                    <button
                      v-if="!isDone(activeMod.id, idx)"
                      type="button"
                      class="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.97]"
                      @click.stop="markDone(idx)"
                    >
                      <svg class="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Marcar como completada
                    </button>
                    <div
                      v-else
                      class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      ¡Lección completada!
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- ── Completion Celebration ──────────────────────────────────── -->
      <Transition name="celebrate">
        <div
          v-if="isModDone"
          class="celebration-panel relative overflow-hidden border-t border-emerald-100 bg-gradient-to-b from-emerald-50/80 via-white to-white px-6 py-12 text-center"
        >
          <!-- Confetti canvas -->
          <canvas
            ref="canvasEl"
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 h-full w-full"
          />

          <div class="relative z-10">
            <!-- Trophy -->
            <div class="trophy mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-xl shadow-amber-200/60">
              <span class="text-5xl leading-none" aria-hidden="true">🏆</span>
            </div>

            <!-- Stars -->
            <div class="mt-5 flex justify-center gap-2 text-2xl" aria-hidden="true">
              <span class="star-1">⭐</span>
              <span class="star-2">⭐</span>
              <span class="star-3">⭐</span>
            </div>

            <h3 class="mt-5 text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
              ¡Módulo Completado!
            </h3>
            <p class="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-gray-500">
              Dominaste <span class="font-semibold text-emerald-600">{{ activeMod.title }}</span>.
              Ahora tienes el conocimiento para generar ingresos reales. ¡Es hora de actuar!
            </p>

            <!-- CTA buttons -->
            <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <RouterLink
                :to="{ name: 'courses' }"
                class="cta-pulse inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 active:scale-[0.98]"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ¡Aplicar lo aprendido ahora!
              </RouterLink>

              <button
                v-if="activeIdx < proModules.length - 1"
                type="button"
                class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-md"
                @click="activeIdx++"
              >
                Siguiente módulo
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <span
                v-else
                class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37]"
              >
                <span aria-hidden="true">🎓</span>
                ¡Programa Completado!
              </span>
            </div>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
/* ── Accordion ── */
.lesson-enter-active.lesson-panel,
.lesson-leave-active.lesson-panel {
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
  max-height: 80rem;
}
.lesson-enter-from.lesson-panel,
.lesson-leave-to.lesson-panel {
  max-height: 0;
  opacity: 0;
}

/* ── Celebration slide-in ── */
.celebrate-enter-active.celebration-panel {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.celebrate-enter-from.celebration-panel {
  opacity: 0;
  transform: translateY(28px) scale(0.97);
}

/* ── Trophy bounce-in ── */
.trophy {
  animation: trophyIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes trophyIn {
  from { transform: scale(0.3) rotate(-20deg); opacity: 0; }
  to   { transform: scale(1)   rotate(0deg);   opacity: 1; }
}

/* ── Stars staggered pop ── */
.star-1 { animation: starPop 0.4s 0.5s both; }
.star-2 { animation: starPop 0.4s 0.7s both; }
.star-3 { animation: starPop 0.4s 0.9s both; }
@keyframes starPop {
  from { transform: scale(0) rotate(-30deg); opacity: 0; }
  60%  { transform: scale(1.4) rotate(10deg); }
  to   { transform: scale(1)   rotate(0deg);  opacity: 1; }
}

/* ── CTA glow pulse ── */
.cta-pulse {
  animation: ctaPulse 2.5s 1.2s ease-in-out infinite;
}
@keyframes ctaPulse {
  0%, 100% { box-shadow: 0 10px 25px -3px rgb(5 150 105 / 0.3), 0 4px 6px -4px rgb(5 150 105 / 0.3); }
  50%       { box-shadow: 0 10px 40px -3px rgb(5 150 105 / 0.5), 0 4px 12px -4px rgb(5 150 105 / 0.5); }
}
</style>
