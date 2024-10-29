import { NextResponse } from 'next/server';
import { fileService } from '@/services/fileService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const files = await fileService.getFiles(folderId || undefined);
    return NextResponse.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: '获取文件列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;

    if (!file) {
      return NextResponse.json(
        { error: '请选择文件' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedFile = await fileService.uploadFile(
      buffer,
      file.name,
      file.type,
      file.size,
      folderId
    );

    return NextResponse.json(uploadedFile);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
} 