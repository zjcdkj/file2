'use client';

import React, { useState } from 'react';
import { Dropzone } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto } from '@tabler/icons-react';
import { Progress, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface FileUploaderProps {
  currentFolder: string | null;
}

interface UploadProgress {
  [key: string]: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ currentFolder }) => {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

  const handleDrop = async (files: File[]) => {
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) {
          formData.append('folderId', currentFolder);
        }

        await axios.post('/api/files', formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
            }
          }
        });

        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 1000);

      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    router.refresh();
  };

  return (
    <div className="relative">
      <Dropzone
        onDrop={handleDrop}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={3 * 1024 ** 2}
        accept={['image/*', 'application/pdf']}
        className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
      >
        <div className="flex flex-col items-center justify-center min-h-[100px] pointer-events-none p-6">
          <div className="mb-4">
            <Dropzone.Accept>
              <IconUpload size={50} className="text-blue-500" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={50} className="text-red-500" />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={50} className="text-gray-400" />
            </Dropzone.Idle>
          </div>

          <div className="text-center">
            <Text size="xl" className="mb-2">
              拖拽文件到此处或点击上传
            </Text>
            <Text size="sm" color="dimmed">
              支持单个文件最大 3MB，支持图片和 PDF 格式
            </Text>
          </div>
        </div>
      </Dropzone>

      {/* 上传进度显示 */}
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div
          key={fileName}
          className="absolute bottom-0 left-0 right-0 bg-white p-2 shadow-lg rounded-b-lg"
        >
          <div className="flex items-center justify-between mb-1">
            <Text size="sm" className="truncate max-w-[200px]">{fileName}</Text>
            <Text size="sm">{progress}%</Text>
          </div>
          <Progress
            value={progress}
            size="sm"
            radius="xl"
            color={progress === 100 ? 'green' : 'blue'}
          />
        </div>
      ))}
    </div>
  );
};

export default FileUploader; 