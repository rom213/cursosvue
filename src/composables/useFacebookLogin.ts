import { ref } from 'vue';
import axios from 'axios';
import { fbLogin, loadFbSdk } from '../services/FacebookSdk';
import AuthService from '../services/AuthServices';
import { authStore } from '../store/AuthStore';
import { toastStore } from '../store/ToastStore';

function messageFrom409(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const raw = error.response?.data;
    if (raw && typeof raw === 'object' && 'detail' in raw) {
      const d = (raw as { detail: unknown }).detail;
      if (typeof d === 'string') return d;
    }
  }
  return 'Este correo ya está registrado con otro método de acceso.';
}

export function useFacebookLogin(options?: { onSuccess?: () => void }) {
  const loading = ref(false);
  const userStore = authStore();
  const toasts = toastStore();

  async function handleFacebookLogin() {
    loading.value = true;
    try {
      await loadFbSdk();
      const { accessToken } = await fbLogin();
      const result = await AuthService.verifyFacebookToken(accessToken);
      if (result) {
        userStore.setProfile(result);
        options?.onSuccess?.();
      } else {
        toasts.add('error', 6000, 'No se pudo iniciar sesión con Facebook. Intenta de nuevo.');
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        toasts.add('error', 8000, messageFrom409(e));
      } else {
        const msg =
          e instanceof Error && e.message
            ? e.message
            : 'No se pudo iniciar sesión con Facebook. Intenta de nuevo.';
        toasts.add('error', 6000, msg);
      }
    } finally {
      loading.value = false;
    }
  }

  return { loading, handleFacebookLogin };
}
