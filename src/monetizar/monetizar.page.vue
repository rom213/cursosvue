<script lang="ts" setup>
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import {
  calculatorCategories,
  calculatorSectionLead,
  calculatorSectionTitle,
  ctaLabel,
  faqCategories,
  faqSectionTitle,
  footerDisclaimer,
  footerSupportLine,
  monetizationLead,
  monetizationOptions,
  monetizationTitle,
  proModules,
  proModulesSectionTitle,
} from "./monetizar.content";
import {
  iconLock,
} from "./monetizar.icons";
import { authStore } from "../store/AuthStore";
import ProLessonViewer from "./ProLessonViewer.vue";
import FooterComponent from "../components/footer/footer.component.vue";

const store = authStore();
const isPro = computed(() => store.profile?.user?.is_bought ?? false);



/* ── Calculadora ── */
const metaMensual = ref(2000000);
const metaInputDisplay = ref(formatCOP(2000000));

function formatCOP(n: number): string {
  return "$" + n.toLocaleString("es-CO");
}

function onMetaInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, "");
  const num = Math.min(Math.max(Number(raw) || 0, 0), 50000000);
  metaMensual.value = num;
  metaInputDisplay.value = formatCOP(num);
}

function onMetaSlider(e: Event) {
  const num = Number((e.target as HTMLInputElement).value);
  metaMensual.value = num;
  metaInputDisplay.value = formatCOP(num);
}

const projections = computed(() =>
  calculatorCategories.map((cat) => {
    const ventasMensuales = Math.ceil(metaMensual.value / cat.comision);
    const ventasDiarias = Math.ceil(ventasMensuales / 30);
    const gananciaDiaria = ventasDiarias * cat.comision;
    const ganancia30dias = gananciaDiaria * 30;
    const extra = ganancia30dias - metaMensual.value;
    return { ...cat, ventasMensuales, ventasDiarias, gananciaDiaria, ganancia30dias, extra };
  })
);

const openFaqKey = ref<string | null>(null);

function faqKey(catIndex: number, itemIndex: number) {
  return `${catIndex}-${itemIndex}`;
}

function toggleFaq(catIndex: number, itemIndex: number) {
  const k = faqKey(catIndex, itemIndex);
  openFaqKey.value = openFaqKey.value === k ? null : k;
}

function isFaqOpen(catIndex: number, itemIndex: number) {
  return openFaqKey.value === faqKey(catIndex, itemIndex);
}

function onFaqKeydown(e: KeyboardEvent, catIndex: number, itemIndex: number) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleFaq(catIndex, itemIndex);
  }
}
</script>

