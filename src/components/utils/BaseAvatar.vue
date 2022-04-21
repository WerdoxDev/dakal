<template>
  <div :class="`overflow-hidden`">
    <img
      v-if="state.hasAvatar"
      :src="`http://localhost:3002/avatar/${id}/${size}/0?${state.randomString}`"
      class="object-cover w-full h-full"
      @error="state.hasAvatar = false"
      draggable="false"
    />
    <UserIcon v-else class="w-full h-full text-blue-500" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { CharacterType, getRandomString, EventType } from "../../../server/shared";
import { UserIcon } from "@heroicons/vue/solid";
import { emitter } from "../../store";

export default defineComponent({
  components: {
    UserIcon,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
  },
  setup() {
    const state = reactive({
      hasAvatar: true,
      randomString: "",
    });

    emitter.on(EventType.AvatarChanged, () => {
      state.hasAvatar = true;
      state.randomString = Date.now().toString();
    });

    return {
      state,
      getRandomString,
      CharacterType,
    };
  },
});
</script>
