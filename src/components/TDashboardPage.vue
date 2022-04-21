<template>
  <div class="flex justify-center" v-if="!state.isClassSelected">
    <div class="p-3 max-w-md md:p-10 w-full">
      <div class="bg-white rounded-lg shadow-lg p-3 flex flex-col">
        <p class="text-xl md:text-2xl text-blue-500 font-bold text-center">انتخاب کلاس</p>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <div v-if="getMessages('general').length > 0"></div>
        <div class="flex justify-center items-center gap-x-2">
          <div class="flex flex-col justify-center items-end gap-y-3">
            <p class="h-[38px] md:h-[42px] flex items-center">مدرسه:</p>
            <p class="h-[38px] md:h-[42px] flex items-center">مقطع:</p>
            <p class="h-[38px] md:h-[42px] flex items-center">کلاس:</p>
          </div>
          <div class="flex flex-col justify-center items-start gap-y-3">
            <List :options="state.schoolOptions" order="3" />
            <List
              :options="state.gradeOptions"
              :show-options="state.gradeOptions.filter((x) => state.schoolOptions.find((x) => x.selected)?.id === x.identifier).map((x) => x.id)"
              order="2"
            />
            <List
              :options="state.classOptions"
              :show-options="state.classOptions.filter((x) => state.gradeOptions.find((x) => x.selected)?.id === x.identifier).map((x) => x.id)"
              order="1"
            />
          </div>
        </div>
        <div
          :class="state.formMessages[0] ? `bg-${state.formMessages[0].color}-300` : 'bg-gray-300'"
          class="h-0.5 my-3 rounded-full transition-all duration-100"
        ></div>
        <div class="flex justify-center items-center">
          <button class="btn-secondary py-2 w-full" @click="submitClass()">ورود به کلاس</button>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col justify-center items-center" v-else>
    <div class="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl p-3 md:pt-5 gap-3 md:gap-5 [grid-template-rows:auto_1fr]">
      <div class="bg-white rounded-lg shadow-xl p-3 flex flex-col xs:flex-row items-center gap-x-3 gap-y-3">
        <div class="flex items-center gap-x-3 w-full">
          <BaseAvatar :id="store.state.user?.id || ''" size="64" class="w-16 h-16 rounded-lg flex-shrink-0" />
          <div class="w-full">
            <p>
              نام:
              <span class="font-bold">استاد {{ store.state.user?.family }}</span>
            </p>
            <p>
              تعداد کلاس ها:
              <span class="font-bold">۳</span>
            </p>
          </div>
        </div>
        <router-link :to="{ name: 'Edit Profile', params: { userId: store.state.user?.id || '' } }" class="btn-primary p-2">ویرایش</router-link>
      </div>
      <div class="bg-white rounded-lg shadow-xl p-3 flex flex-col xs:flex-row items-center gap-x-3 gap-y-3 w-full">
        <div class="flex items-center gap-x-3 w-full">
          <BaseAvatar :id="state.selectedClass.id || ''" size="64" class="w-16 h-16 rounded-lg flex-shrink-0" />
          <div class="w-full">
            <p>
              مدرسه:
              <span class="font-bold">{{ state.selectedClass.school }}</span>
            </p>
            <p>
              مقطع:
              <span class="font-bold">{{ state.selectedClass.grade }}</span>
            </p>
            <p>
              کلاس:
              <span class="font-bold">{{ state.selectedClass.name }}</span>
            </p>
          </div>
        </div>
        <button @click="changeClass()" class="btn-primary p-2 w-full xs:w-max flex-shrink-0">تغییر کلاس</button>
        <router-link :to="{ name: 'Edit Class', params: { classId: state.selectedClass.id } }" class="btn-secondary p-2 w-full xs:w-max flex-shrink-0"
          >ویرایش کلاس
        </router-link>
      </div>
      <div class="row-start-3 md:row-start-2 row-span-full md:col-span-2">
        <div class="bg-white rounded-lg shadow-xl p-3 w-full md:mb-0 h-max">
          <div class="flex items-center gap-x-2 gap-y-2 flex-wrap">
            <LoadingButton
              v-if="state.selectedClass.state === ClassState.NotStarted"
              class="btn-primary p-2"
              @click="startClass()"
              loading-name="start-class"
              loading-color="emerald-600"
              absolute-loading="false"
            >
              شروع کلاس
            </LoadingButton>
            <LoadingButton
              v-else
              class="btn-error p-2"
              @click="stopClass()"
              loading-name="stop-class"
              loading-color="rose-600"
              absolute-loading="false"
            >
              پایان کلاس
            </LoadingButton>
            <LoadingButton
              v-if="!state.absencePresenceStarted"
              class="btn-secondary p-2"
              @click="startAbsencePresence()"
              loading-name="start-ap"
              loading-color="blue-600"
              absolute-loading="false"
            >
              شروع حضور غیاب
            </LoadingButton>
            <LoadingButton
              v-else
              class="btn-error p-2"
              @click="stopAbsencePresence()"
              loading-name="stop-ap"
              loading-color="rose-600"
              absolute-loading="false"
            >
              پایان حضور غیاب ({{ getTimeString() }})
            </LoadingButton>
            <p>
              تعداد دانش آموزان:
              <span class="font-bold">{{ state.students.length }}</span>
            </p>
            <p>
              تعداد دانش آموزان غایب:
              <span class="font-bold">{{ state.students.filter((x) => x.state === StudentState.Absent).length }}</span>
            </p>
          </div>
          <div class="bg-gray-300 h-0.5 my-2 rounded-full" />
          <div class="flex flex-wrap gap-2 justify-center items-center relative">
            <template v-if="state.students.length <= 0">
              <StudentInfoGhost v-for="index in 3" :key="index" />
            </template>
            <StudentInfo v-for="student in state.students" :key="student.nationalCode" :student="student" @open-modal="openModal()" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <Modal :show="state.showModal" @close="state.showModal = false">
    <div class="p-4 rounded-t-lg whitespace-nowrap">
      <p>
        عملیات برای:
        <span class="font-bold">متین تات</span>
      </p>
      <div class="bg-gray-300 h-0.5 my-4 rounded-full" />
      <div class="flex flex-col justify-center gap-y-2">
        <button class="btn-primary w-full p-2">حضور دارد</button>
        <button class="btn-error w-full p-2">غایب است</button>
      </div>
    </div>
    <div class="bg-gray-100 p-4 items-center rounded-b-lg">
      <button type="button" class="btn-error py-2 w-full" @click="state.showModal = false">بازگشت</button>
    </div>
  </Modal> -->
