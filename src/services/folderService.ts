import { IFolder } from '@/types';
import Folder from '@/models/Folder';
import { fileService } from './fileService';

export class FolderService {
  // 获取文件夹列表
  async getFolders() {
    return await Folder.find().sort({ createdAt: -1 });
  }

  // 创建文件夹
  async createFolder(name: string, parentId?: string) {
    let path = name;
    
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (parentFolder) {
        path = `${parentFolder.path}/${name}`;
      }
    }

    return await Folder.create({
      name,
      parentId: parentId || null,
      path
    });
  }

  // 重命名文件夹
  async renameFolder(folderId: string, newName: string) {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // 更新当前文件夹路径
    const oldName = folder.name;
    const newPath = folder.path.replace(oldName, newName);

    // 更新所有子文件夹的路径
    const childFolders = await Folder.find({
      path: { $regex: `^${folder.path}/` }
    });

    const updatePromises = childFolders.map(childFolder => {
      const newChildPath = childFolder.path.replace(folder.path, newPath);
      return Folder.findByIdAndUpdate(
        childFolder._id,
        { path: newChildPath }
      );
    });

    await Promise.all([
      Folder.findByIdAndUpdate(
        folderId,
        { name: newName, path: newPath }
      ),
      ...updatePromises
    ]);

    return await Folder.findById(folderId);
  }

  // 删除文件夹及其内容
  async deleteFolder(folderId: string) {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // 获取所有子文件夹
    const childFolders = await Folder.find({
      path: { $regex: `^${folder.path}/` }
    });
    const allFolderIds = [folderId, ...childFolders.map(f => f._id)];

    // 删除所有相关文件
    const files = await fileService.getFiles(folderId);
    if (files.length > 0) {
      await fileService.deleteFiles(files.map(f => f._id));
    }

    // 删除文件夹
    await Folder.deleteMany({ _id: { $in: allFolderIds } });
    return true;
  }

  // 移动文件夹
  async moveFolder(folderId: string, newParentId: string | null) {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    let newPath = folder.name;
    if (newParentId) {
      const parentFolder = await Folder.findById(newParentId);
      if (parentFolder) {
        newPath = `${parentFolder.path}/${folder.name}`;
      }
    }

    // 更新所有子文件夹的路径
    const childFolders = await Folder.find({
      path: { $regex: `^${folder.path}/` }
    });

    const updatePromises = childFolders.map(childFolder => {
      const newChildPath = childFolder.path.replace(folder.path, newPath);
      return Folder.findByIdAndUpdate(
        childFolder._id,
        { path: newChildPath }
      );
    });

    await Promise.all([
      Folder.findByIdAndUpdate(
        folderId,
        { 
          parentId: newParentId,
          path: newPath,
          updatedAt: new Date()
        }
      ),
      ...updatePromises
    ]);

    return await Folder.findById(folderId);
  }
}

export const folderService = new FolderService();