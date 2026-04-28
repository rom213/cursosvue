const FB_SCRIPT_ID = 'facebook-jssdk';
const SDK_URL = 'https://connect.facebook.net/es_ES/sdk.js';

let loadPromise: Promise<void> | null = null;

/**
 * Carga el SDK de Facebook, define `fbAsyncInit` e inicializa `FB.init`.
 * El script se inserta una sola vez; llamadas posteriores reutilizan la misma promesa.
 */
export function loadFbSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.FB) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  if (!appId) {
    return Promise.reject(new Error('VITE_FACEBOOK_APP_ID no está configurado'));
  }

  loadPromise = new Promise((resolve, reject) => {
    const fail = (reason: unknown) => {
      loadPromise = null;
      reject(reason);
    };

    window.fbAsyncInit = () => {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v19.0',
        });
        resolve();
      } catch (e) {
        fail(e);
      }
    };

    const s = document.createElement('script');
    s.id = FB_SCRIPT_ID;
    s.src = SDK_URL;
    s.async = true;
    s.defer = true;
    s.crossOrigin = 'anonymous';
    s.onerror = () => {
      fail(new Error('No se pudo descargar el SDK de Facebook'));
    };
    document.body.appendChild(s);
  });

  return loadPromise;
}

export function fbLogin(): Promise<{ accessToken: string }> {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('El SDK de Facebook no está listo'));
      return;
    }
    window.FB.login(
      (response) => {
        const token = response.authResponse?.accessToken;
        if (token) {
          resolve({ accessToken: token });
          return;
        }
        reject(new Error('Inicio de sesión cancelado o sin permisos'));
      },
      { scope: 'email,public_profile' }
    );
  });
}
