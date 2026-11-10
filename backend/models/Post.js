import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Post',
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    type: {
      type: String,
      enum: ['Social Post', 'Caption', 'Ad Copy', 'Product Description', 'Marketing Idea', 'Announcement'],
      default: 'Social Post',
    },
    platform: {
      type: String,
      enum: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'Pinterest', 'All Platforms'],
      default: 'LinkedIn',
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    hashtags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Published', 'Pending Approval', 'Archived'],
      default: 'Draft',
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;
