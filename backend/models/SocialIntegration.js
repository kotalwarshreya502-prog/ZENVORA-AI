import mongoose from 'mongoose';

const socialIntegrationSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    platform: {
      type: String,
      enum: ['instagram', 'facebook', 'linkedin', 'twitter', 'google_business', 'wordpress'],
      required: true,
    },
    accountName: {
      type: String,
      default: '',
    },
    accountId: {
      type: String,
      default: '',
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    permissions: {
      type: [String],
      default: ['read_insights', 'publish_content'],
    },
  },
  { timestamps: true }
);

const SocialIntegration =
  mongoose.models.SocialIntegration || mongoose.model('SocialIntegration', socialIntegrationSchema);
export default SocialIntegration;
