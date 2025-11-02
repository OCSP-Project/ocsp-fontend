# Chức năng 3D Model Tracking

## Tổng quan

Chức năng 3D Model Tracking cho phép theo dõi tiến độ thi công từng phần tử của công trình một cách trực quan thông qua mô hình 3D. Người dùng có thể click vào từng phần tử để xem thông tin chi tiết và cập nhật trạng thái thi công.

## Vị trí trong hệ thống

- **Route**: `/projects/[id]/3d-model`
- **File**: `src/app/(dashboard)/projects/[id]/3d-model/page.tsx`
- **Components**:
  - `src/components/features/projects/ModelViewer3D.tsx`
  - `src/components/features/projects/ComponentTrackingPanel.tsx`
- **API**: `src/lib/model-analysis/model-analysis.api.ts`
- **Types**: `src/types/model-tracking.types.ts`

## Tính năng chính

### 1. Mô hình 3D tương tác

- Hiển thị mô hình 3D của công trình
- Hỗ trợ điều khiển: xoay, zoom, di chuyển
- Click để chọn phần tử
- Màu sắc phân biệt trạng thái thi công

### 2. Theo dõi phần tử

- **Tường (Wall)**: Các bức tường của công trình
- **Cột (Column)**: Cột chống đỡ
- **Sàn (Slab)**: Sàn nhà các tầng
- **Dầm (Beam)**: Dầm kết cấu
- **Móng (Foundation)**: Phần móng
- **Mái (Roof)**: Phần mái nhà

### 3. Trạng thái thi công

- 🔴 **Chưa bắt đầu** (not_started): Màu đỏ
- 🟠 **Đang thi công** (in_progress): Màu cam
- 🟢 **Hoàn thành** (completed): Màu xanh

### 4. Chế độ xem

- **Bình thường**: Hiển thị mô hình như thiết kế
- **Tách rời**: Tách các tầng để dễ quan sát
- **Cắt ngang**: Xem mặt cắt ngang
- **X-ray**: Xem qua các lớp

### 5. Thống kê và báo cáo

- Tổng số phần tử
- Phân loại theo loại kết cấu
- Tỷ lệ hoàn thành
- Khối lượng tổng thể

## Cấu trúc dữ liệu

### BuildingElement

```typescript
interface BuildingElement {
  id: string;
  name: string;
  element_type: ComponentType;
  dimensions: { width; length; height };
  center: [x, y, z];
  volume_m3: number;
  floor_level: number;
  tracking_status: TrackingStatus;
  can_track: boolean;
}
```

### TrackingStatistics

```typescript
interface TrackingStatistics {
  total_elements: number;
  by_type: { walls; columns; slabs; beams };
  total_volume: number;
  by_status: { completed; in_progress; not_started };
  completion_percentage: number;
}
```

## Cách sử dụng

### Đối với Supervisor:

1. Truy cập vào dự án được phân công
2. Click vào "Mô hình 3D" trong sidebar
3. Sử dụng chuột để điều khiển mô hình:
   - Chuột trái: Xoay
   - Chuột phải: Di chuyển
   - Lăn chuột: Zoom
4. Click vào phần tử để chọn và xem thông tin
5. Cập nhật trạng thái thi công
6. Thêm ghi chú về tiến độ

### Đối với Homeowner:

1. Truy cập vào dự án của mình
2. Click vào "Mô hình 3D"
3. Xem tiến độ thi công trực quan
4. Theo dõi tỷ lệ hoàn thành

## API Endpoints

### Model Analysis API

- `POST /api/model-analysis/upload` - Upload file GLB
- `GET /api/model-analysis/projects/{id}/model` - Lấy thông tin mô hình
- `GET /api/model-analysis/models/{id}/elements` - Lấy danh sách phần tử
- `PATCH /api/model-analysis/elements/{id}/status` - Cập nhật trạng thái
- `GET /api/model-analysis/projects/{id}/statistics` - Lấy thống kê

## Dependencies

### Three.js

- **three**: ^0.158.0 - Thư viện 3D chính
- **@types/three**: ^0.158.0 - Type definitions

### Các module Three.js được sử dụng:

- `THREE.Scene` - Quản lý scene 3D
- `THREE.PerspectiveCamera` - Camera góc nhìn
- `THREE.WebGLRenderer` - Renderer WebGL
- `OrbitControls` - Điều khiển camera
- `GLTFLoader` - Load file GLB/GLTF

## Demo Data

Khi API chưa sẵn sàng, hệ thống sẽ tự động load demo data với:

- 20 phần tử mẫu
- Các loại: tường, cột, sàn
- Kích thước và vị trí ngẫu nhiên
- Trạng thái ban đầu: "chưa bắt đầu"

## Tính năng nâng cao (tương lai)

### 1. Upload mô hình GLB

- Cho phép upload file GLB từ phần mềm thiết kế
- Tự động phân tích và nhận diện phần tử
- Tạo mesh groups tự động

### 2. AI Analysis

- Sử dụng AI để nhận diện phần tử
- Phân loại tự động các thành phần
- Đề xuất lịch trình thi công

### 3. Real-time Updates

- Cập nhật trạng thái real-time
- Thông báo khi có thay đổi
- Đồng bộ với hệ thống giám sát

### 4. Mobile Support

- Hỗ trợ điều khiển trên mobile
- Touch gestures
- Responsive design

## Troubleshooting

### Lỗi thường gặp:

1. **Mô hình không hiển thị**: Kiểm tra file GLB có hợp lệ không
2. **Performance chậm**: Giảm số lượng phần tử hoặc độ phức tạp
3. **Click không hoạt động**: Kiểm tra raycasting và mesh setup

### Debug:

- Mở Developer Tools để xem console logs
- Kiểm tra network requests trong tab Network
- Sử dụng Three.js Inspector để debug scene

## Performance Tips

1. **Optimize meshes**: Sử dụng LOD (Level of Detail)
2. **Frustum culling**: Chỉ render phần tử trong tầm nhìn
3. **Instanced rendering**: Render nhiều phần tử cùng lúc
4. **Texture compression**: Nén texture để giảm dung lượng
5. **WebGL context**: Quản lý context để tránh memory leaks
