import { NextRequest, NextResponse } from 'next/server'
import { roomDb } from '@/lib/db'

// GET /api/rooms?roomCode=xxx - 获取房间信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('roomCode')

    if (!roomCode) {
      return NextResponse.json({ error: '缺少房间代码' }, { status: 400 })
    }

    const room = await roomDb.getRoom(roomCode)
    
    if (!room) {
      return NextResponse.json({ error: '房间不存在' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('获取房间失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST /api/rooms - 创建房间
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomCode, name } = body

    if (!roomCode) {
      return NextResponse.json({ error: '缺少房间代码' }, { status: 400 })
    }

    const room = await roomDb.createRoom(roomCode, name)
    
    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('创建房间失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
