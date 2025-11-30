// Construction Site Diary Types

// ====== ENUMS (matching backend) ======
export enum ConstructionRating {
  Good = 0,
  Average = 1,
  Poor = 2,
}

export enum WeatherCondition {
  Sunny = 'sunny',
  Cloudy = 'cloudy',
  Rainy = 'rainy',
  Stormy = 'stormy',
}

export enum ImageCategory {
  Construction = 0,
  Incident = 1,
  Material = 2,
}

// ====== LABOR (Nhân công) ======
export interface LaborDto {
  id: string;
  name: string;
  position: string; // Vị trí: Thợ, phụ, v.v.
  hourlyRate?: number; // Đơn giá theo giờ
}

export interface DiaryLaborEntry {
  id: string;
  laborId: string;
  laborName: string;
  position?: string; // Vị trí: Thợ, phụ, v.v.
  workHours: string; // VD: "3.5/7"
  team: string; // VD: "Nhóm 2"
  shift: string; // VD: "7h00-17h00"
  quantity: number; // 2.9
  unit: string; // "Công"
}

// ====== EQUIPMENT (Máy thi công) ======
export interface EquipmentDto {
  id: string;
  name: string;
  specifications: string; // VD: "dung tích: 150 lít"
  category: string; // Loại máy
}

export interface DiaryEquipmentEntry {
  id: string;
  equipmentId: string;
  equipmentName: string;
  specifications: string;
  hoursUsed: number; // Số giờ sử dụng
  quantity: number;
  unit: string; // "ca"
}

// ====== MATERIAL DIARY (Nhật ký vật tư) ======
export interface MaterialSummary {
  id: string;
  name: string;
  code?: string;
  unit?: string;
  contractQuantity?: number;
  actualQuantity?: number;
}

export interface DiaryMaterialEntry {
  id: string;
  materialId: string;
  materialName: string;
  code?: string;
  unit: string;
  contractQuantity: number; // KL hợp đồng
  actualQuantity: number; // KL thực tế (có thể edit)
  variance?: number; // Chênh lệch %
}

// ====== WORK ITEM (Công việc) ======
export interface WorkItemSummary {
  id: string;
  name: string;
  code?: string;
  unit?: string;
  plannedQuantity?: number;
}

export interface DiaryWorkItemEntry {
  id: string;
  workItemId: string;
  workItemName: string;
  constructionArea: string; // Khu vực thi công
  plannedQuantity: number; // KL kế hoạch
  constructedQuantity: number; // KL thi công
  remainingQuantity: number; // Còn lại
  unit: string; // Đơn vị
  laborEntries: DiaryLaborEntry[];
  equipmentEntries: DiaryEquipmentEntry[];
}

// ====== WEATHER (Thời tiết) ======
export interface WeatherPeriod {
  period: 'morning' | 'afternoon' | 'evening' | 'night'; // Sáng, Chiều, Tối, Đêm
  condition: string; // Điều kiện
  temperature: string; // Nhiệt độ
}

// ====== IMAGES (Ảnh hiện trường) ======
export interface DiaryImage {
  id: string;
  url: string; // S3 URL or base64
  category: ImageCategory;
  description?: string;
  uploadedAt: string;
}

// ====== CONSTRUCTION RATINGS (Tình hình thi công) ======
export interface ConstructionAssessment {
  safety: ConstructionRating; // Công tác an toàn
  quality: ConstructionRating; // Chất lượng thi công
  progress: ConstructionRating; // Tiến độ thi công
  cleanliness: ConstructionRating; // Công tác vệ sinh
}

// ====== MAIN DIARY ENTRY ======
export interface ConstructionDiaryDto {
  id: string;
  projectId: string;
  diaryDate: string; // YYYY-MM-DD

  // Work Items Section
  workItems: DiaryWorkItemEntry[];

  // Material Diary Section
  materialEntries?: DiaryMaterialEntry[];

  // Diary Information Section
  team?: string; // Tổ đội thi công
  constructionTeam?: string; // Backend format
  weather?: WeatherPeriod[]; // 4 periods
  weatherPeriods?: WeatherPeriod[]; // Backend format
  assessment?: ConstructionAssessment;
  safetyRating?: number; // Backend format
  qualityRating?: number; // Backend format
  progressRating?: number; // Backend format
  cleanlinessRating?: number; // Backend format

  // Images
  images?: DiaryImage[];

  // Reports & Notes
  incidentReport?: string; // Báo cáo sự cố
  recommendations?: string; // Đề xuất - kiến nghị
  notes?: string; // Ghi chú

  // Metadata
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ====== CREATE/UPDATE DTOs ======
export interface CreateConstructionDiaryDto {
  projectId: string;
  diaryDate: string;
  workItems?: DiaryWorkItemEntry[];
  materialEntries?: DiaryMaterialEntry[];
  team?: string;
  weather?: WeatherPeriod[];
  assessment?: ConstructionAssessment;
  images?: DiaryImage[];
  incidentReport?: string;
  recommendations?: string;
  notes?: string;
}

export interface UpdateConstructionDiaryDto extends Partial<CreateConstructionDiaryDto> {
  id: string;
}

// ====== CALENDAR VIEW ======
export interface DiaryCalendarDay {
  date: string; // YYYY-MM-DD
  hasDiary: boolean;
  diaryId?: string;
  workItemsCount?: number;
}

// ====== RATING LABELS ======
export const ConstructionRatingLabels: Record<ConstructionRating, string> = {
  [ConstructionRating.Good]: 'Tốt',
  [ConstructionRating.Average]: 'Trung bình',
  [ConstructionRating.Poor]: 'Kém',
};

// ====== WEATHER PERIOD LABELS ======
export const WeatherPeriodLabels = {
  morning: 'Sáng',
  afternoon: 'Chiều',
  evening: 'Tối',
  night: 'Đêm',
} as const;

// ====== IMAGE CATEGORY LABELS ======
export const ImageCategoryLabels: Record<ImageCategory, string> = {
  [ImageCategory.Construction]: 'Thi công',
  [ImageCategory.Incident]: 'Sự cố',
  [ImageCategory.Material]: 'Vật liệu',
};
