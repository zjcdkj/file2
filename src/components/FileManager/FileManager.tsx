'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import FileManagerLayout from './FileManagerLayout';
import FolderTree from './FolderTree';
import FileList from './FileList';
import FileUploader from './FileUploader';
import { IFolder, IFile } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

const FileManager: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: folders = [], isLoading: foldersLoading } = useQuery<IFolder[]>(
    ['folders'],
    async () => {
      const response = await axios.get('/api/folders');
      return response.data;
    }
  );

  const { data: files = [], isLoading: filesLoading } = useQuery<IFile[]>(
    ['files', currentFolder],
    async () => {
      const response = await axios.get(`/api/files?folderId=${currentFolder || ''}`);
      return response.data;
    }
  );

  const currentFolderData = folders.find(f => f._id === currentFolder) || null;

  const queryClient = useQueryClient();

  const handleCreateFolder = async () => {
    try {
      const folderName = prompt('请输入文件夹名称');
      if (!folderName) return;

      await axios.post('/api/folders', {
        name: folderName,
        parentId: currentFolder?._id || null
      });

      // 刷新文件夹列表
      queryClient.invalidateQueries(['folders']);
      
      // 显示成功提示
      notifications.show({
        title: '创建成功',
        message: `文件夹 "${folderName}" 已创建`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Create folder error:', error);
      notifications.show({
        title: '创建失败',
        message: '创建文件夹时发生错误',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleRename = async (file: IFile) => {
    try {
      const newName = prompt('请输入新的文件名', file.originalName);
      if (!newName || newName === file.originalName) return;

      await axios.put(`/api/files/${file._id}`, { name: newName });
      queryClient.invalidateQueries(['files']);
      
      notifications.show({
        title: '重命名成功',
        message: `文件已重命名为 "${newName}"`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Rename error:', error);
      notifications.show({
        title: '重命名失败',
        message: '重命名文件时发生错误',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleDelete = async (file: IFile) => {
    if (!confirm('确定要删除此文件吗？此操作不可恢复。')) return;

    try {
      await axios.delete(`/api/files/${file._id}`);
      queryClient.invalidateQueries(['files']);
      
      notifications.show({
        title: '删除成功',
        message: `文件 "${file.originalName}" 已删除`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Delete error:', error);
      notifications.show({
        title: '删除失败',
        message: '删除文件时发生错误',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleCopy = async (file: IFile) => {
    try {
      const response = await axios.post(`/api/files/${file._id}/copy`, {
        folderId: currentFolder?._id || 'root'
      });
      
      queryClient.invalidateQueries(['files']);
      notifications.show({
        title: '复制成功',
        message: `文件 "${file.originalName}" 已复制`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: '复制失败',
        message: '复制文件时发生错误',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleMove = async (file: IFile) => {
    try {
      const targetFolderId = prompt('请输入目标文件夹ID');
      if (!targetFolderId) return;

      await axios.put(`/api/files/${file._id}`, {
        folderId: targetFolderId
      });
      
      queryClient.invalidateQueries(['files']);
      notifications.show({
        title: '移动成功',
        message: `文件 "${file.originalName}" 已移动`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: '移动失败',
        message: '移动文件时发生错误',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  return (
    <FileManagerLayout
      currentFolder={currentFolderData}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      folderTree={
        <FolderTree
          folders={folders}
          loading={foldersLoading}
          onSelect={setCurrentFolder}
          selectedFolder={currentFolder}
        />
      }
      fileList={
        <FileList
          files={files}
          loading={filesLoading}
          viewMode={viewMode}
          onFileRename={handleRename}
          onFileDelete={handleDelete}
          onFileMove={handleMove}
          onFileCopy={handleCopy}
        />
      }
      uploader={
        <FileUploader currentFolder={currentFolder} />
      }
    />
  );
};

export default FileManager; 