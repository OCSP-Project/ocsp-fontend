'use client';

import { useState } from 'react';
import { DiaryImage, ImageCategory } from '@/types/construction-diary.types';

interface ImageUploadSectionProps {
  images: DiaryImage[];
  onChange: (images: DiaryImage[]) => void;
}

const CATEGORY_LABELS: Record<ImageCategory, string> = {
  [ImageCategory.Construction]: 'Thi công',
  [ImageCategory.Incident]: 'Sự cố',
  [ImageCategory.Material]: 'Vật liệu',
};

const CATEGORY_COLORS: Record<ImageCategory, string> = {
  [ImageCategory.Construction]: 'blue',
  [ImageCategory.Incident]: 'red',
  [ImageCategory.Material]: 'orange',
};

export function ImageUploadSection({ images, onChange }: ImageUploadSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>(ImageCategory.Construction);

  // Compress image to reduce base64 size (max 300x300, quality 0.5)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300; // Resize to max 300x300

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Canvas not supported');
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with quality 0.5 (50%)
          const base64 = canvas.toDataURL('image/jpeg', 0.5);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (category: ImageCategory, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: DiaryImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Compress image
        const compressedBase64 = await compressImage(file);

        const newImage: DiaryImage = {
          id: crypto.randomUUID(),
          category,
          url: compressedBase64,
          description: '',
          uploadedAt: new Date().toISOString(),
        };

        newImages.push(newImage);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Không thể xử lý ảnh. Vui lòng thử lại.');
      }
    }

    // Update all at once
    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
      onChange(images.filter(img => img.id !== id));
    }
  };

  const handleUpdateDescription = (id: string, description: string) => {
    onChange(images.map(img => img.id === id ? { ...img, description } : img));
  };

  const getCategoryImages = (category: ImageCategory) => {
    return images.filter(img => img.category === category);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl">
      <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-b border-slate-700/50 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ảnh hiện trường
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Category Tabs */}
        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
          {([ImageCategory.Construction, ImageCategory.Incident, ImageCategory.Material]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg font-medium transition-all
                ${selectedCategory === category
                  ? `bg-${CATEGORY_COLORS[category]}-500/20 text-${CATEGORY_COLORS[category]}-300 border border-${CATEGORY_COLORS[category]}-500/50`
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }
              `}
            >
              {CATEGORY_LABELS[category]} ({getCategoryImages(category).length})
            </button>
          ))}
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-8 text-center hover:border-slate-500/50 transition-colors">
          <input
            type="file"
            id={`image-upload-${selectedCategory}`}
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(selectedCategory, e.target.files)}
            className="hidden"
          />
          <label
            htmlFor={`image-upload-${selectedCategory}`}
            className="cursor-pointer block"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-slate-300 font-medium mb-1">
              Thêm ảnh {CATEGORY_LABELS[selectedCategory].toLowerCase()}
            </p>
            <p className="text-slate-500 text-sm">
              Kéo thả hoặc click để chọn ảnh
            </p>
          </label>
        </div>

        {/* Image Grid */}
        {getCategoryImages(selectedCategory).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {getCategoryImages(selectedCategory).map((image) => (
              <div
                key={image.id}
                className="relative group bg-slate-900/30 rounded-lg overflow-hidden border border-slate-700/30 hover:border-slate-600/50 transition-all"
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.description || 'Ảnh hiện trường'}
                    className="w-full h-full object-cover"
                  />

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Description */}
                <div className="p-2">
                  <input
                    type="text"
                    value={image.description || ''}
                    onChange={(e) => handleUpdateDescription(image.id, e.target.value)}
                    placeholder="Ghi chú cho ảnh..."
                    className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-600/50 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Chưa có ảnh {CATEGORY_LABELS[selectedCategory].toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );
}
