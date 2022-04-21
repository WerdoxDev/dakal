import { reactive } from "vue";
import { AuthErrorCode, Permissions, DbUser, Class, State, MyJwtPayload } from "../server/shared";
import jwtDecode from "jwt-decode";
import { refreshToken } from "./api";
import mitt from "mitt";
import { io } from "socket.io-client";

export const emitter = mitt();

let timeout: NodeJS.Timeout;

export const store = {
  state: reactive<State>({
    socket: io(),
    accessToken: "",
    expireTime: 0,
    user: undefined,
    selectedClass: undefined,
  }),

  connectSocket(id: string) {
    this.state.socket = io("localhost:3002", { query: { token: this.state.accessToken, id } });
  },

  setAccessToken(accessToken: string) {
    this.state.accessToken = accessToken;

    if (!accessToken) {
      this.setUser(undefined);
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await this.refreshToken();
      }, ((this.state.expireTime || 4) - 2) * 1000);
      return;
    }

    const jwt: MyJwtPayload = jwtDecode(accessToken);
    this.state.expireTime = (jwt.exp || 0) - (jwt.iat || 0);

    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      await this.refreshToken();
    }, (this.state.expireTime - 2) * 1000);

    this.setUser({
      id: jwt.id,
      name: jwt.name,
      family: jwt.family,
      fullName: jwt.family,
      phone: jwt.phone,
      nationalCode: jwt.nationalCode,
      role: jwt.role,
      permissions: jwt.permissions,
      password: "",
    });
  },

  setUser(user?: DbUser) {
    if (!this.state.user && user) this.connectSocket(user.id);
    this.state.user = user;
  },

  setSelectedClass(selectedClass?: Class) {
    this.state.selectedClass = selectedClass;
  },

  isLoggedIn() {
    return this.state.user !== undefined && this.state.accessToken !== "";
  },

  hasPermission(permission: Permissions) {
    return this.state.user?.permissions?.includes(permission);
  },

  getRoleText() {
    if (!this.isLoggedIn()) return;
    return this.state.user?.role === "USER"
      ? "کاربر"
      : this.state.user?.role === "STUDENT"
      ? "دانش آموز"
      : this.state.user?.role === "TEACHER"
      ? "دبیر"
      : this.state.user?.role === "ADMIN"
      ? "ادمین"
      : "خطا در سیستم";
  },

  async refreshToken() {
    const newToken = await refreshToken();
    if (newToken !== AuthErrorCode.NoTokenFound && newToken !== AuthErrorCode.WrongToken) {
      if (newToken === AuthErrorCode.ServerDidNotRespond) store.setAccessToken("");
      else store.setAccessToken(newToken);
    }
  },
};
