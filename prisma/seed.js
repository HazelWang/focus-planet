const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据库初始化...')

  // 创建测试用户
  const user1 = await prisma.user.upsert({
    where: { email: 'test1@example.com' },
    update: {},
    create: {
      name: '测试用户1',
      email: 'test1@example.com',
      color: '#4ECDC4',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'test2@example.com' },
    update: {},
    create: {
      name: '测试用户2',
      email: 'test2@example.com',
      color: '#FF6B6B',
    },
  })

  console.log('✅ 测试用户创建成功:', { user1, user2 })

  // 创建测试房间
  const room = await prisma.room.upsert({
    where: { roomCode: 'test-room' },
    update: {},
    create: {
      roomCode: 'test-room',
      name: '测试房间',
    },
  })

  console.log('✅ 测试房间创建成功:', room)

  // 用户加入房间
  await prisma.roomMember.create({
    data: {
      userId: user1.id,
      roomId: room.id,
    },
  })

  console.log('✅ 数据库初始化完成!')
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
