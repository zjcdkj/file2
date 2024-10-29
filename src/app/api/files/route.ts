import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import File from '@/models/File';
import minioClient from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';

// 添加文件类型定义
interface UploadedFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

// 获取文件列表
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    const query = folderId ? { folderId } : {};
    const files = await File.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      { error: '获取文件列表失败' },
      { status: 500 }
    );
  }
}

// 上传文件
export async function POST(request: Request) {
  try {
    await connectDB();
    const formData = await request.formData();
    const file = formData.get('file') as unknown as UploadedFile;
    const folderId = formData.get('folderId') as string;

    if (!file) {
      return NextResponse.json(
        { error: '请选择文件' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}-${file.name}`;
    const bucketName = process.env.MINIO_BUCKET_NAME || 'files';

    // 确保 bucket 存在
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // 上传到 MinIO
    await minioClient.putObject(
      bucketName,
      fileName,
      buffer,
      buffer.length,
      {
        'Content-Type': file.type,
      }
    );

    // 保存文件信息到数据库
    const fileDoc = await File.create({
      name: fileName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `/${bucketName}/${fileName}`,
      folderId
    });

    return NextResponse.json(fileDoc);
  } catch (error) {
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
} 