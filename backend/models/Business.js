import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: 'General',
    },
    description: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    brandVoice: {
      type: String,
      default: 'Professional, innovative, authoritative yet accessible',
    },
    targetAudience: {
      type: String,
      default: 'Target customers and key decision makers',
    },
    uniqueSellingPoints: {
      type: [String],
      default: [],
    },
    productsServices: {
      type: [String],
      default: [],
    },
    brandColors: {
      primary: { type: String, default: '#7657F6' },
      secondary: { type: String, default: '#11152B' },
      accent: { type: String, default: '#3B82F6' },
    },
    pricingOverview: {
      type: String,
      default: '',
    },
    competitors: {
      type: [String],
      default: [],
    },
    companySize: {
      type: String,
      default: '11-50 employees',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    lastAnalyzedAt: {
      type: Date,
    },
    rawMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    locations: [
      {
        name: { type: String, default: 'Primary Headquarters' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        country: { type: String, default: 'United States' },
        phone: { type: String, default: '' },
        isPrimary: { type: Boolean, default: true },
      },
    ],
    socialAccounts: {
      instagram: { connected: { type: Boolean, default: false }, username: { type: String, default: '' } },
      facebook: { connected: { type: Boolean, default: false }, pageName: { type: String, default: '' } },
      linkedin: { connected: { type: Boolean, default: false }, companyName: { type: String, default: '' } },
      twitter: { connected: { type: Boolean, default: false }, handle: { type: String, default: '' } },
    },
  },
  { timestamps: true }
);

const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);
export default Business;
