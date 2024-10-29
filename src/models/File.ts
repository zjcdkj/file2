import mongoose, { Schema } from 'mongoose';
import { IFile } from '@/types';

const FileSchema = new Schema<IFile>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    folderId: {
        type: String,
        required: true,
        default: 'root'
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

const File = mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

export default File; 