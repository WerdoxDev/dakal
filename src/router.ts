import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import LandingPage from "./components/LandingPage.vue";
import DashboardPage from "./components/DashboardPage.vue";
import TDashboardPage from "./components/TDashboardPage.vue";
import LoginPage from "./components/LoginPage.vue";
import RegisterPage from "./components/RegisterPage.vue";
import EditProfile from "./components/EditProfile.vue";
import EditClass from "./components/EditClass.vue";
import { store } from "./store";
import { Permissions } from "../server/shared";

const routes: Array<RouteRecordRaw> = [
  { name: "Landing Page", path: "/", component: LandingPage },
  { name: "Dashboard", path: "/dashboard", component: DashboardPage, meta: { requirePermission: Permissions.AccessDashboard } },
  { name: "Teacher Dashboard", path: "/teacher-dashboard", component: TDashboardPage, meta: { requirePermission: Permissions.AccessTDashboard } },
  {
    name: "Edit Profile",
    path: "/edit-profile/:userId",
    component: EditProfile,
    props: true,
    meta: { requirePermission: Permissions.AccessEditProfile },
  },
  { name: "Edit Class", path: "/edit-class/:classId", component: EditClass, props: true, meta: { requirePermission: Permissions.AccessEditClass } },
  { name: "Login", path: "/login", component: LoginPage, meta: { requireLoggedOff: true } },
  { name: "Register", path: "/register", component: RegisterPage, meta: { requireLoggedOff: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  if (!store.isLoggedIn()) await store.refreshToken();
  if (to.meta.requireLoggedOff && store.isLoggedIn()) return "/";
  if (to.meta.requirePermission && !store.hasPermission(to.meta.requirePermission as Permissions)) return from;
});

export function useRouter() {
  return router;
}
