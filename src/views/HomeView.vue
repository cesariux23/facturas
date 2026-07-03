<script setup>
import { computed, ref, watch } from 'vue';
import api from '@/services/api'
const poliza_gasto = ref('');
const reciboModel = {
  poliza: '',
  //RfcEmisor: '',
  NombreEmisor: '',
  Fecha: '',
  Total: 0,
  Descripcion: '',
  UUID: 'RECIBO SIMPLE',
  Tipo: 'Recibo',
};

const recibo = ref({ ...reciboModel });

const poliza = ref({ Importe_gasto: 0, facturas: [] });
const status_txt = ref('');
const granTotal = computed(() => {
  if (poliza.value && poliza.value.facturas.length > 0) {
    return poliza.value.facturas.reduce((total, factura) => total + Number.parseFloat(factura.Total), 0);
  }
  return 0;
});

const diferencia = computed(() => {
  if (poliza.value) {
    return poliza.value.Importe_gasto - granTotal.value;
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
const req_pago = ref(false);

const searchPoliza = () => {
  error.value = null;
  const poliza_gasto_value = poliza_gasto.value.trim();
  if (!poliza_gasto_value.includes('/')) {
    poliza_gasto.value = poliza_gasto_value + '/001';
  }
  api.get('/polizas/search/', { params: { poliza: poliza_gasto.value } })
    .then(response => {
      error.value = null;
      if (response.data && response.data.length == 1) {
        poliza.value = response.data[0];
        req_pago.value = poliza.value.poliza_gasto.split('/')[1] == '001';

        if (!poliza.value.numero_cuenta) poliza.value.numero_cuenta = '12433 2318';
        if (!poliza.value.folio_poliza_pago) {
          const init_folio = String(poliza.value.poliza_gasto.split('/')[0]);

          console.log(init_folio.startsWith('8'));
          if (init_folio.startsWith('8')) poliza.value.poliza_pago = '4' + init_folio.slice(1);
        }
        if (!poliza.value.institucion_bancaria) poliza.value.institucion_bancaria = 'BBVA';
        if (!poliza.value.status) {
          poliza.value.status = status.value;
        }
        status_txt.value = poliza.value.status;

        recibo.value = { ...reciboModel, poliza: poliza.value.poliza_gasto, Fecha: poliza.value.fecha_poliza_gasto, Total: poliza.value.Importe_gasto };
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
        const factura = response.data[0];
        factura.Total = parseFloat(factura.Total); // Ensure Total is a number
        factura.Fecha = new Date(factura.Fecha);
        factura.Tipo = 'Factura';
        poliza.value.facturas.push(factura);
        uuid.value = '';
        recibo.value.Total = diferencia.value > 0 ? diferencia.value : 0;
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
  const polizaToSave = {
    ...poliza.value,
  };
  if (req_pago.value && !poliza.value.referencia)
    error.value = 'es necesario la información del pago';
  else {
    api.post('/validacion', polizaToSave)
      .then(() => {
        alert('Poliza guardada exitosamente.');
        error.value = null;
      })
      .catch(_error => {
        error.value = _error.response.data.message.includes('Duplicate entry') ? 'Factura ya registrada' : _error.response.data.message;
        console.log(_error);
        console.error('Error saving poliza:', _error);
      });
  }
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
        <div v-if="poliza" class="py-4 border-t-2 border-gray-400 flex gap-4">
          <p><strong>Número de poliza:</strong> {{ poliza.poliza_gasto }}</p>
          <p><strong>Fecha poliza:</strong> {{ poliza.fecha_poliza_gasto }}</p>
          <p><strong>Importe:</strong> {{ numberFormat(poliza.Importe_gasto) }}</p>
          <p><strong>Descripción del gasto:</strong> {{ poliza.descripcion_gasto }}</p>
        </div>
        <h2 class="text-lg font-bold py-2 border-b-2 mb-2 border-gray-400">
          Detalles del pago
        </h2>
        <div class="flex gap-4 pb-4">
          <div class="flex flex-col gap-1">
            Folio poliza pago
            <input v-model="poliza.poliza_pago" type="text" placeholder="Folio poliza pago"
              class="border rounded-md p-2 border-gray-300 bg-white" />
          </div>
          <div class="flex flex-col gap-1">
            Fecha poliza
            <input v-model="poliza.fecha_poliza_pago" type="date" placeholder="Fecha"
              class="border rounded-md p-2 border-gray-300 bg-white" />
          </div>
          <div class="flex flex-col gap-1">
            Banco
            <input v-model="poliza.institucion_bancaria" type="text" placeholder="Banco"
              class="border rounded-md p-2 border-gray-300 bg-white" />
          </div>
          <div class="flex flex-col gap-1">
            Núm. cuenta
            <input v-model="poliza.numero_cuenta" type="text" placeholder="Núm. Cuenta"
              class="border rounded-md p-2 border-gray-300 bg-white" />
          </div>
          <div class="flex flex-col gap-1">
            Referencia
            <input v-model="poliza.referencia" type="text" placeholder="Referencia"
              class="border rounded-md p-2 border-gray-300 bg-white" />
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex flex-col gap-1">
            Fecha Trasferencia
            <input v-model="poliza.fecha_transferencia" type="date"
              class="border rounded-md p-2 border-gray-300 bg-white" />
          </div>
          <div class="flex flex-col gap-1">
            ImportePago
            <input v-model="poliza.importe_pago" class="border rounded-md p-2 border-gray-300 bg-white" />
          </div>
        </div>
        <div>
          <p class="text-sm bg-green-100 mt-5 p-2 rounded" v-if="poliza.status"><strong>Ultimo status:</strong> {{
            poliza.status }}</p>
          <p v-else class=" text-sm bg-yellow-100 mt-5 p-2 rounded">No se ha validado</p>
        </div>
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
        {{ req_pago }}
        <form class="flex-1 flex flex-col gap-2 mt-4" @submit.prevent>
          <h2 class="text-lg font-bold">Recibo simple</h2>
          <div class="flex gap-2">
            <input v-model="recibo.NombreEmisor" type="text" placeholder="UUID o Nombre Proveedor"
              class="border rounded-md p-2 border-gray-300 bg-white" />
            <input v-model="recibo.Fecha" type="date" placeholder="Fecha"
              class="border rounded-md p-2 border-gray-300 bg-white" />
            <input v-model.number="recibo.Total" type="number" placeholder="Total"
              class="border rounded-md p-2 border-gray-300 bg-white" />
            <input v-model="recibo.Descripcion" type="text" placeholder="Concepto"
              class="border rounded-md p-2 border-gray-300 bg-white flex-1" />
            <button @click.prevent="poliza.facturas.push({ ...recibo })"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Agregar
            </button>
          </div>
        </form>
        <div v-if="poliza.facturas && poliza.facturas.length > 0" class="py-4">
          <table class="min-w-full border-collapse border border-gray-300 bg-white text-sm">
            <thead>
              <tr class="bg-gray-200">
                <th>#</th>
                <th>UUID</th>
                <th>Importe</th>
                <th>Fecha de emisión</th>
                <th>RFC emisor</th>
                <th>Nombre emisor</th>
                <th>Concepto</th>
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
                <td class="p-2">{{ factura.RfcEmisor }}</td>
                <td class="p-2">{{ factura.NombreEmisor }}</td>
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
      <div class="flex gap-6">
        <div class="text-lg font-bold self-center">
          <strong>Total soporte:</strong> {{ numberFormat(granTotal) }}
        </div>
        <div class="text-lg font-bold self-center">
          <strong>Diferencia:</strong> {{ numberFormat(diferencia) }}
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
      <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-md border border-red-400">
        <p><strong>Error:</strong> {{ error }}</p>
      </div>
    </div>
  </main>
</template>
