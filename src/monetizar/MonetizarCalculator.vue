<script lang="ts" setup>
import { ref, computed } from "vue";
import { formatCOP } from "./utils";
import {
  calculatorCategories,
  calculatorSectionLead,
  calculatorSectionTitle,
} from "./monetizar.content";

interface CalculatorProps {
  compact?: boolean;
}

withDefaults(defineProps<CalculatorProps>(), {
  compact: false,
});

const metaMensual = ref(2000000);
const metaInputDisplay = ref(formatCOP(2000000));

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
</script>

<template>
  <section
    class="border-t border-gray-200/60 bg-[#FAFAFA] px-4 py-16 sm:px-6 lg:px-8"
    :class="{ 'py-8': compact }"
  >
    <div class="mx-auto" :class="{ 'max-w-6xl': !compact, 'max-w-2xl': compact }">
      <h2
        v-if="!compact"
        class="text-center text-xl font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] sm:text-2xl"
      >
        {{ calculatorSectionTitle }}
      </h2>
      <p
        v-if="!compact"
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
      <div
        class="mt-12 grid gap-6"
        :class="
          compact
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
        "
      >
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
</template>

<style scoped>
.calc-slider {
  accent-color: #059669;
}
</style>
