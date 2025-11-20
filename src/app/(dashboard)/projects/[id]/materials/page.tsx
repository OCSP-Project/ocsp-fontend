'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  MaterialDto,
  MaterialRequestDto,
  MaterialRequestDetailDto,
  MaterialRequestStatus,
} from '@/types/material.types';
import { materialService } from '@/services/materialService';
import { MaterialTable } from './components/MaterialTable';
import { MaterialDetailModal } from './components/MaterialDetailModal';
import { ActualQuantityModal } from './components/ActualQuantityModal';
import { MaterialRequestList } from './components/MaterialRequestList';
import { ImportMaterialModal } from './components/ImportMaterialModal';
import { ApprovalModal } from './components/ApprovalModal';
import { RequestDetailModal } from './components/RequestDetailModal';
import { Plus, RefreshCw, Package } from 'lucide-react';
import { useAuth, UserRole } from '@/hooks/useAuth';

export default function MaterialsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();

  // State management
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [requests, setRequests] = useState<MaterialRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActualQuantityModalOpen, setIsActualQuantityModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRequestId, setImportRequestId] = useState<string | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalRequest, setApprovalRequest] = useState<MaterialRequestDetailDto | null>(null);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>('approve');
  const [isRequestDetailModalOpen, setIsRequestDetailModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Permissions based on user role
  const canCreateRequest = user?.role === UserRole.Contractor;
  const canApproveAsHomeowner = user?.role === UserRole.Homeowner;
  const canApproveAsSupervisor = user?.role === UserRole.Supervisor;
  const canUpdateActual = user?.role === UserRole.Supervisor;

  // Load data
  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [materialsData, requestsData] = await Promise.all([
        materialService.getMaterialsByProject(projectId),
        materialService.getRequestsByProject(projectId),
      ]);

      setMaterials(materialsData);
      setRequests(requestsData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreateRequest = async () => {
    try {
      const newRequest = await materialService.createRequest({ projectId });
      setImportRequestId(newRequest.id);
      setIsImportModalOpen(true);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo yêu cầu');
    }
  };

  const handleViewMaterialDetail = (material: MaterialDto) => {
    setSelectedMaterialId(material.id);
    setIsDetailModalOpen(true);
  };

  const handleUpdateActual = (material: MaterialDto) => {
    setSelectedMaterial(material);
    setIsActualQuantityModalOpen(true);
  };

  const handleViewRequestDetail = async (request: MaterialRequestDto) => {
    try {
      const detail = await materialService.getRequestById(request.id);
      setApprovalRequest(detail);
      // Just view, no approval action
      // You can create a separate "View Request Detail Modal" if needed
      alert(`Request ID: ${detail.id}\nMaterials: ${detail.materialCount}`);
    } catch (err: any) {
      alert(err.message || 'Không thể tải chi tiết');
    }
  };

  const handleApproveRequest = async (request: MaterialRequestDto) => {
    try {
      const detail = await materialService.getRequestById(request.id);
      setApprovalRequest(detail);
      setApprovalMode('approve');
      setIsApprovalModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Không thể tải chi tiết');
    }
  };

  const handleRejectRequest = async (request: MaterialRequestDto) => {
    try {
      const detail = await materialService.getRequestById(request.id);
      setApprovalRequest(detail);
      setApprovalMode('reject');
      setIsApprovalModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Không thể tải chi tiết');
    }
  };

  const approvedMaterials = materials.filter((m) => m.requestId); // Only show approved materials

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Quản lý vật tư
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách vật tư, yêu cầu phê duyệt và khối lượng thực tế
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          {canCreateRequest && (
            <button
              onClick={handleCreateRequest}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo yêu cầu mới
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Material Requests Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Yêu cầu phê duyệt vật tư
            </h2>
            <MaterialRequestList
              requests={requests}
              canApproveAsHomeowner={canApproveAsHomeowner}
              canApproveAsSupervisor={canApproveAsSupervisor}
              onViewDetail={handleViewRequestDetail}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </section>

          {/* Approved Materials Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách vật tư đã phê duyệt
              </h2>
              <span className="text-sm text-gray-500">
                {approvedMaterials.length} vật tư
              </span>
            </div>
            <MaterialTable
              materials={approvedMaterials}
              canUpdateActual={canUpdateActual}
              onViewDetail={handleViewMaterialDetail}
              onUpdateActual={handleUpdateActual}
            />
          </section>
        </>
      )}

      {/* Modals */}
      <MaterialDetailModal
        isOpen={isDetailModalOpen}
        materialId={selectedMaterialId}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMaterialId(null);
        }}
      />

      <ActualQuantityModal
        isOpen={isActualQuantityModalOpen}
        material={selectedMaterial}
        onClose={() => {
          setIsActualQuantityModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSuccess={() => {
          loadData();
        }}
      />

      <ImportMaterialModal
        isOpen={isImportModalOpen}
        requestId={importRequestId}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportRequestId(null);
        }}
        onSuccess={() => {
          loadData();
        }}
      />

      <ApprovalModal
        isOpen={isApprovalModalOpen}
        request={approvalRequest}
        mode={approvalMode}
        approverType={canApproveAsHomeowner ? 'homeowner' : 'supervisor'}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setApprovalRequest(null);
        }}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
