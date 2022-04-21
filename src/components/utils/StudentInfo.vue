<template>
  <div class="flex flex-col justify-center items-center p-2 border border-gray-200 rounded-lg shadow-lg w-max gap-y-2">
    <div class="flex items-center w-full gap-x-2">
      <UserAvatar :id="student.id" size="64" class="w-12 h-12 md:w-16 md:h-16 rounded-lg" />
      <div class="flex flex-col justify-center gap-y-1">
        <p>
          نام:
          <span class="font-bold">{{ `${student.name} ${student.family}` }}</span>
        </p>
        <!-- <p>
          نمره:
          <span class="font-bold">{{ `${student.phone}` }}</span>
        </p> -->
        <div class="flex items-center gap-x-1">
          <div :class="`bg-${getStateColor(student.state)}-500 w-5 h-5 rounded-lg shadow-lg`" />
          <p>{{ getStateText(student.state) }}</p>
        </div>
      </div>
    </div>
    <button class="btn-primary w-full py-1" @click="emit('open-modal')">عملیات</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { StudentState, StudentsInfo } from "../../../server/shared";
import UserAvatar from "./BaseAvatar.vue";

export default defineComponent({
  props: {
    student: {
      type: Object as PropType<StudentsInfo>,
      required: true,
    },
  },
  emits: ["open-modal"],
  setup(props, { emit }) {
    function getStateText(state: StudentState) {
      if (state === StudentState.Unknown) return "مشخص نشده";
      if (state === StudentState.Present) return "حاضر";
      if (state === StudentState.Absent) return "غایب";
    }

    function getStateColor(state: StudentState) {
      if (state === StudentState.Unknown) return "gray";
      if (state === StudentState.Present) return "emerald";
      if (state === StudentState.Absent) return "rose";
    }

    return {
      getStateText,
      getStateColor,
      emit,
    };
  },
  components: { UserAvatar },
});
</script>
