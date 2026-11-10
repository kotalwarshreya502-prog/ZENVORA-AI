import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Share2,
  FileText,
  Clock,
  CheckCircle,
  Filter,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // New event form state
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('linkedin');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTime, setNewTime] = useState('10:00');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getCalendarEvents();
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      // Fallback sample calendar events
      setEvents([
        {
          _id: 'ev-1',
          title: 'Q1 AI Marketing Trends Thread',
          platform: 'twitter',
          scheduledFor: new Date(Date.now() + 86400000 * 1).toISOString(),
          status: 'scheduled',
          contentType: 'post',
        },
        {
          _id: 'ev-2',
          title: 'Scaling B2B Pipelines with Brand Voice Automation',
          platform: 'linkedin',
          scheduledFor: new Date(Date.now() + 86400000 * 2).toISOString(),
          status: 'scheduled',
          contentType: 'post',
        },
        {
          _id: 'ev-3',
          title: 'Mastering Keyword Intent in 2025 Deep Dive',
          platform: 'blog',
          scheduledFor: new Date(Date.now() + 86400000 * 4).toISOString(),
          status: 'draft',
          contentType: 'blog',
        },
        {
          _id: 'ev-4',
          title: 'Product Feature Carousel: Real-Time Audit',
          platform: 'instagram',
          scheduledFor: new Date(Date.now() + 86400000 * 5).toISOString(),
          status: 'scheduled',
          contentType: 'post',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const scheduledDateTime = new Date(`${newDate}T${newTime}:00`).toISOString();

    try {
      const res = await api.scheduleCalendarEvent({
        title: newTitle,
        platform: newPlatform,
        scheduledFor: scheduledDateTime,
        contentType: newPlatform === 'blog' ? 'blog' : 'post',
      });

      if (res && res.data) {
        setEvents([...events, res.data]);
      } else {
        setEvents([
          ...events,
          {
            _id: `ev-${Date.now()}`,
            title: newTitle,
            platform: newPlatform,
            scheduledFor: scheduledDateTime,
            status: 'scheduled',
            contentType: newPlatform === 'blog' ? 'blog' : 'post',
          },
        ]);
      }
      setShowScheduleModal(false);
      setNewTitle('');
    } catch (err) {
      console.error('Error scheduling event:', err);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const days = [];
  // Leading empty days
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const filteredEvents = events.filter((ev) => {
    if (selectedPlatform === 'all') return true;
    return ev.platform === selectedPlatform;
  });

  const getEventsForDay = (day) => {
    if (!day) return [];
    return filteredEvents.filter((ev) => {
      const evDate = new Date(ev.scheduledFor);
      return (
        evDate.getFullYear() === year &&
        evDate.getMonth() === month &&
        evDate.getDate() === day
      );
    });
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'linkedin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'twitter':
        return 'bg-slate-900 text-white border-slate-700';
      case 'instagram':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'blog':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'facebook':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="text-brand-violet" size={24} />
            Multi-Channel Content Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Orchestrate, preview, and reschedule all automated marketing posts and SEO articles in one visual timeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm rounded-lg shadow-md shadow-brand-violet/20 transition-all"
          >
            <Plus size={16} /> Schedule Content
          </button>
        </div>
      </div>

      {/* Controls & Platform Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-base font-bold text-slate-900 min-w-[150px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={todayMonth}
            className="ml-2 px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'linkedin', label: 'LinkedIn' },
            { id: 'twitter', label: 'X' },
            { id: 'instagram', label: 'Instagram' },
            { id: 'blog', label: 'SEO Blog' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedPlatform(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                selectedPlatform === item.id
                  ? 'border-brand-violet bg-brand-violet text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 py-3 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[550px]">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={idx}
                className={`p-2 transition-colors flex flex-col justify-between min-h-[90px] ${
                  !day ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/70'
                }`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-brand-violet text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-mono font-medium text-slate-400">
                          {dayEvents.length} items
                        </span>
                      )}
                    </div>

                    {/* Events inside this cell */}
                    <div className="mt-1.5 space-y-1.5 flex-1 overflow-y-auto max-h-[90px]">
                      {dayEvents.map((ev) => (
                        <div
                          key={ev._id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-1.5 rounded-md border text-[11px] cursor-pointer hover:shadow-xs transition-shadow truncate ${getPlatformBadge(
                            ev.platform
                          )}`}
                          title={ev.title}
                        >
                          <span className="font-semibold uppercase text-[9px] mr-1">
                            [{ev.platform}]
                          </span>
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Schedule New Event */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="text-brand-violet" size={18} />
                Schedule New Marketing Content
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Content Title or Working Hook <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 5 Trends in AI Marketing for Q2"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Channel
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white"
                >
                  <option value="linkedin">LinkedIn Post</option>
                  <option value="twitter">X (Twitter) Thread</option>
                  <option value="instagram">Instagram Carousel / Reel</option>
                  <option value="facebook">Facebook Post</option>
                  <option value="blog">SEO Blog Article</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Time (UTC/Local)
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-brand-violet hover:bg-brand-violet/90 text-white rounded-lg shadow-sm"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Event Detail */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${getPlatformBadge(selectedEvent.platform)}`}>
                {selectedEvent.platform}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-base font-bold text-slate-900">{selectedEvent.title}</h3>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock size={14} className="text-brand-violet" />
                Scheduled for: {new Date(selectedEvent.scheduledFor).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                Status: <span className="capitalize font-semibold text-slate-800">{selectedEvent.status}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
