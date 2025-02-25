
<script setup>
import { onMounted } from 'vue'
import AuthService from '../services/AuthServices';

// Esta función se ejecutará cuando el componente se monte
onMounted(async () => {
  const res = AuthService.getProfile()
  console.log(res);

  // const res2 = await fetch("http://localhost:5001/profile", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ token: "" }),  // Reemplaza "hola" por el token real si es necesario
  //   credentials: 'include'
  // });

  // // Usar la respuesta correcta para obtener el JSON
  // const data2 = await res2.json();
  // console.log("Respuesta del backend (/profile):", data2);
});

// Esta función se ejecuta al autenticarse correctamente con Google
const handleSuccess = async (response) => {
  console.log("Token de Google:", response.credential);

  const ser=AuthService.verifyToken(response.credential)
  console.log(ser);
  // const res = await fetch("http://localhost:5001/verify-token", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ token: response.credential }),
  //   credentials: 'include'
  // });

  // const data = await res.json();
  // console.log("Respuesta del backend (/verify-token):", data);
};

const handleError = () => {
  console.error("Error en la autenticación con Google");
};
</script>