</template>

<script lang="ts">
import { defineComponent, onUnmounted, reactive } from "@vue/runtime-core";
import { onMounted } from "vue";
import { getClasses, getClassUsers } from "../api";
import { StudentState, Class, ClassState, NotificationType, EventType, FormMessage, Option, StudentsInfo } from "../../server/shared";
import { emitter, store } from "../store";
import List from "./utils/BaseList.vue";
// import Modal from "./utils/BaseModal.vue";
import BaseAvatar from "./utils/BaseAvatar.vue";
import StudentInfo from "./utils/StudentInfo.vue";
import StudentInfoGhost from "./utils/StudentInfoGhost.vue";
import LoadingButton from "./utils/LoadingButton.vue";

export default defineComponent({
  components: {
    List,
    // Modal,
    BaseAvatar,
    StudentInfo,
    LoadingButton,
    StudentInfoGhost,
  },
  setup() {
    const state = reactive({
      schoolOptions: Array<Option>(),
      gradeOptions: Array<Option>(),
      classOptions: Array<Option>(),
      showModal: false,
      formMessages: Array<FormMessage>(),
      isRequesting: false,
      isClassSelected: false,
      absencePresenceStarted: false,
      selectedClass: {} as Class,
      students: Array<StudentsInfo>(),
      classes: Array<Class>(),
      apTimeRemaining: 0,
      // eslint-disable-next-line no-undef
      apTimer: {} as NodeJS.Timer,
    });

    async function submitClass() {
      state.students.length;
      const classId = (state.classOptions.find((x) => x.selected)?.value as string) || "-";
      const classIndex = state.classes.findIndex((x) => x.id === classId);
      if (classIndex === -1) return;
      state.selectedClass = state.classes[classIndex];
      store.setSelectedClass(state.selectedClass);
      state.isClassSelected = true;
      await fetchStudents(classId);
    }

    async function fetchStudents(classId: string) {
      const result = await getClassUsers(classId, true);
      if (typeof result === "string") {
        console.log(`nope, ${result}`);
      } else {
        result.forEach((x) => {
          if (x.user && !x.isTeacher) {
            state.students.push({
              id: x.userId,
              state: x.state,
              name: x.user.name,
              family: x.user.family,
              fullName: x.user.fullName,
              nationalCode: x.user.nationalCode,
              phone: x.user.phone,
              password: "",
            });
          }
        });
      }
    }

    async function fetchClasses() {
      if (!store.state.user) return;
      const result = await getClasses(store.state.user.id);
      if (typeof result === "string") console.log(`we are fucked, ${result}`);
      else {
        state.classes = result;
        state.schoolOptions.splice(0, state.schoolOptions.length);
        state.classOptions.splice(0, state.classOptions.length);
        state.gradeOptions.splice(0, state.gradeOptions.length);
        result.forEach((x) => {
          let existingSchoolIndex, existingGradeIndex;
          existingSchoolIndex = state.schoolOptions.findIndex((y) => y.text === x.school);
          existingGradeIndex = state.gradeOptions.findIndex((y) => y.text === x.grade);
          if (existingSchoolIndex === -1)
            state.schoolOptions.push({
              id: state.schoolOptions.length,
              text: x.school,
              selected: state.schoolOptions.length === 0,
            });
          if (existingGradeIndex === -1)
            state.gradeOptions.push({
              id: state.gradeOptions.length,
              text: x.grade,
              selected: state.gradeOptions.length === 0,
              identifier: existingSchoolIndex === -1 ? state.schoolOptions.length - 1 : existingSchoolIndex,
            });
          state.classOptions.push({
            id: state.classOptions.length,
            text: x.name,
            selected: state.classOptions.length === 0,
            identifier: existingGradeIndex === -1 ? state.gradeOptions.length - 1 : existingGradeIndex,
            value: x.id,
          });
        });
      }
    }

    function startClass() {
      emitter.emit(EventType.ShowLoading, "start-class");
      store.state.socket.emit("set-class-state", state.selectedClass.id, ClassState.Started);
      store.state.socket.emit(
        "send-notification",
        state.selectedClass.id,
        state.students.map((x) => x.id),
        NotificationType.StartClass,
        [state.selectedClass.name]
      );
    }

    function stopClass() {
      emitter.emit(EventType.ShowLoading, "stop-class");
      store.state.socket.emit("set-class-state", state.selectedClass.id, ClassState.NotStarted);
      store.state.socket.emit(
        "send-notification",
        state.selectedClass.id,
        state.students.map((x) => x.id),
        NotificationType.StopClass,
        [state.selectedClass.name]
      );
    }

    function startAbsencePresence() {
      emitter.emit(EventType.ShowLoading, "start-ap");
      store.state.socket.emit("start-absence-presence", state.selectedClass.id, 6000);
      store.state.socket.emit(
        "send-notification",
        state.selectedClass.id,
        state.students.map((x) => x.id),
        NotificationType.StartAbsencePresence,
        [state.selectedClass.name]
      );
    }

    function stopAbsencePresence() {
      emitter.emit(EventType.ShowLoading, "stop-ap");
      store.state.socket.emit("stop-absence-presence", state.selectedClass.id);
      store.state.socket.emit(
        "send-notification",
        state.selectedClass.id,
        state.students.map((x) => x.id),
        NotificationType.StopAbsencePresence,
        [state.selectedClass.name]
      );
    }

    function openModal() {
      state.showModal = true;
    }

    function getMessages(group: string) {
      return state.formMessages.filter((x) => x.group === group);
    }

    function addFormMessage(group: string, message: string, color?: string) {
      state.formMessages.push({ group, message, color: color ? color : "rose" });
    }

    function startApTimer() {
      state.apTimer = setInterval(() => {
        console.log(state.apTimeRemaining);
        if (state.apTimeRemaining - 1000 <= 0) clearInterval(state.apTimer);
        state.apTimeRemaining -= 1000;
      }, 1000);
    }

    function getTimeString() {
      return new Date(state.apTimeRemaining).toISOString().slice(14, 19);
    }

    async function changeClass() {
      state.students.splice(0, state.students.length);
      state.isClassSelected = false;
      await fetchClasses();
    }

    function listenToEvents() {
      store.state.socket.on("students-state-update", (usersId: string[], studentsState: StudentState) => {
        usersId.forEach((x) => {
          const student = state.students.find((y) => y.id === x);
          if (student) student.state = studentsState;
        });
      });

      store.state.socket.on("class-state-update", (classId: string, classState: ClassState) => {
        if (state.selectedClass.id !== classId) return;
        state.selectedClass.state = classState;
        if (classState === ClassState.Started) emitter.emit(EventType.HideLoading, "start-class");
        else emitter.emit(EventType.HideLoading, "stop-class");
      });

      store.state.socket.on("absence-presence-stopped", (classId: string) => {
        if (state.selectedClass.id !== classId) return;
        state.absencePresenceStarted = false;
        clearInterval(state.apTimer);
        emitter.emit(EventType.HideLoading, "stop-ap");
      });

      store.state.socket.on("absence-presence-started", (classId: string) => {
        if (state.selectedClass.id !== classId) return;
        state.absencePresenceStarted = true;
        state.apTimeRemaining = 6000;
        emitter.emit(EventType.HideLoading, "start-ap");
        startApTimer();
      });
    }

    onMounted(async () => {
      if (store.state.selectedClass) {
        state.selectedClass = store.state.selectedClass;
        state.isClassSelected = true;
        await fetchStudents(store.state.selectedClass.id);
        listenToEvents();
        return;
      }
      await fetchClasses();
      listenToEvents();
    });

    onUnmounted(() => {
      store.state.socket.off("class-state-update");
      store.state.socket.off("students-state-update");
      store.state.socket.off("absence-presence-started");
      store.state.socket.off("absence-presence-stopped");
    });

    return {
      state,
      store,
      ClassState,
      StudentState,
      submitClass,
      openModal,
      stopClass,
      startClass,
      changeClass,
      getMessages,
      getTimeString,
      addFormMessage,
      stopAbsencePresence,
      startAbsencePresence,
    };
  },
});
</script>
