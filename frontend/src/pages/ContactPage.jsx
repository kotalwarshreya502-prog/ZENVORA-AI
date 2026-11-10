import { CheckCircle2, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import React, { useState } from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Product Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="violet" size="md">Get In Touch</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy tracking-tight">
          How can we help your team scale?
        </h1>
        <p className="text-base text-slate-600">
          Whether you need an enterprise custom integration or want to learn more about our autonomous marketing stack, our product engineers are ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-lg text-brand-navy">Direct Channels</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-violet/10 text-brand-violet shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Email Support</div>
                  <div className="text-slate-500">support@zenvora.ai</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-teal/10 text-brand-teal shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Enterprise Sales</div>
                  <div className="text-slate-500">enterprise@zenvora.ai</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="font-bold text-brand-navy">Headquarters</div>
                  <div className="text-slate-500">100 Innovation Way, Suite 400<br />San Francisco, CA 94105</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-6 rounded-2xl bg-brand-navy text-white space-y-3 text-xs">
            <div className="font-bold text-sm text-brand-teal">Enterprise SLA Commitment</div>
            <p className="text-slate-300 leading-relaxed">
              We offer dedicated private cloud deployments, custom Gemini prompt fine-tuning, and 99.9% uptime SLAs for high-volume agencies and franchised brands.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8 space-y-6">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy">Message Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. One of our senior product architects will review your inquiry and follow up within 4 business hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-xl text-brand-navy">Send us an inquiry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Topic of Interest</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet bg-white"
                  >
                    <option value="Product Inquiry">Product Inquiry / Demo</option>
                    <option value="Enterprise Sales">Enterprise & Agency Workspaces</option>
                    <option value="Custom API Integration">Custom API & Model Integration</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">How can we help?</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tell us about your team's marketing goals, volume, or timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet resize-none"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full shadow-md shadow-brand-violet/25">
                  <span>Send Inquiry</span>
                  <Send size={15} />
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
