<template>
  <div class="flex justify-center">
    <div class="p-3 max-w-md md:p-10 w-full">
      <form class="bg-white rounded-lg shadow-lg p-3 flex flex-col" @submit.prevent>
        <p class="text-xl md:text-2xl text-blue-500 font-bold text-center">ویرایش پروفایل</p>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <div v-if="getMessages('general').length > 0">
          <p v-for="message in getMessages('general')" :key="message.group" class="text-center" :class="`text-${message.color}-500`">
            {{ message.message }}
          </p>
        </div>
        <div class="flex flex-col justify-center items-center space-y-3">
          <input ref="avatar" type="file" class="hidden" accept="image/*" @change="setAvatarImage()" />
          <div class="relative group cursor-pointer select-none" @click="avatar?.click()">
            <!-- <img :src="`http://localhost:3002/avatar/${store.state.user?.id}/128`" class="object-cover w-20 h-20 rounded-full" /> -->
            <UserIcon v-if="!state.avatarImage" class="w-20 h-20 rounded-full border-2 border-gray-300 text-blue-500" />
            <img v-else :src="`data:image/png;base64,${state.avatarImage}`" class="object-cover w-20 h-20 rounded-full" alt="avatar" />
            <div class="absolute inset-0 rounded-full hidden group-hover:flex justify-center items-center overflow-hidden">
              <div class="z-10">
                <p class="text-white">تغییر</p>
                <p class="text-white">عکس</p>
              </div>
              <div class="absolute bg-black opacity-50 inset-0"></div>
            </div>
            <PencilAltIcon class="bg-white p-1 rounded-full absolute top-0 w-6 h-6 text-blue-500" />
            <XIcon
              v-if="state.avatarImage"
              class="bg-white p-1 rounded-full absolute top-0 left-0 w-6 h-6 text-rose-500"
              @click.stop="removeAvatarImage()"
            />
          </div>
          <div class="flex justify-center w-full gap-x-3">
            <BaseTextbox v-model:text="state.name" label="نام" placeholder="نام" main-class="w-full">
              <p v-for="message in getMessages('name')" :key="message.group" :class="`text-${message.color}-500`">
                {{ message.message }}
              </p>
            </BaseTextbox>
            <BaseTextbox v-model:text="state.family" label="نام خانوادگی" placeholder="نام خانوادگی" main-class="w-full">
              <p v-for="message in getMessages('family')" :key="message.group" :class="`text-${message.color}-500`">
                {{ message.message }}
              </p>
            </BaseTextbox>
          </div>
          <div class="flex justify-center w-full">
            <BaseTextbox v-model:text="state.phone" label="تلفن همراه" type="number" placeholder="تلفن همراه">
              <p v-for="message in getMessages('phone')" :key="message.group" :class="`text-${message.color}-500`">
                {{ message.message }}
              </p>
            </BaseTextbox>
          </div>
          <div class="flex justify-center w-full">
            <BaseTextbox v-model:text="state.currentPassword" label="رمز عبور فعلی" type="password" placeholder="رمز عبور فعلی">
              <p v-for="message in getMessages('currentPassword')" :key="message.group" :class="`text-${message.color}-500`">{{ message.message }}</p>
            </BaseTextbox>
          </div>
          <div class="flex justify-center w-full gap-x-3">
            <BaseTextbox
              v-model:text="state.enteredSecurityNum"
              label="ورود رمز امنیتی"
              type="number"
              placeholder="ورود رمز امنیتی"
              main-class="w-full no-spin"
            >
              <p v-for="message in getMessages('enteredSecurityNum')" :key="message.group" :class="`text-${message.color}-500`">
                {{ message.message }}
              </p>
            </BaseTextbox>
            <BaseTextbox :text="state.securityNum" label="رمز امنیتی" main-class="w-16 text-blue-500 font-bold text-center select-none" disabled />
          </div>
        </div>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <div class="flex justify-center items-center gap-x-3">
          <router-link to="/" class="btn-error py-2 w-full" @click="submit()">بازگشت</router-link>
          <LoadingButton class="btn-secondary py-2 w-full" @click="submit()" loading-name="form" loading-color="blue-600">ذخیره </LoadingButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import BaseTextbox from "./utils/BaseTextbox.vue";
import LoadingButton from "./utils/LoadingButton.vue";
import {
  AuthErrorCode,
  AvatarErrorCode,
  EditUser,
  EditUserErrorCode,
  EventType,
  arrayBufferToBase64,
  checkPhoneNumber,
  getRandomNum,
  FormMessage,
} from "../../server/shared";
import { PencilAltIcon, UserIcon, XIcon } from "@heroicons/vue/solid";
import { emitter, store } from "../store";
import { editProfile, getAvatar, getUser } from "../api";
import { useRouter } from "../router";

