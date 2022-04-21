<template>
  <div class="flex justify-center w-full h-full overflow-auto p-3 md:p-10" style="height: calc(100% - 56px)">
    <div class="max-w-6xl w-full">
      <div class="bg-white w-full h-full rounded-lg overflow-hidden shadow-lg relative flex">
        <img src="/wave-sm.svg" class="w-full h-full absolute block md:hidden" alt="background-sm" />
        <img src="/wave-lg.svg" class="w-full h-full absolute hidden md:block lg:hidden" alt="background-lg" />
        <img src="/wave-full.svg" class="w-full h-full absolute hidden lg:block" alt="background-full" />
        <div class="z-0 h-full w-full flex justify-center items-center">
          <div class="flex flex-col justify-center items-center h-full md:max-w-xl text-center">
            <p class="text-4xl md:text-5xl font-bold text-blue-500">سامانه دَکَل</p>
            <p class="mt-5 text-xl md:text-2xl font-bold text-blue-600">سامانه ای برای کمک به معلمان و دانش آموزان</p>
            <!--             <router-link to="/register" class="mt-5 text-lg btn-primary p-2">شروع به کار با سامانه!</router-link> -->
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="flex justify-center pt-3 md:pt-10">
            <div class="max-w-6xl w-full">
                <div class="bg-white w-full h-full rounded-lg shadow-lg flex">
                    <div class="z-10 h-full w-full flex flex-col justify-center items-center p-3 md:p-5">
                        <p class="text-2xl font-bold text-blue-500">قابلیت ها</p>
                        <div class="mt-3 md:mt-5 flex flex-wrap justify-center items-center gap-5">
                            <div class="bg-gray-100 rounded-lg shadow-lg p-3">
                                <p class="text-xl text-emerald-500 text-center">حضور غیاب</p>
                                <div class="bg-gray-300 h-0.5 my-3 rounded-full" />
                                <div class="flex items-center">
                                    <CheckIcon class="ml-1 w-5 h-5 text-emerald-500" />
                                    <p>حضور غیاب مجازی</p>
                                </div>
                                <div class="flex items-center">
                                    <CheckIcon class="ml-1 w-5 h-5 text-emerald-500" />
                                    <p>حضور غیاب توسط دبیر</p>
                                </div>
                                <div class="flex items-center">
                                    <CheckIcon class="ml-1 w-5 h-5 text-emerald-500" />
                                    <p>گزارش حضور غیاب هر دانش آموز</p>
                                </div>
                            </div>
                            <div class="bg-gray-100 rounded-lg shadow-lg p-3">
                                <p class="text-xl text-emerald-500 text-center">گزارشات</p>
                                <div class="bg-gray-300 h-0.5 my-3 rounded-full" />
                                <div class="flex items-center">
                                    <CheckIcon class="ml-1 w-5 h-5 text-emerald-500" />
                                    <p>گزارش فعالیت های کلاسی هز دانش آموز</p>
                                </div>
                                <div class="flex items-center">
                                    <CheckIcon class="ml-1 w-5 h-5 text-emerald-500" />
                                    <p>گزارش نمرات هر دانش آموز</p>
                                </div>
                                <div class="flex items-center">
                                    <CheckIcon class="ml-1 w-5 h-5 text-emerald-500" />
                                    <p>گزارش حضور غیاب هر دانش آموز</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
