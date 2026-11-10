import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
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
      required: [true, 'Blog title is required'],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    topic: {
      type: String,
      default: '',
    },
    targetKeyword: {
      type: String,
      default: '',
    },
    secondaryKeywords: {
      type: [String],
      default: [],
    },
    seoTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    outline: [
      {
        heading: String,
        subpoints: [String],
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Scheduled', 'Archived'],
      default: 'Draft',
    },
    readingTime: {
      type: Number,
      default: 5, // minutes
    },
    seoScore: {
      type: Number,
      default: 88,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
export default Blog;
