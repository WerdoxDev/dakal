import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { useRouter } from "./router";

const router = useRouter();

createApp(App).use(router).mount("#app");
