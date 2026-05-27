'use client';

import { useUserStore } from '@/store/userStore';
import { User, Bell, Moon, Shield, HelpCircle, Save } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { name, email, setName, setEmail } = useUserStore();
  const [localName, setLocalName] = useState(name);
  const [localEmail, setLocalEmail] = useState(email);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setName(localName);
    setEmail(localEmail);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-veda-dark">Settings</h1>
        <p className="text-sm text-veda-muted mt-1">Manage your account and preferences.</p>
      </div>

      <div className="space-y-3">
        {/* Profile */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <User size={20} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-veda-dark">Profile</h3>
              <p className="text-xs text-veda-muted">Manage your personal information</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-veda-muted">Name</label>
              <input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-veda-border rounded-xl text-sm focus:outline-none focus:border-veda-orange transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-veda-muted">Email</label>
              <input
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-veda-border rounded-xl text-sm focus:outline-none focus:border-veda-orange transition"
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-veda-dark text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bell size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-veda-dark">Notifications</h3>
              <p className="text-xs text-veda-muted">Receive assignment updates</p>
            </div>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Moon size={20} className="text-gray-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-veda-dark">Dark Mode</h3>
              <p className="text-xs text-veda-muted">Switch to dark theme</p>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Shield size={20} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-veda-dark">Privacy & Security</h3>
              <p className="text-xs text-veda-muted">Manage data and permissions</p>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <HelpCircle size={20} className="text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-veda-dark">Help & Support</h3>
              <p className="text-xs text-veda-muted">Get help or report issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
