import { IFile } from '@/types';
import File from '@/models/File';
import minioClient from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'files';
  }

  // 初始化 MinIO bucket
  private async initBucket() {
    const exists = await minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await minioClient.makeBucket(this.bucketName, 'us-east-1');
    }
  }

  // 获取文件列表
  async getFiles(folderId?: string) {
    const query = folderId ? { folderId } : {};
    return await File.find(query).sort({ createdAt: -1 });
  }

  // 上传文件
  async uploadFile(file: Buffer, originalName: string, mimeType: string, size: number, folderId?: string) {
    await this.initBucket();
    
    const fileName = `${uuidv4()}-${originalName}`;
    
    // 上传到 MinIO
    await minioClient.putObject(
      this.bucketName,
      fileName,
      file,
      size,
      { 'Content-Type': mimeType }
    );

    // 保存到数据库
    return await File.create({
      name: fileName,
      originalName,
      mimeType,
      size,
      path: `/${this.bucketName}/${fileName}`,
      folderId: folderId || 'root'
    });
  }

  // 移动文件
  async moveFile(fileId: string, newFolderId: string) {
    return await File.findByIdAndUpdate(
      fileId,
      { folderId: newFolderId, updatedAt: new Date() },
      { new: true }
    );
  }

  // 删除文件
  async deleteFile(fileId: string) {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // 从 MinIO 删除
    await minioClient.removeObject(this.bucketName, file.name);
    
    // 从数据库删除
    await file.deleteOne();
    return true;
  }

  // 获取文件下载链接
  async getFileUrl(fileId: string) {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    return await minioClient.presignedGetObject(
      this.bucketName,
      file.name,
      60 * 60 // 1小时有效期
    );
  }

  // 批量删除文件
  async deleteFiles(fileIds: string[]) {
    const files = await File.find({ _id: { $in: fileIds } });
    
    // 从 MinIO 批量删除
    await Promise.all(
      files.map(file => 
        minioClient.removeObject(this.bucketName, file.name)
      )
    );

    // 从数据库批量删除
    await File.deleteMany({ _id: { $in: fileIds } });
    return true;
  }
}

export const fileService = new FileService();