'use client';

import React, { useState } from 'react';
import { Modal, TextInput, Button as MantineButton } from '@mantine/core';
import { IconFolderPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import Button from '../UI/Button';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

interface FolderActionsProps {
  currentFolder: string | null;
}

const FolderActions: React.FC<FolderActionsProps> = ({ currentFolder }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const queryClient = useQueryClient();

  const handleCreateFolder = async () => {
    try {
      await axios.post('/api/folders', {
        name: folderName,
        parentId: currentFolder
      });
      queryClient.invalidateQueries(['folders']);
      setIsCreateOpen(false);
      setFolderName('');
    } catch (error) {
      console.error('Create folder error:', error);
    }
  };

  const handleRenameFolder = async () => {
    try {
      await axios.put(`/api/folders/${currentFolder}`, {
        name: folderName
      });
      queryClient.invalidateQueries(['folders']);
      setIsRenameOpen(false);
      setFolderName('');
    } catch (error) {
      console.error('Rename folder error:', error);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await axios.delete(`/api/folders/${currentFolder}`);
      queryClient.invalidateQueries(['folders']);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Delete folder error:', error);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1"
        >
          <IconFolderPlus size={16} />
          新建文件夹
        </Button>
        {currentFolder && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRenameOpen(true)}
              className="flex items-center gap-1"
            >
              <IconEdit size={16} />
              重命名
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1"
            >
              <IconTrash size={16} />
              删除
            </Button>
          </>
        )}
      </div>

      {/* 创建文件夹对话框 */}
      <Modal
        opened={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="新建文件夹"
      >
        <div className="space-y-4">
          <TextInput
            label="文件夹名称"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="请输入文件夹名称"
          />
          <div className="flex justify-end gap-2">
            <MantineButton variant="default" onClick={() => setIsCreateOpen(false)}>
              取消
            </MantineButton>
            <MantineButton onClick={handleCreateFolder}>
              创建
            </MantineButton>
          </div>
        </div>
      </Modal>

      {/* 重命名对话框 */}
      <Modal
        opened={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="重命名文件夹"
      >
        <div className="space-y-4">
          <TextInput
            label="新名称"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="请输入新的文件夹名称"
          />
          <div className="flex justify-end gap-2">
            <MantineButton variant="default" onClick={() => setIsRenameOpen(false)}>
              取消
            </MantineButton>
            <MantineButton onClick={handleRenameFolder}>
              确定
            </MantineButton>
          </div>
        </div>
      </Modal>

      {/* 删除确认对话框 */}
      <Modal
        opened={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="删除文件夹"
      >
        <div className="space-y-4">
          <p>确定要删除这个文件夹吗？此操作不可恢复。</p>
          <div className="flex justify-end gap-2">
            <MantineButton variant="default" onClick={() => setIsDeleteOpen(false)}>
              取消
            </MantineButton>
            <MantineButton color="red" onClick={handleDeleteFolder}>
              删除
            </MantineButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FolderActions; 