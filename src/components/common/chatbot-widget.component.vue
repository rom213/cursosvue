<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { authStore } from '../../store/AuthStore';
import ChatbotService from '../../services/ChatbotService';

const userStore = authStore();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

// Estado del widget
const isOpen = ref(false);

watch(isOpen, (value) => emit('update:open', value));

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const isLoading = ref(false);
const messageInput = ref<HTMLInputElement | null>(null);
const messageText = ref('');
const messagesArea = ref<HTMLElement | null>(null);

// Historial de mensajes
interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

const messages = ref<Message[]>([]);

// Preguntas predefinidas
interface PredefinedQuestion {
  id: string;
  text: string;
  blanks: number; // Cantidad de campos a llenar
}

const predefinedQuestions: PredefinedQuestion[] = [
  {
    id: 'q1',
    text: 'Recomiéndame un bloque de cursos según mi profesión',
    blanks: 0
  },
  {
    id: 'q2',
    text: '¿cuales son mis garantias?',
    blanks: 0
  },
  {
    id: 'q3',
    text: '¿Qué es Google Drive y por qué usar Google Drive?',
    blanks: 0
  },
  {
    id: 'q4',
    text: '¿Qué es la opción de monetizar?',
    blanks: 0
  }
];

// Sugerencias
const suggestionsVisible = ref(true);

// Audio de notificación
const notifAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
notifAudio.volume = 0.35;

// Computed properties
const userProfile = computed(() => userStore.getProfile()?.user);
const isAuthenticated = computed(() => !!userProfile.value);
const userFirstName = computed(() =>
  isAuthenticated.value ? (userProfile.value?.given_name || 'Usuario') : 'Invitado'
);
const userPhotoUrl = computed(() => userProfile.value?.picture || '');

const showTyping = computed(() => isLoading.value);

// Saludo inicial: personalizado si hay sesión, genérico si es invitado
function pushWelcomeMessage() {
  if (messages.value.length !== 0) return;

  const profile = userStore.getProfile();
  const content = profile?.user
    ? `¡Hola! <strong>${capitalize(profile.user.given_name || 'Usuario')}</strong> 👋 Soy Clarita, tu asistente de cursos. ¿En qué puedo ayudarte hoy?`
    : `¡Hola! 👋 Soy Clarita, tu asistente de cursos. ¿En qué puedo ayudarte hoy?`;

  messages.value.push({
    id: '1',
    type: 'agent',
    content,
    timestamp: new Date()
  });
}

// Inicializar mensaje de bienvenida cuando el usuario se loguee (o cambie estado).
// Al detectar login, purgar el seudo-email de invitado para que las próximas
// conversaciones usen la identidad real.
watch(
  () => userStore.getProfile(),
  (profile) => {
    if (profile?.user) {
      ChatbotService.clearGuestSession();
    }
    pushWelcomeMessage();
  }
);

// Funciones auxiliares
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function parseMarkdown(str: string): string {
  let html = escapeHtml(str);

  // 1. Detectar listas PRIMERO (antes de convertir ** a strong)
  // Líneas que empiezan con "- " o "* " (con espacios opcionales)
  html = html.replace(/((?:^|\n)\s*[*\-] .+)+/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map(line => {
        const cleaned = line.replace(/^\s*[*\-]\s+/, '').trim();
        return `<li>${cleaned}</li>`;
      })
      .join('');
    return `<ul class="chat-list">${items}</ul>`;
  });

  // 2. Negritas: **texto** → <strong>texto</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 3. Cursiva: _texto_ → <em>texto</em>
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // 4. Saltos de línea: \n → <br>
  html = html.replace(/\n/g, '<br>');

  // 5. URLs → enlaces
  html = html.replace(
    /(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-action-link">$1</a>'
  );

  return html;
}

function playNotification() {
  notifAudio.currentTime = 0;
  notifAudio.play().catch(() => {});
}

async function scrollToBottom() {
  await nextTick();
  if (messagesArea.value) {
    messagesArea.value.scrollTo({ top: messagesArea.value.scrollHeight, behavior: 'smooth' });
  }
}

function toggleChat() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => messageInput.value?.focus());
  }
}

function closeChat() {
  isOpen.value = false;
}

