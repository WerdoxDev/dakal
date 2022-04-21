import {
  CreateUserErrorCode,
  UserCredentials,
  UserInfo,
  GetUserErrorCode,
  AuthErrorCode,
  LogoutErrorCode,
  AvatarErrorCode,
  Class,
  UserClass,
  GetNotificationsErrorCode,
  DbNotification,
  UserBasicInfo,
  DbUser,
} from "../server/shared";
import axios from "axios";
import { store } from "./store";

const hosts = ["http://localhost:3002", "https://dakal.matin-tat.ir"];
const host = hosts[1];

export async function registerUser(user: UserInfo): Promise<CreateUserErrorCode> {
  const response = await axios.post(`${host}/register`, user, { withCredentials: true });
  return response.data;
}

export async function loginUser(credentials: UserCredentials): Promise<GetUserErrorCode | string> {
  const response = await axios.post(`${host}/login`, credentials, { withCredentials: true });
  return response.data;
}

export async function logoutUser(): Promise<"" | LogoutErrorCode> {
  const response = await axios.delete(`${host}/logout`, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function refreshToken(): Promise<AuthErrorCode | string> {
  try {
    const response = await axios.get(`${host}/refresh-token`, { withCredentials: true });
    return response.data;
  } catch {
    return AuthErrorCode.ServerDidNotRespond;
  }
}

export async function editProfile(formData: FormData): Promise<AuthErrorCode | string> {
  const response = await axios.post(`${host}/edit-profile`, formData, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function editClass(formData: FormData): Promise<AuthErrorCode | string> {
  const response = await axios.post(`${host}/edit-class`, formData, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function getAvatar(id: string, size = 128): Promise<AvatarErrorCode | string> {
  const response = await axios.get(`${host}/avatar/${id}/${size}/1`);
  return response.data;
}

export async function getClasses(userId: string): Promise<AuthErrorCode | Class[]> {
  const response = await axios.get(`${host}/user-classes/${userId}`, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function getClass(classId: string): Promise<AuthErrorCode | Class> {
  const response = await axios.get(`${host}/get-class/${classId}`, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function getUser(userId: string): Promise<AuthErrorCode | DbUser> {
  const response = await axios.get(`${host}/get-user/${userId}`, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function getClassUsers(classId: string, includeUsers = false, excludeTeacher = false): Promise<AuthErrorCode | UserClass[]> {
  const response = await axios.get(`${host}/class-users/${classId}/${includeUsers === true ? 1 : 0}/${excludeTeacher === true ? 1 : 0}`, {
    headers: { Authorization: `Bearer ${store.state.accessToken}` },
  });
  return response.data;
}

export async function searchUsers(searchQuery: string): Promise<AuthErrorCode | UserBasicInfo[]> {
  const response = await axios.get(`${host}/search-users/${searchQuery}`, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function getNotifications(userId: string): Promise<DbNotification[] | GetNotificationsErrorCode> {
  const response = await axios.get(`${host}/user-notifications/${userId}`, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  return response.data;
}

export async function test(): Promise<void> {
  const response = await axios.get(`${host}/test`, { headers: { Authorization: `Bearer ${store.state.accessToken}` } });
  console.log(response.data);
}
