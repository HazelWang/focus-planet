import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'

// GET /api/users/:id - 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 })
    }

    const user = await userDb.getUserById(id)
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('获取用户失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST /api/users - 创建或更新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color, email } = body

    if (!name || !color) {
      return NextResponse.json({ error: '缺少必需字段' }, { status: 400 })
    }

    const user = await userDb.createOrGetUser({ name, color, email })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
