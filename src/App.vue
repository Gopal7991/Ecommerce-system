<template>
  <router-view></router-view>
  <DynamicDialog />
</template>

<script setup>
import DynamicDialog from 'primevue/dynamicdialog';
// import ReceiptService from '@/services/ReceiptService.js';

import vueFilePond from 'vue-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css';

import FilePondPluginFilePoster from 'filepond-plugin-file-poster';

import * as FilePond from 'filepond';
FilePond.registerPlugin(FilePondPluginFilePoster);

const FilePondComponent = vueFilePond(FilePondPluginFilePoster);
// onMounted(() => {
//   ReceiptService.getReceipts(); // example function
// });
</script>