# 数据库使用指南

## 📋 概述

专注星球使用 **Prisma ORM + SQLite** 实现数据持久化，所有用户数据、房间信息和专注记录都会自动保存。

### 功能特性

- **自动保存** - 加入房间、开始专注时自动创建记录
- **实时统计** - 显示总时间、完成次数、平均时长
- **历史记录** - 查看最近的专注记录
- **容错设计** - 数据库失败不影响应用核心功能

---

## 🚀 快速开始

### 1. 创建环境变量

```bash
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
EOF
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 创建数据库
npm run db:push

# 添加测试数据（可选）
npm run db:seed
```

### 4. 启动项目

```bash
npm run dev
```

### 5. 查看数据库

```bash
npm run db:studio
```

访问 http://localhost:5555

---

## 📊 数据模型

### User（用户）
- `id` - 唯一标识符
- `name` - 用户名
- `email` - 邮箱（可选）
- `color` - 用户颜色
- `createdAt` - 创建时间

### Room（房间）
- `id` - 唯一标识符
- `roomCode` - 房间代码
- `name` - 房间名称
- `createdAt` - 创建时间

### RoomMember（房间成员）
- `userId` - 用户 ID
- `roomId` - 房间 ID
- `joinedAt` - 加入时间

### FocusSession（专注记录）
- `userId` - 用户 ID
- `roomId` - 房间 ID（可选）
- `startTime` - 开始时间
- `endTime` - 结束时间
- `duration` - 持续时间（秒）
- `completed` - 是否完成

---

## 🔄 工作流程

### 加入房间
```
输入名字 → 自动创建用户 → 创建/加入房间 → 保存成员关系
```

### 开始专注
```
点击开始 → 创建专注会话 → 实时追踪时间
```

### 结束专注
```
点击完成 → 保存会话记录 → 更新统计数据
```

---

## 🎯 API 使用

### 前端 API（lib/api.ts）

#### 获取统计数据
```typescript
import { statsApi } from '@/lib/api'
const stats = await statsApi.getUserStats(userId)
```

#### 获取专注记录
```typescript
import { sessionApi } from '@/lib/api'
const sessions = await sessionApi.getUserSessions(userId, 20)
```

#### 创建用户
```typescript
import { userApi } from '@/lib/api'
const user = await userApi.createOrGetUser({ name, color })
```

### 服务器端操作（lib/db.ts）

#### 用户操作
```typescript
import { userDb } from '@/lib/db'

// 创建或获取用户
const user = await userDb.createOrGetUser({
  name: '张三',
  color: '#4ECDC4'
})

// 获取用户统计
const stats = await userDb.getUserStats(userId)
```

#### 房间操作
```typescript
import { roomDb } from '@/lib/db'

// 创建房间
const room = await roomDb.createRoom('room-code', '房间名称')

// 用户加入房间
await roomDb.joinRoom(userId, 'room-code')
```

#### 专注记录操作
```typescript
import { sessionDb } from '@/lib/db'

// 开始专注
const session = await sessionDb.startSession(userId, roomId)

// 结束专注
const completed = await sessionDb.endSession(session.id)

// 获取用户记录
const sessions = await sessionDb.getUserSessions(userId, 20)
```

---

## 🌐 HTTP API

### 用户 API

#### 创建用户
```http
POST /api/users
Content-Type: application/json

{
  "name": "张三",
  "color": "#4ECDC4",
  "email": "optional@example.com"
}
```

#### 获取用户
```http
GET /api/users?id=xxx
```

### 统计 API

```http
GET /api/stats?userId=xxx

Response:
{
  "totalFocusTime": 3600,     // 秒
  "totalSessions": 5,
  "averageSessionTime": 720    // 秒
}
```

### 专注记录 API

#### 开始专注
```http
POST /api/sessions
Content-Type: application/json

{
  "userId": "xxx",
  "roomId": "xxx"  // 可选
}
```

#### 结束专注
```http
PATCH /api/sessions
Content-Type: application/json

{
  "sessionId": "xxx"
}
```

#### 获取记录
```http
GET /api/sessions?userId=xxx&limit=20
GET /api/sessions?roomId=xxx&limit=20
```

---

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run db:studio        # 打开数据库管理界面

# 数据库
npm run db:generate      # 生成 Prisma Client
npm run db:push          # 同步数据库结构
npm run db:migrate       # 创建数据库迁移
npm run db:seed          # 运行种子数据

# 重置数据库
rm prisma/dev.db
npm run db:push
npm run db:seed
```

---

## 🔄 切换数据库

修改 `.env` 文件：

```env
# SQLite（默认）
DATABASE_URL="file:./dev.db"

# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/focusplanet"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/focusplanet"
```

然后运行：

```bash
npm run db:push
```

---

## 💡 UI 组件

### UserStats
显示用户统计数据（总时间、完成次数、平均时长）

```tsx
import { UserStats } from '@/components/UserStats'

<UserStats />
```

### SessionHistory
显示最近的专注记录（支持展开查看更多）

```tsx
import { SessionHistory } from '@/components/SessionHistory'

<SessionHistory />
```

---

## 🔍 查看数据

### Prisma Studio
```bash
npm run db:studio
```
访问 http://localhost:5555 可视化管理数据库

### 左侧面板
应用会自动显示：
- 总专注时间
- 完成次数
- 平均时长
- 最近的专注记录

---

## 📝 最佳实践

1. **类型安全** - Prisma 自动生成 TypeScript 类型
2. **关联查询** - 使用 `include` 加载关联数据
3. **异步操作** - 所有数据库操作都是异步的
4. **错误处理** - 数据库失败不影响核心功能
5. **数据验证** - 在 API 层进行输入验证

---

## 🎯 使用示例

### 在组件中使用

```typescript
'use client'

import { useState, useEffect } from 'react'

export function UserStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch(`/api/stats?userId=${userId}`)
      .then(res => res.json())
      .then(data => setStats(data))
  }, [userId])

  if (!stats) return <div>加载中...</div>

  return (
    <div>
      <p>总时间: {Math.floor(stats.totalFocusTime / 60)} 分钟</p>
      <p>次数: {stats.totalSessions}</p>
      <p>平均: {Math.floor(stats.averageSessionTime / 60)} 分钟</p>
    </div>
  )
}
```

### 在服务器端使用

```typescript
import { userDb } from '@/lib/db'

export async function GET(request: Request) {
  const user = await userDb.createOrGetUser({
    name: '新用户',
    color: '#FF6B6B'
  })
  
  return Response.json(user)
}
```
