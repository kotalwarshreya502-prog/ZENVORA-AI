import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';
import Analytics from '../models/Analytics.js';
import Blog from '../models/Blog.js';
import BrandGuideline from '../models/BrandGuideline.js';
import Business from '../models/Business.js';
import Campaign from '../models/Campaign.js';
import ContentSchedule from '../models/ContentSchedule.js';
import Notification from '../models/Notification.js';
import Post from '../models/Post.js';
import SocialIntegration from '../models/SocialIntegration.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// In-Memory store for offline/decoupled resilience when Atlas is not yet whitelisted
const memoryStore = {
  users: [
    {
      _id: '672000000000000000000001',
      name: 'Demo Founder',
      email: 'demo@zenvora.ai',
      // Password hash for 'Demo1234!'
      password: '$2a$12$e0X9aKz.p3u2rW8X0rE5l.l6aZ3xW3XbK6v8Q0l8Q0l8Q0l8Q0l8Q',
      role: 'admin',
      businessName: 'Zenvora Digital Labs',
      websiteUrl: 'https://zenvora.ai',
      industry: 'Software / Marketing Automation',
      onboardingCompleted: true,
      createdAt: new Date(),
    },
  ],
  businesses: [
    {
      _id: '672000000000000000000002',
      name: 'Zenvora Digital Labs',
      website: 'https://zenvora.ai',
      industry: 'Software / Marketing Automation',
      description: 'Next-generation AI marketing automation platform helping SMBs and agencies scale sustainable organic reach.',
      ownerId: '672000000000000000000001',
      locations: [
        { name: 'Headquarters', address: '100 Innovation Way', city: 'San Francisco', country: 'United States', phone: '+1 (555) 234-5678', isPrimary: true },
        { name: 'EU Hub', address: '45 Silicon Roundabout', city: 'London', country: 'United Kingdom', phone: '+44 20 7946 0912', isPrimary: false },
      ],
      socialAccounts: {
        instagram: { connected: true, username: '@zenvora_ai' },
        facebook: { connected: false, pageName: '' },
        linkedin: { connected: true, companyName: 'Zenvora AI Systems' },
        twitter: { connected: true, handle: '@ZenvoraAI' },
      },
    },
  ],
  brandGuidelines: [
    {
      _id: '672000000000000000000003',
      userId: '672000000000000000000001',
      businessId: '672000000000000000000002',
      brandVoice: 'Authoritative, forward-looking, innovative, and ROI-focused with approachable clarity.',
      targetAudience: 'Growth-stage founders, VP of Marketing, CMOs, and boutique agency owners.',
      primaryColor: '#11152B',
      accentColor: '#7657F6',
      logoUrl: '/favicon.svg',
      productsServices: ['AI Content Studio', 'Organic Blog SEO Engine', 'Autonomous Social Scheduling', 'Multi-channel Campaigns'],
      preferredKeywords: ['sustainable growth', 'smart marketing', 'organic traffic', 'conversion acceleration'],
      restrictedWords: ['cheap hacks', 'spam', 'guaranteed overnight miracles'],
      marketingGuidelines: 'Back up claims with transparent metrics. Maintain a modern, confident tone. Use active verbs.',
    },
  ],
  campaigns: [
    {
      _id: '672000000000000000000010',
      userId: '672000000000000000000001',
      name: 'Q4 Product Launch & Organic SEO Push',
      objective: 'Product Launch',
      targetAudience: 'E-commerce and SaaS Marketers',
      platforms: ['LinkedIn', 'Twitter', 'Blog'],
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      budget: 5000,
      spent: 2150,
      status: 'In Progress',
      progress: 68,
      description: 'Comprehensive multi-channel blitz announcing autonomous marketing capabilities.',
      createdAt: new Date(),
    },
    {
      _id: '672000000000000000000011',
      userId: '672000000000000000000001',
      name: 'Black Friday & Cyber Week Strategy',
      objective: 'Lead Generation',
      targetAudience: 'Direct-to-Consumer Brands',
      platforms: ['Instagram', 'Facebook', 'LinkedIn'],
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-12-05'),
      budget: 8000,
      spent: 3400,
      status: 'Approved',
      progress: 45,
      description: 'High-converting social proof ads and seasonal buyer guides.',
      createdAt: new Date(),
    },
    {
      _id: '672000000000000000000012',
      userId: '672000000000000000000001',
      name: 'Thought Leadership & Technical SEO',
      objective: 'SEO Growth',
      targetAudience: 'Agency Directors and Tech Founders',
      platforms: ['Blog', 'LinkedIn'],
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-11-30'),
      budget: 3500,
      spent: 3100,
      status: 'Published',
      progress: 92,
      description: 'In-depth pillar guides analyzing algorithmic search updates.',
      createdAt: new Date(),
    },
  ],
  posts: [
    {
      _id: '672000000000000000000020',
      userId: '672000000000000000000001',
      campaignId: '672000000000000000000010',
      title: 'Autonomous Marketing vs Manual Chaos',
      content: 'Traditional marketing teams spend 68% of their hours formatting spreadsheets and copy-pasting posts. Here is how modern marketing teams build automated workflows that run 24/7 without losing brand voice.\n\nKey takeaways:\n1. Consolidate your asset library\n2. Automate keyword clustering\n3. Pre-schedule with dynamic approval queues',
      type: 'Social Post',
      platform: 'LinkedIn',
      hashtags: ['#MarketingAutomation', '#SaaSGrowth', '#AIInnovation', '#OrganicSEO'],
      status: 'Published',
      scheduledFor: new Date('2026-11-04T10:00:00Z'),
      publishedAt: new Date('2026-11-04T10:00:00Z'),
      metrics: { impressions: 4820, clicks: 312, likes: 184, shares: 42 },
      createdAt: new Date(),
    },
    {
      _id: '672000000000000000000021',
      userId: '672000000000000000000001',
      campaignId: '672000000000000000000011',
      title: '5 Rules for High-Converting Ad Copy',
      content: 'Stop talking about your features. Your buyers care about one thing: time to value. Here are the 5 hooks driving 4.2x ROAS across our clients this quarter.\n\nSwipe through for the breakdown ->',
      type: 'Ad Copy',
      platform: 'Instagram',
      hashtags: ['#MarketingTips', '#Copywriting', '#AdCreative', '#GrowthHacking'],
      status: 'Scheduled',
      scheduledFor: new Date(Date.now() + 24 * 3600 * 1000),
      publishedAt: null,
      metrics: { impressions: 0, clicks: 0, likes: 0, shares: 0 },
      createdAt: new Date(),
    },
    {
      _id: '672000000000000000000022',
      userId: '672000000000000000000001',
      campaignId: '672000000000000000000010',
      title: 'The Future of Search Engine Generative Experience',
      content: 'Google SGE is rewriting how zero-click searches behave. If your content is not answering user intent in paragraph one, your impressions will plummet.\n\nRead our technical breakdown at the link in bio.',
      type: 'Marketing Idea',
      platform: 'Twitter',
      hashtags: ['#SEO', '#SGE', '#DigitalMarketing'],
      status: 'Draft',
      scheduledFor: null,
      publishedAt: null,
      metrics: { impressions: 0, clicks: 0, likes: 0, shares: 0 },
      createdAt: new Date(),
    },
  ],
  blogs: [
    {
      _id: '672000000000000000000030',
      userId: '672000000000000000000001',
      title: 'The Complete Guide to AI-Powered Marketing Automation in 2026',
      slug: 'complete-guide-ai-marketing-automation-2026',
      topic: 'Marketing Automation',
      targetKeyword: 'AI marketing automation platform',
      secondaryKeywords: ['content scaling', 'automated SEO', 'marketing workflow'],
      seoTitle: 'AI Marketing Automation: The Definitive 2026 Playbook | Zenvora AI',
      metaDescription: 'Discover how forward-thinking marketing teams use AI automation to scale organic content, automate social distribution, and drive 3x ROI.',
      readingTime: 7,
      seoScore: 94,
      status: 'Published',
      outline: [
        { heading: '1. What is Modern Marketing Automation?', subpoints: ['Beyond email drip campaigns', 'The integration of autonomous AI engines'] },
        { heading: '2. The 4 Pillars of Sustainable Growth', subpoints: ['SEO-driven blog creation', 'Dynamic social distribution', 'Brand consistency checks', 'Real-time performance analytics'] },
        { heading: '3. Implementing AI in Your Marketing Stack', subpoints: ['Auditing existing bottlenecks', 'Choosing the right tooling'] },
      ],
      faqs: [
        { question: 'Will AI content get penalized by Google?', answer: 'Google explicitly states it rewards high-quality, helpful content regardless of how it was produced. ZENVORA AI ensures every article is tailored with unique brand insights and rigorous SEO structure.' },
        { question: 'How much time does automation save?', answer: 'Our benchmark studies indicate teams reclaim 15-20 hours per week previously lost to repetitive drafting and scheduling.' },
      ],
      content: `## The Evolution of Digital Marketing Workflows\n\nMarketing in 2026 is no longer about who can write the most blog posts or queue up the most tweets. It is about **sustainable velocity**—the ability to systematically identify customer demand, generate authoritative answers, and distribute them across every channel your buyers inhabit.\n\n### The Shift to Autonomous Brand Intelligence\n\nTraditional marketing stacks relied on disconnected tools: one for keyword research, another for drafting, a third for scheduling, and a fourth for reporting. Modern SaaS platforms consolidate this fragmented pipeline into a single responsive engine.\n\n### Key Strategies for Implementation\n\n1. **Anchor Every Asset to Core Brand Guidelines:** Never allow generic AI output. Feed your brand voice, prohibited jargon, and target personas directly into the generation layer.\n2. **Prioritize Semantic Search Intent:** Search algorithms now prioritize topical depth and factual accuracy over mere keyword density.\n3. **Maintain Human Oversight in the Loop:** Autonomous execution works best when coupled with an intuitive approval queue.\n\nBy executing on these fundamentals, businesses build lasting organic flywheels that compound year after year.`,
      createdAt: new Date(),
    },
  ],
  notifications: [
    {
      _id: '672000000000000000000040',
      userId: '672000000000000000000001',
      title: 'Campaign Reached 68% Completion',
      message: 'Your campaign "Q4 Product Launch" has successfully published 14 of 20 planned assets.',
      type: 'campaign',
      link: '/dashboard/campaigns',
      isRead: false,
      createdAt: new Date(),
    },
    {
      _id: '672000000000000000000041',
      userId: '672000000000000000000001',
      title: 'SEO Audit Ready',
      message: 'Website health scan completed with a score of 92/100. 3 recommended actions found.',
      type: 'ai',
      link: '/dashboard/seo-analysis',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      _id: '672000000000000000000042',
      userId: '672000000000000000000001',
      title: 'Scheduled Post Live',
      message: 'Your LinkedIn post "Autonomous Marketing vs Manual Chaos" was published successfully.',
      type: 'schedule',
      link: '/dashboard/calendar',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000),
    },
  ],
  subscriptions: [
    {
      _id: '672000000000000000000050',
      userId: '672000000000000000000001',
      plan: 'Growth',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 22 * 24 * 3600 * 1000),
      usage: {
        aiWordsGenerated: 34850,
        aiWordsLimit: 150000,
        socialPostsScheduled: 42,
        socialPostsLimit: 250,
        connectedAccounts: 4,
        connectedAccountsLimit: 15,
      },
    },
  ],
};

