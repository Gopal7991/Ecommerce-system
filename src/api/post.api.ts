import { apiFactory } from "./apiFactory";

const postApi = apiFactory("/posts");

export const getPosts = postApi.getAll;
export const getPostById = postApi.getOne;
export const createPost = postApi.create;
export const updatePost = postApi.update;
export const deletePost = postApi.delete;