import express from 'express';
import aiRoutes from './aiRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import authRoutes from './authRoutes.js';
import blogRoutes from './blogRoutes.js';
import brandRoutes from './brandRoutes.js';
import businessRoutes from './businessRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import healthRoutes from './healthRoutes.js';
import integrationRoutes from './integrationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import postRoutes from './postRoutes.js';
import seoRoutes from './seoRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import historyRoutes from './historyRoutes.js';
import researchRoutes from './researchRoutes.js';
import competitorRoutes from './competitorRoutes.js';
import imageRoutes from './imageRoutes.js';
import posterRoutes from './posterRoutes.js';

const router = express.Router();

// System Health
router.use('/health', healthRoutes);

// Authentication
router.use('/auth', authRoutes);

// AI Content & Blog Generator
router.use('/ai', aiRoutes);

// Marketing Campaigns
router.use('/campaigns', campaignRoutes);

// Posts & Captions
router.use('/posts', postRoutes);

// SEO Blogs
router.use('/blogs', blogRoutes);

// Brand Knowledge Base & Guidelines
router.use('/brand', brandRoutes);

// SEO Audit & Heuristics
router.use('/seo', seoRoutes);

// Marketing Analytics & KPIs
router.use('/analytics', analyticsRoutes);

// Business & Locations
router.use('/business', businessRoutes);

// Content Calendar & Scheduling
router.use('/calendar', calendarRoutes);

// Social Media Integrations
router.use('/integrations', integrationRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// Subscriptions & Billing
router.use('/subscriptions', subscriptionRoutes);

// Generation History
router.use('/history', historyRoutes);

// Research & Analysis
router.use('/research', researchRoutes);

// Competitor Analysis
router.use('/competitor', competitorRoutes);

// Image Generation
router.use('/image', imageRoutes);

// Poster Generation (Universal Intelligent Poster Engine)
router.use('/poster', posterRoutes);

export default router;
