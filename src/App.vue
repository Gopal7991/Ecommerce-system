<template>
  <router-view></router-view>
  <DynamicDialog />
</template>

<script setup>
import DynamicDialog from 'primevue/dynamicdialog';

// FilePond imports
import vueFilePond from 'vue-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css';

// FilePond plugins
import FilePondPluginFilePoster from 'filepond-plugin-file-poster';

// Register plugins
import * as FilePond from 'filepond';
FilePond.registerPlugin(FilePondPluginFilePoster);

// Create Vue FilePond component
const FilePondComponent = vueFilePond(FilePondPluginFilePoster);
</script>