import { PrismaClient } from "@prisma/client";
import {
  CreateUserErrorCode,
  UserInfo,
  Permissions,
  Roles,
  UserCredentials,
  GetUserErrorCode,
  EditUser,
  EditUserErrorCode,
  DbUser,
  Class,
  UserClass,
  NotificationInfo,
  DbNotification,
  CreateNotificationErrorCode,
  GetNotificationsErrorCode,
  StudentState,
  ClassState,
  UserBasicInfo,
  EditClassErrorCode,
  EditClass,
} from "./shared/common";

const prisma = new PrismaClient();
const defaultPermissions = [Permissions.EditProfile, Permissions.AccessDashboard, Permissions.AccessTDashboard, Permissions.AccessEditProfile];

async function main() {
  await prisma.$connect();
  console.log("connected to mongodb");
}

export async function createUser(user: UserInfo): Promise<DbUser | CreateUserErrorCode> {
  try {
    if (await prisma.user.findFirst({ where: { phone: user.phone } })) return CreateUserErrorCode.PhoneExists;
    if (await prisma.user.findFirst({ where: { nationalCode: user.nationalCode } })) return CreateUserErrorCode.NationalExists;
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        family: user.family,
        fullName: user.fullName,
        password: user.password,
        nationalCode: user.nationalCode,
        phone: user.phone,
        permissions: defaultPermissions,
        role: Roles.User,
      },
    });
    return newUser as DbUser;
  } catch {
    return CreateUserErrorCode.Failure;
  }
}

export async function createNotification(notification: NotificationInfo): Promise<DbNotification | CreateNotificationErrorCode> {
  try {
    const newNotification = await prisma.userNotification.create({
      data: {
        type: notification.type,
        textHighlights: notification.textHighlights,
        sentDate: notification.sentDate,
        data: notification.data,
        classId: notification.classId,
        userId: notification.userId,
      },
    });
    return newNotification as DbNotification;
  } catch {
    return CreateNotificationErrorCode.Failure;
  }
}

export async function editUser(user: EditUser): Promise<EditUserErrorCode | undefined> {
  try {
    const dbUser = await prisma.user.findFirst({ where: { id: user.id, password: user.currentPassword } });
    if (!dbUser) return EditUserErrorCode.WrongPassword;
    await prisma.user.update({ where: { id: user.id }, data: { name: user.name, family: user.family, phone: user.phone } });
  } catch {
    return EditUserErrorCode.Failure;
  }
}

export async function editClass(newClass: EditClass): Promise<EditClassErrorCode | undefined> {
  try {
    const dbClass = await prisma.class.findFirst({
      where: { id: newClass.id, UserClass: { some: { isTeacher: true, User: { password: newClass.currentPassword } } } },
    });
    if (!dbClass) return EditClassErrorCode.WrongPassword;
    await prisma.class.update({ where: { id: newClass.id }, data: { name: newClass.name } });
    await prisma.userClass.deleteMany({ where: { classId: dbClass.id, isTeacher: false } });
    for (const student in newClass.students) {
      const userId = newClass.students[student];
      await prisma.userClass.create({ data: { userId, classId: newClass.id, isTeacher: false, state: StudentState.Unknown } });
    }
  } catch {
    return EditClassErrorCode.Failure;
  }
}

export async function getUserByCredentials(credentials: UserCredentials): Promise<DbUser | GetUserErrorCode> {
  try {
    const dbUser = await prisma.user.findFirst({ where: { nationalCode: credentials.nationalCode, password: credentials.password } });
    if (!dbUser) return GetUserErrorCode.WrongCredentials;
    return dbUser as DbUser;
  } catch {
    return GetUserErrorCode.Failure;
  }
}

export async function getUserByID(userId: string): Promise<DbUser | GetUserErrorCode> {
  try {
    const dbUser = await prisma.user.findFirst({ where: { id: userId } });
    if (dbUser) return dbUser as DbUser;
    else return GetUserErrorCode.IDNotFound;
  } catch {
    return GetUserErrorCode.Failure;
  }
}