async function sendMessage() {
  const text = messageText.value.trim();
  if (!text || isLoading.value) return;

  messageText.value = '';

  // Agregar mensaje del usuario
  messages.value.push({
    id: Math.random().toString(36),
    type: 'user',
    content: text,
    timestamp: new Date()
  });

  await scrollToBottom();

  isLoading.value = true;

  try {
    const email = isAuthenticated.value ? userProfile.value!.email : '';
    const name = isAuthenticated.value ? userProfile.value!.name : 'Invitado';

    const response = await ChatbotService.sendMessage(
      text,
      email,
      name,
      isAuthenticated.value
    );

    if (response?.success && response.output) {
      messages.value.push({
        id: Math.random().toString(36),
        type: 'agent',
        content: parseMarkdown(response.output),
        timestamp: new Date()
      });
      playNotification();
    } else {
      messages.value.push({
        id: Math.random().toString(36),
        type: 'system',
        content: response?.message || 'Lo siento, tuve un problema de conexión. ¿Podrías intentar enviar tu mensaje de nuevo?',
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    messages.value.push({
      id: Math.random().toString(36),
      type: 'system',
      content: 'Lo siento, tuve un problema de conexión. ¿Podrías intentar enviar tu mensaje de nuevo?',
      timestamp: new Date()
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
    messageInput.value?.focus();
  }
}

async function resetConversation() {
  if (!confirm('¿Reiniciar la conversación y borrar la memoria de Clarita?')) return;

  messages.value = [
    {
      id: '1',
      type: 'agent',
      content: 'Conversación reiniciada. ¿En qué puedo ayudarte? 😊',
      timestamp: new Date()
    }
  ];

  suggestionsVisible.value = true;

  await ChatbotService.resetConversation(
    isAuthenticated.value ? userProfile.value!.email : ''
  );

  await scrollToBottom();
}

function selectPredefinedQuestion(question: PredefinedQuestion) {
  // Poner el texto de la pregunta en el input
  messageText.value = question.text;
  suggestionsVisible.value = false;

  // Si tiene blancos, autoseleccionar el primero para editar
  nextTick(() => {
    const input = messageInput.value;
    if (!input) return;

    input.focus();

    // Encontrar el primer blank y seleccionarlo
    const start = question.text.indexOf('______');
    if (start >= 0) {
      input.setSelectionRange(start, start + 6); // Selecciona "______"
    }
  });
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!isLoading.value) sendMessage();
  }
}

// Prevenir que se peguen imágenes + saludo inicial (cubre caso invitado)
onMounted(() => {
  pushWelcomeMessage();
  const input = messageInput.value as HTMLInputElement;
  if (input) {
    input.addEventListener('paste', (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      if (items.some(i => i.type.startsWith('image/'))) {
        e.preventDefault();
      }
    });
    input.addEventListener('drop', (e: DragEvent) => e.preventDefault());
    input.addEventListener('dragover', (e: DragEvent) => e.preventDefault());
  }
});

onBeforeUnmount(() => {
  notifAudio.pause();
});
</script>

<template>
  <!-- Botón flotante -->
  <button
    class="chat-toggle"
    @click="toggleChat"
    aria-label="Abrir chat con Clarita"
  >
    <img src="../../assets/home/mujercurosagente.png" alt="Clarita" class="chat-toggle-avatar" />
  </button>

  <!-- Widget chat -->
  <Transition name="chat-widget">
    <div v-if="isOpen" class="chat-widget fixed bottom-24 right-4 mt-4 w-96 max-h-[calc(100vh-200px)]">
      <!-- Header -->
      <div class="chat-header">
        <img src="../../assets/home/mujercursos.webp" alt="Clarita" class="header-avatar-img" />
        <div class="header-info">
          <p class="header-name">Clarita</p>
          <p class="header-status">
            <span class="status-dot"></span>
            En línea  
          </p>
        </div>
        <button class="header-btn header-reset" @click="resetConversation" title="Reiniciar conversación">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
        </button>
        <button class="header-btn header-close" @click="closeChat" title="Cerrar chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Área de mensajes -->
      <div ref="messagesArea" class="messages-area flex-1 overflow-y-auto">
        <!-- Título "Hoy · Conversación reiniciada" (solo al inicio) -->
        <p
          v-if="suggestionsVisible && messages.length <= 1 && !isLoading"
          class="suggestions-title"
        >
          Hoy · Conversación reiniciada
        </p>

        <template v-for="msg in messages" :key="msg.id">
          <!-- Mensaje de usuario -->
          <div v-if="msg.type === 'user'" class="bubble-row user">
            <img
              v-if="userPhotoUrl"
              :src="userPhotoUrl"
              :alt="userFirstName"
              class="chat-avatar-img"
            />
            <div v-else class="bubble-avatar user">{{ userFirstName.charAt(0).toUpperCase() }}</div>
            <div class="bubble">{{ msg.content }}</div>
          </div>

          <!-- Mensaje del agente -->
          <div v-else-if="msg.type === 'agent'" class="bubble-row agent">
            <img src="../../assets/home/mujercurosagente.png" alt="Clarita" class="chat-avatar-img-agent" />
            <div class="bubble rounded-bl-none" v-html="msg.content"></div>
          </div>

          <!-- Mensaje del sistema -->
          <div v-else class="bubble-row system">
            <div class="bubble">{{ msg.content }}</div>
          </div>
        </template>

        <!-- Preguntas predefinidas (después del saludo de Clarita) -->
        <div
          v-if="suggestionsVisible && messages.length <= 1 && !isLoading"
          class="suggestions-container mt-4"
        >
          <button
            v-for="question in predefinedQuestions"
            :key="question.id"
            class="suggestion-btn bg-white border border-blue-200 text-blue-600 text-sm py-2"
            @click="selectPredefinedQuestion(question)"
          >
            {{ question.text }}
          </button>
        </div>

        <!-- Typing indicator -->
        <div v-if="showTyping" class="bubble-row agent">
          <img src="../../assets/home/mujercurosagente.png" alt="Clarita" class="chat-avatar-img-agent" />
          <div class="typing-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>

      <!-- Input área -->
      <div class="input-area">
        <input
          ref="messageInput"
          v-model="messageText"
          type="text"
          placeholder="Escribe tu pregunta..."
          class="message-input"
          :disabled="isLoading"
          @keydown="handleKeyDown"
        />
        <button
          class="send-btn"
          :disabled="isLoading || !messageText.trim()"
          @click="sendMessage"
          aria-label="Enviar mensaje"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ────── BOTÓN FLOTANTE ────── */
.chat-toggle {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 0;
  color: white;
}

.chat-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(37, 99, 235, 0.55);
}

.chat-toggle-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 3px solid #2563eb;
  background: white;
  box-sizing: border-box;
}

/* ────── WIDGET CHAT ────── */
.chat-widget {
  height: 560px;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 10px 48px rgba(0, 0, 0, 0.13), 0 2px 10px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 40;
}

/* ────── TRANSICIÓN ────── */
.chat-widget-enter-active,
.chat-widget-leave-active {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.chat-widget-enter-from,
.chat-widget-leave-to {
  transform: scale(0.88) translateY(24px);
  opacity: 0;
  pointer-events: none;
}

/* ────── HEADER ────── */
.chat-header {
  background: #2563eb;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.header-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
}

.header-avatar-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 30%;
  scale: 1.1;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  background: white;
  padding: 2px;
  box-sizing: border-box;
}

.header-info {
  flex: 1;
}

.header-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  line-height: 1.2;
  margin: 0;
}

