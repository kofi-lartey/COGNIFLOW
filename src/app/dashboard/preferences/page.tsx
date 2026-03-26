'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, Bell, Shield, Globe, Palette, Camera, 
  Mail, Lock, Eye, EyeOff, Check, X, Upload,
  Crop, RotateCcw, ZoomIn, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Types for preferences
interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  marketingEmails: boolean;
  analysisAlerts: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  dataSharing: boolean;
  analyticsTracking: boolean;
  activityStatus: boolean;
}

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'dark',
  timezone: 'UTC',
  notifications: {
    push: true,
    email: true,
    sms: false,
    marketingEmails: false,
    analysisAlerts: true,
    weeklyDigest: true,
  },
  privacy: {
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    activityStatus: true,
  },
};

type SettingsTab = 'profile' | 'notifications' | 'account' | 'privacy' | 'appearance';

export default function PreferencesPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [user, setUser] = useState<{ fullName: string; email: string; avatarUrl?: string } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load user data and preferences on mount
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ 
          fullName: user.user_metadata?.full_name || '', 
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url
        });
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        if (user.user_metadata?.avatar_url) {
          setAvatarPreview(user.user_metadata.avatar_url);
        }
      }
    }
    loadUser();

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('cogniflow_user_preferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = async (newPreferences: UserPreferences) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      localStorage.setItem('cogniflow_user_preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setSaveMessage({ type: 'error', text: 'Please select a JPG or PNG image.' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage({ type: 'error', text: 'Image must be less than 5MB.' });
      return;
    }

    setAvatarFile(file);
    setIsCropping(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle crop
  const handleCrop = () => {
    if (!avatarPreview || !cropCanvasRef.current) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to 200x200 for profile picture
      canvas.width = 200;
      canvas.height = 200;

      // Default crop area (center square)
      const cropSize = Math.min(img.width, img.height);
      const cropX = (img.width - cropSize) / 2;
      const cropY = (img.height - cropSize) / 2;

      // Draw cropped image
      ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, 200, 200);
      
      // Get cropped image as data URL
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setAvatarPreview(croppedDataUrl);
      setIsCropping(false);
    };
    img.src = avatarPreview;
  };

  // Handle profile save
  const handleProfileSave = async () => {
    // Validate
    const errors: { name?: string; email?: string } = {};
    
    if (!fullName.trim()) {
      errors.name = 'Name is required';
    } else if (fullName.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update user profile via Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarPreview || undefined
        }
      });

      if (error) {
        setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      } else if (data.user) {
        setUser({ 
          fullName: data.user.user_metadata?.full_name || '', 
          email: data.user.email || '',
          avatarUrl: data.user.user_metadata?.avatar_url
        });
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    const errors: { current?: string; new?: string; confirm?: string } = {};
    
    if (!currentPassword) {
      errors.current = 'Current password is required';
    }
    
    if (!newPassword) {
      errors.new = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.new = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirm = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaveMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    const newNotifications = { ...preferences.notifications, [key]: !preferences.notifications[key] };
    savePreferences({ ...preferences, notifications: newNotifications });
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (key: keyof PrivacySettings) => {
    const newPrivacy = { ...preferences.privacy, [key]: !preferences.privacy[key] };
    savePreferences({ ...preferences, privacy: newPrivacy });
  };

  // Handle appearance change
  const handleAppearanceChange = (key: 'language' | 'theme' | 'timezone', value: string) => {
    savePreferences({ ...preferences, [key]: value });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#090B13] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Preferences</h1>
          <p className="text-[#4B5563] mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            saveMessage.type === 'success' 
              ? 'bg-cyan-400/10 border border-cyan-400/20 text-cyan-400' 
              : 'bg-red-400/10 border border-red-400/20 text-red-400'
          }`}>
            {saveMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{saveMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                      : 'text-[#4B5563] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-cyan-400' : 'opacity-50'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <User className="w-5 h-5 text-cyan-400" />
                    Profile Picture
                  </h2>
                  
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-[#111421] border-4 border-[#1E253A]">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-[#4B5563]" />
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#111421] border border-[#1E253A] rounded-xl text-sm font-medium text-white hover:bg-[#1E253A] transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </button>
                      <p className="text-xs text-[#4B5563]">JPG or PNG, max 5MB</p>
                    </div>

                    {/* Crop Modal */}
                    {isCropping && (
                      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 max-w-lg w-full">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Crop className="w-5 h-5 text-cyan-400" />
                            Crop Profile Picture
                          </h3>
                          <div className="aspect-square bg-[#111421] rounded-xl overflow-hidden mb-4">
                            {avatarPreview && (
                              <img src={avatarPreview} alt="Crop preview" className="w-full h-full object-contain" />
                            )}
                          </div>
                          <canvas ref={cropCanvasRef} className="hidden" />
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setIsCropping(false);
                                setAvatarPreview(user?.avatarUrl || null);
                                setAvatarFile(null);
                              }}
                              className="flex-1 px-4 py-2 border border-[#1E253A] rounded-xl text-white font-medium hover:bg-[#111421] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCrop}
                              className="flex-1 px-4 py-2 bg-cyan-400 text-[#090B13] rounded-xl font-bold hover:brightness-110 transition-all"
                            >
                              Apply Crop
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <label className="block text-sm font-medium text-[#4B5563] mb-2">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`w-full h-14 bg-[#090B13] border rounded-xl px-5 text-white placeholder:text-[#1E253A] focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all ${
                            formErrors.name ? 'border-red-500' : 'border-[#1E253A]'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {formErrors.name && (
                          <p className="text-red-400 text-sm mt-2">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4B5563] mb-2">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full h-14 bg-[#090B13] border rounded-xl px-5 text-white placeholder:text-[#1E253A] focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all ${
                            formErrors.email ? 'border-red-500' : 'border-[#1E253A]'
                          }`}
                          placeholder="Enter your email"
                        />
                        {formErrors.email && (
                          <p className="text-red-400 text-sm mt-2">{formErrors.email}</p>
                        )}
                      </div>
                      <button
                        onClick={handleProfileSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-cyan-400 text-[#090B13] rounded-xl font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Bell className="w-5 h-5 text-cyan-400" />
                    Notification Channels
                  </h2>
                  
                  <div className="space-y-4">
                    <NotificationToggle
                      label="Push Notifications"
                      description="Receive push notifications on your device"
                      enabled={preferences.notifications.push}
                      onChange={() => handleNotificationToggle('push')}
                    />
                    <NotificationToggle
                      label="Email Notifications"
                      description="Receive notifications via email"
                      enabled={preferences.notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                    />
                    <NotificationToggle
                      label="SMS Notifications"
                      description="Receive notifications via SMS"
                      enabled={preferences.notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                    />
                  </div>
                </div>

                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    Email Preferences
                  </h2>
                  
                  <div className="space-y-4">
                    <NotificationToggle
                      label="Analysis Alerts"
                      description="Get notified when your document analysis is complete"
                      enabled={preferences.notifications.analysisAlerts}
                      onChange={() => handleNotificationToggle('analysisAlerts')}
                    />
                    <NotificationToggle
                      label="Weekly Digest"
                      description="Receive a weekly summary of your activity"
                      enabled={preferences.notifications.weeklyDigest}
                      onChange={() => handleNotificationToggle('weeklyDigest')}
                    />
                    <NotificationToggle
                      label="Marketing Emails"
                      description="Receive promotional and marketing emails"
                      enabled={preferences.notifications.marketingEmails}
                      onChange={() => handleNotificationToggle('marketingEmails')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    Account Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-[#1E253A]">
                      <div>
                        <p className="text-white font-medium">Email</p>
                        <p className="text-[#4B5563] text-sm">{user?.email || 'Not set'}</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        Change
                      </button>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#1E253A]">
                      <div>
                        <p className="text-white font-medium">Password</p>
                        <p className="text-[#4B5563] text-sm">••••••••••••</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        Change
                      </button>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-[#4B5563] text-sm">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-[#111421] border border-[#1E253A] rounded-xl text-sm font-medium text-white hover:bg-[#1E253A] transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-cyan-400" />
                    Change Password
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`w-full h-14 bg-[#090B13] border rounded-xl px-5 pr-12 text-white placeholder:text-[#1E253A] focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all ${
                            passwordErrors.current ? 'border-red-500' : 'border-[#1E253A]'
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.current && (
                        <p className="text-red-400 text-sm mt-2">{passwordErrors.current}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-2">New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full h-14 bg-[#090B13] border rounded-xl px-5 text-white placeholder:text-[#1E253A] focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all ${
                          passwordErrors.new ? 'border-red-500' : 'border-[#1E253A]'
                        }`}
                        placeholder="Enter new password"
                      />
                      {passwordErrors.new && (
                        <p className="text-red-400 text-sm mt-2">{passwordErrors.new}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-2">Confirm New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full h-14 bg-[#090B13] border rounded-xl px-5 text-white placeholder:text-[#1E253A] focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all ${
                          passwordErrors.confirm ? 'border-red-500' : 'border-[#1E253A]'
                        }`}
                        placeholder="Confirm new password"
                      />
                      {passwordErrors.confirm && (
                        <p className="text-red-400 text-sm mt-2">{passwordErrors.confirm}</p>
                      )}
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSaving}
                      className="w-full py-4 bg-cyan-400 text-[#090B13] rounded-xl font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    Profile Visibility
                  </h2>
                  
                  <div className="space-y-4">
                    <VisibilityOption
                      label="Public"
                      description="Anyone can see your profile"
                      selected={preferences.privacy.profileVisibility === 'public'}
                      onChange={() => {
                        savePreferences({ ...preferences, privacy: { ...preferences.privacy, profileVisibility: 'public' } });
                      }}
                    />
                    <VisibilityOption
                      label="Private"
                      description="Only you can see your profile"
                      selected={preferences.privacy.profileVisibility === 'private'}
                      onChange={() => {
                        savePreferences({ ...preferences, privacy: { ...preferences.privacy, profileVisibility: 'private' } });
                      }}
                    />
                    <VisibilityOption
                      label="Contacts Only"
                      description="Only your contacts can see your profile"
                      selected={preferences.privacy.profileVisibility === 'contacts'}
                      onChange={() => {
                        savePreferences({ ...preferences, privacy: { ...preferences.privacy, profileVisibility: 'contacts' } });
                      }}
                    />
                  </div>
                </div>

                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-cyan-400" />
                    Data & Privacy
                  </h2>
                  
                  <div className="space-y-4">
                    <NotificationToggle
                      label="Data Sharing"
                      description="Share anonymized data to help improve our services"
                      enabled={preferences.privacy.dataSharing}
                      onChange={() => handlePrivacyToggle('dataSharing')}
                    />
                    <NotificationToggle
                      label="Analytics Tracking"
                      description="Allow us to collect usage analytics"
                      enabled={preferences.privacy.analyticsTracking}
                      onChange={() => handlePrivacyToggle('analyticsTracking')}
                    />
                    <NotificationToggle
                      label="Activity Status"
                      description="Show when you're active on the platform"
                      enabled={preferences.privacy.activityStatus}
                      onChange={() => handlePrivacyToggle('activityStatus')}
                    />
                  </div>
                </div>

                <div className="bg-[#0D101A] rounded-2xl border border-red-500/20 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    Danger Zone
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-[#1E253A]">
                      <div>
                        <p className="text-white font-medium">Export Data</p>
                        <p className="text-[#4B5563] text-sm">Download all your data</p>
                      </div>
                      <button className="px-4 py-2 bg-[#111421] border border-[#1E253A] rounded-xl text-sm font-medium text-white hover:bg-[#1E253A] transition-colors">
                        Export
                      </button>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <div>
                        <p className="text-white font-medium">Delete Account</p>
                        <p className="text-[#4B5563] text-sm">Permanently delete your account and data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Language & Region
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-2">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handleAppearanceChange('language', e.target.value)}
                        className="w-full h-14 bg-[#090B13] border border-[#1E253A] rounded-xl px-5 text-white focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="pt">Português</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-2">Timezone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
                        className="w-full h-14 bg-[#090B13] border border-[#1E253A] rounded-xl px-5 text-white focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 outline-none transition-all"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Palette className="w-5 h-5 text-cyan-400" />
                    Theme
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <ThemeOption
                      label="Light"
                      selected={preferences.theme === 'light'}
                      onChange={() => handleAppearanceChange('theme', 'light')}
                    />
                    <ThemeOption
                      label="Dark"
                      selected={preferences.theme === 'dark'}
                      onChange={() => handleAppearanceChange('theme', 'dark')}
                    />
                    <ThemeOption
                      label="System"
                      selected={preferences.theme === 'system'}
                      onChange={() => handleAppearanceChange('theme', 'system')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function NotificationToggle({ 
  label, 
  description, 
  enabled, 
  onChange 
}: { 
  label: string; 
  description: string; 
  enabled: boolean; 
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1E253A] last:border-0">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-[#4B5563] text-sm">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-cyan-400' : 'bg-[#1E253A]'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

function VisibilityOption({
  label,
  description,
  selected,
  onChange
}: {
  label: string;
  description: string;
  selected: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
        selected 
          ? 'bg-cyan-400/10 border-cyan-400/30' 
          : 'bg-[#090B13] border-[#1E253A] hover:border-[#4B5563]'
      }`}
    >
      <div className="text-left">
        <p className={`font-medium ${selected ? 'text-cyan-400' : 'text-white'}`}>{label}</p>
        <p className="text-[#4B5563] text-sm">{description}</p>
      </div>
      {selected && <Check className="w-5 h-5 text-cyan-400" />}
    </button>
  );
}

function ThemeOption({
  label,
  selected,
  onChange
}: {
  label: string;
  selected: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`p-4 rounded-xl border transition-all ${
        selected 
          ? 'bg-cyan-400/10 border-cyan-400/30' 
          : 'bg-[#090B13] border-[#1E253A] hover:border-[#4B5563]'
      }`}
    >
      <div className={`w-full h-16 rounded-lg mb-3 ${
        label === 'Light' ? 'bg-white' : label === 'Dark' ? 'bg-[#090B13]' : 'bg-gradient-to-br from-white to-[#090B13]'
      }`} />
      <p className={`font-medium ${selected ? 'text-cyan-400' : 'text-white'}`}>{label}</p>
    </button>
  );
}
