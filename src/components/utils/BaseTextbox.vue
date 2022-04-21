<template>
  <div class="flex flex-col w-full space-y-1">
    <label v-if="label" class="ml-2" :class="textClass">{{ label }}:</label>
    <input
      v-if="!disabled"
      v-model="state.text"
      :type="type ? type : 'text'"
      class="border focus:outline-none focus:border-blue-500 py-1 px-2 border-gray-200 rounded-lg"
      :placeholder="placeholder"
      :maxlength="max"
      :class="mainClass"
    />
    <input
      v-else
      v-model="state.text"
      :type="type ? type : 'text'"
      class="border focus:outline-none focus:border-blue-500 py-1 px-2 border-gray-200 rounded-lg"
      :placeholder="placeholder"
      :maxlength="max"
      :class="mainClass"
      disabled
    />
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";

export default defineComponent({
  props: {
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    text: {
      type: String,
      required: false,
      default: undefined,
    },
    placeholder: {
      type: String,
      required: false,
      default: undefined,
    },
    max: {
      type: String,
      required: false,
      default: undefined,
    },
    type: {
      type: String,
      required: false,
      default: undefined,
    },
    mainClass: {
      type: String,
      required: false,
      default: undefined,
    },
    textClass: {
      type: String,
      required: false,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  emits: ["update:text"],
  setup(props, { emit }) {
    const state = reactive({
      text: props.text,
    });

    watch(state, () => {
      emit("update:text", state.text?.toString());
    });

    watch(props, () => {
      state.text = props.text;
    });

    return {
      state,
    };
  },
});
</script>
