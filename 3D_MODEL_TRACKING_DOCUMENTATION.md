# 3D Model Tracking System - Comprehensive Technical Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Data Flow & System Integration](#data-flow--system-integration)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [Database Schema](#database-schema)
8. [Game Development Techniques](#game-development-techniques)
9. [Performance Optimizations](#performance-optimizations)
10. [API Reference](#api-reference)
11. [File Structure](#file-structure)

---

## System Overview

Hệ thống 3D Model Tracking là một nền tảng giám sát tiến độ xây dựng cho phép người dùng tải lên mô hình 3D dạng GLB, hiển thị chúng trong trình xem 3D tương tác, chọn các thành phần xây dựng riêng lẻ (cột, dầm, sàn, tường), và theo dõi tiến độ xây dựng theo thời gian với ảnh, ghi chú và phần trăm hoàn thành.

### Key Features

- **3D Model Upload & Validation**: Tải lên file GLB/glTF 2.0 với validation tự động
- **Interactive 3D Visualization**: Trình xem dựa trên Three.js với điều khiển camera, zoom, pan, rotation
- **Component Selection**: Click hoặc drag-select các building elements trong không gian 3D
- **Progress Tracking**: Ghi lại tiến độ hàng ngày với phần trăm, trạng thái, ảnh và ghi chú
- **Real-time Updates**: Hiển thị màu sắc dựa trên tracking status
- **Material Tracking**: Theo dõi lượng sử dụng xi măng, cát, cốt liệu cho mỗi component
- **Photo Evidence**: Tải lên nhiều ảnh cho mỗi tracking record với S3 storage
- **History Management**: Xem toàn bộ lịch sử tracking cho mỗi element

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Next.js 14 (React 18) - TypeScript                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │ ModelViewer3D │  │ ComponentPanel│  │ Project Pages│     │ │
│  │  │ (Three.js)    │  │ (Tracking UI) │  │              │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ASP.NET Core 8 Web API                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │ Controllers  │  │ Middleware   │  │ Auth/JWT     │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  OCSP.Application                                          │ │
│  │  ┌────────────────┐  ┌────────────────┐                   │ │
│  │  │ Services       │  │ DTOs           │                   │ │
│  │  │ - GLBValidator │  │ - Element DTOs │                   │ │
│  │  │ - ModelAnalysis│  │ - Tracking DTOs│                   │ │
│  │  │ - BuildingElem │  │ - Photo DTOs   │                   │ │
│  │  └────────────────┘  └────────────────┘                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE LAYER                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  OCSP.Infrastructure                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │ Repositories │  │ EF Core      │  │ File Storage │     │ │
│  │  │ - Elements   │  │ - DbContext  │  │ - S3 Service │     │ │
│  │  │ - Tracking   │  │ - Migrations │  │ - Local Storage    │ │
│  │  │ - Photos     │  │              │  │              │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌────────────────┐            ┌────────────────┐               │
│  │ PostgreSQL 15  │            │ AWS S3         │               │
│  │ - JSONB support│            │ - GLB files    │               │
│  │ - UUID primary │            │ - Photos       │               │
│  │   keys         │            │                │               │
│  └────────────────┘            └────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **Repository Pattern**: Trừu tượng hóa truy cập dữ liệu với các interface IRepository
2. **Service Layer Pattern**: Tách biệt business logic khỏi controllers
3. **DTO Pattern**: Data transfer objects cho API contracts
4. **Dependency Injection**: DI container tích hợp sẵn của ASP.NET Core
5. **Unit of Work**: Quản lý transaction trong ApplicationDbContext
6. **Observer Pattern**: React hooks cho state management (useState, useEffect, useCallback)
7. **Strategy Pattern**: Các chiến lược lưu trữ file khác nhau (S3 vs Local)
8. **Factory Pattern**: Tạo object Three.js trong ModelViewer3D

---

## Technology Stack

### Frontend Stack

#### Core Framework

- **Next.js 14.2.5**: Framework React với App Router, Server Components
- **React 18**: Thư viện UI dựa trên component
- **TypeScript 5.x**: Static typing cho JavaScript

#### 3D Graphics & Visualization

- **Three.js r168**: Thư viện render 3D dựa trên WebGL
  - `@react-three/fiber`: React renderer cho Three.js
  - `@react-three/drei`: Các helper hữu ích cho react-three-fiber
- **GLB/glTF 2.0**: Định dạng mô hình 3D nhị phân (Graphics Library Transmission Format)

#### UI Components & Styling

- **Tailwind CSS 3.4.1**: CSS framework utility-first
- **Lucide React**: Thư viện icon
- **Radix UI**: Headless UI components cho accessibility

#### State Management & Data Fetching

- **Axios**: HTTP client cho API requests
- **React Query (TanStack Query)**: Quản lý server state
- **Zustand**: State management nhẹ

### Backend Stack

#### Core Framework

- **.NET 8**: Framework hiện đại, đa nền tảng
- **ASP.NET Core 8**: Framework Web API
- **C# 12**: Ngôn ngữ lập trình

#### ORM & Database

- **Entity Framework Core 8**: Object-Relational Mapper
- **PostgreSQL 15**: Cơ sở dữ liệu quan hệ với hỗ trợ JSONB
- **Npgsql**: Driver PostgreSQL cho .NET

#### File Storage

- **AWS S3 SDK**: Cloud object storage
- **LocalFileStorage**: Fallback cho development

#### Authentication & Security

- **JWT (JSON Web Tokens)**: Xác thực stateless
- **ASP.NET Core Identity**: Framework quản lý user
- **BCrypt**: Băm mật khẩu

#### Validation & Serialization

- **System.Text.Json**: Serialization JSON hiệu năng cao
- **FluentValidation**: Thư viện validation object

### DevOps & Infrastructure

- **Docker**: Containerization
- **Docker Compose**: Điều phối multi-container
- **PostgreSQL Docker Image**: Containerization database
- **Nginx**: Reverse proxy (production)

---

## Data Flow & System Integration

### Complete Data Flow: Từ User Click đến Database và Quay Lại

#### Scenario 1: User Click vào Building Element trong 3D Viewer

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Tương tác User (Client-Side)                          │
└─────────────────────────────────────────────────────────────────┘
File: ocsp-fontend/src/components/features/projects/ModelViewer3D.tsx
Lines: 580-650

User click vào object 3D
    ▼
Hàm handleClick() được kích hoạt (dòng 580)
    ▼
Raycaster tính toán điểm giao nhau
    Code: raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(scene.children, true);
    ▼
Tìm index của mesh được click trong mảng modelData.vertices
    Lặp qua tất cả meshes để tìm mesh.uuid khớp
    ▼
Tìm BuildingElement tương ứng theo meshIndex
    Lọc buildingElements nơi element.meshIndices.includes(meshIndex)
    ▼
Cập nhật state selectedElement
    Code: setSelectedElement(element);
    ▼
Kích hoạt callback prop onElementSelect
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Cập nhật State Component (Client-Side)                    │
└─────────────────────────────────────────────────────────────────┘
File: ocsp-fontend/src/components/features/projects/ComponentTrackingPanel.tsx
Lines: 37-58

ComponentTrackingPanel nhận thay đổi prop selectedElement
    ▼
Hook useEffect được kích hoạt (dòng 37)
    ▼
Dependency: selectedElement đã thay đổi
    ▼
Gọi hàm async fetchElementDetail()
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: API Request (Client-Side)                               │
└─────────────────────────────────────────────────────────────────┘
File: ocsp-fontend/src/lib/building-elements/building-elements.api.ts
Lines: 25-33

buildingElementsApi.getDetail(selectedElement.id)
    ▼
Axios GET request
    URL: /api/building-elements/{id}/detail
    Headers: { Authorization: Bearer <JWT> }
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: HTTP Request (Network Layer)                            │
└─────────────────────────────────────────────────────────────────┘
HTTP GET https://api.example.com/api/building-elements/{guid}/detail
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: API Gateway (Server-Side)                               │
└─────────────────────────────────────────────────────────────────┘
File: OCSP.Backend/src/OCSP.API/Controllers/BuildingElementController.cs
Lines: 60-66

Request đến Controller endpoint
    ▼
Attribute [HttpGet("{id:guid}/detail")] định tuyến request
    ▼
Method GetDetail(Guid id) được gọi
    Code: public async Task<IActionResult> GetDetail(Guid id)
    ▼
JWT middleware xác thực token, trích xuất user claims
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Service Layer (Server-Side)                             │
└─────────────────────────────────────────────────────────────────┘
File: OCSP.Backend/src/OCSP.Application/Services/BuildingElementService.cs
Lines: 154-182

Controller gọi _service.GetDetailAsync(id)
    ▼
Method signature:
    public async Task<BuildingElementDetailDto?> GetDetailAsync(Guid id)
    ▼
Query 1: Lấy BuildingElement theo ID
    Code: var e = await _elements.GetByIdAsync(id);
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Repository Layer (Server-Side)                          │
└─────────────────────────────────────────────────────────────────┘
File: OCSP.Backend/src/OCSP.Infrastructure/Data/Repositories/BuildingElementRepository.cs
Lines: 20-25

Repository method: GetByIdAsync(Guid id)
    ▼
Entity Framework query:
    Code: return await _context.BuildingElements
                .Include(e => e.Model)
                .FirstOrDefaultAsync(e => e.Id == id);
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: Database Query (Data Layer)                             │
└─────────────────────────────────────────────────────────────────┘
PostgreSQL thực thi:
    SELECT * FROM "BuildingElements"
    WHERE "Id" = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    LIMIT 1;
    ▼
Trả về row với các cột:
    Id, ModelId, Name, ElementType, Width, Length, Height,
    CenterX, CenterY, CenterZ, VolumeM3, FloorLevel,
    TrackingStatus, CompletionPercentage, CanTrack, Color,
    MeshIndices (JSONB), CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: Quay lại Service Layer - Các Query Bổ Sung              │
└─────────────────────────────────────────────────────────────────┘
File: OCSP.Backend/src/OCSP.Application/Services/BuildingElementService.cs
Lines: 158-162

Query 2: Lấy tracking history
    Code: var histories = await _histories.GetByElementIdAsync(id);
    ▼
Database thực thi:
    SELECT * FROM "ElementTrackingHistory"
    WHERE "BuildingElementId" = '<guid>'
    ORDER BY "TrackingDate" DESC;
    ▼
Lấy record history mới nhất:
    Code: var latestHistory = histories.OrderByDescending(h => h.TrackingDate).FirstOrDefault();
    ▼
Query 3: Lấy photos cho history mới nhất
    Code: var photoEntities = await _photos.GetByHistoryIdAsync(latestHistory.Id);
    ▼
Database thực thi:
    SELECT * FROM "TrackingPhotos"
    WHERE "TrackingHistoryId" = '<guid>'
    ORDER BY "UploadedAt" DESC;
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 10: DTO Mapping (Server-Side)                              │
└─────────────────────────────────────────────────────────────────┘
File: OCSP.Backend/src/OCSP.Application/Services/BuildingElementService.cs
Lines: 164-180

Map entities sang DTOs:
    1. Map BuildingElement → BuildingElementDetailDto (các thuộc tính cơ bản)
    2. Map ElementTrackingHistory → TrackingHistoryDto (dòng 164)
        Code: LatestHistory = latestHistory == null ? null : MapHistory(latestHistory)
    3. Map TrackingPhoto[] → TrackingPhotoDto[] (dòng 165)
        Code: LatestPhotos = photoEntities.Select(MapPhoto).ToList()
    ▼
Helper MapHistory() (dòng 184-202):
    Map tất cả các thuộc tính tracking bao gồm PreviousPercentage, NewPercentage,
    NewStatus, PlannedQuantity, ActualQuantity, CementUsed, SandUsed,
    AggregateUsed, Notes, TrackingDate, RecordedById
    ▼
Helper MapPhoto() (dòng 204-217):
    Map các thuộc tính photo bao gồm PhotoUrl, Caption, FileSizeMB,
    FileType, Width, Height, UploadedAt
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 11: HTTP Response (Server-Side)                            │
└─────────────────────────────────────────────────────────────────┘
File: OCSP.Backend/src/OCSP.API/Controllers/BuildingElementController.cs
Lines: 64-65

Controller trả về DTO:
    Code: return Ok(detail);
    ▼
ASP.NET Core serialize sang JSON:
    System.Text.Json chuyển đổi BuildingElementDetailDto sang JSON
    ▼
HTTP Response:
    Status: 200 OK
    Content-Type: application/json
    Body:
    {
      "id": "guid",
      "modelId": "guid",
      "name": "Column C1-1",
      "elementType": 1,
      "floorLevel": 1,
      "meshIndicesJson": "[0,1,2,3]",
      "trackingStatus": 2,
      "completionPercentage": 75,
      "color": "#4ade80",
      "createdAt": "2024-01-15T10:30:00Z",
      "latestHistory": {
        "id": "guid",
        "buildingElementId": "guid",
        "trackingDate": "2024-01-20T08:00:00Z",
        "previousPercentage": 50,
        "newPercentage": 75,
        "previousStatus": 2,
        "newStatus": 2,
        "plannedQuantity": 10.5,
        "actualQuantity": 9.8,
        "cementUsed": 120.5,
        "sandUsed": 300.0,
        "aggregateUsed": 450.0,
        "notes": "Good progress today",
        "recordedById": "guid"
      },
      "latestPhotos": [
        {
          "id": "guid",
          "trackingHistoryId": "guid",
          "photoUrl": "https://s3.amazonaws.com/bucket/photo1.jpg",
          "caption": "Column after concrete pour",
          "fileSizeMB": 2.5,
          "fileType": "image/jpeg",
          "width": 1920,
          "height": 1080,
          "uploadedAt": "2024-01-20T08:15:00Z"
        }
      ]
    }
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 12: Xử lý API Response (Client-Side)                  │
└─────────────────────────────────────────────────────────────────┘
File: ocsp-fontend/src/lib/building-elements/building-elements.api.ts
Lines: 28-32

Axios nhận response
    ▼
Parse JSON response
    Code: const d = res.data;
    ▼
Transform data:
    1. Parse meshIndicesJson: safeParseJsonArray(d.meshIndicesJson)
    2. Map trackingStatus enum: mapTrackingStatus(d.trackingStatus)
    ▼
Trả về object đã transform
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 13: Cập nhật State (Client-Side)                             │
└─────────────────────────────────────────────────────────────────┘
File: ocsp-fontend/src/components/features/projects/ComponentTrackingPanel.tsx
Lines: 48-53

fetchElementDetail() resolve với data
    ▼
Cập nhật React state:
    Code: setElementDetail(detail);
          setCompletionPercentage(detail.completionPercentage || 0);
    ▼
Đặt loading thành false:
    Code: setLoading(false);
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 14: UI Re-render (Client-Side)                             │
└─────────────────────────────────────────────────────────────────┘
File: ocsp-fontend/src/components/features/projects/ComponentTrackingPanel.tsx
Lines: 173-221

React phát hiện thay đổi state elementDetail
    ▼
Component re-render
    ▼
Conditional rendering hiển thị tracking data:
    {selectedElement && elementDetail?.latestHistory && (
      <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/90">
        Hiển thị phần trăm hoàn thành với màu động
        Hiển thị ghi chú
        Hiển thị ảnh
      </div>
    )}
    ▼
User thấy:
    - Tên và loại element
    - Hoàn thành hiện tại: 75% (màu xanh lá)
    - Ngày cập nhật cuối
    - Ghi chú: "Good progress today"
    - Thumbnail ảnh
    ▼
FLOW HOÀN TẤT ✓
```

#### Scenario 2: User Lưu Tracking Progress

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Điền Form (Client-Side)                           │
└─────────────────────────────────────────────────────────────────┘
File: ComponentTrackingPanel.tsx
Lines: 139-165

User tương tác với form:
    1. Điều chỉnh slider phần trăm hoàn thành (0-100%)
    2. Nhập ghi chú vào textarea
    3. Tải lên file ảnh (File input)
    4. Click nút "Lưu" (Save)
    ▼
handleSave() được kích hoạt (dòng 78)
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Tạo Tracking Record (Client-Side)                    │
└─────────────────────────────────────────────────────────────────┘
File: ComponentTrackingPanel.tsx
Lines: 80-85

API Call 1: Tạo tracking history
    Code: const historyRes = await buildingElementsApi.createTracking({
            buildingElementId: selectedElement.id,
            newPercentage: completionPercentage,
            newStatus: completionPercentage === 100 ? 'completed' : 'in_progress',
            notes: notes,
          });
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: HTTP POST Request (Network)                             │
└─────────────────────────────────────────────────────────────────┘
POST /api/building-elements/tracking
Content-Type: application/json
Authorization: Bearer <JWT>

Body:
{
  "buildingElementId": "guid",
  "newPercentage": 75,
  "newStatus": "in_progress",
  "notes": "Good progress today"
}
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Controller Nhận Request (Server-Side)               │
└─────────────────────────────────────────────────────────────────┘
File: BuildingElementController.cs
Lines: 45-53

Endpoint [HttpPost("tracking")] được khớp
    ▼
CreateTracking(CreateTrackingRequest request) được gọi
    ▼
Trích xuất user ID từ JWT claims:
    Code: var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    ▼
Gọi service:
    Code: var result = await _service.CreateTrackingAsync(request, userId);
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Service Tạo History (Server-Side)                   │
└─────────────────────────────────────────────────────────────────┘
File: BuildingElementService.cs
Lines: 80-152

Method CreateTrackingAsync():
    ▼
Query 1: Lấy trạng thái element hiện tại
    Code: var element = await _elements.GetByIdAsync(request.BuildingElementId);
    ▼
Query 2: Lấy các histories hiện có
    Code: var existingHistories = await _histories.GetByElementIdAsync(request.BuildingElementId);
    ▼
Xác định trạng thái trước đó:
    Code: var previousPercentage = element.CompletionPercentage;
          var previousStatus = element.TrackingStatus;
    ▼
Tạo entity ElementTrackingHistory mới:
    Code: var history = new ElementTrackingHistory
          {
              Id = Guid.NewGuid(),
              BuildingElementId = request.BuildingElementId,
              TrackingDate = DateTime.UtcNow,
              PreviousPercentage = previousPercentage,
              NewPercentage = request.NewPercentage,
              PreviousStatus = previousStatus,
              NewStatus = MapTrackingStatus(request.NewStatus),
              PlannedQuantity = request.PlannedQuantity,
              ActualQuantity = request.ActualQuantity,
              CementUsed = request.CementUsed,
              SandUsed = request.SandUsed,
              AggregateUsed = request.AggregateUsed,
              Notes = request.Notes,
              RecordedById = userId,
              CreatedBy = userId,
              UpdatedBy = userId,
              CreatedAt = DateTime.UtcNow,
              UpdatedAt = DateTime.UtcNow
          };
    ▼
Repository lưu vào database:
    Code: await _histories.CreateAsync(history);
    ▼
Database thực thi INSERT:
    INSERT INTO "ElementTrackingHistory"
    ("Id", "BuildingElementId", "TrackingDate", "PreviousPercentage",
     "NewPercentage", "PreviousStatus", "NewStatus", "PlannedQuantity",
     "ActualQuantity", "CementUsed", "SandUsed", "AggregateUsed",
     "Notes", "RecordedById", "CreatedBy", "UpdatedBy", "CreatedAt", "UpdatedAt")
    VALUES (...)
    ▼
Cập nhật BuildingElement với trạng thái mới:
    Code: element.CompletionPercentage = request.NewPercentage;
          element.TrackingStatus = MapTrackingStatus(request.NewStatus);
          element.UpdatedBy = userId;
          element.UpdatedAt = DateTime.UtcNow;
    ▼
Repository cập nhật element:
    Code: await _elements.UpdateAsync(element);
    ▼
Database thực thi UPDATE:
    UPDATE "BuildingElements"
    SET "CompletionPercentage" = 75,
        "TrackingStatus" = 2,
        "UpdatedBy" = '<user-guid>',
        "UpdatedAt" = '2024-01-20T08:00:00Z'
    WHERE "Id" = '<element-guid>'
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Trả về Response (Server-Side)                           │
└─────────────────────────────────────────────────────────────────┘
Map sang DTO và trả về:
    Code: return MapHistory(history);
    ▼
HTTP Response:
    Status: 200 OK
    Body: { "id": "guid", "buildingElementId": "guid", ... }
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Upload Photos (Client-Side)                             │
└─────────────────────────────────────────────────────────────────┘
File: ComponentTrackingPanel.tsx
Lines: 87-95

Lặp qua selectedPhotos:
    Code: for (const file of selectedPhotos) {
            await buildingElementsApi.addPhoto(historyRes.id, file, `Photo ${idx + 1}`);
          }
    ▼
Với mỗi file ảnh:
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: API Call Upload Photo (Client-Side)                     │
└─────────────────────────────────────────────────────────────────┘
File: building-elements.api.ts
Lines: 70-80

addPhoto(historyId, file, caption):
    ▼
Tạo FormData:
    Code: const formData = new FormData();
          formData.append('photo', file);
          formData.append('caption', caption || '');
    ▼
POST multipart/form-data:
    URL: /api/building-elements/tracking/{historyId}/photos/upload
    Headers: { Content-Type: multipart/form-data }
    Body: FormData với binary file
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: Photo Upload Endpoint (Server-Side)                     │
└─────────────────────────────────────────────────────────────────┘
File: BuildingElementController.cs
Lines: 55-58

Endpoint [HttpPost("tracking/{historyId:guid}/photos/upload")] được khớp
    ▼
UploadPhoto(Guid historyId, IFormFile photo, string? caption) được gọi
    ▼
Validate file:
    - Kiểm tra file không null
    - Kiểm tra kích thước file (tối đa 10MB)
    - Kiểm tra loại file (image/jpeg, image/png)
    ▼
Gọi service:
    Code: var result = await _service.UploadPhotoAsync(historyId, photo, caption, userId);
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 10: File Storage (Server-Side)                             │
└─────────────────────────────────────────────────────────────────┘
File: BuildingElementService.cs
Lines: 219-260

Method UploadPhotoAsync():
    ▼
Tạo tên file duy nhất:
    Code: var fileName = $"{historyId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{photo.FileName}";
    ▼
Upload lên S3 (production) hoặc local storage (development):
    Code: var photoUrl = await _fileStorage.UploadFileAsync(photo, "tracking-photos", fileName);
    ▼
File: S3FileStorageService.cs hoặc LocalFileStorageService.cs
    ▼
S3 Upload (production):
    1. Tạo PutObjectRequest với bucket name, key, file stream
    2. Đặt ContentType dựa trên file extension
    3. Gọi _s3Client.PutObjectAsync(request)
    4. Trả về S3 URL: https://s3.amazonaws.com/bucket-name/tracking-photos/filename.jpg
    ▼
Tạo entity TrackingPhoto:
    Code: var photoEntity = new TrackingPhoto
          {
              Id = Guid.NewGuid(),
              TrackingHistoryId = historyId,
              PhotoUrl = photoUrl,
              Caption = caption,
              FileSizeMB = photo.Length / 1024m / 1024m,
              FileType = photo.ContentType,
              Width = null,  // Can be extracted from image metadata if needed
              Height = null,
              UploadedAt = DateTime.UtcNow,
              CreatedBy = userId,
              UpdatedBy = userId,
              CreatedAt = DateTime.UtcNow,
              UpdatedAt = DateTime.UtcNow
          };
    ▼
Lưu vào database:
    Code: await _photos.CreateAsync(photoEntity);
    ▼
Database thực thi INSERT:
    INSERT INTO "TrackingPhotos"
    ("Id", "TrackingHistoryId", "PhotoUrl", "Caption", "FileSizeMB",
     "FileType", "Width", "Height", "UploadedAt", "CreatedBy",
     "UpdatedBy", "CreatedAt", "UpdatedAt")
    VALUES (...)
    ▼
Trả về DTO:
    Code: return MapPhoto(photoEntity);
    ▼

┌─────────────────────────────────────────────────────────────────┐
│ STEP 11: Refresh UI (Client-Side)                               │
└─────────────────────────────────────────────────────────────────┘
File: ComponentTrackingPanel.tsx
Lines: 105-106

Sau khi tất cả photos upload thành công:
    ▼
Refetch element details:
    Code: const updatedDetail = await buildingElementsApi.getDetail(selectedElement.id);
          setElementDetail(updatedDetail);
    ▼
Kích hoạt ModelViewer3D để cập nhật màu:
    Code: onUpdateElement?.();
    ▼
File: ModelViewer3D.tsx
Lines: 445-460

Callback onUpdateElement kích hoạt refetch của buildingElements
    ▼
Màu mới được áp dụng cho 3D meshes dựa trên trackingStatus đã cập nhật
    ▼
User thấy:
    - Phần trăm hoàn thành đã cập nhật (75%)
    - Màu mới trong 3D viewer (cam cho in_progress)
    - Ghi chú đã lưu được hiển thị
    - Thumbnail ảnh được hiển thị
    ▼
SAVE FLOW HOÀN TẤT ✓
```

---

## Frontend Implementation

### Core 3D Visualization Component

#### File: ModelViewer3D.tsx

**Path**: `ocsp-fontend/src/components/features/projects/ModelViewer3D.tsx`
**Lines**: 1-1557
**Purpose**: Trình xem mô hình 3D chính sử dụng Three.js cho visualization tương tác

##### Key Technologies Used

**Three.js Core Classes**:

- `THREE.Scene`: Container cho tất cả các 3D objects
- `THREE.PerspectiveCamera`: Mô phỏng góc nhìn mắt người
- `THREE.WebGLRenderer`: Render scene sử dụng WebGL
- `THREE.Raycaster`: Thực hiện kiểm tra giao nhau ray-triangle cho mouse picking
- `THREE.BufferGeometry`: Lưu trữ geometry hiệu quả
- `THREE.Mesh`: Kết hợp geometry + material
- `THREE.MeshStandardMaterial`: Material PBR (Physically Based Rendering)
- `THREE.Group`: Nhóm nhiều meshes lại với nhau
- `THREE.Box3`: Axis-aligned bounding box cho tính toán
- `THREE.Vector3`: Toán học vector 3D
- `THREE.Matrix4`: Ma trận biến đổi 4x4

**Camera Controls**:

- `OrbitControls` từ three-stdlib: Cho phép mouse orbit, zoom, pan

**Loaders**:

- `GLTFLoader`: Tải file mô hình 3D GLB/glTF
- `DRACOLoader`: Giải nén geometry được nén DRACO (để giảm kích thước file)

##### Component Structure

```typescript
// Lines 1-50: Imports and Type Definitions
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Type definitions for props
interface ModelViewer3DProps {
  modelUrl: string; // S3 URL to GLB file
  buildingElements: BuildingElement[]; // Array of building components
  selectedElement: BuildingElement | null;
  onElementSelect: (element: BuildingElement | null) => void;
  selectionMode: "click" | "drag"; // Selection interaction mode
  onUpdateElement?: () => void; // Callback after changes
}

// Lines 120-180: State Management with useRef hooks
const containerRef = useRef<HTMLDivElement>(null);
const sceneRef = useRef<THREE.Scene | null>(null);
const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
const controlsRef = useRef<OrbitControls | null>(null);
const modelGroupRef = useRef<THREE.Group | null>(null);
const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
const octreeRef = useRef<Octree | null>(null);
const pickingSceneRef = useRef<THREE.Scene | null>(null);
const pickingTextureRef = useRef<THREE.WebGLRenderTarget | null>(null);

// Lines 200-350: Scene Initialization
useEffect(() => {
  if (!containerRef.current) return;

  // Tạo scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  sceneRef.current = scene;

  // Tạo camera (FOV: 60°, aspect ratio, near: 0.1m, far: 2000m)
  const camera = new THREE.PerspectiveCamera(
    60,
    containerRef.current.clientWidth / containerRef.current.clientHeight,
    0.1,
    2000
  );
  camera.position.set(50, 50, 50);
  cameraRef.current = camera;

  // Tạo WebGL renderer với anti-aliasing
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(
    containerRef.current.clientWidth,
    containerRef.current.clientHeight
  );
  renderer.setPixelRatio(window.devicePixelRatio); // Hỗ trợ màn hình retina
  containerRef.current.appendChild(renderer.domElement);
  rendererRef.current = renderer;

  // Thêm orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Chuyển động camera mượt mà
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false; // Pan vuông góc với camera
  controls.minDistance = 10; // Zoom tối thiểu
  controls.maxDistance = 500; // Zoom tối đa
  controlsRef.current = controls;

  // Thêm ánh sáng
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  // Thêm grid helper (lưới 1000x1000 với 50 divisions)
  const gridHelper = new THREE.GridHelper(1000, 50, 0x888888, 0xcccccc);
  scene.add(gridHelper);

  // Vòng lặp animation
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // Cleanup khi unmount
  return () => {
    renderer.dispose();
    controls.dispose();
    containerRef.current?.removeChild(renderer.domElement);
  };
}, []);

// Lines 400-520: GLB Model Loading
useEffect(() => {
  if (!sceneRef.current || !modelUrl) return;

  const loader = new GLTFLoader();

  // Thiết lập DRACO decoder cho geometry được nén
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/"); // Đường dẫn đến file WASM decoder
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    modelUrl,
    (gltf) => {
      // Callback thành công
      const model = gltf.scene;

      // Trích xuất tất cả dữ liệu mesh
      const meshes: THREE.Mesh[] = [];
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child);
        }
      });

      // Căn giữa model tại gốc tọa độ
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Scale model để vừa với view
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 100 / maxDim; // Kích thước mục tiêu: 100 units
      model.scale.multiplyScalar(scale);

      // Thêm vào scene
      sceneRef.current!.add(model);
      modelGroupRef.current = model;

      // Xây dựng Octree cho spatial partitioning (tối ưu hiệu năng)
      const octree = new Octree();
      octree.fromGraphNode(model);
      octreeRef.current = octree;

      // Xây dựng GPU picking scene cho selection được tăng tốc phần cứng
      buildPickingScene(meshes);
    },
    (xhr) => {
      // Callback tiến trình
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      // Callback lỗi
      console.error("Error loading model:", error);
    }
  );
}, [modelUrl]);

// Lines 580-650: Raycasting cho Element Selection (Click Mode)
const handleClick = useCallback(
  (event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current || !containerRef.current)
      return;
    if (selectionMode !== "click") return;

    // Tính toán vị trí chuột trong normalized device coordinates (-1 đến +1)
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Cập nhật raycaster
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Giao nhau với các objects trong scene
    const intersects = raycaster.intersectObjects(
      sceneRef.current.children,
      true // Recursive
    );

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as THREE.Mesh;

      // Tìm index của mesh trong mảng modelData.vertices
      let meshIndex = -1;
      modelGroupRef.current?.traverse((child, index) => {
        if (child instanceof THREE.Mesh && child.uuid === clickedMesh.uuid) {
          meshIndex = index;
        }
      });

      // Tìm BuildingElement tương ứng
      const element = buildingElements.find((el) =>
        el.meshIndices.includes(meshIndex)
      );

      if (element) {
        // Highlight element được chọn
        highlightElement(element);
        onElementSelect(element);
      } else {
        // Xóa selection
        clearHighlight();
        onElementSelect(null);
      }
    }
  },
  [buildingElements, selectionMode, onElementSelect]
);

// Lines 700-850: Color Mapping Dựa trên Tracking Status
const getStatusColor = (status: TrackingStatus | string): number => {
  const colors: Record<string, number> = {
    not_started: 0xef5350, // Red (#ef5350)
    in_progress: 0xffa726, // Orange (#ffa726)
    completed: 0x4caf50, // Green (#4caf50)
    on_hold: 0xff6f00, // Dark Orange (#ff6f00)
  };
  return colors[status] || 0xcccccc; // Mặc định: Gray
};

// Áp dụng màu cho tất cả meshes dựa trên BuildingElement.trackingStatus
useEffect(() => {
  if (!modelGroupRef.current) return;

  buildingElements.forEach((element) => {
    const color = getStatusColor(element.trackingStatus);

    element.meshIndices.forEach((meshIndex) => {
      let currentIndex = 0;
      modelGroupRef.current?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (currentIndex === meshIndex) {
            // Cập nhật màu material của mesh
            const material = child.material as THREE.MeshStandardMaterial;
            material.color.setHex(color);
            material.needsUpdate = true;
          }
          currentIndex++;
        }
      });
    });
  });
}, [buildingElements]);

// Lines 900-1050: Drag Selection với Box Helper
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState<THREE.Vector2 | null>(null);
const [dragEnd, setDragEnd] = useState<THREE.Vector2 | null>(null);
const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);

const handleMouseDown = useCallback(
  (event: MouseEvent) => {
    if (selectionMode !== "drag") return;

    const rect = containerRef.current!.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    setIsDragging(true);
    setDragStart(mouse.clone());
    setDragEnd(mouse.clone());
  },
  [selectionMode]
);

const handleMouseMove = useCallback(
  (event: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const rect = containerRef.current!.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    setDragEnd(mouse.clone());

    // Vẽ selection box trong screen space
    updateSelectionBox(dragStart, mouse);
  },
  [isDragging, dragStart]
);

const handleMouseUp = useCallback(() => {
  if (!isDragging || !dragStart || !dragEnd) return;

  // Thực hiện frustum selection
  const selected = performFrustumSelection(dragStart, dragEnd);

  if (selected.length > 0) {
    onElementSelect(selected); // Multi-select
  }

  setIsDragging(false);
  setDragStart(null);
  setDragEnd(null);
  clearSelectionBox();
}, [isDragging, dragStart, dragEnd]);

// Lines 1100-1200: Octree Spatial Partitioning (Phase 2 Optimization)
/**
 * Octree: Hierarchical space partitioning data structure
 * Divides 3D space into 8 octants recursively
 *
 * Benefits:
 * - Accelerates ray-object intersection tests
 * - Reduces complexity from O(n) to O(log n) for spatial queries
 * - Used in games for collision detection, frustum culling
 *
 * Implementation:
 * 1. Build octree from model geometry
 * 2. Use for raycasting instead of iterating all meshes
 */

class Octree {
  private box: THREE.Box3;
  private children: Octree[] = [];
  private objects: THREE.Object3D[] = [];
  private maxDepth = 8;
  private maxObjects = 10;

  constructor(box?: THREE.Box3) {
    this.box = box || new THREE.Box3();
  }

  fromGraphNode(node: THREE.Object3D) {
    // Tính toán bounding box của toàn bộ model
    this.box.setFromObject(node);
    this.addObject(node, 0);
  }

  private addObject(object: THREE.Object3D, depth: number) {
    if (depth >= this.maxDepth || this.objects.length < this.maxObjects) {
      this.objects.push(object);
      return;
    }

    // Chia nhỏ thành 8 octants nếu cần
    if (this.children.length === 0) {
      this.subdivide();
    }

    // Thêm object vào octant(s) phù hợp
    const objectBox = new THREE.Box3().setFromObject(object);
    for (const child of this.children) {
      if (child.box.intersectsBox(objectBox)) {
        child.addObject(object, depth + 1);
      }
    }
  }

  private subdivide() {
    const { min, max } = this.box;
    const center = this.box.getCenter(new THREE.Vector3());

    // Tạo 8 child octants
    const boxes = [
      new THREE.Box3(min, center),
      new THREE.Box3(
        new THREE.Vector3(center.x, min.y, min.z),
        new THREE.Vector3(max.x, center.y, center.z)
      ),
      // ... 6 octants nữa
    ];

    this.children = boxes.map((box) => new Octree(box));
  }

  rayIntersect(raycaster: THREE.Raycaster): THREE.Intersection[] {
    const results: THREE.Intersection[] = [];

    // Thoát sớm nếu ray không giao với octree box
    if (!raycaster.ray.intersectsBox(this.box)) {
      return results;
    }

    // Kiểm tra objects trong octant này
    for (const obj of this.objects) {
      const intersects = raycaster.intersectObject(obj, true);
      results.push(...intersects);
    }

    // Kiểm tra children một cách đệ quy
    for (const child of this.children) {
      results.push(...child.rayIntersect(raycaster));
    }

    return results;
  }
}

// Lines 1250-1400: GPU Picking (Phase 2 Optimization)
/**
 * GPU Picking: Selection object được tăng tốc phần cứng
 *
 * CPU raycasting truyền thống: O(n) kiểm tra giao nhau tam giác
 * GPU picking: O(1) tra cứu pixel sử dụng render pass mã hóa màu
 *
 * Thuật toán:
 * 1. Render scene lên offscreen texture
 * 2. Gán màu duy nhất cho mỗi object có thể chọn
 * 3. Khi click chuột, đọc màu pixel tại vị trí cursor
 * 4. Map màu trở lại object ID
 *
 * Lợi ích:
 * - Selection thời gian hằng số bất kể độ phức tạp scene
 * - Tận dụng song song hóa GPU
 * - Được sử dụng trong phần mềm 3D modeling (Blender, Maya)
 */

const buildPickingScene = (meshes: THREE.Mesh[]) => {
  const pickingScene = new THREE.Scene();
  const pickingTexture = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight
  );
  pickingTexture.texture.minFilter = THREE.NearestFilter;
  pickingTexture.texture.magFilter = THREE.NearestFilter;

  // Tạo picking materials với màu duy nhất
  meshes.forEach((mesh, index) => {
    const pickingMaterial = new THREE.MeshBasicMaterial({
      color: index + 1, // Bắt đầu từ 1 (0 là background)
    });

    const pickingMesh = new THREE.Mesh(mesh.geometry, pickingMaterial);
    pickingMesh.position.copy(mesh.position);
    pickingMesh.rotation.copy(mesh.rotation);
    pickingMesh.scale.copy(mesh.scale);
    pickingMesh.userData.originalIndex = index;

    pickingScene.add(pickingMesh);
  });

  pickingSceneRef.current = pickingScene;
  pickingTextureRef.current = pickingTexture;
};

const pickObjectByGPU = (mouse: THREE.Vector2): number => {
  if (!pickingSceneRef.current || !pickingTextureRef.current) return -1;
  if (!rendererRef.current || !cameraRef.current) return -1;

  // Render picking scene lên offscreen buffer
  rendererRef.current.setRenderTarget(pickingTextureRef.current);
  rendererRef.current.render(pickingSceneRef.current, cameraRef.current);

  // Đọc pixel tại vị trí chuột
  const pixelBuffer = new Uint8Array(4);
  const x = Math.floor(((mouse.x + 1) / 2) * pickingTextureRef.current.width);
  const y = Math.floor(((mouse.y + 1) / 2) * pickingTextureRef.current.height);

  rendererRef.current.readRenderTargetPixels(
    pickingTextureRef.current,
    x,
    y,
    1,
    1,
    pixelBuffer
  );

  // Khôi phục main render target
  rendererRef.current.setRenderTarget(null);

  // Chuyển đổi RGB sang object ID
  const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];
  return id - 1; // Trừ 1 vì chúng ta bắt đầu từ 1
};

// Lines 1450-1557: Performance Monitoring & Cleanup
useEffect(() => {
  // Bộ đếm FPS cho giám sát hiệu năng
  let frameCount = 0;
  let lastTime = performance.now();

  const measureFPS = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(measureFPS);
  };

  measureFPS();
}, []);

// Cleanup khi unmount
useEffect(() => {
  return () => {
    // Dispose geometries và materials để tránh memory leaks
    modelGroupRef.current?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    // Dispose render targets
    pickingTextureRef.current?.dispose();

    // Xóa event listeners
    window.removeEventListener("click", handleClick);
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
}, []);
```

---

### Component Tracking Panel

#### File: ComponentTrackingPanel.tsx

**Path**: `ocsp-fontend/src/components/features/projects/ComponentTrackingPanel.tsx`
**Lines**: 1-300
**Purpose**: Panel UI để ghi lại tracking progress

##### Component Workflow

```typescript
// Lines 1-35: Imports and Props
import { useState, useEffect, useCallback } from "react";
import { buildingElementsApi } from "@/lib/building-elements/building-elements.api";
import type {
  BuildingElement,
  BuildingElementDetailDto,
} from "@/types/building-elements";

interface Props {
  selectedElement: BuildingElement | null;
  onUpdateElement?: () => void;
}

// Lines 37-77: State Management
export function ComponentTrackingPanel({
  selectedElement,
  onUpdateElement,
}: Props) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [elementDetail, setElementDetail] =
    useState<BuildingElementDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lấy dữ liệu element chi tiết khi selection thay đổi
  useEffect(() => {
    const fetchElementDetail = async () => {
      if (!selectedElement) {
        setElementDetail(null);
        return;
      }

      setLoading(true);
      try {
        const detail = await buildingElementsApi.getDetail(selectedElement.id);
        setElementDetail(detail);
        setCompletionPercentage(detail.completionPercentage || 0);
      } catch (error) {
        console.error("Error fetching element detail:", error);
        setCompletionPercentage(selectedElement.completion_percentage || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchElementDetail();
  }, [selectedElement]);

  // Lines 78-110: Save Handler
  const handleSave = async () => {
    if (!selectedElement) return;

    setSaving(true);
    try {
      // Bước 1: Tạo tracking record
      const historyRes = await buildingElementsApi.createTracking({
        buildingElementId: selectedElement.id,
        newPercentage: completionPercentage,
        newStatus: completionPercentage === 100 ? "completed" : "in_progress",
        notes: notes,
      });

      // Bước 2: Upload photos
      for (let idx = 0; idx < selectedPhotos.length; idx++) {
        const file = selectedPhotos[idx];
        await buildingElementsApi.addPhoto(
          historyRes.id,
          file,
          `Photo ${idx + 1}`
        );
      }

      // Bước 3: Refresh UI
      const updatedDetail = await buildingElementsApi.getDetail(
        selectedElement.id
      );
      setElementDetail(updatedDetail);
      onUpdateElement?.(); // Kích hoạt cập nhật màu 3D viewer

      // Bước 4: Reset form
      setNotes("");
      setSelectedPhotos([]);

      alert("Lưu thành công!");
    } catch (error) {
      console.error("Error saving tracking:", error);
      alert("Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Lines 120-127: Color Helper (Inline Style)
  const getPercentageColorHex = (percentage: number) => {
    if (percentage === 0) return "#ef4444"; // red-500
    if (percentage <= 25) return "#ea580c"; // orange-600
    if (percentage <= 50) return "#f97316"; // orange-500
    if (percentage <= 75) return "#eab308"; // yellow-500
    if (percentage < 100) return "#4ade80"; // green-400
    return "#22c55e"; // green-500
  };

  // Lines 139-165: Form UI
  return (
    <div className="h-full flex flex-col p-4">
      {selectedElement ? (
        <>
          <h2 className="text-xl font-bold mb-4">{selectedElement.name}</h2>

          {/* Completion Percentage Slider */}
          <div className="mb-4">
            <label className="block mb-2">
              Hoàn thành:
              <span
                style={{ color: getPercentageColorHex(completionPercentage) }}
                className="font-bold ml-2"
              >
                {completionPercentage}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={completionPercentage}
              onChange={(e) =>
                setCompletionPercentage(parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>

          {/* Notes Textarea */}
          <div className="mb-4">
            <label className="block mb-2">Ghi chú:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded p-2"
              rows={4}
              placeholder="Nhập ghi chú về tiến độ..."
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="block mb-2">Hình ảnh chứng minh:</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedPhotos(files);
              }}
              className="w-full"
            />
            {selectedPhotos.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {selectedPhotos.length} ảnh đã chọn
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>

          {/* Lines 173-221: Display Saved Tracking Data */}
          {elementDetail?.latestHistory && (
            <div className="mt-6 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 rounded-xl p-5 border border-blue-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                📋 Tracking hiện tại
              </h3>

              {/* Current Percentage */}
              <div className="mb-3">
                <span className="text-sm text-gray-600">Hoàn thành: </span>
                <span
                  style={{
                    color: getPercentageColorHex(
                      elementDetail.latestHistory.newPercentage
                    ),
                  }}
                  className="text-2xl font-bold"
                >
                  {elementDetail.latestHistory.newPercentage}%
                </span>
              </div>

              {/* Last Update Date */}
              <div className="mb-3 text-sm text-gray-600">
                Cập nhật lần cuối:{" "}
                {new Date(
                  elementDetail.latestHistory.trackingDate
                ).toLocaleDateString("vi-VN")}
              </div>

              {/* Notes */}
              {elementDetail.latestHistory.notes && (
                <div className="mb-3 bg-white/60 rounded p-3">
                  <span className="text-sm font-medium text-gray-700">
                    Ghi chú:
                  </span>
                  <p className="text-sm text-gray-800 mt-1">
                    {elementDetail.latestHistory.notes}
                  </p>
                </div>
              )}

              {/* Photos */}
              {elementDetail.latestPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {elementDetail.latestPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photoUrl}
                        alt={photo.caption || "Tracking photo"}
                        className="w-full h-24 object-cover rounded border border-gray-300 group-hover:opacity-75 transition"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Chọn một thành phần trong mô hình 3D để tracking
        </div>
      )}
    </div>
  );
}
```

---

## Backend Implementation

### GLB File Validation Service

#### File: GLBValidatorService.cs

**Path**: `OCSP.Backend/src/OCSP.Application/Services/GLBValidatorService.cs`
**Lines**: 1-135
**Purpose**: Validate định dạng nhị phân GLB và trích xuất metadata

##### GLB File Format Structure

```
GLB File Structure (Binary):
┌────────────────────────────────────────────────────────┐
│ HEADER (12 bytes)                                      │
├────────────────────────────────────────────────────────┤
│ magic (4 bytes):    0x46546C67 ("glTF" in ASCII)      │
│ version (4 bytes):  2 (GLB version 2.0)               │
│ length (4 bytes):   Total file size in bytes          │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ CHUNK 0: JSON (Variable length)                        │
├────────────────────────────────────────────────────────┤
│ chunkLength (4 bytes):  JSON chunk size               │
│ chunkType (4 bytes):    0x4E4F534A ("JSON")           │
│ chunkData:             JSON metadata                   │
│   {                                                    │
│     "asset": { "version": "2.0" },                    │
│     "scene": 0,                                        │
│     "scenes": [...],                                   │
│     "nodes": [...],                                    │
│     "meshes": [                                        │
│       {                                                │
│         "primitives": [                                │
│           {                                            │
│             "attributes": {                            │
│               "POSITION": 0,                           │
│               "NORMAL": 1                              │
│             },                                         │
│             "indices": 2,                              │
│             "material": 0                              │
│           }                                            │
│         ]                                              │
│       }                                                │
│     ],                                                 │
│     "buffers": [...],                                  │
│     "bufferViews": [...],                              │
│     "accessors": [...]                                 │
│   }                                                    │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ CHUNK 1: BIN (Variable length)                         │
├────────────────────────────────────────────────────────┤
│ chunkLength (4 bytes):  Binary chunk size             │
│ chunkType (4 bytes):    0x004E4942 ("BIN\0")          │
│ chunkData:             Binary geometry data            │
│   - Vertex positions (float arrays)                   │
│   - Normals (float arrays)                            │
│   - Texture coordinates (float arrays)                │
│   - Indices (uint arrays)                             │
└────────────────────────────────────────────────────────┘
```

##### Validation Implementation

```csharp
// Lines 1-20: Class Definition and Constants
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using OCSP.Application.Interfaces;

namespace OCSP.Application.Services
{
    public class GLBValidatorService : IGLBValidatorService
    {
        private const uint GLB_MAGIC = 0x46546C67;  // "glTF" in ASCII
        private const uint JSON_CHUNK_TYPE = 0x4E4F534A;  // "JSON"
        private const uint BIN_CHUNK_TYPE = 0x004E4942;   // "BIN\0"
        private const long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

        // Lines 22-135: Validation Method
        public async Task<GLBValidationResult> ValidateGLBFileAsync(
            IFormFile file,
            CancellationToken cancellationToken = default)
        {
            // Validation 1: File tồn tại
            if (file == null || file.Length == 0)
            {
                return new GLBValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "File is empty or null"
                };
            }

            // Validation 2: Kích thước file
            if (file.Length > MAX_FILE_SIZE)
            {
                return new GLBValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"File size exceeds maximum allowed size of {MAX_FILE_SIZE / 1024 / 1024} MB"
                };
            }

            // Validation 3: Extension file
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != ".glb")
            {
                return new GLBValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "File must have .glb extension"
                };
            }

            // Parse nhị phân
            using var stream = file.OpenReadStream();
            using var reader = new BinaryReader(stream);

            try
            {
                // Đọc header (12 bytes)
                var magic = reader.ReadUInt32();
                var version = reader.ReadUInt32();
                var length = reader.ReadUInt32();

                // Validation 4: Magic number
                if (magic != GLB_MAGIC)
                {
                    return new GLBValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = $"Invalid GLB file: wrong magic number. Expected {GLB_MAGIC:X}, got {magic:X}"
                    };
                }

                // Validation 5: Version
                if (version != 2)
                {
                    return new GLBValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = $"Unsupported GLB version: {version}. Only version 2 is supported."
                    };
                }

                // Validation 6: Độ dài file
                if (length != file.Length)
                {
                    return new GLBValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = $"File length mismatch. Header says {length} bytes, actual file is {file.Length} bytes"
                    };
                }

                // Đọc JSON chunk
                var jsonChunkLength = reader.ReadUInt32();
                var jsonChunkType = reader.ReadUInt32();

                // Validation 7: Loại JSON chunk
                if (jsonChunkType != JSON_CHUNK_TYPE)
                {
                    return new GLBValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = $"Invalid JSON chunk type. Expected {JSON_CHUNK_TYPE:X}, got {jsonChunkType:X}"
                    };
                }

                // Đọc dữ liệu JSON
                var jsonBytes = reader.ReadBytes((int)jsonChunkLength);
                var jsonString = Encoding.UTF8.GetString(jsonBytes);

                // Parse JSON để trích xuất metadata
                using var jsonDoc = JsonDocument.Parse(jsonString);
                var root = jsonDoc.RootElement;

                // Validation 8: Các thuộc tính bắt buộc
                if (!root.TryGetProperty("asset", out var asset))
                {
                    return new GLBValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "GLB file missing required 'asset' property"
                    };
                }

                // Trích xuất số lượng mesh
                var meshCount = 0;
                if (root.TryGetProperty("meshes", out var meshes))
                {
                    meshCount = meshes.GetArrayLength();
                }

                // Trích xuất số lượng node
                var nodeCount = 0;
                if (root.TryGetProperty("nodes", out var nodes))
                {
                    nodeCount = nodes.GetArrayLength();
                }

                // Validation 9: Phải có ít nhất 1 mesh
                if (meshCount == 0)
                {
                    return new GLBValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "GLB file must contain at least one mesh"
                    };
                }

                // Thành công
                return new GLBValidationResult
                {
                    IsValid = true,
                    MeshCount = meshCount,
                    NodeCount = nodeCount,
                    FileSizeMB = (decimal)file.Length / 1024m / 1024m,
                    ErrorMessage = null
                };
            }
            catch (EndOfStreamException)
            {
                return new GLBValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Kết thúc file không mong đợi khi đọc cấu trúc GLB"
                };
            }
            catch (Exception ex)
            {
                return new GLBValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"Lỗi validate GLB file: {ex.Message}"
                };
            }
        }
    }

    // Result DTO
    public class GLBValidationResult
    {
        public bool IsValid { get; set; }
        public string? ErrorMessage { get; set; }
        public int MeshCount { get; set; }
        public int NodeCount { get; set; }
        public decimal FileSizeMB { get; set; }
    }
}
```

---

### Model Analysis Service

#### File: ModelAnalysisService.cs

**Path**: `OCSP.Backend/src/OCSP.Application/Services/ModelAnalysisService.cs`
**Lines**: 1-199
**Purpose**: Xử lý workflow upload GLB và quản lý model

##### Upload Workflow

```csharp
// Lines 1-30: Dependencies and Constructor
using OCSP.Application.Interfaces;
using OCSP.Domain.Entities;
using OCSP.Domain.Repositories;
using Microsoft.AspNetCore.Http;

namespace OCSP.Application.Services
{
    public class ModelAnalysisService : IModelAnalysisService
    {
        private readonly IGLBValidatorService _validator;
        private readonly IFileStorageService _fileStorage;
        private readonly IRepository<Project3DModel> _modelRepository;
        private readonly IRepository<Project> _projectRepository;

        public ModelAnalysisService(
            IGLBValidatorService validator,
            IFileStorageService fileStorage,
            IRepository<Project3DModel> modelRepository,
            IRepository<Project> projectRepository)
        {
            _validator = validator;
            _fileStorage = fileStorage;
            _modelRepository = modelRepository;
            _projectRepository = projectRepository;
        }

        // Lines 32-150: Upload GLB Method
        public async Task<UploadGLBResponse> UploadGLBAsync(
            UploadGLBRequest request,
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            // Bước 1: Validate project tồn tại
            var project = await _projectRepository.GetByIdAsync(request.ProjectId, cancellationToken);
            if (project == null)
            {
                return new UploadGLBResponse
                {
                    IsValid = false,
                    ValidationMessage = "Project not found"
                };
            }

            // Bước 2: Validate user có quyền
            if (project.CreatedBy != userId.ToString() && !IsUserProjectMember(project, userId))
            {
                return new UploadGLBResponse
                {
                    IsValid = false,
                    ValidationMessage = "You do not have permission to upload models to this project"
                };
            }

            // Bước 3: Validate định dạng file GLB
            var validation = await _validator.ValidateGLBFileAsync(request.File, cancellationToken);
            if (!validation.IsValid)
            {
                return new UploadGLBResponse
                {
                    IsValid = false,
                    ValidationMessage = validation.ErrorMessage
                };
            }

            // Bước 4: Tạo tên file duy nhất
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var sanitizedProjectName = SanitizeFileName(project.Name);
            var fileName = $"{sanitizedProjectName}_{request.ProjectId}_{timestamp}.glb";

            // Bước 5: Upload lên storage (S3 hoặc local)
            var fileUrl = await _fileStorage.UploadFileAsync(
                request.File,
                "3d-models",  // S3 folder/prefix
                fileName,
                cancellationToken
            );

            // Bước 6: Tạo database record
            var model = new Project3DModel
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                FileName = fileName,
                FileUrl = fileUrl,
                FileSizeMB = validation.FileSizeMB,
                TotalMeshes = validation.MeshCount,
                TotalNodes = validation.NodeCount,
                UploadedAt = DateTime.UtcNow,
                CreatedBy = userId.ToString(),
                UpdatedBy = userId.ToString(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _modelRepository.CreateAsync(model, cancellationToken);

            // Bước 7: Trả về response thành công
            return new UploadGLBResponse
            {
                IsValid = true,
                ModelId = model.Id,
                FileUrl = fileUrl,
                MeshCount = validation.MeshCount,
                NodeCount = validation.NodeCount,
                FileSizeMB = validation.FileSizeMB
            };
        }

        // Lines 152-170: Helper Methods
        private string SanitizeFileName(string fileName)
        {
            // Xóa các ký tự không hợp lệ trong tên file
            var invalidChars = Path.GetInvalidFileNameChars();
            var sanitized = new string(fileName
                .Where(c => !invalidChars.Contains(c))
                .ToArray());

            // Thay thế khoảng trắng bằng dấu gạch dưới
            sanitized = sanitized.Replace(" ", "_");

            // Giới hạn độ dài
            if (sanitized.Length > 50)
            {
                sanitized = sanitized.Substring(0, 50);
            }

            return sanitized;
        }

        private bool IsUserProjectMember(Project project, Guid userId)
        {
            // Kiểm tra user có trong danh sách thành viên project không
            return project.ProjectMembers?.Any(m => m.UserId == userId) ?? false;
        }

        // Lines 172-199: Lấy Models theo Project
        public async Task<List<Project3DModelDto>> GetModelsByProjectAsync(
            Guid projectId,
            CancellationToken cancellationToken = default)
        {
            var models = await _modelRepository.GetAllAsync(
                m => m.ProjectId == projectId,
                cancellationToken
            );

            return models.Select(m => new Project3DModelDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId,
                FileName = m.FileName,
                FileUrl = m.FileUrl,
                FileSizeMB = m.FileSizeMB,
                TotalMeshes = m.TotalMeshes,
                TotalNodes = m.TotalNodes,
                UploadedAt = m.UploadedAt,
                CreatedAt = m.CreatedAt
            }).ToList();
        }
    }
}
```

---

### Building Element Service

#### File: BuildingElementService.cs

**Path**: `OCSP.Backend/src/OCSP.Application/Services/BuildingElementService.cs`
**Lines**: 1-300
**Purpose**: Quản lý building elements và tracking records

##### Key Service Methods

```csharp
// Lines 1-40: Dependencies and Constructor
using OCSP.Application.DTOs.BuildingElements;
using OCSP.Application.Interfaces;
using OCSP.Domain.Entities;
using OCSP.Domain.Enums;
using OCSP.Domain.Repositories;

namespace OCSP.Application.Services
{
    public class BuildingElementService : IBuildingElementService
    {
        private readonly IRepository<BuildingElement> _elements;
        private readonly IRepository<ElementTrackingHistory> _histories;
        private readonly IRepository<TrackingPhoto> _photos;
        private readonly IFileStorageService _fileStorage;

        public BuildingElementService(
            IRepository<BuildingElement> elements,
            IRepository<ElementTrackingHistory> histories,
            IRepository<TrackingPhoto> photos,
            IFileStorageService fileStorage)
        {
            _elements = elements;
            _histories = histories;
            _photos = photos;
            _fileStorage = fileStorage;
        }

        // Lines 42-78: Lấy Tất cả Elements theo Model
        public async Task<List<BuildingElementDto>> GetByModelIdAsync(Guid modelId)
        {
            var elements = await _elements.GetAllAsync(e => e.ModelId == modelId);

            return elements.Select(e => new BuildingElementDto
            {
                Id = e.Id,
                ModelId = e.ModelId,
                Name = e.Name,
                ElementType = (int)e.ElementType,
                FloorLevel = e.FloorLevel,
                MeshIndicesJson = e.MeshIndices,
                TrackingStatus = (int)e.TrackingStatus,
                CompletionPercentage = e.CompletionPercentage,
                Color = e.Color,
                CreatedAt = e.CreatedAt
            }).ToList();
        }

        // Lines 80-152: Tạo Tracking Record
        public async Task<TrackingHistoryDto> CreateTrackingAsync(
            CreateTrackingRequest request,
            Guid userId)
        {
            // Lấy trạng thái element hiện tại
            var element = await _elements.GetByIdAsync(request.BuildingElementId);
            if (element == null)
            {
                throw new ArgumentException("Building element not found");
            }

            // Lấy các histories hiện có để xác định trạng thái trước đó
            var existingHistories = await _histories.GetByElementIdAsync(request.BuildingElementId);
            var latestHistory = existingHistories.OrderByDescending(h => h.TrackingDate).FirstOrDefault();

            var previousPercentage = latestHistory?.NewPercentage ?? 0;
            var previousStatus = latestHistory?.NewStatus ?? TrackingStatus.NotStarted;

            // Tạo history record mới
            var history = new ElementTrackingHistory
            {
                Id = Guid.NewGuid(),
                BuildingElementId = request.BuildingElementId,
                TrackingDate = DateTime.UtcNow,
                PreviousPercentage = previousPercentage,
                NewPercentage = request.NewPercentage,
                PreviousStatus = previousStatus,
                NewStatus = MapTrackingStatus(request.NewStatus),
                PlannedQuantity = request.PlannedQuantity,
                ActualQuantity = request.ActualQuantity,
                CementUsed = request.CementUsed,
                SandUsed = request.SandUsed,
                AggregateUsed = request.AggregateUsed,
                Notes = request.Notes,
                RecordedById = userId,
                CreatedBy = userId,  // Guid type (overridden property)
                UpdatedBy = userId,  // Guid type (overridden property)
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _histories.CreateAsync(history);

            // Cập nhật element với tracking status mới
            element.CompletionPercentage = request.NewPercentage;
            element.TrackingStatus = MapTrackingStatus(request.NewStatus);
            element.UpdatedBy = userId;  // Guid type (overridden property)
            element.UpdatedAt = DateTime.UtcNow;

            await _elements.UpdateAsync(element);

            return MapHistory(history);
        }

        // Lines 154-182: Lấy Element Detail với Latest History
        public async Task<BuildingElementDetailDto?> GetDetailAsync(Guid id)
        {
            var e = await _elements.GetByIdAsync(id);
            if (e == null) return null;

            var histories = await _histories.GetByElementIdAsync(id);
            var latestHistory = histories.OrderByDescending(h => h.TrackingDate).FirstOrDefault();

            var photos = new List<TrackingPhotoDto>();
            if (latestHistory != null)
            {
                var photoEntities = await _photos.GetByHistoryIdAsync(latestHistory.Id);
                photos = photoEntities.Select(MapPhoto).ToList();
            }

            return new BuildingElementDetailDto
            {
                Id = e.Id,
                ModelId = e.ModelId,
                Name = e.Name,
                ElementType = (int)e.ElementType,
                FloorLevel = e.FloorLevel,
                MeshIndicesJson = e.MeshIndices,
                TrackingStatus = (int)e.TrackingStatus,
                CompletionPercentage = e.CompletionPercentage,
                Color = e.Color,
                CreatedAt = e.CreatedAt,
                LatestHistory = latestHistory == null ? null : MapHistory(latestHistory),
                LatestPhotos = photos
            };
        }

        // Lines 184-202: Map History Entity sang DTO
        private static TrackingHistoryDto MapHistory(ElementTrackingHistory h) => new()
        {
            Id = h.Id,
            BuildingElementId = h.BuildingElementId,
            TrackingDate = h.TrackingDate,
            PreviousPercentage = h.PreviousPercentage,
            NewPercentage = h.NewPercentage,
            PreviousStatus = (int?)h.PreviousStatus,
            NewStatus = (int)h.NewStatus,
            PlannedQuantity = h.PlannedQuantity,
            ActualQuantity = h.ActualQuantity,
            CementUsed = h.CementUsed,
            SandUsed = h.SandUsed,
            AggregateUsed = h.AggregateUsed,
            Notes = h.Notes,
            RecordedById = h.RecordedById
        };

        // Lines 204-217: Map Photo Entity sang DTO
        private static TrackingPhotoDto MapPhoto(TrackingPhoto p) => new()
        {
            Id = p.Id,
            TrackingHistoryId = p.TrackingHistoryId,
            PhotoUrl = p.PhotoUrl,
            Caption = p.Caption,
            FileSizeMB = p.FileSizeMB,
            FileType = p.FileType,
            Width = p.Width,
            Height = p.Height,
            UploadedAt = p.UploadedAt
        };

        // Lines 219-280: Upload Photo
        public async Task<TrackingPhotoDto> UploadPhotoAsync(
            Guid historyId,
            IFormFile photo,
            string? caption,
            Guid userId)
        {
            // Validate tracking history tồn tại
            var history = await _histories.GetByIdAsync(historyId);
            if (history == null)
            {
                throw new ArgumentException("Tracking history not found");
            }

            // Validate file
            if (photo == null || photo.Length == 0)
            {
                throw new ArgumentException("Photo file is required");
            }

            // Validate kích thước file (tối đa 10MB)
            if (photo.Length > 10 * 1024 * 1024)
            {
                throw new ArgumentException("Photo file size must be less than 10MB");
            }

            // Validate loại file
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(photo.ContentType.ToLowerInvariant()))
            {
                throw new ArgumentException("Only JPEG, PNG, and WebP images are allowed");
            }

            // Tạo tên file duy nhất
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var extension = Path.GetExtension(photo.FileName);
            var fileName = $"{historyId}_{timestamp}{extension}";

            // Upload lên storage
            var photoUrl = await _fileStorage.UploadFileAsync(
                photo,
                "tracking-photos",
                fileName
            );

            // Tạo database record
            var photoEntity = new TrackingPhoto
            {
                Id = Guid.NewGuid(),
                TrackingHistoryId = historyId,
                PhotoUrl = photoUrl,
                Caption = caption,
                FileSizeMB = photo.Length / 1024m / 1024m,
                FileType = photo.ContentType,
                Width = null,  // Có thể trích xuất từ metadata ảnh nếu cần
                Height = null,
                UploadedAt = DateTime.UtcNow,
                CreatedBy = userId,  // Guid type (overridden property)
                UpdatedBy = userId,  // Guid type (overridden property)
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _photos.CreateAsync(photoEntity);

            return MapPhoto(photoEntity);
        }

        // Lines 282-300: Helper Methods
        private static TrackingStatus MapTrackingStatus(string status)
        {
            return status.ToLowerInvariant() switch
            {
                "not_started" => TrackingStatus.NotStarted,
                "in_progress" => TrackingStatus.InProgress,
                "completed" => TrackingStatus.Completed,
                "on_hold" => TrackingStatus.OnHold,
                _ => TrackingStatus.NotStarted
            };
        }
    }
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Projects                                     │
├─────────────────────────────────────────────────────────────────┤
│ Id (PK)                     uuid                                │
│ Name                        varchar(200)                        │
│ Description                 text                                 │
│ CreatedBy                   uuid (FK → Users)                   │
│ CreatedAt                   timestamp                            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Project3DModels                                 │
├─────────────────────────────────────────────────────────────────┤
│ Id (PK)                     uuid                                │
│ ProjectId (FK)              uuid → Projects.Id                  │
│ FileName                    varchar(500)                        │
│ FileUrl                     varchar(2000)                       │
│ FileSizeMB                  decimal(10,2)                       │
│ TotalMeshes                 int                                 │
│ TotalNodes                  int                                 │
│ UploadedAt                  timestamp                            │
│ CreatedBy                   varchar(450)                        │
│ CreatedAt                   timestamp                            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BuildingElements                                │
├─────────────────────────────────────────────────────────────────┤
│ Id (PK)                     uuid                                │
│ ModelId (FK)                uuid → Project3DModels.Id           │
│ Name                        varchar(200)                        │
│ ElementType                 int (enum: Column=1, Beam=2, ...)  │
│ Width                       decimal(10,3)                       │
│ Length                      decimal(10,3)                       │
│ Height                      decimal(10,3)                       │
│ CenterX                     decimal(10,3)                       │
│ CenterY                     decimal(10,3)                       │
│ CenterZ                     decimal(10,3)                       │
│ VolumeM3                    decimal(12,3)                       │
│ FloorLevel                  int                                 │
│ TrackingStatus              int (enum: NotStarted=0, ...)      │
│ CompletionPercentage        int (0-100)                         │
│ CanTrack                    bool                                │
│ Color                       varchar(7) (#RRGGBB)                │
│ MeshIndices                 jsonb ([0,1,2,...])                 │
│ CreatedBy                   uuid (overridden from base)         │
│ UpdatedBy                   uuid (overridden from base)         │
│ CreatedAt                   timestamp                            │
│ UpdatedAt                   timestamp                            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              ElementTrackingHistory                              │
├─────────────────────────────────────────────────────────────────┤
│ Id (PK)                     uuid                                │
│ BuildingElementId (FK)      uuid → BuildingElements.Id          │
│ TrackingDate                timestamp                            │
│ PreviousPercentage          int                                 │
│ NewPercentage               int                                 │
│ PreviousStatus              int (nullable)                      │
│ NewStatus                   int                                 │
│ PlannedQuantity             decimal(10,2)                       │
│ ActualQuantity              decimal(10,2)                       │
│ CementUsed                  decimal(10,2)                       │
│ SandUsed                    decimal(10,2)                       │
│ AggregateUsed               decimal(10,2)                       │
│ Notes                       varchar(2000)                       │
│ RecordedById (FK)           uuid → Users.Id                     │
│ CreatedBy                   uuid (overridden from base)         │
│ UpdatedBy                   uuid (overridden from base)         │
│ CreatedAt                   timestamp                            │
│ UpdatedAt                   timestamp                            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TrackingPhotos                                 │
├─────────────────────────────────────────────────────────────────┤
│ Id (PK)                     uuid                                │
│ TrackingHistoryId (FK)      uuid → ElementTrackingHistory.Id    │
│ PhotoUrl                    varchar(2000)                       │
│ Caption                     varchar(500)                        │
│ FileSizeMB                  decimal(10,2)                       │
│ FileType                    varchar(50) (e.g., "image/jpeg")   │
│ Width                       int (nullable)                      │
│ Height                      int (nullable)                      │
│ UploadedAt                  timestamp                            │
│ CreatedBy                   uuid (overridden from base)         │
│ UpdatedBy                   uuid (overridden from base)         │
│ CreatedAt                   timestamp                            │
│ UpdatedAt                   timestamp                            │
└─────────────────────────────────────────────────────────────────┘
```

### Database Indexes

```sql
-- BuildingElements table indexes (lines 62-67 in BuildingElementConfiguration.cs)
CREATE INDEX "IX_BuildingElements_ModelId" ON "BuildingElements" ("ModelId");
CREATE INDEX "IX_BuildingElements_ElementType" ON "BuildingElements" ("ElementType");
CREATE INDEX "IX_BuildingElements_TrackingStatus" ON "BuildingElements" ("TrackingStatus");
CREATE INDEX "IX_BuildingElements_FloorLevel" ON "BuildingElements" ("FloorLevel");
CREATE INDEX "IX_BuildingElements_ModelId_CompletionPercentage" ON "BuildingElements" ("ModelId", "CompletionPercentage");
CREATE INDEX "IX_BuildingElements_ModelId_TrackingStatus" ON "BuildingElements" ("ModelId", "TrackingStatus");

-- ElementTrackingHistory table indexes (lines 135-139 in BuildingElementConfiguration.cs)
CREATE INDEX "IX_ElementTrackingHistory_BuildingElementId" ON "ElementTrackingHistory" ("BuildingElementId");
CREATE INDEX "IX_ElementTrackingHistory_TrackingDate" ON "ElementTrackingHistory" ("TrackingDate");
CREATE INDEX "IX_ElementTrackingHistory_RecordedById" ON "ElementTrackingHistory" ("RecordedById");
CREATE INDEX "IX_ElementTrackingHistory_BuildingElementId_TrackingDate" ON "ElementTrackingHistory" ("BuildingElementId", "TrackingDate");
CREATE INDEX "IX_ElementTrackingHistory_BuildingElementId_NewStatus" ON "ElementTrackingHistory" ("BuildingElementId", "NewStatus");

-- TrackingPhotos table indexes (lines 160-161 in BuildingElementConfiguration.cs)
CREATE INDEX "IX_TrackingPhotos_TrackingHistoryId" ON "TrackingPhotos" ("TrackingHistoryId");
CREATE INDEX "IX_TrackingPhotos_UploadedAt" ON "TrackingPhotos" ("UploadedAt");
```

### Entity Configuration

**File**: BuildingElementConfiguration.cs
**Path**: `OCSP.Backend/src/OCSP.Infrastructure/Data/Configurations/BuildingElementConfiguration.cs`

This file uses Entity Framework Core's Fluent API to configure database mappings. Key configurations include:

- **Precision for Decimal Fields** (lines 30-37): Dimensions stored with 3 decimal places, volume with 3 decimals
- **JSONB Column Type** (line 40): PostgreSQL-specific JSON binary storage for mesh indices
- **Default Values** (lines 43-48): Color defaults to gray (#CCCCCC), status to NotStarted
- **Cascade Delete** (lines 51-59): Deleting a model cascades to elements and tracking history
- **Enum Conversion** (lines 21-27): Convert C# enums to integers for database storage

---

## Game Development Techniques

### 1. Raycasting

**What it is**: Kỹ thuật toán học để xác định object nào trong không gian 3D giao nhau với một ray được chiếu từ camera qua vị trí chuột.

**How it works**:

1. Chuyển đổi tọa độ chuột (screen space) sang normalized device coordinates (-1 đến +1)
2. Tạo một ray từ vị trí camera qua điểm chuột
3. Kiểm tra giao nhau ray-triangle với tất cả meshes
4. Trả về object giao nhau gần nhất

**Implementation** (ModelViewer3D.tsx, lines 580-650):

```typescript
// Chuyển đổi chuột sang NDC
const mouse = new THREE.Vector2();
mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

// Thiết lập raycaster
raycaster.setFromCamera(mouse, camera);

// Giao nhau với scene
const intersects = raycaster.intersectObjects(scene.children, true);
```

**Game industry usage**: First-person shooters (quỹ đạo đạn), RTS games (chọn đơn vị), level editors

### 2. Octree Spatial Partitioning

**What it is**: Cấu trúc dữ liệu phân cấp chia đệ quy không gian 3D thành 8 octants (giống như phiên bản 3D của quadtree).

**Why it's used**: Giảm độ phức tạp tính toán của spatial queries từ O(n) xuống O(log n).

**How it works**:

1. Tạo bounding box quanh toàn bộ scene
2. Nếu box chứa nhiều hơn N objects, chia thành 8 sub-boxes
3. Chia đệ quy cho đến khi đạt max depth hoặc min objects
4. Đối với raycasting, chỉ kiểm tra objects trong các octants mà ray giao nhau

**Implementation** (ModelViewer3D.tsx, lines 1100-1200):

```typescript
class Octree {
  private subdivide() {
    // Chia không gian thành 8 octants
    const center = this.box.getCenter();
    this.children = [
      new Octree(new Box3(min, center)),           // Bottom-Front-Left
      new Octree(new Box3(...)),                   // Bottom-Front-Right
      // ... 6 octants nữa
    ];
  }

  rayIntersect(raycaster) {
    if (!raycaster.ray.intersectsBox(this.box)) {
      return []; // Thoát sớm - ray không trúng octant này
    }
    // Chỉ kiểm tra objects trong các octants được giao nhau
  }
}
```

**Game industry usage**: Phát hiện va chạm (Unreal Engine), frustum culling (Unity), physics engines

### 3. GPU Picking

**What it is**: Selection object được tăng tốc phần cứng sử dụng offscreen rendering mã hóa màu.

**Why it's faster**: Thay vì kiểm tra ray-triangle trên CPU, sử dụng GPU pixel shader để render màu duy nhất cho mỗi object, sau đó đọc pixel tại cursor.

**How it works**:

1. Tạo offscreen render target
2. Render scene với mỗi object có màu rắn duy nhất (object ID được mã hóa dưới dạng RGB)
3. Đọc pixel tại tọa độ chuột
4. Giải mã RGB trở lại object ID

**Implementation** (ModelViewer3D.tsx, lines 1250-1400):

```typescript
// Xây dựng picking scene
meshes.forEach((mesh, index) => {
  const pickingMaterial = new MeshBasicMaterial({
    color: index + 1, // Mã hóa ID thành màu
  });
  pickingScene.add(new Mesh(mesh.geometry, pickingMaterial));
});

// Khi click: render và đọc pixel
renderer.setRenderTarget(pickingTexture);
renderer.render(pickingScene, camera);

const pixelBuffer = new Uint8Array(4);
renderer.readRenderTargetPixels(pickingTexture, x, y, 1, 1, pixelBuffer);

// Giải mã màu sang ID
const objectId =
  (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];
```

**Game industry usage**: Chọn đơn vị RTS (StarCraft 2), level editors (Unity, Unreal), phần mềm CAD

### 4. Level of Detail (LOD)

**What it is**: Kỹ thuật render các phiên bản object có ít polygon hơn khi ở xa camera.

**Why it's used**: Duy trì frame rate khi render các scene lớn bằng cách giảm số lượng tam giác của các objects ở xa.

**How it works**:

1. Tạo nhiều phiên bản mesh (high, medium, low poly)
2. Tính toán khoảng cách từ camera đến object
3. Hoán đổi mesh dựa trên ngưỡng khoảng cách

**Implementation** (Mentioned in ModelViewer3D.tsx Phase 3 optimization):

```typescript
const lod = new THREE.LOD();
lod.addLevel(highPolyMesh, 0); // 0-50 units
lod.addLevel(mediumPolyMesh, 50); // 50-100 units
lod.addLevel(lowPolyMesh, 100); // 100+ units
scene.add(lod);
```

**Game industry usage**: Game open-world (GTA, Skyrim), mô phỏng bay, render terrain

### 5. Mesh Instancing

**What it is**: Render nhiều bản sao của cùng một mesh với một draw call đơn sử dụng GPU instancing.

**Why it's used**: Giảm đáng kể số lượng draw calls cho các objects lặp lại (cây, cột, đám đông).

**How it works**:

1. Tạo InstancedMesh với tham số count
2. Đặt transformation matrix cho mỗi instance
3. GPU render tất cả instances trong một lần gọi

**Implementation** (Mentioned in Phase 3 optimization):

```typescript
const instancedMesh = new InstancedMesh(geometry, material, 100);

// Đặt vị trí cho mỗi instance
const matrix = new Matrix4();
for (let i = 0; i < 100; i++) {
  matrix.setPosition(x, y, z);
  instancedMesh.setMatrixAt(i, matrix);
}
```

**Game industry usage**: Đám đông (Assassin's Creed), thực vật (Far Cry), hệ thống particle

### 6. Physically Based Rendering (PBR)

**What it is**: Cách tiếp cận render mô phỏng tương tác ánh sáng-material dựa trên các định luật vật lý.

**Why it's used**: Tạo ra các materials thực tế trông chính xác dưới mọi điều kiện ánh sáng.

**Implementation** (ModelViewer3D.tsx, line 350):

```typescript
const material = new MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.5, // Mức độ kim loại (0 = điện môi, 1 = kim loại)
  roughness: 0.5, // Độ nhám bề mặt (0 = gương, 1 = mờ)
});
```

**Game industry usage**: Tất cả các game AAA hiện đại (Unreal Engine, Unity HDRP), 3D modeling (Blender, Substance Painter)

### 7. Frustum Culling

**What it is**: Không render các objects nằm ngoài view frustum của camera.

**How it works**:

1. Tính toán camera frustum (6 mặt phẳng tạo thành hình chóp)
2. Kiểm tra bounding box của mỗi object với frustum
3. Bỏ qua render nếu object ở ngoài

**Game industry usage**: Mọi 3D game engine, tự động trong Three.js

### 8. Dirty Tracking

**What it is**: Chỉ tính lại/re-render các components đã thay đổi.

**Implementation** (Mentioned in Phase 1 optimization):

```typescript
const isDirty = useRef(false);

useEffect(() => {
  if (!isDirty.current) return;

  // Chỉ cập nhật các meshes đã thay đổi
  updateMeshColors();
  isDirty.current = false;
}, [buildingElements]);
```

**Game industry usage**: Hệ thống UI, hệ thống particle, hệ thống animation

---

## Performance Optimizations

### Three-Phase Optimization Strategy

#### Phase 1: Basic Optimizations (Currently Implemented)

1. **Debouncing**: Trì hoãn các thao tác tốn kém cho đến khi user ngừng tương tác
2. **Throttling**: Giới hạn tần suất thao tác (ví dụ: tối đa 60 FPS)
3. **Index-based Lookup**: Truy cập mesh O(1) sử dụng Map thay vì lặp mảng O(n)
4. **Dirty Tracking**: Chỉ cập nhật các objects đã thay đổi

#### Phase 2: Advanced Optimizations (Partially Implemented)

1. **Octree**: Đã được implement cho spatial partitioning
2. **GPU Picking**: Đã được implement cho selection được tăng tốc phần cứng
3. **Object Pooling**: Tái sử dụng objects thay vì tạo/hủy
4. **Batch Updates**: Nhóm nhiều thay đổi state vào một lần render

#### Phase 3: Extreme Optimizations (Planned)

1. **LOD**: Chuyển đổi chi tiết mesh dựa trên khoảng cách
2. **Mesh Instancing**: Một draw call cho các objects lặp lại
3. **Web Workers**: Chuyển các tính toán sang background threads
4. **Lazy Loading**: Tải các chunks của model theo nhu cầu

### Performance Metrics

Hiệu năng mục tiêu:

- **Frame Rate**: 60 FPS (16.67ms mỗi frame)
- **Initial Load**: < 3 giây cho file GLB 100MB
- **Element Selection**: < 50ms thời gian phản hồi
- **Tracking Save**: < 2 giây bao gồm upload ảnh
- **Memory Usage**: < 500MB cho project thông thường

---

## API Reference

### Building Elements Endpoints

#### GET /api/building-elements/{id}/detail

**Purpose**: Lấy building element với latest tracking history và photos
**Controller**: BuildingElementController.cs, line 60-66
**Service**: BuildingElementService.cs, line 154-182
**Response**: BuildingElementDetailDto

```json
{
  "id": "guid",
  "modelId": "guid",
  "name": "Column C1-1",
  "elementType": 1,
  "floorLevel": 1,
  "meshIndicesJson": "[0,1,2,3]",
  "trackingStatus": 2,
  "completionPercentage": 75,
  "color": "#4ade80",
  "createdAt": "2024-01-15T10:30:00Z",
  "latestHistory": {
    "id": "guid",
    "trackingDate": "2024-01-20T08:00:00Z",
    "newPercentage": 75,
    "notes": "Good progress"
  },
  "latestPhotos": [
    {
      "id": "guid",
      "photoUrl": "https://s3.../photo.jpg",
      "caption": "Progress photo"
    }
  ]
}
```

#### POST /api/building-elements/tracking

**Purpose**: Tạo tracking record mới
**Controller**: BuildingElementController.cs, line 45-53
**Service**: BuildingElementService.cs, line 80-152
**Request Body**:

```json
{
  "buildingElementId": "guid",
  "newPercentage": 75,
  "newStatus": "in_progress",
  "notes": "Good progress today",
  "plannedQuantity": 10.5,
  "actualQuantity": 9.8,
  "cementUsed": 120.5,
  "sandUsed": 300.0,
  "aggregateUsed": 450.0
}
```

#### POST /api/building-elements/tracking/{historyId}/photos/upload

**Purpose**: Upload ảnh cho tracking record
**Controller**: BuildingElementController.cs, line 55-58
**Service**: BuildingElementService.cs, line 219-280
**Request**: multipart/form-data
**Form Fields**:

- `photo`: File (tối đa 10MB, JPEG/PNG/WebP)
- `caption`: string (tùy chọn)

---

## File Structure

### Frontend Files (20+ files)

#### Components

- `ModelViewer3D.tsx` (1557 lines) - Trình xem 3D chính
- `ComponentTrackingPanel.tsx` (300 lines) - Panel UI tracking
- `ProjectModelPage.tsx` - Component wrapper trang

#### API Clients

- `building-elements.api.ts` (80 lines) - API building elements
- `models.api.ts` - API upload mô hình 3D
- `tracking.api.ts` - API tracking history
- `photos.api.ts` - API upload ảnh

#### Types

- `building-elements.types.ts` - TypeScript interfaces cho elements
- `tracking.types.ts` - Types tracking history
- `model.types.ts` - Types mô hình 3D

### Backend Files (30+ files)

#### Domain Layer (Entities)

- `BuildingElement.cs` (47 lines) - Entity building component
- `ElementTrackingHistory.cs` (48 lines) - Entity tracking record
- `TrackingPhoto.cs` (31 lines) - Entity photo evidence
- `Project3DModel.cs` - Entity metadata mô hình 3D
- `MeshGroup.cs` - Entity nhóm mesh

#### Application Layer (Services & DTOs)

- `BuildingElementService.cs` (300 lines) - Business logic
- `GLBValidatorService.cs` (135 lines) - Validation GLB
- `ModelAnalysisService.cs` (199 lines) - Workflow upload model
- `S3FileStorageService.cs` - Tích hợp AWS S3
- `LocalFileStorageService.cs` - Fallback local storage
- `BuildingElementDTOs.cs` - Data transfer objects

#### Infrastructure Layer (Data Access)

- `ApplicationDbContext.cs` (1200+ lines) - EF Core context
- `BuildingElementConfiguration.cs` (164 lines) - Cấu hình entity
- `BuildingElementRepository.cs` - Truy cập dữ liệu
- `TrackingHistoryRepository.cs` - Truy cập dữ liệu history
- `PhotoRepository.cs` - Truy cập dữ liệu photo

#### API Layer (Controllers)

- `BuildingElementController.cs` (70 lines) - REST endpoints
- `ModelController.cs` - Endpoints upload model
- `TrackingController.cs` - Endpoints tracking

#### Migrations

- `20251223154951_AddContractorPostsWithBuildingElementFix.cs` - Migration UUID
- `20251223173200_AddWidthHeightToTrackingPhotos.cs` - Kích thước photo

---

## Conclusion

Hệ thống 3D Model Tracking này thể hiện sự tích hợp của các công nghệ web hiện đại với các kỹ thuật phát triển game để tạo ra một nền tảng quản lý xây dựng sẵn sàng cho production. Các thành tựu chính:

1. **Robust Backend**: .NET 8 với Entity Framework Core, PostgreSQL JSONB, S3 storage
2. **Interactive 3D**: Three.js với raycasting, Octree, GPU picking cho hiệu năng
3. **Real-time Tracking**: Ghi lại tiến độ hàng ngày với ảnh, ghi chú, sử dụng vật liệu
4. **Scalable Architecture**: Repository pattern, service layer, DTO mapping
5. **Production-Ready**: Triển khai Docker, database migrations, xử lý lỗi

Tổng số dòng code: 3000+ (frontend) + 2500+ (backend) = **5500+ dòng**

Tài liệu này bao gồm tất cả các components chính, data flows, thuật ngữ kỹ thuật, và chi tiết implementation như yêu cầu.
