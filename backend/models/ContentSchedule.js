import mongoose from 'mongoose';

const contentScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
    title: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      default: '09:00 AM',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Published', 'Failed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

const ContentSchedule =
  mongoose.models.ContentSchedule || mongoose.model('ContentSchedule', contentScheduleSchema);
export default ContentSchedule;
