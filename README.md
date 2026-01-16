# 专注星球 🪐 Focus Planet

将番茄工作法与虚拟空间结合，用户化身一个"星球"，专注时星球生长，分心时停滞。能看到其他在线用户的"星球"状态，形成无声的集体监督。

## ✨ 特性

- 🎮 **游戏化专注体验** - 将枯燥的时间管理游戏化、可视化
- 🌌 **3D 宇宙视图** - 使用 Three.js 构建的精美 3D 星球场景
- 👥 **多人实时协作** - 实时状态同步（3 秒刷新）
- ⏱️ **番茄工作法** - 25 分钟专注周期，科学的时间管理
- 🔗 **一键分享** - 生成房间链接，邀请朋友一起专注
- 📊 **数据持久化** - 自动保存专注记录和统计数据

## 🚀 技术栈

- **前端框架**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand + SWR
- **3D 渲染**: Three.js + @react-three/fiber + @react-three/drei
- **实时通信**: SWR 轮询（3 秒刷新）
- **数据库**: Prisma ORM + SQLite
- **部署**: Vercel（完全兼容 ✅）

---

## 📦 快速开始

### 📋 前置条件

- Node.js 18+
- npm

### ⚡ 安装和运行

#### 方法 1：一键安装（推荐）

```bash
chmod +x setup.sh
./setup.sh
```

#### 方法 2：手动安装

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npm run db:push

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 🎉

---

## 🎯 使用指南

### 1. 创建房间

- 输入你的名字
- 留空房间 ID 创建新房间，或输入已有 ID 加入现有房间
- 点击"进入宇宙"

### 2. 邀请朋友

- 点击"分享"按钮复制房间链接
- 发送给朋友一起专注

### 3. 开始专注

- 点击"开始专注"按钮
- 你的星球会发光并成长
- 其他人会在 3 秒内看到你的状态更新

### 4. 生成分享卡片

- 完成专注后，点击"生成分享卡片"
- 下载精美的成就图片，分享到社交平台

---

## 🔧 开发命令

### 基本命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行代码检查
```

### 数据库命令

```bash
npm run db:generate  # 生成 Prisma Client
npm run db:push      # 同步数据库结构
npm run db:studio    # 打开数据库管理界面（http://localhost:5555）
npm run db:migrate   # 创建数据库迁移
npm run db:seed      # 添加测试数据
```

---

## 📁 项目结构

```
focus-planet/
├── app/
│   ├── api/                # API 路由
│   │   ├── users/         # 用户 API
│   │   ├── sessions/      # 专注记录 API
│   │   ├── stats/         # 统计 API
│   │   └── room-status/   # 房间状态 API
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/
│   ├── Universe.tsx        # 3D 宇宙场景
│   ├── Planet.tsx          # 星球组件
│   ├── FocusTimer.tsx      # 番茄钟计时器
│   ├── RoomPanel.tsx       # 房间信息面板
│   ├── UserStats.tsx       # 用户统计
│   ├── SessionHistory.tsx  # 历史记录
│   └── ShareCard.tsx       # 分享卡片生成
├── lib/
│   ├── store.ts            # Zustand 状态管理 + SWR
│   ├── api.ts              # API 调用函数
│   ├── prisma.ts           # Prisma 客户端
│   └── db.ts               # 数据库操作函数
├── prisma/
│   ├── schema.prisma       # 数据库模型定义
│   └── seed.js             # 测试数据
├── setup.sh                # 一键安装脚本
├── fix-prisma.sh           # 修复 Prisma 类型脚本
├── README.md               # 本文档
└── DATABASE.md             # 数据库详细文档
```

---

## ⚙️ 配置

### 修改专注时长

编辑 `lib/store.ts`：

```typescript
focusDuration: 25 * 60 * 1000, // 改为你想要的时长（毫秒）
```

### 切换数据库

编辑 `.env` 文件：

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

更多配置请查看 [DATABASE.md](./DATABASE.md)

---

## 🚀 部署到 Vercel

### 方式 1：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 一键部署
vercel --prod
```

### 方式 2：通过 Vercel 网站

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（可选）：
   ```
   DATABASE_URL=file:./dev.db
   NODE_ENV=production
   ```
4. 点击 **Deploy**

就这么简单！🎉

### 技术说明

本项目使用 **SWR 轮询**实现实时状态同步：

- ✅ 完全兼容 Vercel
- ✅ 无需额外服务器
- ✅ 3 秒刷新延迟（完全够用）
- ✅ 自动缓存和重试
- ✅ 成本：**$0/月**

---

## 💾 数据库功能

### 已集成功能

- ✅ **自动用户创建** - 加入房间时自动创建数据库用户
- ✅ **专注会话追踪** - 自动记录每次专注的开始和结束
- ✅ **实时统计展示** - 显示总时间、完成次数、平均时长
- ✅ **历史记录** - 查看最近的专注记录
- ✅ **数据持久化** - 所有数据保存到 SQLite 数据库
- ✅ **房间状态同步** - 自动清理 5 分钟内不活跃的用户

### UI 组件

- `<UserStats />` - 显示用户统计数据
- `<SessionHistory />` - 显示专注历史记录
- `<RoomPanel />` - 显示房间信息和在线用户

详细说明：[DATABASE.md](./DATABASE.md)

---

## 🎨 功能特色

### 星球可视化

- 基础大小根据累计专注时间增长
- 专注时星球发光、呼吸动画
- 粒子效果环绕
- 个性化颜色标识

### 实时同步

- 多用户状态实时同步（3 秒刷新）
- 自动缓存和去重
- 离线重连自动恢复
- 页面关闭时自动标记离线

### 房间系统

- 独立的房间空间
- 支持多人同时在线
- 统计房间总专注时间
- 自动清理离线用户（5 分钟）

---

## 🐛 故障排查

### 数据库错误

```bash
# 重新生成 Prisma Client
npm run db:generate

# 重置数据库
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Prisma 类型错误

```bash
# 使用修复脚本
./fix-prisma.sh

# 或手动执行
rm -rf node_modules/.prisma node_modules/@prisma/client
npm install @prisma/client
npm run db:generate

# 重启 TypeScript 服务器
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### WebGL Context Lost

如果遇到 `THREE.WebGLRenderer: Context Lost` 错误：

1. 刷新页面
2. 减少同时打开的标签页
3. 更新显卡驱动

### 清理重装

```bash
rm -rf node_modules package-lock.json
npm install
npm run db:push
```

---

## 📝 开发计划

- [x] 用户数据持久化
- [x] 专注记录统计
- [x] 实时状态同步
- [x] 房间成员管理
- [x] 自动离线检测
- [ ] 用户认证系统
- [ ] 背景音乐和音效
- [ ] 自定义专注时长
- [ ] 历史记录可视化图表
- [ ] 成就系统
- [ ] 更多星球样式和主题
- [ ] 移动端适配优化
- [ ] 数据导出功能

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- Three.js 和 React Three Fiber 社区
- Next.js 和 Vercel 团队
- Prisma 团队
- SWR 团队
- 所有开源贡献者

---

⭐ 如果这个项目对你有帮助，欢迎 Star！
