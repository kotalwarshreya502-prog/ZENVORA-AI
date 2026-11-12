import mongoose from 'mongoose';

const generationHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestId: { type: String, required: true, unique: true },
    module: {
      type: String,
      required: true,
      enum: ['content-studio', 'blog-generator', 'caption-generator', 'hashtag-generator',
             'image-generation', 'seo-analysis', 'research', 'competitor-analysis', 'social-generator'],
    },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    input: { type: mongoose.Schema.Types.Mixed, required: true },   // sanitized request params
    output: { type: mongoose.Schema.Types.Mixed, required: true },  // AI response (never null)
    provider: { type: String, default: 'google-gemini' },
    model: { type: String, default: 'gemini-1.5-flash' },
    status: { type: String, enum: ['success', 'failed', 'partial'], default: 'success' },
    isSaved: { type: Boolean, default: false },   // user explicitly saved this
    title: { type: String, default: '' },          // user-given title
  },
  { timestamps: true }
);

// Always scope queries to userId — enforced at model level
generationHistorySchema.statics.findForUser = function(userId, filters = {}) {
  return this.find({ userId, ...filters }).sort({ createdAt: -1 });
};

const GenerationHistory = mongoose.models.GenerationHistory || mongoose.model('GenerationHistory', generationHistorySchema);
export default GenerationHistory;
