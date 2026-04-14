<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getPostById, updatePost } from "@/api/post.api";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const form = ref({
  title: "",
  body: "",
});

const fetchPost = async () => {
  const res = await getPostById(Number(route.params.id));
  form.value = res.data;
};

const submit = async () => {
  await updatePost(Number(route.params.id), form.value);
  router.push("/posts");
};

onMounted(fetchPost);
</script>

<template>
  <div>
    <h1>Edit Post</h1>

    <input v-model="form.title" />
    <textarea v-model="form.body"></textarea>

    <button @click="submit">Update</button>
  </div>
</template>