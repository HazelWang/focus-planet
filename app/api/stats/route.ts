import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'

// GET /api/stats?userId=xxx - 获取用户统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 })
    }

    const stats = await userDb.getUserStats(userId)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取统计失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
