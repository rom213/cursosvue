<script setup lang="ts">
import AuthService from '../../services/AuthServices';
import FooterComponent from '../footer/footer.component.vue';
import { authStore } from '../../store/AuthStore';
import { useFacebookLogin } from '../../composables/useFacebookLogin';

const autstore = authStore()

const { loading: facebookLoading, handleFacebookLogin } = useFacebookLogin();





// Esta función se ejecuta al autenticarse correctamente con Google
const handleSuccess = async (response:any) => {
  const ser = await AuthService.verifyToken(response.credential)
  autstore.setProfile(ser)
};

const handleError = () => {
  console.error("Error en la autenticación con Google");
};


</script>
<template>
  <div class="relative flex justify-center pt-16">
    <div>
      <h2 class="text-center font-semibold text-2xl">INICIAR SESION</h2>
      <div class="flex flex-col gap-4">
        <div class="px-8">
          <p>Aquí podrás:</p>
          <ul class="list-disc ml-4 pl-2">
            <li>Comprar los cursos que quieres</li>
            <li>Configurar tu cuenta</li>
            <li>Agregar el PayPal para desembolso de dinero</li>
            <li>Consultar tus ventas</li>
          </ul>
        </div>

        <div class="flex justify-center">
          <div class=" relative flex flex-col gap-2 items-center">
            <GoogleLogin class="w-[230px]" :callback="handleSuccess" @error="handleError" />
            <button
              type="button"
              class="fb-page-login-btn w-[230px]"
              :disabled="facebookLoading"
              @click="handleFacebookLogin"
            >
              <span class="inline-flex shrink-0" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              <span>{{ facebookLoading ? 'Conectando…' : 'Iniciar sesión con Facebook' }}</span>
            </button>
            <div class="w-[230px]">
              <div class="flex text-[14px] gap-2 border border-gray-300 p-1 rounded-sm text-gray-7s00">
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.3055 10.0415H21.5V10H12.5V14H18.1515C17.327 16.3285 15.1115 18 12.5 18C9.1865 18 6.5 15.3135 6.5 12C6.5 8.6865 9.1865 6 12.5 6C14.0295 6 15.421 6.577 16.4805 7.5195L19.309 4.691C17.523 3.0265 15.134 2 12.5 2C6.9775 2 2.5 6.4775 2.5 12C2.5 17.5225 6.9775 22 12.5 22C18.0225 22 22.5 17.5225 22.5 12C22.5 11.3295 22.431 10.675 22.3055 10.0415Z"
                    fill="#FFC107" />
                  <path
                    d="M3.65308 7.3455L6.93858 9.755C7.82758 7.554 9.98058 6 12.5001 6C14.0296 6 15.4211 6.577 16.4806 7.5195L19.3091 4.691C17.5231 3.0265 15.1341 2 12.5001 2C8.65908 2 5.32808 4.1685 3.65308 7.3455Z"
                    fill="#FF3D00" />
                  <path
                    d="M12.4999 22C15.0829 22 17.4299 21.0115 19.2044 19.404L16.1094 16.785C15.0719 17.5745 13.8037 18.0014 12.4999 18C9.89891 18 7.69041 16.3415 6.85841 14.027L3.59741 16.5395C5.25241 19.778 8.61341 22 12.4999 22Z"
                    fill="#4CAF50" />
                  <path
                    d="M22.3055 10.0415H21.5V10H12.5V14H18.1515C17.7571 15.1082 17.0467 16.0766 16.108 16.7855L16.1095 16.7845L19.2045 19.4035C18.9855 19.6025 22.5 17 22.5 12C22.5 11.3295 22.431 10.675 22.3055 10.0415Z"
                    fill="#1976D2" />
                </svg>
                Registrarme con Google
              </div>
              <div class="absolute top-12 opacity-0">
                <GoogleLogin class="" :callback="handleSuccess" @error="handleError" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
  <div class="absolute bottom-0 w-full">
    <FooterComponent />
  </div>




</template>

<style>
.fb-page-login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.5rem 0.9rem;
  min-height: 2.5rem;
  background: #1877f2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
}
.fb-page-login-btn:hover:not(:disabled) {
  background: #166fe5;
}
.fb-page-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.custom-google-button {
  position: relative;
  width: fit-content;
}

.custom-google-button::after {
  content: "Iniciar session";
  /* Texto personalizado */
  position: absolute;
  left: 40px;
  /* Ajusta según sea necesario */
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: black;
  font-weight: bold;
}
</style>