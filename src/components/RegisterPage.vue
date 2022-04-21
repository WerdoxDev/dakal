<template>
  <div class="flex justify-center">
    <div class="p-3 max-w-md md:p-10 w-full">
      <form class="bg-white rounded-lg shadow-lg p-3 flex flex-col" @submit.prevent>
        <p class="text-xl md:text-2xl text-blue-500 font-bold text-center">ثبت نام</p>
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
          <div class="flex justify-center w-full gap-x-3">
            <BaseTextbox v-model:text="state.phone" label="تلفن همراه" type="number" placeholder="تلفن همراه" main-class="w-full no-spin">
              <p v-for="message in getMessages('phone')" :key="message.group" :class="`text-${message.color}-500`">
                {{ message.message }}
              </p>
            </BaseTextbox>
            <BaseTextbox v-model:text="state.nationalCode" label="کد ملی" type="number" placeholder="کد ملی" main-class="w-full no-spin">
              <p v-for="message in getMessages('nationalCode')" :key="message.group" :class="`text-${message.color}-500`">{{ message.message }}</p>
            </BaseTextbox>
          </div>
          <div class="flex justify-center w-full gap-x-3">
            <BaseTextbox v-model:text="state.password" label="رمز عبور" type="password" placeholder="رمز عبور" main-class="w-full">
              <p v-for="message in getMessages('password')" :key="message.group" :class="`text-${message.color}-500`">
                {{ message.message }}
              </p>
            </BaseTextbox>
            <BaseTextbox v-model:text="state.repeatPassword" label="تکرار رمز عبور" type="password" placeholder="تکرار رمز عبور" main-class="w-full">
              <p v-for="message in getMessages('repeatPassword')" :key="message.group" :class="`text-${message.color}-500`">{{ message.message }}</p>
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
            <BaseTextbox :text="state.securityNum" label="رمز امنیتی" main-class="w-16 text-blue-500 font-bold text-center" disabled />
          </div>
        </div>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <LoadingButton class="btn-secondary py-2 w-full" @click="submit()" loading-name="form" loading-color="blue-600"> ثبت نام </LoadingButton>
        <p class="mt-2 text-center text-gray-500">
          قبلا حساب کاربری داشته اید؟
          <router-link to="/login" class="text-blue-500 hover:text-blue-600">ورود</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { registerUser } from "../api";
import BaseTextbox from "./utils/BaseTextbox.vue";
import LoadingButton from "./utils/LoadingButton.vue";
import { checkNationalCode, checkPhoneNumber, getRandomNum, UserInfo, CreateUserErrorCode, EventType, FormMessage } from "../../server/shared";
import { emitter, store } from "../store";
import { useRouter } from "../router";

export default defineComponent({
  components: {
    BaseTextbox,
    LoadingButton,
  },
  setup() {
    const state = reactive({
      name: "",
      family: "",
      phone: "",
      password: "",
      nationalCode: "",
      repeatPassword: "",
      enteredSecurityNum: "",
      securityNum: getRandomNum(1000, 9999).toString(),
      formMessages: Array<FormMessage>(),
      isRequesting: false,
    });

    async function submit() {
      if (state.isRequesting) return;
      state.formMessages.splice(0, state.formMessages.length);
      if (!state.name) addFormMessage("name", "نام  الزامی است");
      else if (state.name.match(/[a-z0-9۱۲۳۴۵۶۷۸۹]/g)) addFormMessage("name", "نام باید فارسی باشد");
      if (!state.family) addFormMessage("family", "نام خانوادگی  الزامی است");
      else if (state.family.match(/[a-z0-9۱۲۳۴۵۶۷۸۹]/g)) addFormMessage("family", "نام خانوادگی باید فارسی باشد");
      if (!state.phone) addFormMessage("phone", "تلفن همراه  الزامی است");
      else if (!checkPhoneNumber(state.phone)) addFormMessage("phone", "تلفن همراه معتبر نمیباشد");
      if (!state.nationalCode) addFormMessage("nationalCode", "کد ملی الزامی است");
      else if (!checkNationalCode(state.nationalCode)) addFormMessage("nationalCode", "کد ملی معتبر نمیباشد");
      if (!state.password) addFormMessage("password", "رمز عبور  الزامی است");
      else if (state.password.length < 8) addFormMessage("password", "رمز عبور باید بیشتر از ۸ کاراکتر باشد");
      if (!state.repeatPassword) addFormMessage("repeatPassword", "تکرار رمز عبور  الزامی است");
      else if (state.repeatPassword !== state.password) addFormMessage("repeatPassword", "تکرار رمز عبور با رمز عبور یکی نالزامی است");
      if (!state.enteredSecurityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی  الزامی است");
      else if (state.enteredSecurityNum !== state.securityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی اشتباه الزامی است");

      if (state.formMessages.length > 0) return;
      const user: UserInfo = {
        name: state.name,
        family: state.family,
        fullName: state.name + " " + state.family,
        phone: state.phone,
        nationalCode: state.nationalCode,
        password: state.password,
      };
      state.isRequesting = true;
      emitter.emit(EventType.ShowLoading, "form");
      const result = await registerUser(user);
      if (result === CreateUserErrorCode.PhoneExists) addFormMessage("general", "تلفن همراه تکراری است");
      else if (result === CreateUserErrorCode.NationalExists) addFormMessage("general", "کد ملی تکراری است");
      else if (result === CreateUserErrorCode.Failure) addFormMessage("general", "مشکلی در سیستم به وحود آمده است");
      else {
        addFormMessage("general", "با موفقیت ثبت نام شدید", "emerald");
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
