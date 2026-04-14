<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getPosts, deletePost } from "@/api/post.api";
import { useRouter } from "vue-router";

const posts = ref([]);
const router = useRouter();

const fetchPosts = async () => {
  const res = await getPosts();
  posts.value = res.data;
};

const removePost = async (id: number) => {
  await deletePost(id);
  fetchPosts();
};

onMounted(fetchPosts);
</script>

<template>
  <div>
    <h1>Post List</h1>
    <button @click="router.push('/posts/create')">Create Post</button>

    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
        <button @click="router.push(`/posts/${post.id}/edit`)">Edit</button>
        <button @click="removePost(post.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>