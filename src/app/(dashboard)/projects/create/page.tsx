"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { projectsApi, type CreateProjectDto } from '@/lib/projects/projects.api';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateProjectDto>({
    name: '',
    description: '',
    address: '',
    floorArea: 0,
    numberOfFloors: 1,
    budget: 0,
    startDate: '',
    estimatedCompletionDate: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim()) {
      setError('Tên dự án là bắt buộc');
      return;
    }
    if (!form.address.trim()) {
      setError('Địa chỉ là bắt buộc');
      return;
    }
    if (form.floorArea <= 0) {
      setError('Diện tích phải lớn hơn 0');
      return;
    }
    if (form.numberOfFloors <= 0) {
      setError('Số tầng phải lớn hơn 0');
      return;
    }
    if (form.budget <= 0) {
      setError('Ngân sách phải lớn hơn 0');
      return;
    }
    if (!form.startDate) {
      setError('Ngày bắt đầu là bắt buộc');
      return;
    }
    if (form.estimatedCompletionDate && new Date(form.estimatedCompletionDate) <= new Date(form.startDate)) {
      setError('Ngày hoàn thành dự kiến phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Convert date format to ISO string for backend
      const projectData = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        estimatedCompletionDate: form.estimatedCompletionDate 
          ? new Date(form.estimatedCompletionDate).toISOString() 
          : undefined
      };
      
      const project = await projectsApi.createProject(projectData);
      
      // Redirect to project detail page
      router.push(`/projects/${project.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-md border border-stone-700 bg-stone-900/60 text-stone-100 placeholder-stone-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition';
  const cardCls = 'bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100';
  const titleCls = 'text-xl font-semibold text-amber-300 tracking-wide';
  const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-amber-600 text-stone-900 px-4 py-2 font-semibold hover:bg-amber-500 active:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition';
  const btnGhost = 'inline-flex items-center justify-center rounded-md border border-stone-600 px-3 py-2 text-stone-200 hover:bg-stone-700/60 transition';
  const labelCls = 'text-sm text-stone-300 mb-1 block';

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-amber-200">Tạo dự án mới</h1>
          </div>

          <form onSubmit={onSubmit} className={cardCls}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={titleCls}>Thông tin dự án</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="name">Tên dự án *</label>
                <input
                  id="name"
                  className={inputCls}
                  name="name"
                  placeholder="Ví dụ: Nhà 3 tầng tại Đà Nẵng"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  className={`${inputCls} resize-none`}
                  rows={3}
                  name="description"
                  placeholder="Mô tả chi tiết về dự án"
                  value={form.description}
                  onChange={onChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="address">Địa chỉ *</label>
                <input
                  id="address"
                  className={inputCls}
                  name="address"
                  placeholder="Số nhà, đường, quận, thành phố"
                  value={form.address}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="floorArea">Diện tích (m²) *</label>
                <input
                  id="floorArea"
                  className={inputCls}
                  type="number"
                  name="floorArea"
                  min="0.1"
                  step="0.1"
                  placeholder="150.5"
                  value={form.floorArea || ''}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="numberOfFloors">Số tầng *</label>
                <input
                  id="numberOfFloors"
                  className={inputCls}
                  type="number"
                  name="numberOfFloors"
                  min="1"
                  placeholder="3"
                  value={form.numberOfFloors || ''}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="budget">Ngân sách (VND) *</label>
                <input
                  id="budget"
                  className={inputCls}
                  type="number"
                  name="budget"
                  min="1000000"
                  step="1000000"
                  placeholder="2000000000"
                  value={form.budget || ''}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="startDate">Ngày bắt đầu *</label>
                <input
                  id="startDate"
                  className={inputCls}
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="estimatedCompletionDate">Ngày hoàn thành dự kiến</label>
                <input
                  id="estimatedCompletionDate"
                  className={inputCls}
                  type="date"
                  name="estimatedCompletionDate"
                  value={form.estimatedCompletionDate}
                  onChange={onChange}
                  min={form.startDate}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? 'Đang tạo...' : 'Tạo dự án'}
              </button>
              <button 
                type="button" 
                className={btnGhost} 
                onClick={() => router.back()}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}