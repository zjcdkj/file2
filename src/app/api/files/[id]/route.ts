import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import File from '@/models/File';
import minioClient from '@/lib/minio';

// 获取单个文件
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const file = await File.findById(params.id);
    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      { error: '获取文件失败' },
      { status: 500 }
    );
  }
}

// 移动文件
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { folderId } = await request.json();
    
    const file = await File.findByIdAndUpdate(
      params.id,
      { folderId, updatedAt: new Date() },
      { new: true }
    );

    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      { error: '移动文件失败' },
      { status: 500 }
    );
  }
}

// 删除文件
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const file = await File.findById(params.id);
    
    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // 从 MinIO 删除文件
    const bucketName = process.env.MINIO_BUCKET_NAME || 'files';
    await minioClient.removeObject(bucketName, file.name);

    // 从数据库删除记录
    await file.deleteOne();

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '删除文件失败' },
      { status: 500 }
    );
  }
} 