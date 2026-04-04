<script lang="ts" setup>
import { ref, computed } from "vue";
import { authStore } from "../../store/AuthStore";

interface Category {
  id: number;
  titulo: string;
  imagen_url?: string;
  precio_final?: number;
  link_afiliado?: string;
  url_drive?: string;
  [key: string]: any;
}

interface Props {
  category: Category;
  cursoCount?: number;
  type?: "bloque" | "pilar" | "combinacion" | "tienda-completa";
}

const props = withDefaults(defineProps<Props>(), {
  cursoCount: 0,
  type: "bloque",
});

const emit = defineEmits<{
  "open-buy-modal": [category: Category];
}>();

const storeAuth = authStore();
const copiado = ref<string | null>(null);

const codigoReferido = computed(() => storeAuth.profile?.user?.codigo_referido || "");

const copyToClipboard = async (text: string, actionType: string) => {
  if (!text) {
    if (actionType === "cupon" && !codigoReferido.value) {
      copiado.value = "sin-cupon";
      setTimeout(() => {
        copiado.value = null;
      }, 3000);
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copiado.value = actionType;
    setTimeout(() => {
      copiado.value = null;
    }, 2000);
  } catch (error) {
    console.error("Error copying to clipboard:", error);
  }
};

const copyAffiliateLink = () => {
  if (!codigoReferido.value) {
    copiado.value = "sin-link-afiliado";
    setTimeout(() => {
      copiado.value = null;
    }, 3000);
    return;
  }
  const affiliateLink = props.category.link_afiliado || "";
  copyToClipboard(affiliateLink, "link-afiliado");
};

const copyCupon = () => {
  if (!codigoReferido.value) {
    copiado.value = "sin-cupon";
    setTimeout(() => {
      copiado.value = null;
    }, 3000);
    return;
  }
  copyToClipboard(codigoReferido.value, "cupon");
};

const copyDriveLink = (e: Event) => {
  e.preventDefault();
  const driveLink = props.category.url_drive || "";
  if (driveLink) {
    copyToClipboard(driveLink, "drive");
  }
};

const openBuyModal = () => {
  emit("open-buy-modal", props.category);
};

const defaultImage = "https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=400&h=300&fit=crop";
const imageUrl = props.category.imagen_url || defaultImage;
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col h-full group">
    <!-- Image Section -->
    <div class="relative h-48 bg-gray-100 overflow-hidden">
      <img
        :src="imageUrl"
        :alt="category.titulo"
        class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
    </div>

    <!-- Content Section -->
    <div class="flex-1 p-6 flex flex-col">
      <!-- Título -->
      <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
        {{ category.titulo }}
      </h3>

      <!-- Cantidad de cursos -->
      <div class="mb-4">
        <span
          class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          :class="{
            'bg-emerald-100 text-emerald-700': type === 'bloque',
            'bg-blue-100 text-blue-700': type === 'pilar',
            'bg-purple-100 text-purple-700': type === 'combinacion',
            'bg-amber-100 text-amber-700': type === 'tienda-completa',
          }"
        >
          📚 {{ cursoCount }} {{ cursoCount === 1 ? "curso" : "cursos" }}
        </span>
      </div>

      <!-- Precio (si existe) -->
      <div v-if="category.precio_final" class="mb-4">
        <p class="text-sm text-gray-500">Precio final</p>
        <p class="text-xl font-bold text-emerald-600">
          ${{ category.precio_final.toLocaleString("es-CO") }}
        </p>
      </div>

      <!-- Actions Grid -->
      <div class="mt-auto grid grid-cols-2 gap-2">
        <!-- Link de Afiliado -->
        <button
          @click="copyAffiliateLink"
          class="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
          :title="codigoReferido ? 'Copiar link de afiliado' : 'Ve a configuraciones para crear tu código'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Link
        </button>

        <!-- Cupón de Descuento -->
        <button
          @click="copyCupon"
          class="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          :title="codigoReferido ? 'Copiar cupón' : 'Ve a configuraciones para crear tu código'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m-4 3.5V9m4 11.5v2m-4-3.5v2M9 9h6m-6 4h6m2-8a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7z" />
          </svg>
          Cupón
        </button>

        <!-- Venta a Terceros -->
        <button
          @click="openBuyModal"
          class="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
          title="Vender a terceros"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Venta
        </button>

        <!-- Link de Drive -->
        <a
          :href="category.url_drive || '#'"
          @click="copyDriveLink"
          class="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
          title="Copiar link de Drive"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Drive
        </a>
      </div>
    </div>

    <!-- Toast Messages -->
    <transition name="fade">
      <div
        v-if="copiado === 'link-afiliado'"
        class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
      >
        <div class="bg-white rounded-lg px-4 py-2 text-sm font-medium text-emerald-700">
          ✓ Link copiado
        </div>
      </div>

      <div
        v-else-if="copiado === 'cupon'"
        class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
      >
        <div class="bg-white rounded-lg px-4 py-2 text-sm font-medium text-blue-700">
          ✓ Cupón copiado
        </div>
      </div>

      <div
        v-else-if="copiado === 'drive'"
        class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
      >
        <div class="bg-white rounded-lg px-4 py-2 text-sm font-medium text-amber-700">
          ✓ Drive copiado
        </div>
      </div>

      <div
        v-else-if="copiado === 'sin-cupon'"
        class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
      >
        <div class="bg-white rounded-lg px-4 py-2 text-sm font-medium text-red-700 text-center max-w-xs">
          Ve a configuraciones y crea tu cupón personalizado
        </div>
      </div>

      <div
        v-else-if="copiado === 'sin-link-afiliado'"
        class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
      >
        <div class="bg-white rounded-lg px-4 py-2 text-sm font-medium text-red-700 text-center max-w-xs">
          Ve a configuraciones para completar tu perfil
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
