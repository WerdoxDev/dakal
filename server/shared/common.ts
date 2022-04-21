import { JwtPayload } from "jwt-decode";
import { Socket } from "socket.io-client";
import { FunctionalComponent, HTMLAttributes, RenderFunction, VNode, VNodeProps } from "vue";

export interface DbUser extends UserInfo {
  id: string;
  role: string;
  permissions?: string[];
  refreshToken?: string;
}

export interface UserBasicInfo {
  id: string;
  name: string;
  family: string;
  fullName: string;
  phone: string;
}

export interface UserInfo extends UserCredentials {
  name: string;
  family: string;
  fullName: string;
  phone: string;
}

export interface UserCredentials {
  nationalCode: string;
  password: string;
}

export interface EditUser {
  id: string;
  name: string;
  family: string;
  phone: string;
  currentPassword: string;
  avatarChanged: boolean;
}

export interface UserClass {
  id: string;
  isTeacher: boolean;
  state: StudentState;
  userId: string;
  classId: string;
  user?: UserInfo;
}

export interface Class {
  id: string;
  school: string;
  grade: string;
  name: string;
  state: ClassState;
  users?: UserClass[];
}

export interface EditClass {
  id: string;
  name: string;
  currentPassword: string;
  avatarChanged: boolean;
  students: string[];
}

export interface DbNotification extends NotificationInfo {
  id: string;
}

export interface NotificationInfo {
  type: NotificationType;
  textHighlights: string[];
  sentDate: number;
  userId: string;
  classId: string;
  data?: string;
}

export interface State {
  socket: Socket;
  accessToken: string;
  expireTime: number;
  user?: DbUser;
  selectedClass?: Class;
}

export interface Option {
  id: number;
  text: string;
  selected: boolean;
  identifier?: string | number;
  value?: string | number;
}

export interface NavbarItem {
  text: string;
  link: string;
  permission?: Permissions;
  icon: FunctionalComponent<HTMLAttributes & VNodeProps>;
  selected: boolean;
}

export interface FormMessage {
  group: string;
  color: string;
  message: string;
}

export interface StudentsInfo extends UserInfo {
  id: string;
  state: StudentState;
}

export interface AvailableStudent extends UserBasicInfo {
  isAdded: boolean;
  new?: boolean;
}

export interface MyJwtPayload extends JwtPayload {
  [key: string]: any;
}

export enum CreateUserErrorCode {
  Failure = "FAILURE",
  PhoneExists = "PHONE_EXISTS",
  NationalExists = "NATIONAL_EXISTS",
}

export enum GetUserErrorCode {
  Failure = "FAILURE",
  WrongCredentials = "WRONG_CREDENTIALS",
  IDNotFound = "ID_NOT_FOUND",
}

export enum GetNotificationsErrorCode {
  UserNotFound = "USER_NOT_FOUND",
  Failure = "FAILURE",
}

export enum EditUserErrorCode {
  Failure = "FAILURE",
  WrongPassword = "WRONG_PASSWORD",
}

export enum EditClassErrorCode {
  Failure = "FAILURE",
  WrongPassword = "WRONG_PASSWORD",
}

export enum LogoutErrorCode {
  Failure = "FAILURE",
}

export enum CreateNotificationErrorCode {
  Failure = "FAILURE",
}

export enum AuthErrorCode {
  NoTokenFound = "NO_TOKEN_FOUND",
  WrongToken = "WRONG_TOKEN",
  AccessDenied = "ACCESS_DENIED",
  ServerDidNotRespond = "SERVER_DID_NOT_RESPOND",
}

export enum AvatarErrorCode {
  DoesNotExists = "DOES_NOT_EXISTS",
}

export enum Roles {
  User = "USER",
  Student = "STUDENT",
  Teacher = "TEACHER",
  Admin = "ADMIN",
}

export enum Permissions {
  EditProfile = "S_EDIT_PROFILE",
  EditClass = "S_EDIT_CLASS",
  AccessEditProfile = "C_ACCESS_EDIT_PROFILE",
  AccessDashboard = "C_ACCESS_DASHBOARD",
  AccessTDashboard = "C_ACCESS_TDASHBOARD",
  AccessEditClass = "C_ACCESS_EDIT_CLASS",
}

export enum NotificationType {
  StartAbsencePresence = "START_ABSENCE_PRESENCE",
  StopAbsencePresence = "STOP_ABSENCE_PRESENCE",
  StartClass = "START_CLASS",
  StopClass = "STOP_CLASS",
}

export enum EventType {
  AvatarChanged = "AVATAR_CHANGED",
  ShowLoading = "SHOW_LOADING",
  HideLoading = "HIDE_LOADING",
}

export enum StudentState {
  Unknown = -1,
  Present = 1,
  Absent = 0,
}

export enum ClassState {
  NotStarted = 0,
  Started = 1,
}
