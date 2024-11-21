import { createWebHistory, createRouter } from "vue-router";
import admin from "./admin.js";
import client from "./client.js";

const routes = [...admin, ...client];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
