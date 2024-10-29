'use client';

import React from 'react';
import { IFile } from '@/types';
import FileCard from './FileCard';
import { Loader } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface FileListProps {
  files: IFile[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onFileSelect?: (file: IFile) => void;
  onFileDelete?: (file: IFile) => void;
  onFileMove?: (file: IFile) => void;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  loading, 
  viewMode,
  onFileSelect,
  onFileDelete,
  onFileMove
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <IconInbox size={48} className="mb-2" />
        <p>当前文件夹为空</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {files.map((file) => (
          <FileCard
            key={file._id}
            file={file}
            viewMode={viewMode}
            onSelect={onFileSelect}
            onDelete={onFileDelete}
            onMove={onFileMove}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((file) => (
        <FileCard
          key={file._id}
          file={file}
          viewMode="list"
          onSelect={onFileSelect}
          onDelete={onFileDelete}
          onMove={onFileMove}
        />
      ))}
    </div>
  );
};

export default FileList; 