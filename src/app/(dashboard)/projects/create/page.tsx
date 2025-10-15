"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { projectsApi } from "@/lib/projects/projects.api";
import { type CreateProjectDto } from "@/lib/projects/project.types";
import { scanPermitImage, type PermitScanResult } from "@/lib/ocr/permitOcr";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  FileImage,
  Shield,
  File,
} from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();
  const permitInputRef = useRef<HTMLInputElement>(null);
  const drawingInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "preview" | "form">("upload");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [permitPreview, setPermitPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PermitScanResult | null>(null);

  const [drawingFile, setDrawingFile] = useState<File | null>(null);

  const [form, setForm] = useState<CreateProjectDto>({
    name: "",
    description: "",
    address: "",
    budget: 0,
  });

  // ═══════════════════ Handle Permit Upload & Scan ═══════════════════
  const handlePermitSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Giấy phép: Chỉ chấp nhận PDF, JPG, PNG");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Giấy phép quá lớn (tối đa 10MB)");
      return;
    }

    setPermitFile(file);
    setError(null);

    // Preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPermitPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // ✅ SCAN USING CLIENT-SIDE OCR
    await handleScanPermit(file);
  };

  const handleScanPermit = async (file: File) => {
    try {
      setScanning(true);
      setError(null);
      setScanProgress(0);

      console.log("🔍 Scanning permit with Tesseract.js...");

      // ✅ CLIENT-SIDE OCR
      const result = await scanPermitImage(file, (progress) => {
        setScanProgress(progress);
      });

      console.log("✅ Scan result:", result);

      setScanResult(result);

      // Auto-fill form
      setForm((prev: CreateProjectDto) => ({
        ...prev,
        address: result.address || prev.address,
        description: `${result.buildingType} - Diện tích ${result.floorArea}m²`,
        floorArea: result.floorArea,
        numberOfFloors: result.numberOfFloors,
        permitNumber: result.permitNumber,
      }));

      if (drawingFile) {
        setStep("preview");
      }
    } catch (e: any) {
      console.error("❌ Scan error:", e);
      setError(`Lỗi OCR: ${e?.message || "Không thể quét giấy phép"}`);
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };

  const handleDrawingSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Bản vẽ: Chỉ chấp nhận file PDF");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Bản vẽ quá lớn (tối đa 50MB)");
      return;
    }

    setDrawingFile(file);
    setError(null);
  };

  const canProceedToPreview = permitFile && drawingFile && scanResult;

  const handleConfirmScan = () => {
    if (!canProceedToPreview) return;
    setStep("form");
  };

  const handleRescan = () => {
    setPermitFile(null);
    setPermitPreview(null);
    setDrawingFile(null);
    setScanResult(null);
    setStep("upload");
    if (permitInputRef.current) permitInputRef.current.value = "";
    if (drawingInputRef.current) drawingInputRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!permitFile || !drawingFile) {
      setError("Vui lòng upload đầy đủ giấy phép và bản vẽ");
      return;
    }
    if (!form.name.trim()) {
      setError("Tên dự án là bắt buộc");
      return;
    }
    if (!form.address.trim()) {
      setError("Địa chỉ là bắt buộc");
      return;
    }
    if (form.budget <= 0) {
      setError("Ngân sách phải lớn hơn 0");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ SEND OCR RESULT TO BACKEND
      const projectData = {
        ...form,
        // Include OCR data
        floorArea: scanResult?.floorArea || 0,
        numberOfFloors: scanResult?.numberOfFloors || 0,
        permitNumber: scanResult?.permitNumber || "",
      };

      console.log("🚀 Creating project with data:", projectData);
      console.log("📁 Drawing file:", drawingFile?.name, drawingFile?.size);
      console.log("📄 Permit file:", permitFile?.name, permitFile?.size);

      const project = await projectsApi.createProject(
        projectData,
        drawingFile,
        permitFile
      );

      console.log("✅ Project created successfully:", project);
      router.push(`/projects/${project.id}`);
    } catch (e: any) {
      console.error("❌ Create project error:", e);
      console.error("❌ Error details:", {
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status,
        statusText: e?.response?.statusText,
      });

      const errorMessage =
        e?.response?.data?.message || e?.message || "Không thể tạo dự án";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev: CreateProjectDto) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Testing backend connection...");
      const isConnected = await projectsApi.testConnection();
      if (isConnected) {
        setError("✅ Backend is running!");
      } else {
        setError("❌ Backend is not responding");
      }
    } catch (e: any) {
      setError(`❌ Connection test failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test create project without files
  const testCreateProject = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🧪 Testing create project without files...");

      const testData = {
        name: "Test Project",
        description: "Test description",
        address: "Test address",
        budget: 1000000,
        floorArea: 100,
        numberOfFloors: 2,
        permitNumber: "TEST123",
      };

      const success = await projectsApi.testCreateProject(testData);
      if (success) {
        setError("✅ Create project endpoint is working!");
      } else {
        setError("❌ Create project endpoint failed");
      }
    } catch (e: any) {
      setError(`❌ Test create project failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const cardCls =
    "bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-6 text-stone-100";
  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 text-stone-900 px-5 py-2.5 font-semibold hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/20";
  const btnGhost =
    "inline-flex items-center justify-center gap-2 rounded-md border border-stone-600 px-4 py-2 text-stone-200 hover:bg-stone-700/60 transition";
  const inputCls =
    "w-full rounded-md border border-stone-700 bg-stone-900/60 text-stone-100 placeholder-stone-400 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition";
  const labelCls = "text-sm font-medium text-stone-300 mb-1.5 block";

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-amber-200 mb-2">
              Tạo dự án mới
            </h1>
            <p className="text-stone-400">
              Upload bản vẽ và giấy phép • OCR tự động ngay trên trình duyệt
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <StepIndicator
              number={1}
              title="Upload tài liệu"
              active={step === "upload"}
              completed={step !== "upload"}
            />
            <div
              className={`h-px flex-1 ${
                step !== "upload" ? "bg-amber-500" : "bg-stone-700"
              }`}
            />
            <StepIndicator
              number={2}
              title="Xác nhận"
              active={step === "preview"}
              completed={step === "form"}
            />
            <div
              className={`h-px flex-1 ${
                step === "form" ? "bg-amber-500" : "bg-stone-700"
              }`}
            />
            <StepIndicator
              number={3}
              title="Hoàn tất"
              active={step === "form"}
              completed={false}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                error.includes("✅")
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-rose-500/10 border border-rose-500/30"
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  error.includes("✅") ? "text-green-400" : "text-rose-400"
                }`}
              />
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    error.includes("✅") ? "text-green-400" : "text-rose-400"
                  }`}
                >
                  {error}
                </p>
                {error.includes("❌") && (
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={testBackendConnection}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Test Backend Connection
                    </button>
                    <button
                      onClick={testCreateProject}
                      className="text-xs text-green-400 hover:text-green-300 underline"
                    >
                      Test Create Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === "upload" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Drawing */}
              <FileUploadCard
                title="Bản vẽ thi công"
                description="File PDF (tối đa 50MB)"
                icon={<FileImage className="w-6 h-6 text-blue-400" />}
                iconBg="bg-blue-500/10"
                file={drawingFile}
                onFileSelect={handleDrawingSelect}
                inputRef={drawingInputRef}
                inputId="drawing-upload"
                accept=".pdf"
                color="blue"
              />

              {/* Permit */}
              <FileUploadCard
                title="Giấy phép xây dựng"
                description="PDF, JPG, PNG (tối đa 10MB) • Sẽ được mã hóa"
                icon={<Shield className="w-6 h-6 text-amber-400" />}
                iconBg="bg-amber-500/10"
                file={permitFile}
                onFileSelect={handlePermitSelect}
                inputRef={permitInputRef}
                inputId="permit-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                color="amber"
                scanning={scanning}
                scanProgress={scanProgress}
                scanResult={scanResult}
              />
            </div>
          )}

          {step === "upload" && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setStep("preview")}
                disabled={!canProceedToPreview}
                className={btnPrimary}
              >
                <Sparkles className="w-4 h-4" />
                Tiếp tục
              </button>
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === "preview" && scanResult && (
            <PreviewSection
              scanResult={scanResult}
              drawingFile={drawingFile}
              permitFile={permitFile}
              onRescan={handleRescan}
              onConfirm={handleConfirmScan}
            />
          )}

          {/* STEP 3: Form */}
          {step === "form" && scanResult && (
            <FormSection
              form={form}
              onChange={onChange}
              onSubmit={onSubmit}
              loading={loading}
              scanResult={scanResult}
              router={router}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════ Helper Components ═══════════════════

function StepIndicator({
  number,
  title,
  active,
  completed,
}: {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
          completed
            ? "bg-amber-500 text-stone-900"
            : active
            ? "bg-amber-500/20 text-amber-400 border-2 border-amber-500"
            : "bg-stone-800 text-stone-500 border-2 border-stone-700"
        }`}
      >
        {completed ? <CheckCircle className="w-4 h-4" /> : number}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${
          active || completed ? "text-amber-300" : "text-stone-500"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

function FileUploadCard({
  title,
  description,
  icon,
  iconBg,
  file,
  onFileSelect,
  inputRef,
  inputId,
  accept,
  color,
  scanning,
  scanProgress,
  scanResult,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  file: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  inputId: string;
  accept: string;
  color: "blue" | "amber";
  scanning?: boolean;
  scanProgress?: number;
  scanResult?: PermitScanResult | null;
}) {
  const cardCls =
    "bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-6 text-stone-100";
  const colorClasses = {
    blue: {
      border: "border-blue-500",
      hoverBorder: "hover:border-blue-500",
      text: "text-blue-300",
      hoverText: "group-hover:text-blue-300",
      icon: "text-blue-400",
      hoverIcon: "group-hover:text-blue-400",
      bg: "bg-blue-500/5",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-300",
    },
    amber: {
      border: "border-amber-500",
      hoverBorder: "hover:border-amber-500",
      text: "text-amber-300",
      hoverText: "group-hover:text-amber-300",
      icon: "text-amber-400",
      hoverIcon: "group-hover:text-amber-400",
      bg: "bg-amber-500/5",
      borderColor: "border-amber-500/20",
      textColor: "text-amber-300",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cardCls}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <h3 className={`text-lg font-bold ${colors.text}`}>{title}</h3>
          <p className="text-xs text-stone-400">{description}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="hidden"
        id={inputId}
      />

      {!file ? (
        <label
          htmlFor={inputId}
          className={`flex flex-col items-center justify-center py-12 px-6 rounded-lg border-2 border-dashed border-stone-600 ${colors.hoverBorder} bg-stone-900/40 hover:bg-stone-800/60 cursor-pointer transition-all group`}
        >
          <Upload
            className={`w-10 h-10 text-stone-400 ${colors.hoverIcon} transition mb-3`}
          />
          <div className="text-center">
            <div
              className={`text-stone-200 font-medium ${colors.hoverText} transition mb-1`}
            >
              Chọn file {title.toLowerCase()}
            </div>
            <div className="text-xs text-stone-500">
              {color === "blue"
                ? "Bản vẽ thiết kế, thi công (PDF)"
                : "Sẽ tự động quét thông tin"}
            </div>
          </div>
        </label>
      ) : (
        <div className="space-y-3">
          <div
            className={`p-4 rounded-lg ${colors.bg} border ${colors.borderColor}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <FileText className={`w-8 h-8 ${colors.icon}`} />
                <div>
                  <div className={`font-medium ${colors.textColor}`}>
                    {file.name}
                  </div>
                  <div className="text-xs text-stone-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <button
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                // Reset file state will be handled by parent
              }}
              className={`text-xs ${colors.textColor} hover:opacity-80 transition`}
            >
              Thay đổi file
            </button>
          </div>

          {scanning && (
            <div className="flex items-center justify-center gap-2 py-4 text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">
                Đang quét... {scanProgress}%
              </span>
            </div>
          )}

          {scanResult && (
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-300">
                  Quét thành công ({(scanResult.confidence * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500">Diện tích: </span>
                  <span className="text-stone-200 font-medium">
                    {scanResult.floorArea}m²
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Số tầng: </span>
                  <span className="text-stone-200 font-medium">
                    {scanResult.numberOfFloors}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewSection({
  scanResult,
  drawingFile,
  permitFile,
  onRescan,
  onConfirm,
}: {
  scanResult: PermitScanResult;
  drawingFile: File | null;
  permitFile: File | null;
  onRescan: () => void;
  onConfirm: () => void;
}) {
  const cardCls =
    "bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-6 text-stone-100";
  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 text-stone-900 px-5 py-2.5 font-semibold hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20";
  const btnGhost =
    "inline-flex items-center justify-center gap-2 rounded-md border border-stone-600 px-4 py-2 text-stone-200 hover:bg-stone-700/60 transition";

  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-amber-300 mb-2">
              Xác nhận thông tin
            </h3>
            <p className="text-sm text-stone-400">
              Kiểm tra thông tin tự động trích xuất từ giấy phép
            </p>
          </div>
          <button onClick={onRescan} className={btnGhost}>
            Quét lại
          </button>
        </div>

        {/* Files Summary */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <FileImage className="w-8 h-8 text-blue-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-blue-300 truncate">
                  {drawingFile?.name}
                </div>
                <div className="text-xs text-stone-400">Bản vẽ thi công</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-amber-300 truncate">
                  {permitFile?.name}
                </div>
                <div className="text-xs text-stone-400">
                  Giấy phép (sẽ mã hóa)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Data */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem
            label="Số giấy phép"
            value={scanResult.permitNumber || "N/A"}
          />
          <InfoItem
            label="Loại công trình"
            value={scanResult.buildingType}
            highlight
          />
          <InfoItem
            label="Diện tích xây dựng"
            value={`${scanResult.floorArea} m²`}
            highlight
          />
          <InfoItem
            label="Số tầng"
            value={scanResult.numberOfFloors.toString()}
            highlight
          />
          <InfoItem
            label="Chủ đầu tư"
            value={scanResult.owner || "N/A"}
            className="col-span-2"
          />
          <InfoItem
            label="Địa chỉ"
            value={scanResult.address || "N/A"}
            className="col-span-2"
          />
        </div>

        {scanResult.warnings.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-300 space-y-1">
                {scanResult.warnings.map((w, i) => (
                  <div key={i}>• {w}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={onRescan} className={btnGhost}>
          Quét lại
        </button>
        <button onClick={onConfirm} className={btnPrimary}>
          <Sparkles className="w-4 h-4" />
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

function FormSection({
  form,
  onChange,
  onSubmit,
  loading,
  scanResult,
  router,
}: {
  form: CreateProjectDto;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  scanResult: PermitScanResult;
  router: any;
}) {
  const cardCls =
    "bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-6 text-stone-100";
  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 text-stone-900 px-5 py-2.5 font-semibold hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/20";
  const btnGhost =
    "inline-flex items-center justify-center gap-2 rounded-md border border-stone-600 px-4 py-2 text-stone-200 hover:bg-stone-700/60 transition";
  const inputCls =
    "w-full rounded-md border border-stone-700 bg-stone-900/60 text-stone-100 placeholder-stone-400 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition";
  const labelCls = "text-sm font-medium text-stone-300 mb-1.5 block";

  return (
    <form onSubmit={onSubmit} className={cardCls}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-300">Thông tin dự án</h2>
        <div className="text-sm text-stone-400">
          {scanResult.buildingType} • {scanResult.floorArea}m²
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="name">
            Tên dự án *
          </label>
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

        <div>
          <label className={labelCls} htmlFor="description">
            Mô tả
          </label>
          <textarea
            id="description"
            className={`${inputCls} resize-none`}
            rows={3}
            name="description"
            value={form.description}
            onChange={onChange}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="address">
            Địa chỉ *
          </label>
          <input
            id="address"
            className={inputCls}
            name="address"
            value={form.address}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="budget">
            Ngân sách (VND) *
          </label>
          <input
            id="budget"
            className={inputCls}
            type="number"
            name="budget"
            min="1000000"
            step="1000000"
            placeholder="2000000000"
            value={form.budget || ""}
            onChange={onChange}
            required
          />
          {form.budget > 0 && (
            <p className="mt-1 text-xs text-stone-400">
              ≈ {new Intl.NumberFormat("vi-VN").format(form.budget)} VND
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Tạo dự án
            </>
          )}
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
  );
}

function InfoItem({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg ${
        highlight
          ? "bg-amber-500/5 border border-amber-500/20"
          : "bg-stone-900/40"
      } ${className}`}
    >
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div
        className={`font-semibold ${
          highlight ? "text-amber-300" : "text-stone-200"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
