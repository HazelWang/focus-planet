# 数据库使用指南

## 📋 概述

专注星球使用 **Prisma ORM + SQLite** 实现数据持久化。

### 核心功能

- ✅ **自动保存** - 用户数据、房间、专注记录自动保存
- ✅ **实时统计** - 总时间、完成次数、平均时长
- ✅ **历史记录** - 查看最近的专注记录
- ✅ **容错设计** - 数据库失败不影响核心功能

---

## 🗄️ 数据模型

### User（用户）
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String?  @unique
  color     String
  createdAt DateTime @default(now())
}
```

### Room（房间）
```prisma
model Room {
  id        String   @id @default(cuid())
  roomCode  String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

### RoomMember（房间成员）
```prisma
model RoomMember {
  id             String    @id @default(cuid())
  userId         String
  roomId         String
  joinedAt       DateTime  @default(now())
  
  // 实时状态（用于 SWR 同步）
  isFocusing     Boolean   @default(false)
  focusStartTime DateTime?
  totalFocusTime Int       @default(0)
  lastActiveAt   DateTime  @default(now())
  
  @@unique([userId, roomId])
}
```

### FocusSession（专注记录）
```prisma
model FocusSession {
  id        String    @id @default(cuid())
  userId    String
  roomId    String?
  startTime DateTime
  endTime   DateTime?
  duration  Int       @default(0)  // 秒
  completed Boolean   @default(false)
}
```

---

## 🔧 常用命令

### 开发

```bash
# 生成 Prisma Client
npm run db:generate

# 同步数据库结构（开发环境）
npm run db:push

# 打开数据库管理界面
npm run db:studio
```

### 迁移

```bash
# 创建迁移（生产环境）
npm run db:migrate

# 添加测试数据
npm run db:seed
```

### 重置

```bash
# 删除数据库
rm prisma/dev.db

# 重新创建
npm run db:push
npm run db:seed
```

---

## 🔌 API 使用

### 创建用户

```typescript
import { userApi } from '@/lib/api'

const user = await userApi.createOrGetUser({
  name: 'Alice',
  color: '#4ECDC4'
})
```

### 开始专注

```typescript
import { sessionApi } from '@/lib/api'

const session = await sessionApi.startSession(userId, roomId)
```

### 结束专注

```typescript
await sessionApi.endSession(sessionId)
```

### 获取统计

```typescript
import { statsApi } from '@/lib/api'

const stats = await statsApi.getUserStats(userId)
// { totalTime, sessionCount, averageTime, longestSession }
```

### 获取历史

```typescript
const sessions = await sessionApi.getUserSessions(userId, 10)
```

---

## 🗂️ 文件位置

```
prisma/
├── schema.prisma     # 数据模型定义
├── seed.js           # 测试数据
└── dev.db            # SQLite 数据库文件（不提交）
```

---

## 💾 切换到其他数据库

### PostgreSQL

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/focusplanet"
```

### MySQL

```env
# .env
DATABASE_URL="mysql://user:password@localhost:3306/focusplanet"
```

然后运行：

```bash
npm run db:push
```

---

## 📊 数据库统计

使用 Prisma Studio 查看：

```bash
npm run db:studio
```

访问 http://localhost:5555

---

## 🔍 查询示例

### 直接使用 Prisma

```typescript
import { prisma } from '@/lib/prisma'

// 查询用户
const user = await prisma.user.findUnique({
  where: { id: userId }
})

// 查询专注记录
const sessions = await prisma.focusSession.findMany({
  where: { userId },
  orderBy: { startTime: 'desc' },
  take: 10
})

// 统计数据
const stats = await prisma.focusSession.aggregate({
  where: { userId, completed: true },
  _sum: { duration: true },
  _count: true,
  _avg: { duration: true }
})
```

---

## 🐛 常见问题

### 1. Prisma Client 类型错误

```bash
# 重新生成 Prisma Client
npm run db:generate

# 重启 TypeScript 服务器
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### 2. 数据库损坏

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### 3. 迁移失败

```bash
# 强制重置（会丢失数据）
npm run db:push -- --force-reset
```

---

## 📚 相关资源

- [Prisma 文档](https://www.prisma.io/docs)
- [SQLite 文档](https://www.sqlite.org/docs.html)
- [项目 README](./README.md)
