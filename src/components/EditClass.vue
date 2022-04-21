<template>
  <div class="flex justify-center">
    <div class="p-3 max-w-md md:p-10 w-full">
      <form class="bg-white rounded-lg shadow-lg p-3 flex flex-col" @submit.prevent>
        <p class="text-xl md:text-2xl text-blue-500 font-bold text-center">ویرایش کلاس</p>
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
            <img v-else :src="`data:image/png;base64,${state.avatarImage}`" class="object-cover w-20 h-20 rounded-full" />
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
          <div class="flex justify-center w-full">
            <BaseTextbox v-model:text="state.className" label="نام کلاس" placeholder="نام کلاس">
              <p v-for="message in getMessages('className')" :key="message.group" :class="`text-${message.color}-500`">
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
        <button class="btn-secondary py-2 w-full" type="button" @click="openStudentsModal()">لیست دانش آموزان</button>
        <div class="flex justify-center items-center gap-x-3 mt-3">
          <router-link to="/teacher-dashboard" class="btn-error py-2 w-full" @click="submit()">بازگشت</router-link>
          <LoadingButton class="btn-secondary py-2 w-full" type="submit" @click="submit()" loading-name="form" loading-color="blue-600"
            >ذخیره
          </LoadingButton>
        </div>
      </form>
    </div>
    <Modal :show="state.showStudentsModal" @close="closeStudentsModal()">
      <div class="p-3 rounded-t-lg whitespace-nowrap">
        <p class="font-bold">لیست دانش آموزان</p>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <div v-if="getMessages('general2').length > 0">
          <p v-for="message in getMessages('general2')" :key="message.group" class="text-center" :class="`text-${message.color}-500`">
            {{ message.message }}
          </p>
        </div>
        <form @submit.prevent>
          <div class="flex justify-center items-center border focus:border-blue-500 p-1 border-gray-200 rounded-lg gap-x-1 mt-3">
            <button class="btn-primary py-1 px-2 flex-shrink-0" @click="searchStudent()">جستجو</button>
            <input dir="rtl" class="focus:outline-none" placeholder="جستجوی دانش آموز" v-model="state.searchQuery" />
            <SearchIcon class="w-5 h-5 text-gray-500 hover:cursor-pointer flex-shrink-0" />
          </div>
        </form>
        <div class="flex flex-col justify-center items-end gap-y-2 mt-3 p-2 bg-gray-100 rounded-lg">
          <p v-if="state.isSearching">نتایج جستجو</p>
          <p v-else-if="state.students.length <= 0" class="w-full">هیچ دانش آموزش اضافه نشده است</p>
          <div v-for="student in !state.isSearching ? state.students : state.searchStudents" :key="student.id + state.isSearching" class="w-full">
            <div class="flex justify-end items-center border border-gray-200 bg-white rounded-lg px-2 py-1 shadow-lg gap-x-2">
              <div class="w-full flex justify-start">
                <button v-if="!student.isAdded" class="btn-primary px-1" @click="addStudent(student)">اضافه</button>
                <button v-else class="btn-error px-1" @click="removeStudent(student)">حذف</button>
              </div>
              <!-- <BaseCheckbox v-model:enabled="student.selected" /> -->
              <div v-if="student.new && !state.isSearching" class="bg-emerald-500 text-white rounded-lg px-1">جدید</div>
              <p>{{ student.name + " " + student.family }}</p>
              <BaseAvatar :id="student.id" size="32" class="w-8 h-8 rounded-full flex-shrink-0" />
            </div>
          </div>
          <button v-if="state.isSearching" class="btn-primary p-1" @click="clearSearch()">حذف جستجو</button>
        </div>
        <div class="flex justify-end items-center mt-3">
          <button class="btn-primary p-1" @click="updateStudents()">بروزرسانی لیست</button>
        </div>
      </div>
      <div class="bg-gray-100 p-3 rounded-b-lg flex justify-center items-center gap-x-3">
        <button type="button" class="btn-primary py-2 w-full" @click="submitStudents()">ذخیره</button>
        <button type="button" class="btn-error py-2 w-full" @click="closeStudentsModal()">بازگشت</button>
      </div>
    </Modal>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import {
  arrayBufferToBase64,
  AuthErrorCode,
  AvatarErrorCode,
  EditClass,
  EditClassErrorCode,
  EventType,
  getRandomNum,
  AvailableStudent,
  FormMessage,
} from "../../server/shared";
import BaseTextbox from "./utils/BaseTextbox.vue";
import Modal from "./utils/BaseModal.vue";
import BaseAvatar from "./utils/BaseAvatar.vue";
import LoadingButton from "./utils/LoadingButton.vue";
import { PencilAltIcon, UserIcon, XIcon, SearchIcon } from "@heroicons/vue/solid";
import { getClass, getClassUsers, searchUsers, editClass, getAvatar } from "../api";
import { emitter } from "../store";
import { useRouter } from "../router";

