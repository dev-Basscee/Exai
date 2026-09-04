import React, { useState } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const EMOJI_OPTIONS = ['📚', '🧬', '⚖️', '💻', '🧪', '📐', '🧠', '📊', '⚡', '🌍', '🩺', '🏛️'];

export default function NewWorkspaceModal({
  isOpen,
  onClose,
  onCreateWorkspace
}) {
  const [name, setName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [semester, setSemester] = useState('Fall 2026');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📚');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Course name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onCreateWorkspace({
        name: name.trim(),
        course_code: courseCode.trim().toUpperCase() || 'CRS',
        semester: semester.trim(),
        instructor: instructor.trim(),
        description: description.trim(),
        icon: selectedEmoji
      });
      setName('');
      setCourseCode('');
      setInstructor('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create course workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel border border-white/15 rounded-4xl max-w-md w-full p-6 sm:p-7 shadow-2xl animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-white text-xl">
                Create Course Workspace
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Organize exams, syllabus notes, and predictions.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Course Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-cyan-500/30 border-2 border-cyan-400 scale-110 shadow-glow-cyan'
                      : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Chemistry II"
              className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          {/* Course Code & Term */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="CHEM 202"
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Semester / Term
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Spring 2026"
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Instructor (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Instructor / Professor
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Prof. Evelyn Reed"
              className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Focus / Description
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reaction mechanisms, synthesis pathways, and spectroscopy."
              className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Creating...' : 'Create Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
