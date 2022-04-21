import express from "express";
import http from "http";
import cors from "cors";
import historyApi from "connect-history-api-fallback";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import {
  editUser,
  getUserByCredentials,
  getUserByID,
  createUser,
  setUserRefreshToken,
  getUserClasses,
  getClassUsers,
  getUserNotifications,
  getClass,
  searchUsers,
  editClass,
  getClassTeacherId,
} from "./database";
import {
  UserCredentials,
  CreateUserErrorCode,
  UserInfo,
  AuthErrorCode,
  LogoutErrorCode,
  GetUserErrorCode,
  Permissions,
  EditUser,
  AvatarErrorCode,
  DbUser,
  EditClass,
} from "./shared/common";
import webpush from "web-push";
import path from "path";
import sharp from "sharp";
import multer from "multer";
import fs from "fs";
import { connect } from "./socket";

const app = express();
const server = http.createServer(app);
export const corsConfig: cors.CorsOptions = {
  credentials: true,
  origin: ["http://localhost:3001", "http://192.168.1.115:3001", "http://192.168.1.156:3001", "https://dakal.matin-tat.ir"],
};
const port = process.env.PORT || 3002;
const filePath = path.join(__dirname, "../dist/");
const multipart = multer();
connect(server);
dotenv.config();

sharp.cache(false);
app.use(cors(corsConfig));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(cookieParser());

app.post("/register", async (req, res) => {
  const user: UserInfo = req.body;
  const result = await createUser(user);
  if (typeof result === "object") {
    const tokens = generateTokens(result);
    if (!(await setUserRefreshToken(result.id, tokens[1]))) res.json(CreateUserErrorCode.Failure);
    res.cookie("refresh_token", tokens[1], {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.json(tokens[0]);
  } else res.json(result);
});

app.post("/login", async (req, res) => {
  const credentials: UserCredentials = req.body;
  const result = await getUserByCredentials(credentials);
  if (typeof result === "object") {
    const tokens = generateTokens(result);
    if (!(await setUserRefreshToken(result.id, tokens[1]))) {
      return res.json(GetUserErrorCode.Failure);
    }
    res.cookie("refresh_token", tokens[1], {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.json(tokens[0]);
  } else res.json(result);
});

app.delete("/logout", authenticateToken, async (req, res) => {
  if (!req.jwt) return res.json(AuthErrorCode.WrongToken);
  if (!(await setUserRefreshToken((req.jwt as DbUser).id, ""))) return res.json(LogoutErrorCode.Failure);
  res.sendStatus(204);
});

app.get("/refresh-token", (req, res) => {
  const refreshToken = req.headers["cookie"]?.split("=")[1];
  if (!refreshToken) res.json(AuthErrorCode.NoTokenFound);
  else {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "", async (err, verifiedJwt) => {
      if (err) return res.json(AuthErrorCode.WrongToken);
      if (verifiedJwt) {
        const result = await getUserByID((verifiedJwt as DbUser).id);
        if (typeof result === "object") {
          if (refreshToken !== result.refreshToken) return res.json(AuthErrorCode.WrongToken);
          delete result.refreshToken;
          const tokens = generateTokens(result);
          await setUserRefreshToken(result.id, tokens[1]);
          res.cookie("refresh_token", tokens[1], {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          });
          res.json(tokens[0]);
        } else return res.json(result);
      }
    });
  }
});

app.get("/test", authenticateToken, (req, res) => {
  res.json(req.jwt?.exp);
});

app.post("/edit-profile", authenticateToken, needPermission(Permissions.EditProfile), multipart.single("binary_data"), async (req, res) => {
  const user: EditUser = JSON.parse(req.body.json_data);
  const result = await editUser(user);
  if (result) return res.json(result);
  const outputFile = path.join(__dirname, `./avatars/${user.id}.webp`);
  if (req.file) {
    const buffer = req.file.buffer;
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    await sharp(buffer)
      .resize(128, 128)
      .toFile(path.join(__dirname, `./avatars/${user.id}.webp`));
  } else if (user.avatarChanged) {
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  }
  res.sendStatus(200);
});

app.post("/edit-class", authenticateToken, needPermission(Permissions.EditClass), multipart.single("binary_data"), async (req, res) => {
  const newClass: EditClass = JSON.parse(req.body.json_data);
  const result = await editClass(newClass);
  if (result) return res.json(result);
  const outputFile = path.join(__dirname, `./avatars/${newClass.id}.webp`);
  if (req.file) {
    const buffer = req.file.buffer;
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    await sharp(buffer)
      .resize(128, 128)
      .toFile(path.join(__dirname, `./avatars/${newClass.id}.webp`));
  } else if (newClass.avatarChanged) {
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  }
  res.sendStatus(200);
});

app.get("/avatar/:id/:size/:isBase64", async (req, res) => {
  const [id, size, isBase64] = [req.params.id, Number(req.params.size), Number(req.params.isBase64)];
  const inputFile = path.join(__dirname, `./avatars/${id}.webp`);
  if (fs.existsSync(inputFile)) {
    const newFile = await sharp(inputFile).resize(size, size).toBuffer();
    res.type("image/webp").end(isBase64 === 1 ? newFile.toString("base64") : newFile);
  } else res.json(AvatarErrorCode.DoesNotExists);
});

app.get("/user-classes/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  const result = await getUserClasses(userId);
  res.json(result);
});

app.get("/class-users/:id/:includeUsers/:excludeTeacher", authenticateToken, async (req, res) => {
  const [classId, includeUsers, excludeTeacher] = [req.params.id, Number(req.params.includeUsers), Number(req.params.excludeTeacher)];
  const result = await getClassUsers(classId, includeUsers === 1 ? true : false, excludeTeacher === 1 ? true : false);
  res.json(result);
});

app.get("/user-notifications/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  const result = await getUserNotifications(userId);
  res.json(result);
});

app.get("/get-class/:id", authenticateToken, async (req, res) => {
  const classId = req.params.id;
  const classTeacherId = await getClassTeacherId(classId);
  if (req.jwt?.id !== classTeacherId) return res.json(AuthErrorCode.AccessDenied);
  const result = await getClass(classId);
  res.json(result);
});

app.get("/get-user/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  if (req.jwt?.id !== userId) return res.json(AuthErrorCode.AccessDenied);
  const result = await getUserByID(userId);
  res.json(result);
});

