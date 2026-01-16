#!/bin/bash

echo "🚀 专注星球 - 一键安装"
echo ""

# 创建 .env 文件
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
EOF
    echo "✅ .env 文件已创建"
else
    echo "✅ .env 文件已存在"
fi

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install || { echo "❌ 安装失败"; exit 1; }

# 生成 Prisma Client
echo ""
echo "🔧 生成 Prisma Client..."
npm run db:generate || { echo "❌ 生成失败"; exit 1; }

# 初始化数据库
echo ""
echo "🗄️ 初始化数据库..."
npm run db:push || { echo "❌ 初始化失败"; exit 1; }

# 添加测试数据
# echo ""
# echo "🌱 添加测试数据..."
# npm run db:seed || echo "⚠️ 测试数据添加失败（可忽略）"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 安装完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "启动项目："
echo "  npm run dev"
echo ""
echo "查看数据库："
echo "  npm run db:studio"
echo ""
