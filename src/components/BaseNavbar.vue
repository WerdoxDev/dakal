<template>
  <div class="bg-white flex justify-center items-center shadow-md">
    <Popover class="flex h-14 p-3 max-w-6xl w-full items-center z-10">
      <div class="flex items-center md:w-auto w-full md:flex-shrink-0">
        <AcademicCapIcon class="w-8 h-8 text-blue-500" />
        <router-link to="/" class="font-bold text-2xl text-blue-500 w-max mr-2 select-none">سامانه دکل</router-link>
      </div>
      <div class="hidden md:flex items-center mr-10 gap-x-5 w-full">
        <div
          v-for="item in navbarItems.filter((x) => !x.permission || store.hasPermission(x.permission))"
          :key="item.text"
          :class="router.currentRoute.value.fullPath === item.link ? 'bg-gray-200' : 'hover:bg-gray-100 hover:scale-105'"
          class="flex justify-center items-center text-black rounded-lg px-2 py-1 transform transition-all duration-100 cursor-pointer"
        >
          <component :is="item.icon" class="flex-shrink-0 h-5 w-5 text-blue-500" />
          <router-link :to="item.link" class="mr-2 font-bold select-none">{{ item.text }}</router-link>
        </div>
      </div>
      <div v-if="!store.state.user" class="hidden md:flex justify-center items-center flex-shrink-0">
        <router-link to="/register" class="btn-secondary px-2 py-1">ثبت نام</router-link>
        <p class="text-center text-base text-gray-500 mr-2">
          قبلا حساب کاربری داشته اید؟
          <router-link to="/login" class="text-blue-500 hover:text-blue-600">ورود</router-link>
        </p>
      </div>
      <div v-else class="hidden md:flex justify-center items-center flex-shrink-0 gap-x-3">
        <BaseAvatar :id="store.state.user?.id || ''" size="40" class="w-10 h-10 rounded-full" />
        <div>
          <p>{{ store.state.user.name + " " + store.state.user.family }}</p>
          <p>{{ store.state.user.phone }}</p>
        </div>

        <router-link :to="{ name: 'Edit Profile', params: { userId: store.state.user.id } }" class="btn-primary px-2 py-1">ویرایش</router-link>
        <button class="btn-secondary px-2 py-1" @click="logout()">خروج</button>
      </div>
      <PopoverButton class="flex-shrink-0 hover:bg-gray-200 p-1 rounded-lg md:hidden">
        <MenuIcon class="w-8 h-8 text-gray-500 hover:text-gray-700" />
      </PopoverButton>
      <transition
        enter-active-class="duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <PopoverPanel focus class="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-10">
          <div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-300">
            <div class="p-3">
              <div class="flex items-center justify-between">
                <div class="w-full flex items-center">
                  <AcademicCapIcon class="w-8 h-8 text-blue-500" />
                  <router-link to="/" class="text-2xl text-blue-500 w-max mr-2">
                    <PopoverButton class="font-bold select-none">سامانه دکل</PopoverButton>
                  </router-link>
                </div>
                <PopoverButton class="flex-shrink-0 hover:bg-gray-200 p-1 rounded-lg">
                  <XIcon class="w-8 h-8 text-gray-500 hover:text-gray-700" />
                </PopoverButton>
              </div>
              <div class="mt-4 flex flex-col gap-y-1">
                <div
                  v-for="item in navbarItems.filter((x) => !x.permission || store.hasPermission(x.permission))"
                  :key="item.text"
                  :class="router.currentRoute.value.fullPath === item.link ? 'bg-gray-200' : 'hover:bg-gray-100'"
                  class="p-3 flex items-center rounded-md"
                >
                  <component :is="item.icon" class="flex-shrink-0 h-5 w-5 text-blue-500" />
                  <router-link :to="item.link" class="mr-2 w-full">
                    <PopoverButton class="w-full font-bold text-right select-none">{{ item.text }}</PopoverButton>
                  </router-link>
                </div>
              </div>
            </div>
            <div v-if="!store.state.user" class="p-3 flex flex-col justify-center gap-y-2">
              <router-link to="/register" class="btn-secondary mx-10 py-2">
                <PopoverButton class="w-full h-full">ثبت نام</PopoverButton>
              </router-link>
              <p class="text-center text-gray-500">
                قبلا حساب کاربری داشته اید؟
                <!-- <PopoverButton> -->
                <router-link to="/login" class="text-blue-500 hover:text-blue-600">
                  <PopoverButton>ورود</PopoverButton>
                </router-link>
                <!-- </PopoverButton> -->
              </p>
            </div>
            <div v-else class="p-3 flex flex-col justify-center gap-y-2">
              <div class="flex justify-center items-center gap-x-2">
                <BaseAvatar :id="store.state.user?.id || ''" size="40" class="w-10 h-10 rounded-full" />
                <div>
                  <p>{{ store.state.user.name + " " + store.state.user.family }}</p>
                  <p>{{ store.state.user.phone }}</p>
                </div>
              </div>
              <button class="btn-secondary mx-10 py-2" @click="logout()">خروج</button>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script lang="ts">
import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from "@headlessui/vue";
import { MenuIcon, XIcon, ClipboardListIcon, DocumentReportIcon, AcademicCapIcon, ChartPieIcon } from "@heroicons/vue/solid";
import { defineComponent } from "@vue/runtime-core";
import { logoutUser } from "../api";
import { LogoutErrorCode, Permissions, NavbarItem } from "../../server/shared";
import { useRouter } from "../router";
import { store } from "../store";
import BaseAvatar from "./utils/BaseAvatar.vue";
const navbarItems: NavbarItem[] = [
  { text: "داشبورد معلم", link: "/teacher-dashboard", permission: Permissions.AccessTDashboard, icon: ChartPieIcon, selected: false },
  { text: "داشبورد دانش آموز", link: "/dashboard", permission: Permissions.AccessDashboard, icon: ChartPieIcon, selected: false },
  // { text: "لیست مدارس", link: "", icon: ClipboardListIcon, selected: false },
  // { text: "گزارشات", link: "", icon: DocumentReportIcon, selected: false },
];

export default defineComponent({
  components: {
    MenuIcon,
    XIcon,
    ClipboardListIcon,
    DocumentReportIcon,
    AcademicCapIcon,
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
    BaseAvatar,
  },
  setup() {
    const router = useRouter();
    async function logout() {
      const result = await logoutUser();
      if (result !== LogoutErrorCode.Failure) {
        store.setAccessToken("");
        useRouter().push("/login");
      }
    }

    return {
      store,
      navbarItems,
      logout,
      router,
    };
  },
});
</script>
;