app.get("/search-users/:searchQuery", authenticateToken, async (req, res) => {
  const searchQuery = req.params.searchQuery;
  const result = await searchUsers(searchQuery);
  res.json(result);
});

function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.json(AuthErrorCode.NoTokenFound);

  const verifiedJwt = verifyToken(token);
  if (verifiedJwt) {
    req.jwt = verifiedJwt as JwtPayload;
    next();
  }
}

function needPermission(...permissions: string[]) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.jwt) return res.json(AuthErrorCode.AccessDenied);
    const result = await getUserByID(req.jwt.id);
    if (typeof result === "object") {
      const userPermissions = result.permissions;
      if (userPermissions?.length === 0 || !userPermissions) return res.json(AuthErrorCode.AccessDenied);
      if (!permissions.every((x) => userPermissions.includes(x))) return res.json(AuthErrorCode.AccessDenied);
      else next();
    } else res.json(result);
  };
}

function generateTokens(user: DbUser): [string, string] {
  if (user.permissions) {
    user.permissions = user.permissions.filter((x) => x.startsWith("C_"));
  }
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || "", {
    expiresIn: "2m",
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET || "");
  return [accessToken, refreshToken];
}

export function verifyToken(token: string): JwtPayload | undefined {
  let result: JwtPayload | undefined;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "", (err, verifiedJwt) => {
    if (err) return undefined;
    result = verifiedJwt as JwtPayload | undefined;
  });
  return result;
}

// Notification

const vapidKeys = {
  publicKey: "BEl6KGGxHGLUvZ8oQO6ZJH9lrXNyHq53HwtxY__LfQN2mDLTBNK0nQEjILTDcZ2FJEaFLaR729H8HyLOigcGraY",
  privateKey: "Ez7Y-IssciMt5qmppw0_C2DPB3QD1XBowJLrub2clgo",
};

webpush.setVapidDetails("mailto:matin.tat85@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);

const testSubscriptions: webpush.PushSubscription[] = [];

app.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  testSubscriptions.push(subscription);
  res.json({ message: "success" });
});

app.get("/send-notification", (req, res) => {
  testSubscriptions.forEach((x) => {
    sendNotification(x, "Hello World");
  });
  res.json({ message: "message sent" });
});

function sendNotification(subscription: webpush.PushSubscription, message: string) {
  webpush.sendNotification(subscription, message);
}

app.use(historyApi());

app.use("/", express.static(filePath));

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

export default server;

declare global {
  namespace Express {
    interface Request {
      jwt?: JwtPayload;
    }
  }
}
