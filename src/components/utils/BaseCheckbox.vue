<template>
  <SwitchGroup>
    <div class="flex items-center w-full">
      <SwitchLabel v-if="label" class="ml-2 flex-shrink-0" passive :class="textClass">{{ label }}:</SwitchLabel>
      <Switch v-model="state.enabled">
        <div
          class="w-6 h-6 rounded-lg transition-all duration-100 bg-white border border-gray-200 flex justify-center items-center"
          :class="mainClass"
        >
          <CheckIcon class="w-5 h-5 transition-all duration-100 text-emerald-500" :class="state.enabled ? 'opacity-100' : 'opacity-0'" />
        </div>
      </Switch>
    </div>
  </SwitchGroup>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import { Switch, SwitchLabel, SwitchGroup } from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/solid";

export default defineComponent({
  components: {
    Switch,
    SwitchLabel,
    SwitchGroup,
    CheckIcon,
  },
  props: {
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    enabled: {
      type: Boolean,
      required: false,
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
  },
  emits: ["update:enabled"],
  setup(props, { emit }) {
    const state = reactive({
      enabled: props.enabled,
    });

    watch(state, () => {
      emit("update:enabled", state.enabled);
    });

    return {
      state,
    };
  },
});
</script>
