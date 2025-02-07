<template>
  <GoogleLogin :callback="handleSuccess" @error="handleError" />
</template>

<script setup>
const handleSuccess = async (response) => {
  console.log("Token de Google:", response.credential);

  const res = await fetch("http://localhost:5000/verify-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: response.credential }),
  });

  const data = await res.json();
  console.log("Respuesta del backend:", data);
};

const handleError = () => {
  console.error("Error en la autenticación con Google");
};
</script>