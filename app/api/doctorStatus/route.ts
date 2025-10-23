import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv();

export async function GET() {
  const value = await redis.get('doctorStatus');
  return NextResponse.json({ value: value || {} });
}

export async function POST(req: Request) {
  const body = await req.json();
  await redis.set('doctorStatus', body.value);
  return NextResponse.json({ ok: true });
}
