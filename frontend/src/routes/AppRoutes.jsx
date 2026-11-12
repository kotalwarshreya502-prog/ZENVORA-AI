import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import FeaturesPage from '../pages/FeaturesPage';
import PricingPage from '../pages/PricingPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

// Dashboard Pages
import OverviewDashboard from '../pages/dashboard/OverviewDashboard';
import BusinessProfilePage from '../pages/dashboard/BusinessProfilePage';
import ContentStudioPage from '../pages/dashboard/ContentStudioPage';
import BlogGeneratorPage from '../pages/dashboard/BlogGeneratorPage';
import SocialGeneratorPage from '../pages/dashboard/SocialGeneratorPage';
import CaptionGeneratorPage from '../pages/dashboard/CaptionGeneratorPage';
import HashtagGeneratorPage from '../pages/dashboard/HashtagGeneratorPage';
import ImageGenerationPage from '../pages/dashboard/ImageGenerationPage';
import CampaignsPage from '../pages/dashboard/CampaignsPage';
import CalendarPage from '../pages/dashboard/CalendarPage';
import PublishingHistoryPage from '../pages/dashboard/PublishingHistoryPage';
import SeoAnalysisPage from '../pages/dashboard/SeoAnalysisPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';
import BrandGuidelinesPage from '../pages/dashboard/BrandGuidelinesPage';
import IntegrationsPage from '../pages/dashboard/IntegrationsPage';
import TeamManagementPage from '../pages/dashboard/TeamManagementPage';
import BillingPage from '../pages/dashboard/BillingPage';
import NotificationsPage from '../pages/dashboard/NotificationsPage';
import SettingsPage from '../pages/dashboard/SettingsPage';
import ResearchAssistantPage from '../pages/dashboard/ResearchAssistantPage';
import CompetitorAnalysisPage from '../pages/dashboard/CompetitorAnalysisPage';
import GenerationHistoryPage from '../pages/dashboard/GenerationHistoryPage';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes (Wrapped with MainLayout) */}
        <Route
          path="/"
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          }
        />
        <Route
          path="/features"
          element={
            <MainLayout>
              <FeaturesPage />
            </MainLayout>
          }
        />
        <Route
          path="/pricing"
          element={
            <MainLayout>
              <PricingPage />
            </MainLayout>
          }
        />
        <Route
          path="/about"
          element={
            <MainLayout>
              <AboutPage />
            </MainLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <MainLayout>
              <ContactPage />
            </MainLayout>
          }
        />

        {/* Authentication Pages (Standalone full-screen) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected SaaS Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewDashboard />} />
          <Route path="business-profile" element={<BusinessProfilePage />} />
          <Route path="content-studio" element={<ContentStudioPage />} />
          <Route path="blog-generator" element={<BlogGeneratorPage />} />
          <Route path="social-generator" element={<SocialGeneratorPage />} />
          <Route path="caption-generator" element={<CaptionGeneratorPage />} />
          <Route path="hashtag-generator" element={<HashtagGeneratorPage />} />
          <Route path="image-generation" element={<ImageGenerationPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="publishing-history" element={<PublishingHistoryPage />} />
          <Route path="seo-analysis" element={<SeoAnalysisPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="brand-guidelines" element={<BrandGuidelinesPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="team" element={<TeamManagementPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="research" element={<ResearchAssistantPage />} />
          <Route path="competitor" element={<CompetitorAnalysisPage />} />
          <Route path="history" element={<GenerationHistoryPage />} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
