import mongoose, { Schema } from 'mongoose';
import { IFolder } from '@/types';

const FolderSchema = new Schema<IFolder>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Folder = mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);

export default Folder; 