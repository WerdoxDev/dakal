import http from "http";
import _io from "socket.io";
import { NotificationType, NotificationInfo, AuthErrorCode, StudentState, ClassState } from "./shared/common";
import { createNotification, getClass, getClassTeacherId, getClassUsersId, getUserClass, setClassState, setUserClassState } from "./database";
import { corsConfig, verifyToken } from "./server";

const users: Array<{ userId: string; socketId: string }> = [];
const apTimers: Array<string> = [];

export function connect(server: http.Server) {
  const io: _io.Server = new _io.Server(server, { cors: corsConfig });

  io.use((socket, next) => {
    if (socket.handshake.query.token && typeof socket.handshake.query.token === "string") {
      const token = socket.handshake.query.token;
      const verifiedJwt = verifyToken(token);
      if (verifiedJwt) next();
      else next(new Error(AuthErrorCode.WrongToken.toString()));
    } else next(new Error(AuthErrorCode.NoTokenFound.toString()));
  });

  io.on("connection", (socket) => {
    if (socket.handshake.query.id && typeof socket.handshake.query.id === "string")
      users.push({ userId: socket.handshake.query.id, socketId: socket.id });
    else socket.disconnect();

    socket.on("set-class-state", async (classId: string, state: ClassState) => {
      await setClassState(classId, state);
      const teacherId = await getClassTeacherId(classId);
      if (!teacherId) return;
      io.to(getSocketIdByUserId(teacherId)).emit("class-state-update", classId, state);
      if (state !== ClassState.NotStarted) return;
      const usersId = await getClassUsersId(classId);
      if (!usersId) return;
      for (const id of usersId) await setUserClassState(classId, id, StudentState.Unknown);
      io.to(getSocketIdByUserId(teacherId)).emit("students-state-update", usersId, StudentState.Unknown);
    });

    socket.on("set-student-state", async (classId: string, state: StudentState) => {
      const userId = getUserIdBySocketId(socket.id);
      await setUserClassState(classId, userId, state);
      const teacherId = await getClassTeacherId(classId);
      if (!teacherId) return;
      io.to(getSocketIdByUserId(teacherId)).emit("student-state-update", [userId], state);
    });

    socket.on("start-absence-presence", async (classId: string, timeoutTime: number) => {
      const teacherId = await getClassTeacherId(classId);
      if (!teacherId) return;
      const teacherSocketId = getSocketIdByUserId(teacherId);
      const usersId = await getClassUsersId(classId);
      if (!usersId) return;
      for (const id of usersId) await setUserClassState(classId, id, StudentState.Unknown);
      io.to(getSocketIdByUserId(teacherId)).emit("students-state-update", usersId, StudentState.Unknown);
      setTimeout(async () => {
        if (!apTimers.find((x) => x === classId)) return;
        await stopAbsencePresence(classId);
        io.to(teacherSocketId).emit("absence-presence-stopped", classId);
      }, timeoutTime);
      apTimers.push(classId);
      io.to(teacherSocketId).emit("absence-presence-started", classId);
    });

    socket.on("stop-absence-presence", async (classId: string) => {
      await stopAbsencePresence(classId);
    });

    socket.on("send-notification", (classId: string, usersId: string[], type: NotificationType, textHighlights: string[], data?: string) => {
      usersId.forEach(async (x) => {
        await sendNotification(classId, x, type, textHighlights, data);
      });
    });

    socket.on("disconnect", () => {
      const id = users.findIndex((x) => x.socketId === socket.id);
      if (id === -1) return;
      users.splice(id, 1);
    });
  });

  async function stopAbsencePresence(classId: string) {
    console.log("stop");
    const apTimerIndex = apTimers.findIndex((x) => x === classId);
    if (apTimerIndex === -1) return;
    apTimers.splice(apTimerIndex, 1);
    const teacherId = await getClassTeacherId(classId);
    if (!teacherId) return;
    io.to(getSocketIdByUserId(teacherId)).emit("absence-presence-stopped", classId);
    const usersId = await getClassUsersId(classId, true);
    if (!usersId) return;
    const className = (await getClass(classId))?.name || "";
    const usersIdToChange: Array<string> = [];
    for (const id of usersId) {
      console.log(id);
      await sendNotification(classId, id, NotificationType.StopAbsencePresence, [className]);
      const userClass = await getUserClass(classId, id);
      if (userClass && userClass.state !== StudentState.Present) {
        await setUserClassState(classId, id, StudentState.Absent);
        usersIdToChange.push(id);
      }
    }
    io.to(getSocketIdByUserId(teacherId)).emit("students-state-update", usersIdToChange, StudentState.Absent);
  }

  async function sendNotification(classId: string, userId: string, type: NotificationType, textHighlights: string[], data?: string) {
    const notification: NotificationInfo = {
      type,
      sentDate: Date.now(),
      textHighlights,
      userId,
      classId,
      data,
    };
    const newNotification = await createNotification(notification);
    io.to(getSocketIdByUserId(userId)).emit("notification", newNotification);
  }
}

function getSocketIdByUserId(userId: string) {
  return users.find((x) => x.userId === userId)?.socketId || "";
}

function getUserIdBySocketId(socketId: string) {
  return users.find((x) => x.socketId === socketId)?.userId || "";
}
