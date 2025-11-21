'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Settings as SettingsIcon, Shield, ArrowLeft, Save } from 'lucide-react';
import { useAuth, UserRole } from '@/hooks/useAuth';

interface ProjectSettings {
  delegateApprovalToSupervisor: boolean;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user } = useAuth();

  const [settings, setSettings] = useState<ProjectSettings>({
    delegateApprovalToSupervisor: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isHomeowner = user?.role === UserRole.Homeowner;

  useEffect(() => {
    loadProjectSettings();
  }, [projectId]);

  const loadProjectSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt dự án');
      }

      const project = await response.json();
      setSettings({
        delegateApprovalToSupervisor: project.delegateApprovalToSupervisor || false,
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/delegation`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            delegateApprovalToSupervisor: settings.delegateApprovalToSupervisor,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Không thể cập nhật cài đặt');
      }

      setSuccessMessage('Đã lưu cài đặt thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (!isHomeowner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-3 text-red-600" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-red-700 mb-4">
            Chỉ chủ đầu tư mới có thể thay đổi cài đặt dự án
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            Cài đặt dự án
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý các cài đặt và quyền hạn cho dự án
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
          <Save className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải cài đặt...</p>
        </div>
      )}

      {/* Settings Form */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-md">
          {/* Material Approval Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Cài đặt phê duyệt vật tư
            </h2>

            <div className="space-y-4">
              {/* Delegation Setting */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    Ủy quyền phê duyệt cho giám sát
                  </h3>
                  <p className="text-sm text-gray-600">
                    Khi bật tính năng này, giám sát công trình sẽ có toàn quyền phê duyệt
                    yêu cầu vật tư mà không cần phê duyệt của chủ đầu tư. Điều này giúp
                    tăng tốc quy trình phê duyệt khi bạn tin tưởng hoàn toàn vào giám sát.
                  </p>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Khi bật ủy quyền, chỉ cần giám sát phê duyệt là
                    yêu cầu vật tư sẽ được chấp thuận ngay lập tức.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={settings.delegateApprovalToSupervisor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        delegateApprovalToSupervisor: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu cài đặt
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
