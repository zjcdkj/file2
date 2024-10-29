'use client';

import React, { useRef } from 'react';
import { ActionIcon, Text, Menu } from '@mantine/core';
import { IconList, IconGridDots, IconSearch, IconPlus, IconChevronDown, IconUpload, IconFolderPlus, IconDownload, IconCopy, IconArrowRight, IconEdit, IconTrash, IconDots, IconEye, IconFilter, IconSortAscending, IconSettings, IconFolder, IconFile, IconFileUpload } from '@tabler/icons-react';
import { IFolder } from '@/types';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

interface FileManagerLayoutProps {
  currentFolder: IFolder | null;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  folderTree: React.ReactNode;
  fileList: React.ReactNode;
  uploader: React.ReactNode;
}

const FileManagerLayout: React.FC<FileManagerLayoutProps> = ({
  currentFolder,
  viewMode,
  onViewModeChange,
  folderTree,
  fileList,
  uploader
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        if (currentFolder?._id) {
          formData.append('folderId', currentFolder._id);
        }

        await axios.post('/api/files', formData);
      }
      
      // 刷新文件列表
      queryClient.invalidateQueries(['files']);
      
      // 清除input的值，允许重复上传相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // 处理新建文件夹
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
    } catch (error) {
      console.error('Create folder error:', error);
    }
  };

  // 生成路径导航
  const getPathNavigation = () => {
    const basePath = [{ title: '我的空间', href: '#' }];
    
    if (!currentFolder) {
      return basePath;
    }

    const paths = currentFolder.path.split('/').filter(Boolean);
    const pathItems = paths.map((path, index) => ({
      title: path,
      href: '#' + paths.slice(0, index + 1).join('/')
    }));

    return [...basePath, ...pathItems];
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 左侧导航 */}
      <div className="w-[240px] border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="h-[60px] flex items-center px-4 border-b border-gray-100">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <Text size="lg" weight={500} className="ml-2 text-base">飞书文档</Text>
        </div>
        {/* 文件夹树 */}
        <div className="flex-1 overflow-y-auto px-4">
          {folderTree}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col pt-[30px] px-[30px]">
        {/* 顶部工具栏 */}
        <div className="h-[60px] flex items-center justify-between mb-6">
          {/* 搜索框和按钮容器 */}
          <div className="flex items-center justify-between w-full">
            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="在AIGC内搜索"
                className="w-[280px] h-[32px] pl-8 pr-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <IconSearch
                size={16}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* 按钮组 */}
            <div className="flex items-center gap-2">
              {/* 隐藏的文件输入框 */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              
              {/* 上传按钮 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-[32px] min-w-[80px] px-4 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <IconFileUpload size={16} />
                上传
              </button>

              {/* 新建按钮 */}
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <button className="h-[32px] min-w-[80px] px-4 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
                    <IconPlus size={16} />
                    新建
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item icon={<IconFolderPlus size={16} />}>新建文件夹</Menu.Item>
                  <Menu.Item icon={<IconFile size={16} />}>新建文档</Menu.Item>
                  <Menu.Item icon={<IconFolder size={16} />}>新建表格</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </div>
        </div>

        {/* 路径导航 */}
        <div className="mb-6">
          <div className="flex items-center text-base">
            {getPathNavigation().map((item, index, arr) => (
              <React.Fragment key={item.href}>
                <a 
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600"
                >
                  {item.title}
                </a>
                {index < arr.length - 1 && (
                  <span className="mx-2 text-gray-400">›</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 列表头部 */}
        <div className="h-[48px] flex items-center border-y border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between w-full text-base text-gray-500">
            <div className="flex items-center gap-2 w-[400px] pl-6">
              <IconFile size={16} className="text-gray-400" />
              <span>名称</span>
              <IconSortAscending size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center flex-1 justify-end pr-6">
              <div className="w-[150px] border-l border-gray-200 pl-4">
                <div className="flex items-center gap-2">
                  <IconFilter size={16} className="text-gray-400" />
                  <span>所有者</span>
                </div>
              </div>
              <div className="w-[200px] border-l border-gray-200 pl-4">
                <div className="flex items-center gap-2">
                  <IconSortAscending size={16} className="text-gray-400" />
                  <span>修改时间</span>
                </div>
              </div>
              <div className="w-[150px] border-l border-gray-200 pl-4">
                <div className="flex items-center gap-2">
                  <IconSettings size={16} className="text-gray-400" />
                  <span>操作</span>
                </div>
              </div>
              <div className="w-[60px] border-l border-gray-200 pl-4">
                <div className="flex items-center border rounded-lg p-0.5">
                  <ActionIcon
                    variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                    onClick={() => onViewModeChange('grid')}
                    className="hover:bg-gray-100"
                    radius="md"
                    size="sm"
                  >
                    <IconGridDots size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant={viewMode === 'list' ? 'filled' : 'subtle'}
                    onClick={() => onViewModeChange('list')}
                    className="hover:bg-gray-100"
                    radius="md"
                    size="sm"
                  >
                    <IconList size={16} />
                  </ActionIcon>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 文件列表内容 */}
        <div className="flex-1 overflow-y-auto">
          <div>
            {fileList}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManagerLayout;