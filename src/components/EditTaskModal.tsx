import React, { useState } from 'react';
import { X, Check, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { ActionItem, Priority } from '../types/meeting';

interface EditTaskModalProps {
  item: ActionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ActionItem) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [assigneeName, setAssigneeName] = useState(item.assignee.name || '');
  const [assigneeRole, setAssigneeRole] = useState(item.assignee.role || '');
  const [deadlineRaw, setDeadlineRaw] = useState(item.deadline.raw || '');
  const [deadlineIso, setDeadlineIso] = useState(
    item.deadline.isoDate ? item.deadline.isoDate.split('T')[0] : ''
  );
  const [priority, setPriority] = useState<Priority>(item.priority || 'medium');
  const [category, setCategory] = useState(item.category || 'General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: ActionItem = {
      ...item,
      title: title.trim(),
      description: description.trim(),
      assignee: {
        name: assigneeName.trim() || 'Unassigned',
        role: assigneeRole.trim(),
        isAmbiguous: false,
      },
      deadline: {
        raw: deadlineRaw.trim() || (deadlineIso ? deadlineIso : 'Unspecified'),
        isoDate: deadlineIso ? `${deadlineIso}T17:00:00` : item.deadline.isoDate,
        isAmbiguous: false,
      },
      priority,
      category: category.trim() || 'General',
      // If manually edited, mark ambiguity resolved
      ambiguity: {
        ...item.ambiguity,
        isAmbiguous: false,
        resolvedValue: `Manually updated by user (${assigneeName}, due ${deadlineRaw || deadlineIso})`,
        resolvedAt: new Date().toISOString(),
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">
            {item.id.startsWith('new-') ? 'Add New Action Item' : 'Edit Action Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement WebSocket reconnection fallback"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Details / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional task requirements, criteria, or context..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Assignee Name</label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="e.g. Sarah"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Role / Department</label>
              <input
                type="text"
                value={assigneeRole}
                onChange={(e) => setAssigneeRole(e.target.value)}
                placeholder="e.g. Frontend Lead"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Deadline (Text)</label>
              <input
                type="text"
                value={deadlineRaw}
                onChange={(e) => setDeadlineRaw(e.target.value)}
                placeholder="e.g. Friday, Nov 14 at 5pm"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Normalized Date</label>
              <input
                type="date"
                value={deadlineIso}
                onChange={(e) => setDeadlineIso(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category / Tag</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Engineering, Design"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Save Action Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