const isMongooseReady = () => mongoose.connection.readyState === 1;

export const Storage = {
  isMongooseReady,

  // --- Users ---
  findUserByEmail: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongooseReady()) {
      return await User.findOne({ email: cleanEmail }).select('+password');
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  findUserById: async (id) => {
    if (isMongooseReady()) {
      return await User.findById(id).select('-password');
    }
    const user = memoryStore.users.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  createUser: async (userData) => {
    if (isMongooseReady()) {
      return await User.create(userData);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = {
      _id: 'user_' + Date.now(),
      ...userData,
      password: hashedPassword,
      email: userData.email.toLowerCase().trim(),
      role: userData.role || 'user',
      createdAt: new Date(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  // --- Business ---
  getBusinessByOwner: async (userId) => {
    if (isMongooseReady()) {
      return await Business.findOne({ ownerId: userId });
    }
    return memoryStore.businesses.find((b) => b.ownerId.toString() === userId.toString()) || memoryStore.businesses[0];
  },

  updateBusiness: async (userId, data) => {
    if (isMongooseReady()) {
      return await Business.findOneAndUpdate({ ownerId: userId }, data, { new: true, upsert: true });
    }
    let biz = memoryStore.businesses.find((b) => b.ownerId.toString() === userId.toString());
    if (biz) {
      Object.assign(biz, data);
    } else {
      biz = { _id: 'biz_' + Date.now(), ownerId: userId, ...data };
      memoryStore.businesses.push(biz);
    }
    return biz;
  },

  // --- Brand Guidelines ---
  getBrandGuidelines: async (userId) => {
    if (isMongooseReady()) {
      return await BrandGuideline.findOne({ userId });
    }
    return memoryStore.brandGuidelines.find((bg) => bg.userId.toString() === userId.toString()) || memoryStore.brandGuidelines[0];
  },

  updateBrandGuidelines: async (userId, data) => {
    if (isMongooseReady()) {
      return await BrandGuideline.findOneAndUpdate({ userId }, data, { new: true, upsert: true });
    }
    let bg = memoryStore.brandGuidelines.find((b) => b.userId.toString() === userId.toString());
    if (bg) {
      Object.assign(bg, data);
    } else {
      bg = { _id: 'bg_' + Date.now(), userId, ...data };
      memoryStore.brandGuidelines.push(bg);
    }
    return bg;
  },

  // --- Campaigns ---
  getCampaigns: async (userId) => {
    if (isMongooseReady()) {
      return await Campaign.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryStore.campaigns;
  },

  createCampaign: async (userId, data) => {
    if (isMongooseReady()) {
      return await Campaign.create({ ...data, userId });
    }
    const newCamp = {
      _id: 'camp_' + Date.now(),
      userId,
      ...data,
      progress: data.progress || 0,
      spent: data.spent || 0,
      status: data.status || 'Draft',
      createdAt: new Date(),
    };
    memoryStore.campaigns.unshift(newCamp);
    return newCamp;
  },

  updateCampaign: async (id, data) => {
    if (isMongooseReady()) {
      return await Campaign.findByIdAndUpdate(id, data, { new: true });
    }
    const camp = memoryStore.campaigns.find((c) => c._id.toString() === id.toString());
    if (camp) Object.assign(camp, data);
    return camp;
  },

  deleteCampaign: async (id) => {
    if (isMongooseReady()) {
      return await Campaign.findByIdAndDelete(id);
    }
    const index = memoryStore.campaigns.findIndex((c) => c._id.toString() === id.toString());
    if (index > -1) memoryStore.campaigns.splice(index, 1);
    return { success: true };
  },

  // --- Posts ---
  getPosts: async (userId, filters = {}) => {
    if (isMongooseReady()) {
      const q = { userId };
      if (filters.status) q.status = filters.status;
      if (filters.platform) q.platform = filters.platform;
      return await Post.find(q).sort({ createdAt: -1 });
    }
    return memoryStore.posts;
  },

  createPost: async (userId, data) => {
    if (isMongooseReady()) {
      return await Post.create({ ...data, userId });
    }
    const newPost = {
      _id: 'post_' + Date.now(),
      userId,
      ...data,
      metrics: { impressions: 0, clicks: 0, likes: 0, shares: 0 },
      createdAt: new Date(),
    };
    memoryStore.posts.unshift(newPost);
    return newPost;
  },

  updatePost: async (id, data) => {
    if (isMongooseReady()) {
      return await Post.findByIdAndUpdate(id, data, { new: true });
    }
    const post = memoryStore.posts.find((p) => p._id.toString() === id.toString());
    if (post) Object.assign(post, data);
    return post;
  },

  deletePost: async (id) => {
    if (isMongooseReady()) {
      return await Post.findByIdAndDelete(id);
    }
    const index = memoryStore.posts.findIndex((p) => p._id.toString() === id.toString());
    if (index > -1) memoryStore.posts.splice(index, 1);
    return { success: true };
  },

  // --- Blogs ---
  getBlogs: async (userId) => {
    if (isMongooseReady()) {
      return await Blog.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryStore.blogs;
  },

  getBlogById: async (id) => {
    if (isMongooseReady()) {
      return await Blog.findById(id);
    }
    return memoryStore.blogs.find((b) => b._id.toString() === id.toString()) || null;
  },

  createBlog: async (userId, data) => {
    if (isMongooseReady()) {
      return await Blog.create({ ...data, userId });
    }
    const newBlog = {
      _id: 'blog_' + Date.now(),
      userId,
      ...data,
      createdAt: new Date(),
    };
    memoryStore.blogs.unshift(newBlog);
    return newBlog;
  },

  updateBlog: async (id, data) => {
    if (isMongooseReady()) {
      return await Blog.findByIdAndUpdate(id, data, { new: true });
    }
    const blog = memoryStore.blogs.find((b) => b._id.toString() === id.toString());
    if (blog) Object.assign(blog, data);
    return blog;
  },

  deleteBlog: async (id) => {
    if (isMongooseReady()) {
      return await Blog.findByIdAndDelete(id);
    }
    const index = memoryStore.blogs.findIndex((b) => b._id.toString() === id.toString());
    if (index > -1) memoryStore.blogs.splice(index, 1);
    return { success: true };
  },

  // --- Notifications ---
  getNotifications: async (userId) => {
    if (isMongooseReady()) {
      return await Notification.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryStore.notifications;
  },

  markNotificationsRead: async (userId) => {
    if (isMongooseReady()) {
      return await Notification.updateMany({ userId }, { isRead: true });
    }
    memoryStore.notifications.forEach((n) => (n.isRead = true));
    return { success: true };
  },

  // --- Subscriptions ---
  getSubscription: async (userId) => {
    if (isMongooseReady()) {
      return await Subscription.findOne({ userId });
    }
    return memoryStore.subscriptions[0];
  },
};

export default Storage;
