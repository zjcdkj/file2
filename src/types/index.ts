export interface IFile {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder {
  _id: string;
  name: string;
  path: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
} 