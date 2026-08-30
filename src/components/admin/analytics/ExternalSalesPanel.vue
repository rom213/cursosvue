<script lang="ts" setup>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import AnalyticsService, {
  type ExternalSaleCategory,
  type ExternalSaleResult,
} from "../../../services/AnalyticsService";

const categories = ref<ExternalSaleCategory[]>([]);
const email = ref("");
const categoryId = ref<number | null>(null);
const loadingCategories = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const result = ref<ExternalSaleResult | null>(null);

const selectedCategory = computed(() =>
  categories.value.find((category) => category.id === categoryId.value)
);

function money(value: number | string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toLocaleString("es-CO")}` : String(value);
}

function apiErrorMessage(caught: unknown, fallback: string): string {
  if (!axios.isAxiosError(caught)) return fallback;
  const detail = caught.response?.data?.detail;
  return typeof detail === "string" && detail.trim() ? detail : fallback;
}

async function loadCategories() {
  loadingCategories.value = true;
  error.value = null;
  try {
    categories.value = await AnalyticsService.getExternalSaleCategories();
    if (
      categoryId.value !== null &&
      !categories.value.some((category) => category.id === categoryId.value)
    ) {
      categoryId.value = null;
    }
  } catch (caught) {
    console.error(caught);
    error.value = apiErrorMessage(caught, "No se pudieron cargar las categorías disponibles.");
  } finally {
    loadingCategories.value = false;
  }
}

async function submit() {
  const normalizedEmail = email.value.trim().toLowerCase();
  const category = selectedCategory.value;
  if (!normalizedEmail || !category) {
    error.value = "Ingresa un correo válido y selecciona una categoría.";
    return;
  }

  const accepted = window.confirm(
    `¿Registrar la venta de “${category.title}” para ${normalizedEmail}?\n\n` +
      "Esta acción concede acceso al Google Group y registra un pago exitoso."
  );
  if (!accepted) return;

  submitting.value = true;
  error.value = null;
  result.value = null;
  try {
    result.value = await AnalyticsService.registerExternalSale({
      email: normalizedEmail,
      category_id: category.id,
    });
  } catch (caught) {
    console.error(caught);
    error.value = apiErrorMessage(caught, "No fue posible registrar la venta externa.");
  } finally {
    submitting.value = false;
  }
}

watch([email, categoryId], () => {
  error.value = null;
  result.value = null;
});

onMounted(loadCategories);
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5">
    <form class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm" @submit.prevent="submit">
      <div class="mb-5">
        <h2 class="text-lg font-bold text-gray-800">Registrar venta externa</h2>
        <p class="mt-1 text-sm text-gray-500">
          Concede el acceso y registra el pago desde el servidor. Ninguna credencial externa se
          envía al navegador.
        </p>
      </div>

      <div
        v-if="error"
        role="alert"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>
      <div
        v-if="result"
        role="status"
        class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      >
        <p class="font-semibold">
          {{ result.already_registered ? "La venta ya estaba registrada." : "Venta registrada correctamente." }}
        </p>
        <p class="mt-1 text-xs">
          Pago #{{ result.payment_id }} · {{ money(result.price) }} · {{ result.group_email }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block">
          <span class="block text-sm font-semibold text-gray-700 mb-1.5">Correo del estudiante</span>
          <input
            v-model.trim="email"
            type="email"
            autocomplete="off"
            maxlength="200"
            required
            placeholder="persona@ejemplo.com"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label class="block">
          <span class="block text-sm font-semibold text-gray-700 mb-1.5">Categoría</span>
          <select
            v-model.number="categoryId"
            required
            :disabled="loadingCategories || categories.length === 0"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          >
            <option :value="null" disabled>
              {{ loadingCategories ? "Cargando…" : "Selecciona una categoría" }}
            </option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.title }} — {{ money(category.price) }}
            </option>
          </select>
        </label>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <p class="text-xs text-gray-400">
          Si ya existe el pago, la operación es idempotente y no crea otro.
        </p>
        <button
          type="submit"
          :disabled="submitting || loadingCategories || !selectedCategory || !email.trim()"
          class="inline-flex min-w-40 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ submitting ? "Registrando…" : "Registrar venta" }}
        </button>
      </div>
    </form>

    <aside class="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <h3 class="font-bold">Antes de confirmar</h3>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-xs leading-relaxed">
        <li>Verifica el correo y la categoría; el acceso se concede inmediatamente.</li>
        <li>Solo aparecen categorías activas con precio y Google Group configurados.</li>
        <li>La acción queda registrada en los logs del servidor con el administrador responsable.</li>
      </ul>
      <button
        type="button"
        :disabled="loadingCategories"
        class="mt-4 text-xs font-semibold text-amber-800 underline disabled:opacity-50"
        @click="loadCategories"
      >
        Actualizar categorías
      </button>
    </aside>
  </section>
</template>
