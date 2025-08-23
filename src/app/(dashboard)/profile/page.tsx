"use client";

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { profileApi, type ProfileDto, type UpdateProfileDto, type ProfileDocumentDto } from '@/lib/profile/profile.api';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [documents, setDocuments] = useState<ProfileDocumentDto[]>([]);

  const [form, setForm] = useState<UpdateProfileDto>({});
  const [file, setFile] = useState<File | null>(null);
  const [docDesc, setDocDesc] = useState<string>('');
  const [docType, setDocType] = useState<string>('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const p = await profileApi.getProfile();
      setProfile(p);
      setForm({
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
        phoneNumber: p.phoneNumber ?? '',
        address: p.address ?? '',
        city: p.city ?? '',
        state: p.state ?? '',
        country: p.country ?? '',
        bio: p.bio ?? '',
      });
      const docs = await profileApi.listDocuments();
      setDocuments(docs);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updated = await profileApi.updateProfile(form);
      setProfile(updated);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      await profileApi.uploadDocument(file, { description: docDesc, documentType: docType });
      setFile(null);
      setDocDesc('');
      setDocType('');
      await fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await profileApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete document');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto p-6 text-stone-300">Loading...</div>;
  if (error) return <div className="max-w-5xl mx-auto p-6 text-rose-400">{error}</div>;
  if (!profile) return <div className="max-w-5xl mx-auto p-6 text-stone-200">No profile</div>;

  const inputCls =
    'w-full rounded-md border border-stone-700 bg-stone-900/60 text-stone-100 placeholder-stone-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition';
  const cardCls = 'bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100';
  const titleCls = 'text-xl font-semibold text-amber-300 tracking-wide';
  const btnPrimary =
    'inline-flex items-center justify-center rounded-md bg-amber-600 text-stone-900 px-4 py-2 font-semibold hover:bg-amber-500 active:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition';
  const btnGhost =
    'inline-flex items-center justify-center rounded-md border border-stone-600 px-3 py-2 text-stone-200 hover:bg-stone-700/60 transition';
  const labelCls = 'text-sm text-stone-300 mb-1 block';

  // Build absolute URL for files served by backend (fileUrl is relative like /uploads/...)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const backendBase = apiBase.replace(/\/?api\/?$/, '');

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-amber-200">Hồ sơ</h1>

          <div className={`${cardCls} mb-6`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-stone-400">Username</div>
                <div className="font-medium text-stone-100">{profile.username}</div>
              </div>
              <div>
                <div className="text-stone-400">Email</div>
                <div className="font-medium text-stone-100">{profile.email}</div>
              </div>
            </div>
          </div>

          <form onSubmit={onSave} className={`${cardCls} mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={titleCls}>Chỉnh sửa hồ sơ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="firstName">Tên</label>
                <input id="firstName" className={inputCls} name="firstName" placeholder="Nhập tên" value={form.firstName || ''} onChange={onChange} />
              </div>
              <div>
                <label className={labelCls} htmlFor="lastName">Họ</label>
                <input id="lastName" className={inputCls} name="lastName" placeholder="Nhập họ" value={form.lastName || ''} onChange={onChange} />
              </div>
              <div>
                <label className={labelCls} htmlFor="phoneNumber">Số điện thoại</label>
                <input id="phoneNumber" className={inputCls} name="phoneNumber" placeholder="Ví dụ: +84123456789" value={form.phoneNumber || ''} onChange={onChange} />
              </div>
              <div>
                <label className={labelCls} htmlFor="address">Địa chỉ</label>
                <input id="address" className={inputCls} name="address" placeholder="Số nhà, đường" value={form.address || ''} onChange={onChange} />
              </div>
              <div>
                <label className={labelCls} htmlFor="country">Quốc gia</label>
                <input id="country" className={inputCls} name="country" placeholder="Quốc gia" value={form.country || ''} onChange={onChange} />
              </div>
              <div>
                <label className={labelCls} htmlFor="city">Thành phố</label>
                <input id="city" className={inputCls} name="city" placeholder="Thành phố" value={form.city || ''} onChange={onChange} />
              </div>
              <div>
                <label className={labelCls} htmlFor="state">Tỉnh/Quận</label>
                <input id="state" className={inputCls} name="state" placeholder="Tỉnh/Quận" value={form.state || ''} onChange={onChange} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="bio">Giới thiệu</label>
                <textarea id="bio" className={`${inputCls}`} rows={4} name="bio" placeholder="Mô tả ngắn về bạn" value={form.bio || ''} onChange={onChange} />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" className={btnGhost} onClick={fetchAll}>Đặt lại</button>
            </div>
          </form>

          <form onSubmit={onUpload} className={`${cardCls} mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={titleCls}>Tải tài liệu</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <input className={inputCls} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <input className={inputCls} placeholder="Description" value={docDesc} onChange={(e) => setDocDesc(e.target.value)} />
              <input className={inputCls} placeholder="Document type" value={docType} onChange={(e) => setDocType(e.target.value)} />
            </div>
            <div className="mt-4">
              <button type="submit" disabled={uploading || !file} className={btnPrimary}>
                {uploading ? 'Đang tải...' : 'Tải lên'}
              </button>
            </div>
          </form>

          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={titleCls}>Tài liệu</h2>
            </div>
            {documents.length === 0 && <div className="text-stone-300">Chưa có tài liệu</div>}
            <div className="divide-y divide-stone-700/60">
              {documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-stone-100">
                      {d.fileName} <span className="text-stone-400">({d.fileType}, {Math.round(d.fileSize / 1024)} KB)</span>
                    </div>
                    <div className="text-sm text-stone-400">{d.description || '-'} | {d.documentType || '-'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a className={btnGhost} href={`${backendBase}${d.fileUrl}`} target="_blank" rel="noreferrer">Mở</a>
                    <button type="button" className="inline-flex items-center justify-center rounded-md bg-rose-600/10 text-rose-300 border border-rose-500/30 px-3 py-2 hover:bg-rose-600/20 transition" onClick={() => onDelete(d.id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
