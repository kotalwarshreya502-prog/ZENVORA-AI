import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['Starter', 'Growth', 'Agency Pro', 'Enterprise'],
      default: 'Growth',
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled'],
      default: 'active',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    usage: {
      aiWordsGenerated: { type: Number, default: 12450 },
      aiWordsLimit: { type: Number, default: 100000 },
      socialPostsScheduled: { type: Number, default: 18 },
      socialPostsLimit: { type: Number, default: 200 },
      connectedAccounts: { type: Number, default: 3 },
      connectedAccountsLimit: { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

const Subscription =
  mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
