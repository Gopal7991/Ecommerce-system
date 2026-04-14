<script setup lang="ts">
import { ref } from "vue";
import { createPost } from "@/api/post.api";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
  title: "",
  body: "",
});

const submit = async () => {
  await createPost(form.value);
  router.push("/posts");
};
</script>

<template>
  <div>
    <h1>Create Post</h1>

    <input v-model="form.title" placeholder="Title" />
    <textarea v-model="form.body" placeholder="Body"></textarea>

    <button @click="submit">Save</button>
  </div>
</template>