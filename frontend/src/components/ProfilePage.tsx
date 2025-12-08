import React, { useState, useEffect } from 'react';
import { auth, User } from '../utils/auth';

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: '',
    image: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        interests: currentUser.interests || '',
        image: currentUser.image || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, []);

  const handleSave = () => {
    setError('');
    setSuccess('');

    if (!user) return;

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    const updates: Partial<User> = {
      name: formData.name,
      email: formData.email,
      interests: formData.interests,
      image: formData.image || undefined,
    };

    if (formData.password) {
      updates.password = formData.password;
    }

    const updated = auth.updateUser(user.id, updates);
    if (updated) {
      const { password: _, ...userWithoutPassword } = updated;
      setUser(userWithoutPassword);
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user found</p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const initials = auth.getInitials(user.name);

  // Parse interests from comma-separated string
  const parseInterests = (interestsString: string): string[] => {
    if (!interestsString || !interestsString.trim()) return [];
    return interestsString
      .split(',')
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
  };

  // Color variations for interest boxes
  const interestColors = [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-pink-500 to-pink-600',
    'bg-gradient-to-r from-red-500 to-red-600',
    'bg-gradient-to-r from-orange-500 to-orange-600',
    'bg-gradient-to-r from-yellow-500 to-yellow-600',
    'bg-gradient-to-r from-green-500 to-green-600',
    'bg-gradient-to-r from-teal-500 to-teal-600',
    'bg-gradient-to-r from-cyan-500 to-cyan-600',
  ];

  const getInterestColor = (index: number) => {
    return interestColors[index % interestColors.length];
  };

  const interestsList = parseInterests(user.interests || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
        >
          ← Back to Home
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-100">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              {!isEditing && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-red-500 hover:text-red-600 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Profile Content */}
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Research Interests
                </label>
                <textarea
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Machine Learning, Computer Vision, NLP..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  placeholder="••••••••"
                />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setSuccess('');
                    const currentUser = auth.getCurrentUser();
                    if (currentUser) {
                      setFormData({
                        name: currentUser.name || '',
                        email: currentUser.email || '',
                        interests: currentUser.interests || '',
                        image: currentUser.image || '',
                        password: '',
                        confirmPassword: '',
                      });
                    }
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                  Research Interests
                </h3>
                {interestsList.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {interestsList.map((interest, index) => (
                      <span
                        key={index}
                        className={`${getInterestColor(index)} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No interests specified</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