export async function getUserClasses(userId: string): Promise<Class[] | undefined> {
  try {
    const userClass = (await prisma.userClass.findMany({ where: { userId }, select: { Class: true } })).map((x) => x.Class);
    if (userClass) return userClass;
  } catch {
    return undefined;
  }
}

export async function getUserClass(classId: string, userId: string): Promise<UserClass | undefined> {
  try {
    const userClass = await prisma.userClass.findFirst({ where: { classId, userId } });
    if (userClass) return userClass;
  } catch {
    return undefined;
  }
}

export async function getClassUsers(classId: string, includeUsers: boolean, excludeTeacher = false): Promise<UserClass[] | undefined> {
  try {
    const classUsers: UserClass[] | undefined = (
      await prisma.class.findFirst({ where: { id: classId }, select: { UserClass: { include: { User: includeUsers ? true : false } } } })
    )?.UserClass.map((x) => {
      return { id: x.id, isTeacher: x.isTeacher, state: x.state, user: x.User, userId: x.userId, classId: x.classId };
    });
    if (classUsers) {
      classUsers.forEach((x, index) => {
        if (x.user)
          x.user = {
            name: x.user.name,
            family: x.user.family,
            fullName: x.user.fullName,
            nationalCode: x.user.nationalCode,
            phone: x.user.phone,
            password: "",
          };
        if (x.isTeacher && excludeTeacher) classUsers.splice(index, 1);
      });
      return classUsers;
    }
  } catch {
    return undefined;
  }
}

export async function getClass(classId: string): Promise<Class | undefined> {
  try {
    const dbClass = await prisma.class.findFirst({ where: { id: classId } });
    if (dbClass) return dbClass;
    else return undefined;
  } catch {
    return undefined;
  }
}

export async function getUserNotifications(userId: string): Promise<DbNotification[] | GetNotificationsErrorCode> {
  try {
    const notifications = await prisma.userNotification.findMany({ where: { userId } });
    if (!notifications) return GetNotificationsErrorCode.UserNotFound;
    else return notifications as DbNotification[];
  } catch {
    return GetNotificationsErrorCode.Failure;
  }
}

export async function getClassTeacherId(classId: string): Promise<string | undefined> {
  try {
    const userClass = await prisma.userClass.findFirst({ where: { classId, isTeacher: true } });
    if (!userClass) return undefined;
    return userClass.userId;
  } catch {
    return undefined;
  }
}

export async function getClassUsersId(classId: string, excludeTeacher = false): Promise<string[] | undefined> {
  try {
    const classUsers = (
      await prisma.userClass.findMany({ where: { classId, isTeacher: excludeTeacher ? false : undefined }, select: { userId: true } })
    ).map((x) => x.userId);
    return classUsers;
  } catch {
    return undefined;
  }
}

export async function setUserRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
  try {
    if (refreshToken) await prisma.user.update({ where: { id: userId }, data: { refreshToken } });
    else await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return true;
  } catch {
    return false;
  }
}

export async function setUserClassState(classId: string, userId: string, state: StudentState): Promise<boolean> {
  // try {
  const userClass = await prisma.userClass.findFirst({ where: { userId, classId } });
  if (!userClass) return false;
  await prisma.userClass.update({ where: { id: userClass.id }, data: { state } });
  return true;
  // } catch {
  // return false;
  // }
}

export async function setClassState(classId: string, state: ClassState): Promise<boolean> {
  try {
    await prisma.class.update({ where: { id: classId }, data: { state } });
    return true;
  } catch {
    return false;
  }
}

export async function searchUsers(searchQuery: string): Promise<UserBasicInfo[] | undefined> {
  try {
    const users = await prisma.user.findMany({ where: { fullName: { contains: searchQuery } } });
    return users as UserBasicInfo[];
  } catch {
    return undefined;
  }
}

// export async function checkForNotificationLimit(userId: string): Promise<boolean> {
//   try {
//     const notificationCount = (await prisma.userNotification.findMany({ where: { userId } })).length;
//     if(notificationCount > 5) await prisma.userNotification.deleteMany({where:{userId}})

//   } catch {
//     return false;
//   }
// }

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