<template>
  <main
    class="monetizar-page font-sans text-[#1A1A1A] antialiased selection:bg-emerald-500/20"
  >


    <!-- Monetización -->
    <section class="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <h2
          class="text-center text-xl font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] sm:text-2xl"
        >
          {{ monetizationTitle }}
        </h2>
        <p
          class="mx-auto mt-6 max-w-3xl text-center text-base font-light leading-relaxed text-gray-600"
        >
          {{ monetizationLead }}
        </p>

        <div class="mt-12 grid gap-8 lg:grid-cols-2">
          <article
            v-for="opt in monetizationOptions"
            :key="opt.id"
            class="group flex flex-col rounded-2xl border border-transparent bg-white p-8 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md"
          >
            <h3 class="text-lg font-semibold leading-snug text-[#1A1A1A]">
              {{ opt.title }}
            </h3>
            <p class="mt-3 text-sm font-light leading-relaxed text-gray-600">
              {{ opt.intro }}
            </p>
            <ul class="mt-6 space-y-4 text-sm">
              <li v-for="(b, i) in opt.bullets" :key="i">
                <span class="font-medium text-gray-800">{{ b.label }}:</span>
                <span class="font-light text-gray-600">
                  {{ b.text }}
                  <span
                    v-if="b.highlightAmount"
                    class="font-semibold text-emerald-600"
                    >{{ b.highlightAmount }}</span
                  >{{ b.textAfter ?? "" }}
                </span>
              </li>
            </ul>
            <blockquote
              v-if="opt.tipMaestro"
              class="mt-6 border-l-4 border-emerald-500/40 bg-slate-50/90 py-3 pl-4 pr-3 text-sm italic leading-relaxed text-gray-700"
            >
              {{ opt.tipMaestro }}
            </blockquote>
          </article>
        </div>

        <div class="mt-12 flex justify-center">
          <RouterLink
            :to="{ name: 'courses' }"
            class="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-600 px-8 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-emerald-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            {{ ctaLabel }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Calculadora de Proyección -->
    <section class="border-t border-gray-200/60 bg-[#FAFAFA] px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <h2
          class="text-center text-xl font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] sm:text-2xl"
        >
          {{ calculatorSectionTitle }}
        </h2>
        <p
          class="mx-auto mt-4 max-w-3xl text-center text-base font-light leading-relaxed text-gray-600"
        >
          {{ calculatorSectionLead }}
        </p>

        <!-- Input de meta -->
        <div class="mx-auto mt-10 max-w-md">
          <label
            for="meta-input"
            class="block text-center text-sm font-semibold text-gray-700"
          >
            Tu meta de ingresos mensuales (COP)
          </label>
          <input
            id="meta-input"
            type="text"
            inputmode="numeric"
            :value="metaInputDisplay"
            @input="onMetaInput"
            class="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-lg font-semibold text-[#1A1A1A] shadow-sm transition-colors duration-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <input
            type="range"
            :min="500000"
            :max="10000000"
            :step="100000"
            :value="metaMensual"
            @input="onMetaSlider"
            class="calc-slider mt-4 w-full cursor-pointer accent-emerald-600"
          />
          <div class="mt-1 flex justify-between text-xs font-light text-gray-400">
            <span>$500.000</span>
            <span>$10.000.000</span>
          </div>
        </div>

        <!-- Grid de tarjetas -->
        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="p in projections"
            :key="p.id"
            class="flex flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md"
          >
            <!-- Nombre categoría -->
            <h3 class="text-base font-semibold text-[#1A1A1A]">{{ p.name }}</h3>

            <!-- Datos estáticos -->
            <dl class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="font-light text-gray-500">Precio final</dt>
                <dd class="font-medium text-gray-700">{{ formatCOP(p.precioFinal) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="font-light text-gray-500">Costo Pasarela de pago</dt>
                <dd class="font-medium text-gray-700">{{ formatCOP(p.costoPayU) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="font-light text-gray-500">Tu comisión (60%)</dt>
                <dd class="font-semibold text-emerald-600">{{ formatCOP(p.comision) }}</dd>
              </div>
            </dl>

            <!-- Separador -->
            <hr class="my-4 border-gray-100" />

            <!-- Datos dinámicos -->
            <div class="flex flex-1 flex-col gap-3">
              <!-- Ventas diarias (destacado) -->
              <div class="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                <p class="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Ventas diarias
                </p>
                <p class="mt-1 text-3xl font-bold text-emerald-600">
                  {{ p.ventasDiarias }}
                </p>
              </div>

              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="font-light text-gray-500">Ventas/mes</dt>
                  <dd class="font-medium text-gray-700">{{ p.ventasMensuales }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="font-light text-gray-500">Ganancia/día</dt>
                  <dd class="font-medium text-gray-700">{{ formatCOP(p.gananciaDiaria) }}</dd>
                </div>
              </dl>

              <!-- Ganancia 30 días (destacado) -->
              <div class="mt-auto rounded-xl bg-emerald-50 px-4 py-3 text-center">
                <p class="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Ganancia a 30 días
                </p>
                <p class="mt-1 text-2xl font-bold text-emerald-600">
                  {{ formatCOP(p.ganancia30dias) }}
                </p>
                <p
                  v-if="p.extra > 0 && metaMensual > 0"
                  class="mt-1 inline-block rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white"
                >
                  +{{ formatCOP(p.extra) }} extra
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Muro PRO -->
    <section class="border-t border-gray-200/60 bg-[#FAFAFA] px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <div class="text-center">
          <h2
            class="text-xl font-semibold tracking-wide text-[#1A1A1A] sm:text-2xl"
          >
            {{ proModulesSectionTitle }}
          </h2>
          <p class="mt-2 text-sm font-light text-gray-500">
            Contenido exclusivo para perfiles
            <span class="font-semibold text-[#D4AF37]">PRO</span>
          </p>
        </div>

        <!-- Locked grid (non-PRO) -->
        <div
          v-if="!isPro"
          class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="mod in proModules"
            :key="mod.id"
            class="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm"
          >
            <div class="relative z-10 border-b border-gray-100/80 bg-white/95 px-5 pb-4 pt-5 backdrop-blur-sm">
              <div
                class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-[#D4AF37] [&_svg]:h-5 [&_svg]:w-5"
                aria-hidden="true"
                v-html="iconLock"
              />
              <h3 class="pr-12 text-base font-semibold leading-snug text-[#1A1A1A]">
                {{ mod.title }}
              </h3>
              <p class="mt-2 text-sm font-light leading-relaxed text-gray-600">
                {{ mod.concept }}
              </p>
              <p class="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
                <span aria-hidden="true">🔒</span>
                Estado: Solo Afiliados
                <span class="font-bold text-[#D4AF37]">PRO</span>
              </p>
            </div>
            <div class="relative min-h-[140px] flex-1 px-5 pt-4 pb-6">
              <div class="pointer-events-none select-none blur-[3px] opacity-70" aria-hidden="true">
                <ul class="space-y-2 text-xs text-gray-500">
                  <li v-for="(t, idx) in mod.lessonTitles" :key="idx">{{ t }}</li>
                </ul>
              </div>
              <div class="absolute inset-0 top-0 bg-gradient-to-b from-white/55 via-white/70 to-white/90" />
              <div class="absolute inset-0 flex items-center justify-center px-4">
                <div class="flex flex-col items-center gap-1 rounded-xl bg-white/90 px-4 py-3 text-center shadow-sm backdrop-blur-md">
                  <span
                    class="flex h-8 w-8 items-center justify-center text-[#D4AF37] [&_svg]:h-7 [&_svg]:w-7"
                    aria-hidden="true"
                    v-html="iconLock"
                  />
                  <span class="text-xs font-semibold text-[#D4AF37]">Contenido PRO</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Unlocked premium viewer (PRO) -->
        <div v-else class="mt-12">
          <ProLessonViewer />
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <h2
          class="text-center text-xl font-semibold tracking-wide text-[#1A1A1A] sm:text-2xl"
        >
          {{ faqSectionTitle }}
        </h2>

        <div class="mt-12 space-y-10">
          <div
            v-for="(cat, catIndex) in faqCategories"
            :key="cat.id"
            class="border-t border-gray-200/80 pt-10 first:border-t-0 first:pt-0"
          >
            <h3
              class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
            >
              {{ cat.title }}
            </h3>
            <div class="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-[#FAFAFA]/50">
              <div
                v-for="(item, itemIndex) in cat.items"
                :key="itemIndex"
                class="bg-white"
              >
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-[#1A1A1A] transition-colors duration-300 ease-in-out hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  :aria-expanded="isFaqOpen(catIndex, itemIndex)"
                  @click="toggleFaq(catIndex, itemIndex)"
                  @keydown="onFaqKeydown($event, catIndex, itemIndex)"
                >
                  <span>{{ item.question }}</span>
                  <span
                    class="shrink-0 text-emerald-600 transition-transform duration-300 ease-in-out"
                    :class="isFaqOpen(catIndex, itemIndex) ? 'rotate-180' : ''"
                    aria-hidden="true"
                    >▼</span
                  >
                </button>
                <Transition name="faq">
                  <div
                    v-show="isFaqOpen(catIndex, itemIndex)"
                    class="faq-panel overflow-hidden border-t border-gray-100/80"
                  >
                    <div
                      class="space-y-3 px-5 pb-5 pt-0 text-sm font-light leading-relaxed text-gray-600"
                    >
                      <template v-if="item.paragraphs.length">
                        <p
                          v-for="(para, pi) in item.paragraphs"
                          :key="pi"
                          class="pt-3 first:pt-0"
                        >
                          {{ para }}
                        </p>
                      </template>
                      <template v-if="item.list">
                        <component
                          :is="item.list.ordered ? 'ol' : 'ul'"
                          class="list-inside space-y-2"
                          :class="[
                            item.list.ordered ? 'list-decimal' : 'list-disc',
                            item.paragraphs.length ? 'pt-2' : 'pt-3',
                          ]"
                        >
                          <li
                            v-for="(li, lii) in item.list.items"
                            :key="lii"
                            class="pl-1"
                          >
                            {{ li }}
                          </li>
                        </component>
                      </template>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FooterComponent />
  </main>
</template>

<style scoped>
.monetizar-page {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    sans-serif;
}

.faq-enter-active.faq-panel,
.faq-leave-active.faq-panel {
  transition:
    opacity 0.3s ease-in-out,
    max-height 0.3s ease-in-out;
}

.faq-enter-active.faq-panel,
.faq-leave-active.faq-panel {
  max-height: 80rem;
}

.faq-enter-from.faq-panel,
.faq-leave-to.faq-panel {
  opacity: 0;
  max-height: 0;
}
</style>