export default defineComponent({
  components: {
    Modal,
    BaseAvatar,
    BaseTextbox,
    LoadingButton,
    PencilAltIcon,
    SearchIcon,
    UserIcon,
    XIcon,
  },
  props: {
    classId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const avatar = ref<HTMLInputElement>();
    const state = reactive({
      className: "",
      avatarImage: "",
      searchQuery: "",
      currentPassword: "",
      enteredSecurityNum: "",
      hasAvatar: false,
      isSearching: false,
      isRequesting: false,
      avatarChanged: false,
      areStudentsFetched: false,
      showStudentsModal: false,
      avatarBuffer: {} as Uint8Array,
      formMessages: Array<FormMessage>(),
      students: Array<AvailableStudent>(),
      searchStudents: Array<AvailableStudent>(),
      originalStudents: Array<AvailableStudent>(),
      securityNum: getRandomNum(1000, 9999).toString(),
    });

    watch(state.originalStudents, () => {
      console.log(state.originalStudents);
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

    async function openStudentsModal() {
      state.showStudentsModal = true;
      fetchStudents();
    }

    async function fetchStudents() {
      state.originalStudents = [...state.students];
      if (state.areStudentsFetched) return;
      const result = await getClassUsers(props.classId, true, true);
      if (typeof result === "object") {
        const newStudents = state.students.filter((x) => x.new);
        state.students = result.map((x) => {
          return {
            id: x.userId,
            name: x.user?.name || "",
            family: x.user?.family || "",
            fullName: x.user?.fullName || "",
            phone: x.user?.phone || "",
            isAdded: true,
          };
        });
        state.students.push(...newStudents);
        state.areStudentsFetched = true;
        state.originalStudents = [...state.students];
      } else addFormMessage("general2", "مشکلی در سیستم پیش آمده");
    }

    async function updateStudents() {
      state.areStudentsFetched = false;
      state.students = state.students.filter((x) => !x.new);
      await fetchStudents();
    }

    function closeStudentsModal() {
      state.showStudentsModal = false;
      state.students = [...state.originalStudents];
    }

    async function submitStudents() {
      state.showStudentsModal = false;
    }

    async function clearSearch() {
      state.searchQuery = "";
      await searchStudent();
    }

    function addStudent(student: AvailableStudent) {
      student.new = true;
      student.isAdded = true;
      state.students.push(student);
    }

    function removeStudent(student: AvailableStudent) {
      if (state.isSearching) {
        student.new = false;
        student.isAdded = false;
      }
      const originalIndex = state.students.findIndex((x) => x.id === student.id);
      if (originalIndex !== -1) state.students.splice(originalIndex, 1);
    }

    async function searchStudent() {
      if (!state.searchQuery) {
        state.isSearching = false;
        state.searchStudents.splice(0, state.searchStudents.length);
        return;
      }
      const result = await searchUsers(state.searchQuery);
      if (typeof result === "object") {
        state.searchStudents = result.map((x) => {
          const existingStudent = state.students.find((y) => y.id === x.id);
          if (existingStudent) return existingStudent;
          return { id: x.id, name: x.name, family: x.family, fullName: x.fullName, phone: x.phone, isAdded: false };
        });
        state.isSearching = true;
      } else addFormMessage("general2", "مشکلی در سیستم پیش آمده");
    }

    async function submit() {
      if (state.isRequesting) return;
      state.formMessages.splice(0, state.formMessages.length);
      if (!state.className) addFormMessage("className", "نام کلاس الزامی است");
      else if (state.className.match(/[a-z0-9۱۲۳۴۵۶۷۸۹]/g)) addFormMessage("className", "نام کلاس باید فارسی باشد");
      if (!state.enteredSecurityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی  الزامی است");
      else if (state.enteredSecurityNum !== state.securityNum) addFormMessage("enteredSecurityNum", "رمز امنیتی اشتباه الزامی است");
      if (!state.currentPassword) addFormMessage("currentPassword", "رمز عبور فعلی الزامی است");

      console.log(state.formMessages);
      if (state.formMessages.length > 0) return;
      state.isRequesting = true;
      emitter.emit(EventType.ShowLoading, "form");
      if (!state.areStudentsFetched) await fetchStudents();
      const newClass: EditClass = {
        id: props.classId,
        name: state.className,
        currentPassword: state.currentPassword,
        avatarChanged: state.avatarChanged,
        students: state.students.map((x) => x.id),
      };
      console.log(newClass.students);

      const formData = new FormData();
      formData.append("json_data", JSON.stringify(newClass));
      if (state.avatarImage && state.avatarChanged) formData.append("binary_data", new Blob([state.avatarBuffer.buffer]));

      const result = await editClass(formData);
      if (result === EditClassErrorCode.WrongPassword) addFormMessage("general", "رمز عبور فعلی اشتباه میباشد");
      else if (result === AuthErrorCode.AccessDenied) addFormMessage("general", "شما دسترسی به ویرایش کلاس را ندارید");
      else if (
        result === EditClassErrorCode.Failure ||
        result === AuthErrorCode.NoTokenFound ||
        result === AuthErrorCode.WrongToken ||
        result === AuthErrorCode.ServerDidNotRespond
      )
        addFormMessage("general", "مشکلی در سیستم به وحود آمده است");
      else {
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
      const result = await getClass(props.classId);
      if (typeof result === "object") {
        state.className = result.name;
      } else {
        if (result === AuthErrorCode.ServerDidNotRespond) addFormMessage("general", "مشکلی در سیستم به وجود آمده");
        else await router.push("/");
      }
      const avatar = await getAvatar(props.classId, 80);
      if (avatar === AvatarErrorCode.DoesNotExists) return;
      state.avatarImage = avatar;
    });

    return {
      state,
      avatar,
      submit,
      addStudent,
      clearSearch,
      getMessages,
      searchStudent,
      removeStudent,
      addFormMessage,
      setAvatarImage,
      submitStudents,
      updateStudents,
      openStudentsModal,
      removeAvatarImage,
      closeStudentsModal,
    };
  },
});
</script>
