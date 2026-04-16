<script lang="ts" setup>
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const PREFIXES = [
  { label: '🇨🇴 +57', value: '+57' },
  { label: '🇺🇸 +1',  value: '+1' },
  { label: '🇲🇽 +52', value: '+52' },
  { label: '🇪🇸 +34', value: '+34' },
  { label: '🇵🇪 +51', value: '+51' },
  { label: '🇦🇷 +54', value: '+54' },
  { label: '🇨🇱 +56', value: '+56' },
  { label: '🇻🇪 +58', value: '+58' },
  { label: '🇪🇨 +593', value: '+593' },
]

function splitValue(full: string): { prefix: string; number: string } {
  for (const p of PREFIXES) {
    const code = p.value + ' '
    if (full.startsWith(code)) {
      return { prefix: p.value, number: full.slice(code.length) }
    }
    if (full.startsWith(p.value) && !full.slice(p.value.length).startsWith(' ')) {
      return { prefix: p.value, number: full.slice(p.value.length) }
    }
  }
  return { prefix: '+57', number: full.replace(/^\+\d{1,4}\s?/, '') }
}

const parsed = splitValue(props.modelValue || '')
const selectedPrefix = ref(parsed.prefix)
const numberInput = ref(parsed.number)

const isValid = computed(() => {
  const digits = numberInput.value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
})

function emitValue() {
  const digits = numberInput.value.replace(/\D/g, '')
  emit('update:modelValue', digits ? `${selectedPrefix.value} ${digits}` : '')
}

watch([selectedPrefix, numberInput], emitValue)

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    const p = splitValue(val)
    if (p.prefix !== selectedPrefix.value) selectedPrefix.value = p.prefix
    if (p.number !== numberInput.value) numberInput.value = p.number
  }
)

function onNumberInput(e: Event) {
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  numberInput.value = v
}
</script>

<template>
  <div class="space-y-1">
    <label class="block text-sm font-medium text-gray-700">
      WhatsApp <span class="text-red-500">*</span>
    </label>
    <div
      class="flex border rounded-md overflow-hidden transition-colors focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500"
      :class="[
        disabled ? 'bg-gray-100 border-gray-200' : 'border-gray-300',
        error && !isValid && numberInput ? 'border-red-400' : ''
      ]"
    >
      <select
        v-model="selectedPrefix"
        :disabled="disabled"
        class="border-0 bg-gray-50 px-2 py-2 text-sm outline-none focus:outline-none disabled:text-gray-400 disabled:bg-gray-100 border-r border-gray-200 min-w-[100px]"
      >
        <option v-for="p in PREFIXES" :key="p.value" :value="p.value">
          {{ p.label }}
        </option>
      </select>
      <input
        :value="numberInput"
        @input="onNumberInput"
        :disabled="disabled"
        type="tel"
        inputmode="numeric"
        placeholder="3101234567"
        maxlength="15"
        class="flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none focus:outline-none disabled:text-gray-400"
      />
    </div>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else class="text-xs text-gray-400">Te enviaremos el recibo de compra por aquí.</p>
  </div>
</template>
