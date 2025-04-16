import mongoose, { Document, Schema } from 'mongoose';

export interface ILink extends Document {
  title: string;
  url: string;
  icon?: string;
  order: number;
  isActive: boolean;
  clicks: number;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Link = mongoose.model<ILink>('Link', linkSchema); 