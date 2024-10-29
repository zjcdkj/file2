import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Folder from '@/models/Folder';

// 获取所有文件夹
export async function GET() {
  try {
    await connectDB();
    const folders = await Folder.find().sort({ createdAt: -1 });
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json(
      { error: '获取文件夹失败' },
      { status: 500 }
    );
  }
}

// 创建文件夹
export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, parentId } = await request.json();
    
    // 构建文件夹路径
    let path = name;
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (parentFolder) {
        path = `${parentFolder.path}/${name}`;
      }
    }

    const folder = await Folder.create({
      name,
      parentId,
      path
    });

    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json(
      { error: '创建文件夹失败' },
      { status: 500 }
    );
  }
} 