export default defineComponent({
  components: {
    BaseTextbox,
    LoadingButton,
    PencilAltIcon,
    UserIcon,
    XIcon,
  },
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const avatar = ref<HTMLInputElement>();
    const state = reactive({
      name: "",
      family: "",
      phone: "",
      currentPassword: "",
      enteredSecurityNum: "",
      securityNum: getRandomNum(1000, 9999).toString(),
      formMessages: Array<FormMessage>(),
      isRequesting: false,
      hasAvatar: false,
      avatarChanged: false,
      avatarImage: "",
      avatarBuffer: {} as Uint8Array,
    });

    async function setAvatarImage() {
      if (!avatar.value?.files) return;
      console.log("here");
      const buffer = await avatar.value.files[0].arrayBuffer();
      state.avatarImage = arrayBufferToBase64(buffer);
      state.avatarBuffer = new Uint8Array(buffer);
      state.avatarChanged = true;
    }

    function removeAvatarImage() {
      state.avatarImage = "";
      state.avatarChanged = true;
      if (avatar.value) avatar.value.value = "";
    }

    async function submit() {
      if (state.isRequesting) return;
      state.formMessages.splice(0, state.formMessages.length);
      if (!state.name) addFormMessage("name", "نام الزامی است");
      else if (state.name.match(/[a-z0-9۱۲۳۴۵۶۷۸۹]/g)) addFormMessage("name", "نام باید فارسی باشد");
      if (!state.family) addFormMessage("family", "نام خانوادگی الزامی است");
      else if (state.family.match(/[a-z0-9۱۲۳۴۵۶۷۸۹]/g)) addFormMessage("family", "نام خانوادگی باید فارسی باشد");
      if (!state.phone) addFormMessage("phone", "تلفن همراه الزامی است");
      else if (!checkPhoneNumber(state.phone)) addFormMessage("phone", "تلفن همراه معتبر نمیباشد");
      if (!state.enteredSecurityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی الزامی است");
      else if (state.enteredSecurityNum !== state.securityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی اشتباه الزامی است");
      if (!state.currentPassword) addFormMessage("currentPassword", "رمز عبور فعلی الزامی است");

      if (state.formMessages.length > 0) return;
      state.isRequesting = true;
      emitter.emit(EventType.ShowLoading, "form");
      const editUser: EditUser = {
        id: store.state.user?.id || "",
        name: state.name,
        family: state.family,
        phone: state.phone,
        currentPassword: state.currentPassword,
        avatarChanged: state.avatarChanged,
      };

      const formData = new FormData();
      formData.append("json_data", JSON.stringify(editUser));
      if (state.avatarImage && state.avatarChanged) formData.append("binary_data", new Blob([state.avatarBuffer.buffer]));

      const result = await editProfile(formData);
      if (result === EditUserErrorCode.WrongPassword) addFormMessage("general", "رمز عبور فعلی اشتباه میباشد");
      else if (result === AuthErrorCode.AccessDenied) addFormMessage("general", "شما دسترسی به ویرایش پروفایل را ندارید");
      else if (
        result === EditUserErrorCode.Failure ||
        result === AuthErrorCode.NoTokenFound ||
        result === AuthErrorCode.WrongToken ||
        result === AuthErrorCode.ServerDidNotRespond
      )
        addFormMessage("general", "مشکلی در سیستم به وحود آمده است");
      else {
        await store.refreshToken();
        state.securityNum = getRandomNum(1000, 9999).toString();
        addFormMessage("general", "اطلاعات با موفقیت ذخیره شد", "emerald");
        emitter.emit(EventType.AvatarChanged);
      }

      state.isRequesting = false;
      emitter.emit(EventType.HideLoading, "form");
    }

    function getMessages(group: string) {
      return state.formMessages.filter((x) => x.group === group);
    }

    function addFormMessage(group: string, message: string, color?: string) {
      state.formMessages.push({ group, message, color: color ? color : "rose" });
    }

    onMounted(async () => {
      const result = await getUser(props.userId);
      if (typeof result === "object") {
        state.name = result.name;
        state.family = result.family;
        state.phone = result.phone;
        const avatar = await getAvatar(result.id, 80);
        if (avatar === AvatarErrorCode.DoesNotExists) return;
        state.avatarImage = avatar;
      } else {
        if (result === AuthErrorCode.ServerDidNotRespond) addFormMessage("general", "مشکلی در سیستم به وجود آمده");
        else await router.push("/");
      }
    });

    return {
      state,
      avatar,
      getMessages,
      submit,
      setAvatarImage,
      removeAvatarImage,
    };
  },
});
</script>
