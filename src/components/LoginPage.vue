<template>
  <div class="flex justify-center">
    <div class="p-3 max-w-md md:p-10 w-full">
      <form class="bg-white rounded-lg shadow-lg p-3 flex flex-col" @submit.prevent>
        <p class="text-xl md:text-2xl text-blue-500 font-bold text-center">ورود</p>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <div v-if="getMessages('general').length > 0" class="mb-3">
          <p v-for="message in getMessages('general')" :key="message.group" class="text-center" :class="`text-${message.color}-500`">
            {{ message.message }}
          </p>
        </div>
        <div class="flex flex-col justify-center items-center space-y-3">
          <div class="flex justify-center w-full">
            <BaseTextbox v-model:text="state.nationalCode" type="number" label="کد ملی" placeholder="کد ملی" main-class="no-spin">
              <p v-for="message in getMessages('nationalCode')" :key="message.group" :class="`text-${message.color}-500`">{{ message.message }}</p>
            </BaseTextbox>
          </div>
          <div class="flex justify-center w-full">
            <BaseTextbox v-model:text="state.password" label="رمز عبور" type="password" placeholder="رمز عبور">
              <p v-for="message in getMessages('password')" :key="message.group" :class="`text-${message.color}-500`">
                {{ message.message }}
              </p>
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
          <div class="flex justify-center w-full">
            <BaseCheckbox label="مرا به خاطر بسپار" />
          </div>
        </div>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <LoadingButton class="btn-secondary py-2 w-full" @click="submit()" loading-name="form" loading-color="blue-600"> ورود </LoadingButton>
        <p class="mt-2 text-center text-gray-500">
          حساب کاربری ندارید؟
          <router-link to="/register" class="text-blue-500 hover:text-blue-600">ثبت نام</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import BaseTextbox from "./utils/BaseTextbox.vue";
import BaseCheckbox from "./utils/BaseCheckbox.vue";
import LoadingButton from "./utils/LoadingButton.vue";
import { UserCredentials, GetUserErrorCode, getRandomNum, EventType, FormMessage } from "../../server/shared";
import { loginUser } from "../api";
import { emitter, store } from "../store";
import { useRouter } from "../router";

export default defineComponent({
  components: {
    BaseTextbox,
    BaseCheckbox,
    LoadingButton,
  },
  setup() {
    const state = reactive({
      nationalCode: "",
      password: "",
      enteredSecurityNum: "",
      securityNum: getRandomNum(1000, 9999).toString(),
      formMessages: Array<FormMessage>(),
      isRequesting: false,
    });

    async function submit() {
      if (state.isRequesting) return;
      state.formMessages.splice(0, state.formMessages.length);
      if (!state.nationalCode) addFormMessage("nationalCode", "کد ملی الزامی است");
      if (!state.password) addFormMessage("password", "رمز عبور الزامی است");
      if (!state.enteredSecurityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی الزامی است");
      else if (state.enteredSecurityNum !== state.securityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی اشتباه میباشد");

      if (state.formMessages.length > 0) return;
      const user: UserCredentials = { nationalCode: state.nationalCode, password: state.password };
      state.isRequesting = true;
      emitter.emit(EventType.ShowLoading, "form");
      const result = await loginUser(user);

      if (result === GetUserErrorCode.WrongCredentials) addFormMessage("general", "کد ملی یا رمز عبور اشتباه میباشد");
      else if (result === GetUserErrorCode.Failure) addFormMessage("general", "مشکلی در سیستم به وجود آمده است");
      else {
        addFormMessage("general", "با موفقیت وارد شدید", "emerald");
        store.setAccessToken(result);
        await useRouter().push("/");
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

    return {
      state,
      submit,
      getMessages,
    };
  },
});
</script>
