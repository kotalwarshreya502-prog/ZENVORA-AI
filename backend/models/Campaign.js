import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    objective: {
      type: String,
      enum: ['Brand Awareness', 'Lead Generation', 'Website Traffic', 'Product Launch', 'SEO Growth', 'Customer Retention'],
      default: 'Lead Generation',
    },
    targetAudience: {
      type: String,
      default: 'B2B Decision Makers',
    },
    platforms: {
      type: [String],
      default: ['Instagram', 'LinkedIn', 'Blog'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    budget: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'In Progress', 'Pending Approval', 'Approved', 'Scheduled', 'Published', 'Completed'],
      default: 'In Progress',
    },
    progress: {
      type: Number,
      default: 25,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
export default Campaign;
