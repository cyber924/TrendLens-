
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Delete API placeholder. Use Firestore/Storage SDK directly on client for now." }, { status: 501 });
}
