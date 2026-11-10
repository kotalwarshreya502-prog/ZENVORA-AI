import mongoose from 'mongoose';

const brandGuidelineSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brandVoice: {
      type: String,
      default: 'Professional, innovative, authoritative yet accessible',
    },
    targetAudience: {
      type: String,
      default: 'Growth-minded SMB founders, marketing leaders, and digital agencies',
    },
    primaryColor: {
      type: String,
      default: '#11152B',
    },
    accentColor: {
      type: String,
      default: '#7657F6',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    productsServices: {
      type: [String],
      default: ['AI Marketing Automation', 'SEO Content Engine', 'Social Media Scheduling'],
    },
    preferredKeywords: {
      type: [String],
      default: ['sustainable growth', 'smart marketing', 'organic traffic', 'conversion rate'],
    },
    restrictedWords: {
      type: [String],
      default: ['cheap', 'guaranteed overnight success', 'spam'],
    },
    marketingGuidelines: {
      type: String,
      default: 'Always maintain clarity and data-backed claims. Emphasize measurable business outcomes and long-term brand equity.',
    },
  },
  { timestamps: true }
);

const BrandGuideline =
  mongoose.models.BrandGuideline || mongoose.model('BrandGuideline', brandGuidelineSchema);
export default BrandGuideline;
