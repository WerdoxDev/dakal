<template>
  <button @click="$emit('click')">
    <div class="flex justify-center items-center gap-x-3">
      <slot></slot>
      <div v-if="state.show" class="w-6 h-6 shadow-lg rounded-lg" :class="absoluteLoading === 'true' && 'absolute left-2 top-1/2 -translate-y-1/2'">
        <div class="border-4 border-white rounded-full w-6 h-6 animate-spin" :class="`border-t-${loadingColor}`"></div>
      </div>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { EventType } from "../../../server/shared";
import { emitter } from "../../store";

export default defineComponent({
  props: {
    loadingName: {
      type: String,
      required: true,
    },
    loadingColor: {
      type: String,
      required: true,
    },
    absoluteLoading: {
      type: String,
      required: false,
      default: "true",
    },
  },
  emits: ["click"],
  setup(props) {
    const state = reactive({
      show: false,
    });

    emitter.on(EventType.ShowLoading, (name) => {
      if (props.loadingName === name) state.show = true;
    });

    emitter.on(EventType.HideLoading, (name) => {
      if (props.loadingName === name) state.show = false;
    });
    return {
      state,
    };
  },
});
</script>