.header-status {
  font-size: 0.73rem;
  color: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  margin: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}

.header-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.72;
  transition: opacity 0.15s, background 0.15s;
  border-radius: 50%;
  color: white;
  width: 32px;
  height: 32px;
}

.header-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.18);
}

.header-btn svg {
  width: 17px;
  height: 17px;
}

/* ────── ÁREA DE MENSAJES ────── */
.messages-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}

.messages-area::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 4px;
}

/* ────── BURBUJAS ────── */
.bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.bubble-row.user {
  flex-direction: row-reverse;
}

.bubble-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 600;
  flex-shrink: 0;
}

.bubble-avatar.agent {
  background: #dbeafe;
  color: #2563eb;
}

.bubble-avatar.user {
  background: #ede9fe;
  color: #7c3aed;
}

.chat-avatar-img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.chat-avatar-img-agent {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 30%;
  scale: 1.3;
  flex-shrink: 0;
}

.bubble {
  max-width: 280px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.bubble-row.agent .bubble {
  background: #e0f2fe;
  color: #0369a1;
}

.bubble-row.agent .bubble.rounded-bl-none {
  border-bottom-left-radius: 0;
}

.bubble-row.user .bubble {
  background: #ede9fe;
  color: #6d28d9;
}

.bubble-row.system .bubble {
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 0.8rem;
  max-width: none;
  text-align: center;
}

.bubble :deep(strong) {
  font-weight: 600;
}

.bubble :deep(ul) {
  margin: 6px 0;
  padding-left: 16px;
}

.bubble :deep(li) {
  margin: 4px 0;
}

.bubble :deep(br) {
  content: "";
  display: block;
  height: 0.5em;
}

.bubble :deep(em) {
  font-style: italic;
}

.bubble :deep(.chat-list) {
  margin: 8px 0;
  padding-left: 18px;
}

.bubble :deep(.chat-action-link) {
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

/* ────── TYPING INDICATOR ────── */
.typing-bubble {
  background: #e0f2fe;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0369a1;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.5;
  }
  30% {
    opacity: 1;
  }
}

/* ────── INPUT ÁREA ────── */
.input-area {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #111827;
  background: #ffffff;
  resize: none;
  outline: none;
  transition: border-color 0.15s;
}

.message-input:focus {
  border-color: #2563eb;
}

.message-input:disabled {
  background: #f3f4f6;
  opacity: 0.6;
}

.send-btn {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.send-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 18px;
  height: 18px;
}

/* ────── PREGUNTAS PREDEFINIDAS ────── */
.suggestions-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
}

.suggestions-title {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  padding: 0 4px;
  font-weight: 500;
}

.suggestion-btn {
  border-radius: 10px;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-weight: 500;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
}

.suggestion-btn:hover {
  background: #eff6ff;
  border-color: #60a5fa;
  transform: translateX(2px);
}

.suggestion-btn:active {
  transform: translateX(1px);
  opacity: 0.8;
}

/* ────── RESPONSIVE ────── */
@media (max-width: 480px) {
  .chat-widget {
    width: calc(100vw - 32px);
    height: 70vh;
  }

  .chat-toggle {
    width: 52px;
    height: 52px;
  }
}
</style>
