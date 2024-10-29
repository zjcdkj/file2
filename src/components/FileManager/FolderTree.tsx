'use client';

import React from 'react';
import { IFolder } from '@/types';
import { IconFolder, IconFolderOpen, IconChevronRight, IconChevronDown } from '@tabler/icons-react';

interface FolderTreeProps {
  folders: IFolder[];
  loading: boolean;
  onSelect: (folderId: string | null) => void;
  selectedFolder: string | null;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  loading,
  onSelect,
  selectedFolder
}) => {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFolderChildren = (parentId: string | null) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  const renderFolder = (folder: IFolder, level: number = 0) => {
    const children = getFolderChildren(folder._id);
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = selectedFolder === folder._id;

    return (
      <div key={folder._id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-50' : ''
          }`}
        >
          {children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder._id);
              }}
              className="p-1 hover:bg-gray-200 rounded-md mr-1"
            >
              {isExpanded ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </button>
          )}
          <div
            className="flex items-center flex-1 gap-2"
            onClick={() => onSelect(folder._id)}
          >
            {isSelected ? (
              <IconFolderOpen size={20} className="text-blue-500" />
            ) : (
              <IconFolder size={20} className="text-gray-400" />
            )}
            <span className="text-sm truncate">{folder.name}</span>
          </div>
        </div>
        {isExpanded && children.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div
        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
          !selectedFolder ? 'bg-blue-50' : ''
        }`}
        onClick={() => onSelect(null)}
      >
        {!selectedFolder ? (
          <IconFolderOpen size={20} className="text-blue-500 mr-2" />
        ) : (
          <IconFolder size={20} className="text-gray-400 mr-2" />
        )}
        <span className="text-sm font-medium">我的文件</span>
      </div>
      {getFolderChildren(null).map(folder => renderFolder(folder))}
    </div>
  );
};

export default FolderTree; 