import { NextRequest, NextResponse } from 'next/server'
import { sessionDb } from '@/lib/db'

// POST /api/sessions - 开始专注
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, roomId } = body

    if (!userId) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 })
    }

    const session = await sessionDb.startSession(userId, roomId)
    
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('开始专注失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// PATCH /api/sessions - 结束专注
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: '缺少会话 ID' }, { status: 400 })
    }

    const session = await sessionDb.endSession(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('结束专注失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// GET /api/sessions?userId=xxx - 获取用户的专注记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const roomId = searchParams.get('roomId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (userId) {
      const sessions = await sessionDb.getUserSessions(userId, limit)
      return NextResponse.json(sessions)
    } else if (roomId) {
      const sessions = await sessionDb.getRoomSessions(roomId, limit)
      return NextResponse.json(sessions)
    } else {
      return NextResponse.json({ error: '缺少 userId 或 roomId' }, { status: 400 })
    }
  } catch (error) {
    console.error('获取专注记录失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
