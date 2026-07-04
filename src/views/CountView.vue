<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const estadisticas = ref({
  Fecha: [],
  Status: [],
});
onMounted(() => {

  api.get('/validacion')
    .then(response => {
      estadisticas.value = response.data;
    })
    .catch(error => {
      console.error('Error fetching statistics:', error);
    });
});
</script>
<template>
  <div class="flex flex-col gap-4 max-w-7xl">
    <h1 class="text-2xl font-bold">Conteo</h1>
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-bold text-green-600">Por fecha de registro</h2>
      <p v-for="value in estadisticas.Fecha" :key="value.date" class="text-sm flex gap-2 p7-4">
        <strong>{{ value.date }}:</strong>
        <span>{{ value.total }}</span>
      </p>
      <h2 class="text-lg font-bold text-green-600">Por fecha de status de validacion</h2>
      <p v-for="value in estadisticas.Status" :key="value.status">
        <strong>{{ value.status }}:</strong> {{ value.total }}
      </p>
    </div>
  </div>
</template>
