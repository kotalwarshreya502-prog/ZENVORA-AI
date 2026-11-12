/**
 * ZENVORA AI — Generation History Model
 * Tracks every AI generation with full isolation between users, modules, and requests.
 */
import mongoose from 'mongoose';

const generationHistorySchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: [
        'content-studio',
        'blog-generator',
        'caption-generator',
        'hashtag-generator',
        'image-generation',
        'seo-analysis',
        'research',
        'competitor-analysis',
        'social-generator',
      ],
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    provider: {
      type: String,
      default: 'zenvora-engine-v1',
    },
    model: {
      type: String,
      default: 'zenvora-engine-v1',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial'],
      default: 'success',
    },
    saved: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure userId scoping — a user can only see their own history
generationHistorySchema.index({ userId: 1, module: 1, createdAt: -1 });

const GenerationHistory =
  mongoose.models.GenerationHistory ||
  mongoose.model('GenerationHistory', generationHistorySchema);

export default GenerationHistory;
