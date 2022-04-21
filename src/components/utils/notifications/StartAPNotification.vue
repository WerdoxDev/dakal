<template>
  <div class="p-1 flex flex-col">
    <div class="flex items-center gap-x-2">
      <div class="w-10 h-10 bg-violet-500 flex justify-center items-center rounded-lg shadow-lg flex-shrink-0">
        <UsersIcon class="w-5 h-5 text-white" />
      </div>
      <div class="flex flex-col justify-center md:justify-start w-full">
        <p>
          حضور غیاب در کلاس
          <span class="font-bold">{{ notification.textHighlights[0] }}</span> شروع شد.
          <span class="text-sm text-gray-700 whitespace-nowrap">۵ دقیقه پیش</span>
        </p>
      </div>
      <button @click="statePresence()" class="btn-primary flex-shrink-0 p-2 hidden sm:block self-center">اعلام حضوری</button>
    </div>
    <button @click="statePresence()" class="btn-primary flex-shrink-0 block sm:hidden mt-2 py-2">اعلام حضوری</button>
    <div class="bg-gray-300 h-0.5 my-2 w-28 rounded-full self-center" />
  </div>
</template>

<script lang="ts">
import { UsersIcon } from "@heroicons/vue/solid";
import { defineComponent, PropType } from "vue";
import { DbNotification, StudentState } from "../../../../server/shared/common";
import { store } from "../../../store";

export default defineComponent({
  props: {
    notification: {
      type: Object as PropType<DbNotification>,
      required: true,
    },
  },
  components: {
    UsersIcon,
  },
  setup(props) {
    function statePresence() {
      store.state.socket.emit("set-student-state", props.notification.classId, StudentState.Present);
    }

    return {
      statePresence,
    };
  },
});
</script>
