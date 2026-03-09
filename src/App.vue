
<template>
  <router-view></router-view>
  <DynamicDialog />
</template>
<script setup>
import DynamicDialog from 'primevue/dynamicdialog';
import vueFilePond from 'vue-filepond';
import 'filepond/dist/filepond.min.css';
</script>