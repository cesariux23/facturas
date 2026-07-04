<script setup>
import api from '@/services/api';
import { onMounted, ref } from 'vue';

const polizas = ref([]);
onMounted(() => {
  api.get('polizas')
    .then(response => {
      polizas.value = response.data
    })
})
</script>
<template>
  <table>
    <thead>
      <tr>
        <th class="px-2">poliza_gasto</th>
        <th class="px-2">fecha_poliza_gasto</th>
        <th class="px-2">capitulo</th>
        <th class="px-2">partida_gasto</th>
        <th class="px-2">descripcion_gasto</th>
        <th class="px-2">Importe_gasto</th>
        <th class="px-2">poliza_pago</th>
        <th class="px-2">fecha_poliza_pago</th>
        <th class="px-2">numero_cuenta</th>
        <th class="px-2">institucion_bancaria</th>
        <th class="px-2">referencia</th>
        <th class="px-2">fecha_transferencia</th>
        <th class="px-2">importe_pago</th>
        <th class="px-2">referencia</th>
        <th class="px-2">Folio</th>
        <th class="px-2">UUID</th>
        <th class="px-2">Fecha</th>
        <th class="px-2">NombreEmisor</th>
        <th class="px-2">Descripcion</th>
        <th class="px-2">Total</th>
        <th class="px-2">TotalImpuestosRetenidos</th>
        <th class="px-2">TotalImpuestosTrasladados</th>
        <th class="px-2">TotalNeto</th>
        <th class="px-2 text-blue-600">TotalOriginalFactura</th>
      </tr>
    </thead>
    <tbody v-for="(pol, idp) in polizas" :key="idp">
      <tr v-for="(factura, idf) in pol.facturas" :key="idf">
        <td class="px-2"> {{ pol.poliza_gasto }} </td>
        <td class="px-2"> {{ pol.fecha_poliza_gasto }} </td>
        <td class="px-2"> {{ pol.capitulo }} </td>
        <td class="px-2"> {{ pol.partida_gasto }} </td>
        <td class="px-2"> {{ pol.descripcion_gasto }} </td>
        <td class="px-2"> {{ pol.Importe_gasto }} </td>
        <td class="px-2"> {{ pol.poliza_pago }} </td>
        <td class="px-2"> {{ pol.fecha_poliza_pago }} </td>
        <td class="px-2"> {{ pol.numero_cuenta }} </td>
        <td class="px-2"> {{ pol.institucion_bancaria }} </td>
        <td class="px-2"> {{ pol.referencia }} </td>
        <td class="px-2"> {{ pol.fecha_transferencia }} </td>
        <td class="px-2"> {{ pol.importe_pago }} </td>
        <td class="px-2"> {{ pol.referencia }} </td>
        <td class="px-2"> {{ factura.Folio }} </td>
        <td class="px-2"> {{ factura.UUID }} </td>
        <td class="px-2"> {{ factura.Fecha }} </td>
        <td class="px-2"> {{ factura.NombreEmisor }} </td>
        <td class="px-2"> {{ factura.Descripcion }} </td>
        <td class="px-2"> {{ factura.Total }} </td>
        <td class="px-2"> {{ factura.TotalImpuestosRetenidos }} </td>
        <td class="px-2"> {{ factura.TotalImpuestosTrasladados }} </td>
        <td class="px-2"> {{ factura.Total }} </td>
        <td class="px-2"> {{ factura.TotalOriginal }} </td>
      </tr>
      <tr v-for="(factura, idf) in pol.recibos" :key="idf">
        <td class="px-2"> {{ pol.poliza_gasto }} </td>
        <td class="px-2"> {{ pol.fecha_poliza_gasto }} </td>
        <td class="px-2"> {{ pol.capitulo }} </td>
        <td class="px-2"> {{ pol.partida_gasto }} </td>
        <td class="px-2"> {{ pol.descripcion_gasto }} </td>
        <td class="px-2"> {{ pol.Importe_gasto }} </td>
        <td class="px-2"> {{ pol.poliza_pago }} </td>
        <td class="px-2"> {{ pol.fecha_poliza_pago }} </td>
        <td class="px-2"> {{ pol.numero_cuenta }} </td>
        <td class="px-2"> {{ pol.institucion_bancaria }} </td>
        <td class="px-2"> {{ pol.referencia }} </td>
        <td class="px-2"> {{ pol.fecha_transferencia }} </td>
        <td class="px-2"> {{ pol.importe_pago }} </td>
        <td class="px-2"> {{ pol.referencia }} </td>
        <td class="px-2"> {{ factura.Folio }} </td>
        <td class="px-2"> {{ factura.UUID }} </td>
        <td class="px-2"> {{ factura.Fecha }} </td>
        <td class="px-2"> {{ factura.NombreEmisor }} </td>
        <td class="px-2"> {{ factura.Descripcion }} </td>
        <td class="px-2"> {{ factura.Total }} </td>
        <td class="px-2"> {{ factura.TotalImpuestosRetenidos }} </td>
        <td class="px-2"> {{ factura.TotalImpuestosTrasladados }} </td>
        <td class="px-2"> {{ factura.Total }} </td>
        <td></td>
      </tr>
    </tbody>
  </table>
</template>
