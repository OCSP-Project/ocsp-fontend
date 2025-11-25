<!-- oke giờ tôi muốn xây dựng chức năng nhât ký giám sát công trình,
flow sẽ là khi vào detail project(D:\Ky 9\do_an_tot_nghiep\full\ocsp-fontend\src\app\(dashboard)\projects\[id]\page.tsx))
tầm dòng 653 thêm một nút là nhật ký công trình,
chúng ta sẽ tập chung xây dựng nhật ký thi công trước nhé, nhật ký thi công
khi ấn vào sẽ mở ra một cái lịch ví dụ ![alt text](image.png) , khi click vòa một ngày bất kỳ sẽ mở ra một trang để ghi lại nhật ký
trong trang nhật ký chia làm 2 phần , bên trái là phần liên kết với thông tin của project, gồm 2 session , 1 là công việc 2 là vật liệu
session công việc nằm trên đầu tiên là thanh search công việc theo tên, sẽ drop và chọn các công việc từ trang dữ liệu(D:\Ky 9\do_an_tot_nghiep\full\ocsp-fontend\src\app\(dashboard)\projects\[id]\budget\page.tsx), và khi click chọn xong sẽ hiện ra các mục

1. Khu vực thi công :text
   -KL kế hoạch:text
   -KL thi công:text
   -Còn lại:text
   -Đơn vị:text
2. Nhân công (làm thêm một endpoid để nhập thông tin nhân công và sẽ cho chọn dữ liệu ở đây)
   -thanh search tên nhân công
   -STT Nhân công Giờ làm Số lượng Đơn vị
   ví dụ:1/ Nhân công 3,5/7 - Nhóm 2/7h00-17h00/ 2,9 /Công
3. máy thi công (làm thêm bộ dữ liệu có sẵn về mấy thi công và hiển thị tương tự như nhân công )
   1 Máy trộn vữa - dung tích: 150 lít
   19:54

- 19:54
  0,019951967485682617
  ca

Sesion vật tư thì tạm thời chưa làm gì để im đó đã,

tiếp theo là màng hình bên phải (Thông tin nhật ký)

1. Đầu tiên là Ảnh hiện trường (chia làm 3 mục)
   -Thi công, sự cố, vật liệu (3 mục này khác nhau nhé cần 3 trường riêng để lưu)
2. Nhật ký ngày (tự động lưu thời gian khi click ở dòng 5 trên á)
   3 . Tổ đội thi công :text
3. ![alt text](image-1.png) toàn text thôi
4. Tình hình thi công trong ngày
   Công tác an toàn Tốt Trung bình Kém
   Chất lượng thi công Tốt Trung bình Kém
   Tiến độ thi công Tốt Trung bình Kém
   Công tác vệ sinh Tốt Trung bình Kém
5. Báo cáo sự cố: text dài
6. Đề xuất - kiến nghị:text dài
7. Ghi chú:text dài

rồi thêm đâu đó 1 nút lưu và 1 nút đóng, giao diện cho siêu chuyên nghiệp -->

tiếp theo là xây dựng backend
đầu tiên là Công việc thi công

1. search :
   -sẽ search các imtem từ đây curl -X 'GET' \
    'http://localhost:8080/api/work-items/project/6d1d0ab1-20a1-4eae-8ade-67940593c532?rootLevelOnly=false&includeChildren=true' \
    -H 'accept: text/plain' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIwYTc1MjdkNy04MWMyLTQzZWUtODc1OC03NzI2MzY2NWQ3NzMiLCJlbWFpbCI6ImFuaGR1b25nNzEwMjAwM0BnbWFpbC5jb20iLCJyb2xlIjoiSG9tZW93bmVyIiwibmJmIjoxNzY0MDU3MDA2LCJleHAiOjE3NjQxNDM0MDYsImlhdCI6MTc2NDA1NzAwNn0.w2GcHxlmwhDt9ofCv53LhUsDWPu3cY3Oa24Mjd1KqEQ'
   Request URL
   http://localhost:8080/api/work-items/project/6d1d0ab1-20a1-4eae-8ade-67940593c532?rootLevelOnly=false&includeChildren=true
   Server response
   Code Details
   200
   Response body
   Download
   [
   {
   "id": "35030635-aa34-4e79-b621-44a11f4c0c72",
   "projectId": "6d1d0ab1-20a1-4eae-8ade-67940593c532",
   "code": "1",
   "orderNumber": "1",
   "name": "CÁC HẠNG MỤC PHỤ TRỢ",
   "description": null,
   "parentId": null,
   "parentName": null,
   "level": 2,
   "sortOrder": 0,
   "type": "Task",
   "hasChildren": false,
   "children": [
   {
   "id": "f52089d8-9d41-4de5-9a63-614692f128ee",
   "projectId": "6d1d0ab1-20a1-4eae-8ade-67940593c532",
   "code": "1.1",
   "orderNumber": "1.1",
   "name": "SAN NỀN",
   "description": null,
   "parentId": "35030635-aa34-4e79-b621-44a11f4c0c72",
   "parentName": null,
   "level": 3,
   "sortOrder": 1,
   "type": "SubTask",
   "hasChildren": false,
   "children": [
   {
   "id": "9760c068-cde4-48fe-85f8-53bd33cb5010",
   "projectId": "6d1d0ab1-20a1-4eae-8ade-67940593c532",
   "code": "1.1.1",
   "orderNumber": "1.1.1",
   "name": "Đào xúc đất bằng máy đào 1,25m3, đất cấp I",
   "description": null,
   "parentId": "f52089d8-9d41-4de5-9a63-614692f128ee",
   "parentName": null,
   "level": 4,
   "sortOrder": 2,
   "type": "SubTask",
   "hasChildren": false,
   "children": [],
   "plannedStartDate": "2024-01-10T00:00:00Z",
   "plannedEndDate": "2024-01-13T00:00:00Z",
   "actualStartDate": "2024-01-10T00:00:00Z",
   "actualEndDate": null,
   "plannedDuration": 0,
   "actualDuration": null,
   "progress": 100,
   "status": "Completed",
   "statusLabel": "Completed",
   "statusColor": "#4CAF50",
   "plannedQuantity": 912.18,
   "unit": "100m3",
   "actualQuantity": 364,
   "unitPrice": null,
   "totalAmount": null,
   "compactionFactor": null,
   "assignees": [
   {
   "userId": "bd25cc57-1188-4077-99e0-8fc7e2484b85",
   "username": "User",
   "fullName": "User Name",
   "avatarUrl": null,
   "position": null
   }
   ],
   "responsiblePerson": null,
   "warnings": [],
   "isOverdue": false,
   "daysOverdue": null,
   "isExpanded": false,
   "isHidden": false,
   "commentCount": 0,
   "documentCount": 0,
   "materialCount": 0,
   "createdAt": "2025-11-22T14:57:55.840685Z",
   "updatedAt": "2025-11-24T18:52:55.673046Z",
   "createdByUsername": null,
   "updatedByUsername": null
   },

còn lại các trường khác tự thêm backend mới đi
