# 专注星球 🪐 Focus Planet

将番茄工作法与虚拟空间结合，用户化身一个"星球"，专注时星球生长，分心时停滞。能看到其他在线用户的"星球"状态，形成无声的集体监督。

## ✨ 特性

- 🎮 **游戏化专注体验** - 将枯燥的时间管理游戏化、可视化
- 🌌 **3D 宇宙视图** - 使用 Three.js 构建的精美 3D 星球场景
- 👥 **多人实时协作** - Socket.io 实现的实时状态同步
- ⏱️ **番茄工作法** - 25 分钟专注周期，科学的时间管理
- 🔗 **一键分享** - 生成房间链接，邀请朋友一起专注
- 📊 **成就分享** - 生成精美的专注星系图，适合分享到社交平台

## 🚀 技术栈

- **前端框架**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **3D 渲染**: Three.js + @react-three/fiber + @react-three/drei
- **实时通信**: Socket.io
- **数据库**: Prisma ORM + SQLite
- **部署**: Vercel（推荐）

## 📦 安装

### 方法 1: 一键安装（推荐）

\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

### 方法 2: 手动安装

\`\`\`bash
# 1. 创建 .env 文件
echo 'DATABASE_URL="file:./dev.db"' > .env

# 2. 安装依赖
npm install

# 3. 初始化数据库
npm run db:generate
npm run db:push

# 4. 添加测试数据（可选）
npm run db:seed
\`\`\`

## 🎯 使用

### 开发模式

\`\`\`bash
# 启动开发服务器
npm run dev

# （可选）在另一个终端打开数据库管理界面
npm run db:studio
\`\`\`

打开 [http://localhost:3000](http://localhost:3000) 查看应用。
打开 [http://localhost:5555](http://localhost:5555) 查看数据库（如果运行了 db:studio）。

### 生产构建

\`\`\`bash
npm run build
npm start
\`\`\`

### 数据库命令

\`\`\`bash
npm run db:generate  # 生成 Prisma Client
npm run db:push      # 同步数据库结构
npm run db:studio    # 打开数据库管理界面
npm run db:migrate   # 创建数据库迁移
npm run db:seed      # 运行种子数据
\`\`\`

## 💡 使用说明

1. **创建/加入房间**
   - 输入你的名字
   - 留空房间 ID 创建新房间，或输入已有房间 ID 加入

2. **开始专注**
   - 点击"开始专注"按钮
   - 你的星球会发光并随着时间成长
   - 可以看到其他在线用户的星球状态

3. **邀请朋友**
   - 点击"分享"按钮复制房间链接
   - 发送给朋友，一起专注

4. **生成分享卡片**
   - 完成专注后，点击"生成分享卡片"
   - 下载精美的成就图片，分享到社交平台

## 🎨 功能特色

### 星球可视化
- 基础大小根据累计专注时间增长
- 专注时星球发光、呼吸动画
- 粒子效果环绕
- 个性化颜色标识

### 实时同步
- 多用户状态实时同步
- 无延迟的状态更新
- 稳定的 WebSocket 连接

### 房间系统
- 独立的房间空间
- 支持多人同时在线
- 统计房间总专注时间

## 📁 项目结构

\`\`\`
focus-planet/
├── app/
│   ├── api/                # API 路由
│   │   ├── users/         # 用户 API
│   │   ├── sessions/      # 专注记录 API
│   │   └── stats/         # 统计 API
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/
│   ├── Universe.tsx        # 3D 宇宙场景
│   ├── Planet.tsx          # 星球组件
│   ├── FocusTimer.tsx      # 番茄钟计时器
│   ├── RoomPanel.tsx       # 房间信息面板
│   └── ShareCard.tsx       # 分享卡片生成
├── lib/
│   ├── store.ts            # Zustand 状态管理
│   ├── prisma.ts           # Prisma 客户端
│   └── db.ts               # 数据库操作函数
├── prisma/
│   ├── schema.prisma       # 数据库模型定义
│   └── seed.js             # 测试数据
├── server.js               # Socket.io 服务器
├── setup.sh                # 一键安装脚本
└── package.json
\`\`\`

## 🔧 配置

### 修改专注时长

编辑 `lib/store.ts`：

\`\`\`typescript
focusDuration: 25 * 60 * 1000, // 改为你想要的时长
\`\`\`

### 切换数据库

编辑 `.env` 文件：

\`\`\`env
# SQLite（默认）
DATABASE_URL="file:./dev.db"

# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/focusplanet"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/focusplanet"
\`\`\`

更多配置请查看 [DATABASE_README.md](./DATABASE_README.md)

## 🚀 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 注意：Vercel 默认不支持 Socket.io，需要：
   - 使用 Vercel Edge Functions
   - 或部署到支持 WebSocket 的平台（如 Railway、Render）

### 推荐部署方案

对于 Socket.io 支持，建议：
- **前端**: Vercel
- **WebSocket 服务**: Railway / Render / Fly.io

## 💾 数据库功能

### 已集成功能

- ✅ **自动用户创建** - 加入房间时自动创建数据库用户
- ✅ **专注会话追踪** - 自动记录每次专注的开始和结束
- ✅ **实时统计展示** - 显示总时间、完成次数、平均时长
- ✅ **历史记录** - 查看最近的专注记录
- ✅ **数据持久化** - 所有数据保存到 SQLite 数据库

### UI 组件

- `<UserStats />` - 显示用户统计数据
- `<SessionHistory />` - 显示专注历史记录

### 文档

- [DATABASE.md](./DATABASE.md) - 数据库完整指南

## 📝 待优化功能

- [x] 用户数据持久化
- [x] 专注记录统计
- [ ] 用户认证系统
- [ ] 添加背景音乐和音效
- [ ] 支持自定义专注时长
- [ ] 历史记录可视化图表
- [ ] 成就系统
- [ ] 更多星球样式和主题
- [ ] 移动端适配优化
- [ ] 数据导出功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- Three.js 和 React Three Fiber 社区
- Socket.io 团队
- 所有开源贡献者

---

⭐ 如果这个项目对你有帮助，欢迎 Star！
