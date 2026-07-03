<script setup>
import { computed, ref, watch } from 'vue';
import api from '@/services/api'
const poliza_gasto = ref('');
const poliza = ref('');
const status_txt = ref('');
const granTotal = computed(() => {
  if (poliza.value && poliza.value.facturas) {
    return poliza.value.facturas.reduce((total, factura) => total + factura.Total, 0);
  }
  return 0;
});

const status = computed(() => {
  if (poliza.value) {
    if (granTotal.value == 0) {
      return 'Sin facturas asociadas.';
    } else if (granTotal.value < poliza.value.Importe_gasto) {
      return 'El total de facturas es menor al importe de la poliza.';
    } else if (granTotal.value > poliza.value.Importe_gasto) {
      return 'El total de facturas excede el importe de la poliza.';
    } else if (granTotal.value == poliza.value.Importe_gasto) {
      return 'Total correcto.';
    }
  }
  return '';
});

watch(granTotal, () => {
  status_txt.value = status.value;
});

const uuid = ref('');

const error = ref(null);

const searchPoliza = () => {
  error.value = null;
  const poliza_gasto_value = poliza_gasto.value.trim();
  if (!poliza_gasto_value.includes('/')) {
    poliza_gasto.value = poliza_gasto_value + '/001';
  }
  api.get('/polizas/search/', { params: { poliza: poliza_gasto.value } })
    .then(response => {
      if (response.data && response.data.length == 1) {
        poliza.value = response.data[0];
        if (!poliza.value.status) {
          poliza.value.status = status.value;
        }
      } else {
        if (response.data && response.data.length > 1) {
          alert('Múltiples resultados encontrados. Por favor, refine su búsqueda.');
        } else {
          alert('Poliza no encontrada.');
        }
      }
    })
    .catch(error => {
      console.error('Error fetching poliza details:', error);
      error.value = error.response ? error.response.data : 'Error de red';
    });
};

const searchFactura = () => {
  error.value = null;
  api.get('/facturas/search/', { params: { UUID: uuid.value } })
    .then(response => {
      if (response.data && response.data.length == 1) {
        poliza.value.facturas.push(response.data[0]);
        uuid.value = '';
      } else {
        if (response.data && response.data.length > 1) {
          alert('Múltiples resultados encontrados. Por favor, refine su búsqueda.');
        } else {
          alert('Factura no encontrada.');
        }
      }
    })
    .catch(error => {
      console.error('Error fetching factura details:', error);
      error.value = error.response ? error.response.data : 'Error de red';
    });
};

const savePoliza = () => {
  poliza.value.status = status_txt.value;
  api.post('/validacion', poliza.value)
    .then(() => {
      alert('Poliza guardada exitosamente.');
    })
    .catch(_error => {
      error.value = _error.response.data.message.includes('Duplicate entry') ? 'Factura ya registrada' : _error.response.data.message;
      console.log(_error);
      console.error('Error saving poliza:', _error);
    });
};

const numberFormat = (value) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

</script>

<template>
  <main>
    <div class="flex flex-col flex-1 gap-4">
      <form class="flex-1 flex gap-2" @submit.prevent="searchPoliza">
        <input v-model="poliza_gasto" type="text" placeholder="Número de poliza"
          class="flex-1 border rounded-md p-2 border-gray-300" />
        <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Buscar
        </button>
      </form>
      <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h2 class="text-lg font-bold">
          Detalles de la poliza
        </h2>
        <div v-if="poliza" class="py-4 border-t-2 border-gray-400">
          <p><strong>Número de poliza:</strong> {{ poliza.poliza_gasto }}</p>
          <p><strong>Importe:</strong> {{ numberFormat(poliza.Importe_gasto) }}</p>
          <p><strong>Descripción del gasto:</strong> {{ poliza.descripcion_gasto }}</p>
          <p class="text-sm bg-green-100 mt-5 p-2 rounded" v-if="poliza.status"><strong>Ultimo status:</strong> {{
            poliza.status }}</p>
          <p v-else class=" text-sm bg-yellow-100 mt-5 p-2 rounded">No se ha validado</p>
        </div>
      </div>
      <div class="flex gap-2">
        <div class="w-  1/3 text-lg font-bold self-center">
          <strong>Total:</strong> {{ numberFormat(granTotal) }}
        </div>
        <div class="flex-1 flex flex-col gap-2 px-6">
          <input type="text" v-model="status_txt"
            class="border rounded-md p-2 border-gray-300 bg-gray-50 placeholder:text-gray-500"
            placeholder="Status de la validación" />
        </div>
        <button class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
          :disabled="!poliza.poliza_gasto" @click="savePoliza">
          Guardar {{ poliza.facturas && poliza.facturas.length == 0 ? 'sin facturas' : '' }}
        </button>
      </div>
      <div class="flex-1 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h2 class="text-lg font-bold">
          Facturas
        </h2>
        <form class="flex-1 flex gap-2" @submit.prevent="searchFactura">
          <input v-model="uuid" type="text" placeholder="UUID"
            class="flex-1 border rounded-md p-2 bg-white border-gray-300" />
          <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 "
            type="submit" :disabled="uuid.trim() === ''">
            Buscar
          </button>
        </form>
        <div v-if="poliza.facturas && poliza.facturas.length > 0" class="py-4">
          <table class="min-w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr class="bg-gray-200">
                <th>#</th>
                <th>UUID</th>
                <th>Importe</th>
                <th>Fecha de emisión</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(factura, idx) in poliza.facturas" :key="factura.id" class="border-t border-gray-300">
                <td class="p-2">{{ idx + 1 }}</td>
                <td class="p-2">{{ factura.UUID }}</td>
                <td class="p-2">
                  <input type="text" v-model="factura.Total" class="border rounded-md p-2 border-gray-300 bg-gray-50" />
                </td>
                <td class="p-2">{{ new Date(factura.Fecha).toLocaleDateString() }}</td>
                <td class="p-2">{{ factura.Descripcion }}</td>
                <td class="p-2">
                  <button @click="poliza.facturas.splice(idx, 1)"
                    class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-sm">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="py-4">
          <p>No se encontraron facturas para esta poliza.</p>
        </div>
      </div>
      <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-md border border-red-400">
        <p><strong>Error:</strong> {{ error }}</p>
      </div>
    </div>
  </main>
</template>
