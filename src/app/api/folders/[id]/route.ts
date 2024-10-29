import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Folder from '@/models/Folder';

// 获取单个文件夹
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const folder = await Folder.findById(params.id);
    if (!folder) {
      return NextResponse.json(
        { error: '文件夹不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json(
      { error: '获取文件夹失败' },
      { status: 500 }
    );
  }
}

// 更新文件夹
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { name } = await request.json();
    
    const folder = await Folder.findById(params.id);
    if (!folder) {
      return NextResponse.json(
        { error: '文件夹不存在' },
        { status: 404 }
      );
    }

    // 更新路径
    const oldName = folder.name;
    const newPath = folder.path.replace(oldName, name);

    const updatedFolder = await Folder.findByIdAndUpdate(
      params.id,
      { name, path: newPath, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json(updatedFolder);
  } catch (error) {
    return NextResponse.json(
      { error: '更新文件夹失败' },
      { status: 500 }
    );
  }
}

// 删除文件夹
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const folder = await Folder.findByIdAndDelete(params.id);
    if (!folder) {
      return NextResponse.json(
        { error: '文件夹不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '删除文件夹失败' },
      { status: 500 }
    );
  }
} 