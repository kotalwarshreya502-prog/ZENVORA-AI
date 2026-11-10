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
