<template>
  <div class="flex flex-col justify-center items-center">
    <div class="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl p-3 md:pt-5 gap-3 md:gap-5 [grid-template-rows:auto_1fr]">
      <div class="bg-white rounded-lg shadow-xl p-3 flex flex-col xs:flex-row items-center gap-x-3 gap-y-3">
        <div class="flex items-center gap-x-3 w-full">
          <BaseAvatar :id="store.state.user?.id || ''" size="64" class="w-16 h-16 rounded-lg flex-shrink-0" />
          <div class="w-full">
            <p>
              نام:
              <span class="font-bold">{{ store.state.user?.name + " " + store.state.user?.family }}</span>
            </p>
            <p>
              پایه و رشته:
              <span class="font-bold">دهم کامپیوتر</span>
            </p>
            <!-- <p>
              میانگین نمرات:
              <span class="font-bold">۱۹.۷۵</span>
            </p> -->
          </div>
        </div>
        <router-link to="/edit-profile" class="btn-primary p-2 w-full xs:w-max">ویرایش</router-link>
        <router-link to="/edit-profile" class="btn-secondary flex-shrink-0 p-2 w-full xs:w-max">نمایش بیشتر</router-link>
      </div>
      <div class="row-start-2 md:row-span-full md:col-start-2">
        <div class="bg-white rounded-lg shadow-xl w-full h-max p-3">
          <p class="text-lg font-bold">اعلان ها</p>
          <div class="bg-gray-300 h-0.5 my-2 rounded-full" />
          <div class="flex flex-col">
            <div v-for="notification in state.notifications" :key="notification.id">
              <StartAPNotification v-if="notification.type === NotificationType.StartAbsencePresence" :notification="notification" />
              <StopAPNotification v-if="notification.type === NotificationType.StopAbsencePresence" :notification="notification" />
              <StartCNotification v-else-if="notification.type === NotificationType.StartClass" :notification="notification" />
              <StopCNotification v-else-if="notification.type === NotificationType.StopClass" :notification="notification" />
            </div>
            <p v-if="state.notifications.length <= 0">شما هیچ اعلانی ندارید</p>
          </div>
        </div>
      </div>
      <div class="row-start-3 md:row-start-2 row-span-full">
        <div class="bg-white rounded-lg shadow-xl p-3 w-full">
          <p class="text-lg font-bold">کار های هفته</p>
          <div class="bg-gray-300 h-0.5 my-2 rounded-full" />
          <div class="flex flex-col">
            <div class="p-1 flex items-center gap-x-2">
              <div class="w-10 h-10 bg-violet-500 flex justify-center items-center rounded-lg shadow-lg flex-shrink-0">
                <BookOpenIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex flex-col justify-center md:justify-start w-full">
                <p><span class="font-bold">چهار شنبه</span> امتحان <span class="font-bold">ریاضی</span> از فصل ۱ تا ۳</p>
              </div>
            </div>
            <div class="p-1 flex items-center gap-x-2">
              <div class="w-10 h-10 bg-emerald-500 flex justify-center items-center rounded-lg shadow-lg flex-shrink-0">
                <PencilIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex flex-col justify-center md:justify-start w-full">
                <p><span class="font-bold">زبان</span> تمرین صفحه ۲۳ انجام شود</p>
              </div>
            </div>
            <div class="p-1 flex items-center gap-x-2">
              <div class="w-10 h-10 bg-emerald-500 flex justify-center items-center rounded-lg shadow-lg flex-shrink-0">
                <PencilIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex flex-col justify-center md:justify-start w-full">
                <p><span class="font-bold">فارسی</span> جدول صفحه ۱۲ انجام شود</p>
              </div>
            </div>
            <div class="p-1 flex items-center gap-x-2">
              <div class="w-10 h-10 bg-emerald-500 flex justify-center items-center rounded-lg shadow-lg flex-shrink-0">
                <PencilIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex flex-col justify-center md:justify-start w-full">
                <p><span class="font-bold">فیزیک</span> سوالات صفحه ۱۵ در دفتر پاکنویس و حل شود</p>
              </div>
            </div>
            <div class="p-1 flex items-center gap-x-2">
              <div class="w-10 h-10 bg-violet-500 flex justify-center items-center rounded-lg shadow-lg flex-shrink-0">
                <BookOpenIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex flex-col justify-center md:justify-start w-full">
                <p><span class="font-bold">دوشنبه</span> پرسش کلاسی <span class="font-bold">جغرافیا</span> از درس ۱ تا ۶</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { BookOpenIcon, PencilIcon } from "@heroicons/vue/solid";
import { defineComponent, onMounted, onUnmounted, reactive } from "@vue/runtime-core";
import { store } from "../store";
import BaseAvatar from "./utils/BaseAvatar.vue";
import { DbNotification, GetNotificationsErrorCode, NotificationType } from "../../server/shared";
import StartAPNotification from "./utils/notifications/StartAPNotification.vue";
import StopAPNotification from "./utils/notifications/StopAPNotification.vue";
import StartCNotification from "./utils/notifications/StartCNotification.vue";
import StopCNotification from "./utils/notifications/StopCNotification.vue";
import { getNotifications } from "../api";

export default defineComponent({
  components: {
    BookOpenIcon,
    PencilIcon,
    BaseAvatar,
    StartAPNotification,
    StopAPNotification,
    StartCNotification,
    StopCNotification,
  },
  setup() {
    const state = reactive({
      notifications: Array<DbNotification>(),
    });
    onMounted(async () => {
      if (!store.state.user) return;
      //
      const notifications = await getNotifications(store.state.user.id);

      if (notifications === GetNotificationsErrorCode.UserNotFound) console.log("User not found");
      else if (notifications === GetNotificationsErrorCode.Failure) console.log("Failure");
      else state.notifications = notifications;

      store.state.socket.on("notification", (notification: DbNotification) => {
        console.log(notification);
        state.notifications.unshift(notification);
      });
    });

    onUnmounted(() => {
      store.state.socket.off("notification");
      //
    });
    return {
      state,
      store,
      NotificationType,
    };
  },
});
</script>
