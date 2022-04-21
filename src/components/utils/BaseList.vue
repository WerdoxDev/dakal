<template>
  <Listbox v-model="state.selectedOption" as="div">
    <div class="flex items-center w-max" :class="column ? 'flex-col' : ''">
      <ListboxLabel v-if="label" class="ml-2" :class="[column ? 'mb-2' : '', textClass]">{{ column ? label : label + ":" }}</ListboxLabel>
      <div class="relative" :class="mainClass">
        <ListboxButton class="border border-gray-200 w-full py-2 px-2 bg-white rounded-lg shadow-lg flex justify-center items-center select-none">
          <SelectorIcon class="w-5 h-5 text-gray-400 ml-2" />
          <p>{{ state.selectedOption }}</p>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100"
          leave-to-class="opacity-0"
          enter-active-class="transition duration-100"
          enter-from-class="opacity-0"
        >
          <ListboxOptions
            class="border border-gray-200 no-scrollbar absolute w-max py-1 mt-1 bg-white rounded-lg shadow-lg"
            :style="order ? `z-index: ${Number(order) * 10}` : ''"
          >
            <!-- <ListboxOption v-for="option in options" v-slot="{ active, selected }" :key="option.id" :value="option.text" :disabled="isTaken(option)"> -->
            <ListboxOption v-for="option in getOptions()" v-slot="{ active, selected }" :key="option.id" :value="option.text">
              <div
                :class="[
                  isTaken(option) ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : active ? 'bg-gray-100' : 'hover:bg-gray-100',
                  'select-none py-2 px-2 flex items-center',
                ]"
              >
                <p :class="selected ? 'w-full font-bold' : ''">{{ option.text }}</p>
                <CheckIcon v-if="selected" class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <BanIcon v-if="isTaken(option) && !selected" class="w-5 h-5 text-red-500 flex-shrink-0" />
              </div>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </div>
  </Listbox>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, watch } from "vue";

import { Listbox, ListboxOptions, ListboxOption, ListboxButton, ListboxLabel } from "@headlessui/vue";
import { CheckIcon, SelectorIcon, BanIcon } from "@heroicons/vue/solid";
import { Option } from "../../../server/shared";

export default defineComponent({
  components: {
    Listbox,
    ListboxOptions,
    ListboxOption,
    ListboxButton,
    ListboxLabel,
    CheckIcon,
    SelectorIcon,
    BanIcon,
  },
  props: {
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    column: {
      type: Boolean,
      required: false,
    },
    options: {
      type: Object as PropType<Array<Option>>,
      required: true,
    },
    showOptions: {
      type: Object as PropType<Array<number>>,
      required: false,
    },
    order: {
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
    identifier: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  emits: ["update:options"],
  setup(props, { emit }) {
    const state = reactive({
      selectedOption: getOptions().find((x) => x.selected === true)?.text,
    });

    function isTaken(option: Option) {
      return option.identifier && option.id !== 0 && option.identifier !== props.identifier;
    }

    function fixOptions() {
      if (!getOptions().find((x) => x.text === state.selectedOption)) {
        const originalOptions = props.options;
        const firstOption = originalOptions.find((x) => x.id === getOptions()[0]?.id);
        originalOptions.forEach((x) => {
          x.selected = false;
          if (props.identifier && x.identifier === props.identifier) x.identifier = undefined;
        });
        if (firstOption) {
          firstOption.selected = true;
          state.selectedOption = firstOption.text;
        } else state.selectedOption = "-";
        emit("update:options", originalOptions);
      }
    }

    function getOptions() {
      if (!props.showOptions) return props.options;
      else return props.options.filter((x) => props.showOptions?.includes(x.id));
    }

    watch(state, () => {
      const options = getOptions();
      options.forEach((x) => {
        x.selected = false;
        if (props.identifier && x.identifier === props.identifier) x.identifier = undefined;
      });
      const option = options.find((x) => x.text === state.selectedOption);
      if (!option) return;
      option.selected = true;
      if (props.identifier) {
        option.identifier = props.identifier;
      }
      emit("update:options", options);
    });

    watch(props, () => fixOptions());

    onMounted(() => fixOptions());

    return {
      state,
      isTaken,
      getOptions,
    };
  },
});
</script>
