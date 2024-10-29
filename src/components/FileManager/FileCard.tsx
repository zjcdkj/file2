'use client';

import React from 'react';
import { IFile } from '@/types';
import { 
  IconFile,
  IconFileText,
  IconFileZip,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconPhoto,
  IconVideo,
  IconDotsVertical,
  IconDownload,
  IconCopy,
  IconArrowRight,
  IconEdit,
  IconTrash,
  IconEye,
  IconPencil,
  IconTrashX,
  IconDots,
  IconShare,
  IconExternalLink,
  IconClipboard,
  IconFolderPlus
} from '@tabler/icons-react';
import { Menu, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

interface FileCardProps {
  file: IFile;
  viewMode: 'grid' | 'list';
  onSelect?: (file: IFile) => void;
  onDelete?: (file: IFile) => void;
  onRename?: (file: IFile) => void;
  onMove?: (file: IFile) => void;
  onCopy?: (file: IFile) => void;
}

const FileCard: React.FC<FileCardProps> = ({ 
  file, 
  viewMode, 
  onSelect,
  onDelete,
  onRename,
  onMove,
  onCopy
}) => {
  const getFileIcon = () => {
    const type = file.mimeType.split('/')[0];
    const extension = file.originalName.split('.').pop()?.toLowerCase();

    switch (type) {
      case 'image':
        return <IconPhoto size={24} className="text-blue-500" />;
      case 'video':
        return <IconVideo size={24} className="text-purple-500" />;
      default:
        switch (extension) {
          case 'pdf':
            return <IconFileTypePdf size={24} className="text-red-500" />;
          case 'doc':
          case 'docx':
            return <IconFileText size={24} className="text-blue-600" />;
          case 'xls':
          case 'xlsx':
            return <IconFileSpreadsheet size={24} className="text-green-500" />;
          case 'zip':
          case 'rar':
            return <IconFileZip size={24} className="text-yellow-500" />;
          default:
            return <IconFile size={24} className="text-gray-500" />;
        }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 处理下载
  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/files/${file._id}/download`);
      const downloadUrl = response.data.url;
      
      // 创建一个临时的 a 标签来触发下载
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notifications.show({
        title: '下载开始',
        message: `文件 "${file.originalName}" 开始下载`,
        color: 'blue'
      });
    } catch (error) {
      notifications.show({
        title: '下载失败',
        message: '文件下载失败，请重试',
        color: 'red'
      });
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="relative group">
        <div 
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-all duration-200 cursor-pointer"
          onClick={() => onSelect?.(file)}
        >
          <div className="flex flex-col items-center">
            <div className="mb-3 p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              {getFileIcon()}
            </div>
            <div className="w-full text-center">
              <div className="text-sm font-medium text-gray-900 truncate mb-1">
                {file.originalName}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </div>
            </div>
          </div>
        </div>
        <Menu position="bottom-end" shadow="md">
          <Menu.Target>
            <ActionIcon 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="subtle"
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => onRename?.(file)}>
              <IconEdit size={16} style={{ marginRight: '8px' }} />
              重命名
            </Menu.Item>
            <Menu.Item onClick={() => onDelete?.(file)} color="red">
              <IconTrash size={16} style={{ marginRight: '8px' }} />
              删除
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    );
  }

  return (
    <div 
      className="group flex items-center h-[48px] hover:bg-gray-50 cursor-pointer border-b border-gray-100"
      onClick={() => onSelect?.(file)}
    >
      <div className="flex items-center w-[400px] pl-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 truncate">
              {file.originalName}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center flex-1 justify-end pr-6">
        <div className="w-[150px] border-l border-gray-200 pl-4 text-sm text-gray-500">
          张凯
        </div>
        <div className="w-[200px] border-l border-gray-200 pl-4 text-sm text-gray-500">
          {formatDate(file.createdAt)}
        </div>
        <div className="w-[150px] border-l border-gray-200 pl-4 flex items-center justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(file);
              }}
              className="text-gray-500 hover:text-blue-500 text-sm flex items-center gap-1"
            >
              <IconExternalLink size={16} />
              预览
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="text-gray-500 hover:text-blue-500 text-sm flex items-center gap-1"
            >
              <IconDownload size={16} />
              下载
            </button>
          </div>
        </div>
        <div className="w-[60px] border-l border-gray-200 pl-4">
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                variant="subtle"
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => onRename?.(file)} className="menu-item">
                <IconEdit size={16} className="menu-item-icon" />
                重命名
              </Menu.Item>
              <Menu.Item onClick={() => onDelete?.(file)} color="red" className="menu-item">
                <IconTrash size={16} className="menu-item-icon" />
                删除
              </Menu.Item>
              <Menu.Item onClick={() => onCopy?.(file)} className="menu-item">
                <IconCopy size={16} className="menu-item-icon" />
                复制
              </Menu.Item>
              <Menu.Item onClick={() => onMove?.(file)} className="menu-item">
                <IconFolderPlus size={16} className="menu-item-icon" />
                移动到
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default FileCard; 