"use client";

import React, { useState, useEffect } from "react";
import { notification } from "antd";
import { SignaturePad } from "@/components/common/SignaturePad";
import {
  contractsApi,
  paymentsApi,
  type ContractDto,
} from "@/lib/contracts/contracts.api";
import { proposalsApi } from "@/lib/proposals/proposals.api";
import {
  DownloadOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const PROFILE_INFO_ERROR =
  "Vui lòng cập nhật đầy đủ thông tin cá nhân (Họ tên, SĐT, Địa chỉ) trong mục Hồ sơ trước khi xem hoặc ký hợp đồng.";

const getFriendlyErrorMessage = (
  error: any,
  fallback: string,
  userRole?: "homeowner" | "contractor"
) => {
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.response?.data?.title ||
    (typeof error?.response?.data === "string" ? error.response.data : null);

  // Check for specific profile missing errors
  if (apiMessage && typeof apiMessage === "string") {
    // Parse backend error messages
    // For contract between homeowner and contractor: only homeowner can be missing info
    if (
      apiMessage.includes("HOMEOWNER_PROFILE_MISSING") ||
      apiMessage.includes("Chủ nhà chưa cập nhật")
    ) {
      return "Chủ nhà chưa cập nhật thông tin cá nhân. Vui lòng yêu cầu chủ nhà cập nhật đầy đủ thông tin (Họ tên, SĐT, Địa chỉ) trong mục Hồ sơ trước khi xem hợp đồng.";
    }
    // CONTRACTOR_INFO_MISSING should not happen (contractor info is created during registration)
    // But if it does, show generic error
    if (
      apiMessage.includes("CONTRACTOR_INFO_MISSING") ||
      apiMessage.includes("CONTRACTOR_PROFILE_MISSING")
    ) {
      return "Không tìm thấy thông tin nhà thầu. Vui lòng liên hệ hỗ trợ.";
    }
    // If message already contains the full error, return it
    if (apiMessage.includes("chưa cập nhật thông tin cá nhân")) {
      return apiMessage;
    }
    return apiMessage;
  }

  if (
    typeof error?.message === "string" &&
    error.message !== "Request failed with status code 500"
  ) {
    // Filter out technical error messages like "Request failed with status code XXX"
    if (error.message.match(/Request failed with status code \d+/)) {
      // Don't return technical error messages, fall through to other checks
    } else {
      // Check error message for profile issues
      // For contract between homeowner and contractor: only homeowner can be missing info
      if (
        error.message.includes("HOMEOWNER_PROFILE_MISSING") ||
        error.message.includes("Homeowner profile not found")
      ) {
        return "Chủ nhà chưa cập nhật thông tin cá nhân. Vui lòng yêu cầu chủ nhà cập nhật đầy đủ thông tin (Họ tên, SĐT, Địa chỉ) trong mục Hồ sơ trước khi xem hợp đồng.";
      }
      // CONTRACTOR_INFO_MISSING should not happen, but if it does, show generic error
      if (
        error.message.includes("CONTRACTOR_INFO_MISSING") ||
        error.message.includes("CONTRACTOR_PROFILE_MISSING") ||
        error.message.includes("Contractor information not found")
      ) {
        return "Không tìm thấy thông tin nhà thầu. Vui lòng liên hệ hỗ trợ.";
      }
      // Only return non-technical error messages
      if (
        !error.message.match(
          /status code|Request failed|Network Error|timeout/i
        )
      ) {
        return error.message;
      }
    }
  }

  // Check for 400/500 status codes and provide friendly messages
  if (error?.response?.status === 400 || error?.response?.status === 500) {
    // For 400/500 errors, check if we have a specific profile error message
    if (apiMessage && typeof apiMessage === "string") {
      // For contract between homeowner and contractor: only homeowner can be missing info
      if (
        apiMessage.includes("HOMEOWNER_PROFILE_MISSING") ||
        apiMessage.includes("Chủ nhà chưa cập nhật")
      ) {
        return "Chủ nhà chưa cập nhật thông tin cá nhân. Vui lòng yêu cầu chủ nhà cập nhật đầy đủ thông tin (Họ tên, SĐT, Địa chỉ) trong mục Hồ sơ trước khi xem hợp đồng.";
      }
      // CONTRACTOR_INFO_MISSING should not happen, but if it does, show generic error
      if (
        apiMessage.includes("CONTRACTOR_INFO_MISSING") ||
        apiMessage.includes("CONTRACTOR_PROFILE_MISSING")
      ) {
        return "Không tìm thấy thông tin nhà thầu. Vui lòng liên hệ hỗ trợ.";
      }
      // If apiMessage contains other useful info, return it
      if (apiMessage.includes("chưa cập nhật thông tin cá nhân")) {
        return apiMessage;
      }
    }

    // Fallback: for contract between homeowner and contractor, only homeowner can be missing info
    return "Không thể tải PDF hợp đồng. Vui lòng kiểm tra xem chủ nhà đã cập nhật đầy đủ thông tin cá nhân (Họ tên, SĐT, Địa chỉ) trong mục Hồ sơ chưa.";
  }

  return fallback;
};

interface ContractSigningModalProps {
  contractId: string;
  userRole: "homeowner" | "contractor";
  onClose: () => void;
  onSigned?: (contract: ContractDto) => void;
  onError?: (message: string) => void;
}

export const ContractSigningModal: React.FC<ContractSigningModalProps> = ({
  contractId,
  userRole,
  onClose,
  onSigned,
  onError,
}) => {
  const [contract, setContract] = useState<ContractDto | null>(null);
  const [proposalPriceTotal, setProposalPriceTotal] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string>("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [commissionPaidServer, setCommissionPaidServer] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    loadContract();
    loadPdf();
    loadWalletBalance();
    checkCommissionStatus();
  }, [contractId]);

  const emitError = (message: string) => {
    if (!message) return;
    onError?.(message.startsWith("✗") ? message : `✗ ${message}`);
  };

  const loadContract = async () => {
    try {
      const data = await contractsApi.getById(contractId);
      setContract(data);

      // Load proposal to get priceTotal for commission calculation
      if (data.proposalId) {
        try {
          const proposal = await proposalsApi.getMineById(data.proposalId);
          setProposalPriceTotal(proposal.priceTotal);
        } catch (proposalError: any) {
          console.error("Failed to load proposal:", proposalError);
          // Fallback to contract totalPrice
          setProposalPriceTotal(data.totalPrice);
        }
      } else {
        // Fallback to contract totalPrice
        setProposalPriceTotal(data.totalPrice);
      }
    } catch (error: any) {
      const friendly = getFriendlyErrorMessage(
        error,
        "Không thể tải dữ liệu hợp đồng. Vui lòng thử lại sau."
      );
      emitError(friendly);
    } finally {
      setLoading(false);
    }
  };

  const loadPdf = async () => {
    try {
      setPdfLoading(true);
      setPdfError(null);
      setProfileError(null);
      console.log("Loading PDF for contract ID:", contractId);

      // First try to generate PDF if it doesn't exist - this will validate profiles on backend
      try {
        console.log("Attempting to generate PDF...");
        await contractsApi.generatePdf(contractId);
        console.log("PDF generation successful");
      } catch (error: any) {
        console.log("PDF generation error:", error);
        // Check if it's a profile validation error
        const friendly = getFriendlyErrorMessage(
          error,
          PROFILE_INFO_ERROR,
          userRole
        );

        // Check for specific profile missing errors
        if (
          friendly.includes("HOMEOWNER_PROFILE_MISSING") ||
          friendly.includes("Chủ nhà chưa cập nhật")
        ) {
          setProfileError(
            "Chủ nhà chưa cập nhật thông tin cá nhân. Vui lòng yêu cầu chủ nhà cập nhật đầy đủ thông tin (Họ tên, SĐT, Địa chỉ) trong mục Hồ sơ trước khi xem hợp đồng."
          );
          setPdfError(friendly);
          setPdfUrl("");
          return;
        }
        // Other errors - still try to download if PDF might exist
        console.log(
          "PDF generation failed, will try to download existing PDF:",
          error
        );
      }

      // Download PDF - this will also validate profiles
      try {
        console.log("Attempting to download PDF...");
        const blob = await contractsApi.downloadPdf(contractId);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setPdfError(null);
        setProfileError(null);
        console.log("PDF loaded successfully");
      } catch (downloadError: any) {
        console.error("Error downloading PDF:", downloadError);
        const friendly = getFriendlyErrorMessage(
          downloadError,
          PROFILE_INFO_ERROR,
          userRole
        );

        // Check for specific profile missing errors
        if (
          friendly.includes("HOMEOWNER_PROFILE_MISSING") ||
          friendly.includes("Chủ nhà chưa cập nhật")
        ) {
          setProfileError(
            "Chủ nhà chưa cập nhật thông tin cá nhân. Vui lòng yêu cầu chủ nhà cập nhật đầy đủ thông tin (Họ tên, SĐT, Địa chỉ) trong mục Hồ sơ trước khi xem hợp đồng."
          );
        } else {
          setProfileError(friendly);
        }

        setPdfError(friendly);
        setPdfUrl("");
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      if (userRole === "contractor") {
        const data = await paymentsApi.getWalletBalance();
        setWalletBalance(data.balance);
      }
    } catch (error) {
      console.error("Failed to load wallet balance:", error);
      setWalletBalance(0);
    }
  };

  const checkCommissionStatus = async () => {
    try {
      if (userRole === "contractor") {
        const res = await paymentsApi.getCommissionStatus(contractId);
        setCommissionPaidServer(!!res?.paid);
      }
    } catch (e) {
      setCommissionPaidServer(null);
    }
  };

  // Helpers
  const commissionRequiredRaw = Math.round((proposalPriceTotal || 0) * 0.01);
  const commissionRequired = Math.max(
    1000,
    Math.ceil((commissionRequiredRaw || 0) / 1000) * 1000
  );
  // Strict gating: rely on server-paid flag; if unknown or false -> treat as NOT paid
  const commissionPaid =
    userRole !== "contractor" ? true : commissionPaidServer === true;

  const handleSaveSignature = (signature: string) => {
    setSignatureBase64(signature);
    setShowSignaturePad(false);
  };

  const handleSign = async () => {
    if (!signatureBase64) {
      notification.warning({
        message: "Chưa ký tên",
        description: "Vui lòng ký tên trước!",
      });
      return;
    }

    // Enforce commission payment for contractor before signing
    if (userRole === "contractor") {
      if (commissionRequired <= 0) {
        notification.error({
          message: "Lỗi",
          description:
            "Không xác định được phí môi giới. Vui lòng thử lại sau.",
        });
        return;
      }
      if (!commissionPaid) {
        notification.warning({
          message: "Chưa thanh toán",
          description: "Bạn cần thanh toán phí môi giới trước khi ký hợp đồng.",
        });
        return;
      }
    }

    setSigning(true);
    try {
      const signDto = { signatureBase64 };

      const updatedContract =
        userRole === "homeowner"
          ? await contractsApi.signByHomeowner(contractId, signDto)
          : await contractsApi.signByContractor(contractId, signDto);

      notification.success({
        message: "Thành công",
        description: "Ký hợp đồng thành công!",
      });

      if (onSigned) {
        onSigned(updatedContract);
      }

      onClose();
    } catch (error: any) {
      const errorMsg = getFriendlyErrorMessage(
        error,
        "Ký hợp đồng thất bại. Vui lòng kiểm tra lại thông tin và thử lại."
      );
      emitError(errorMsg);
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `contract_${contractId}.pdf`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-stone-900 p-6 rounded-lg">
          <p className="text-white">Đang tải hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return null;
  }

  const canSign =
    userRole === "homeowner"
      ? !contract.homeownerSignatureBase64
      : contract.homeownerSignatureBase64 &&
        !contract.contractorSignatureBase64;

  const alreadySigned =
    userRole === "homeowner"
      ? !!contract.homeownerSignatureBase64
      : !!contract.contractorSignatureBase64;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-700">
          <h2 className="text-xl font-bold text-white">
            {userRole === "homeowner"
              ? "Ký hợp đồng (Chủ nhà)"
              : "Ký hợp đồng (Nhà thầu)"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contract Info */}
          <div className="bg-stone-800 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-stone-400">Trạng thái</p>
                <p className="text-white font-medium">{contract.status}</p>
              </div>
              <div>
                <p className="text-sm text-stone-400">Tổng giá trị</p>
                <p className="text-amber-400 font-semibold">
                  {(proposalPriceTotal || 0).toLocaleString("vi-VN")} đồng
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-400">Thời gian thi công</p>
                <p className="text-white">{contract.durationDays} ngày</p>
              </div>
              <div>
                <p className="text-sm text-stone-400">Ngày tạo</p>
                <p className="text-white">
                  {new Date(contract.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Signature Status */}
            <div className="pt-4 border-t border-stone-700 space-y-2">
              <div className="flex items-center gap-2">
                {contract.homeownerSignatureBase64 ? (
                  <CheckOutlined className="text-green-500" />
                ) : (
                  <span className="text-stone-500">○</span>
                )}
                <span
                  className={
                    contract.homeownerSignatureBase64
                      ? "text-green-400"
                      : "text-stone-400"
                  }
                >
                  Chủ nhà đã ký{" "}
                  {contract.signedByHomeownerAt &&
                    `(${new Date(contract.signedByHomeownerAt).toLocaleString(
                      "vi-VN"
                    )})`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {contract.contractorSignatureBase64 ? (
                  <CheckOutlined className="text-green-500" />
                ) : (
                  <span className="text-stone-500">○</span>
                )}
                <span
                  className={
                    contract.contractorSignatureBase64
                      ? "text-green-400"
                      : "text-stone-400"
                  }
                >
                  Nhà thầu đã ký{" "}
                  {contract.signedByContractorAt &&
                    `(${new Date(contract.signedByContractorAt).toLocaleString(
                      "vi-VN"
                    )})`}
                </span>
              </div>
            </div>
          </div>

          {/* Contractor commission payment requirement - show until paid and not already signed */}
          {userRole === "contractor" && !alreadySigned && !commissionPaid && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-amber-300 font-semibold">
                    Yêu cầu thanh toán phí môi giới
                  </p>
                  <p className="text-sm text-amber-200/80 mt-1">
                    Để ký hợp đồng, nhà thầu cần thanh toán phí hoa hồng 1% trên
                    tổng giá trị dự án (đã bao gồm VAT).
                  </p>
                  <p className="text-sm text-amber-200 mt-2">
                    Số tiền cần thanh toán:{" "}
                    <span className="font-semibold">
                      {commissionRequired.toLocaleString("vi-VN")} đồng
                    </span>
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md"
                    onClick={async () => {
                      try {
                        const amount = commissionRequired;
                        if (!amount || amount <= 0) {
                          notification.error({
                            message: "Lỗi",
                            description:
                              "Không xác định được số tiền phí môi giới",
                          });
                          return;
                        }
                        const redirectUrl = `${window.location.origin}/projects?tab=contracts`;
                        const res = await paymentsApi.momoCreate({
                          amount,
                          description: "Phí môi giới ký hợp đồng",
                          contractId,
                          redirectUrl,
                          purpose: "commission",
                        });
                        if (res?.payUrl) {
                          window.location.href = res.payUrl;
                        } else {
                          notification.error({
                            message: "Lỗi",
                            description: "Không lấy được liên kết thanh toán",
                          });
                        }
                      } catch (e: any) {
                        notification.error({
                          message: "Lỗi",
                          description:
                            e?.response?.data ||
                            e?.message ||
                            "Khởi tạo thanh toán MoMo thất bại",
                        });
                      }
                    }}
                  >
                    Thanh toán qua MoMo
                  </button>
                </div>
              </div>
              <p className="text-xs text-amber-200/70 mt-2">
                Sau khi thanh toán thành công, vui lòng quay lại và tiến hành ký
                hợp đồng.
              </p>
            </div>
          )}

          {/* Profile Error - Show prominently at top */}
          {profileError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-300 font-semibold mb-1">
                    Không thể tải PDF hợp đồng
                  </p>
                  <p className="text-red-200 text-sm">{profileError}</p>
                  <p className="text-red-200/80 text-xs mt-2">
                    Vui lòng cập nhật đầy đủ thông tin trong mục{" "}
                    <strong>Hồ sơ</strong> trước khi xem hoặc ký hợp đồng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PDF Preview */}
          {pdfUrl && !profileError && (
            <div className="bg-stone-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Xem trước hợp đồng</h3>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
                >
                  <DownloadOutlined />
                  Tải PDF
                </button>
              </div>
              <iframe
                src={pdfUrl}
                className="w-full h-[500px] border border-stone-700 rounded"
                title="Contract PDF"
              />
            </div>
          )}

          {/* Signature Section */}
          {canSign && !alreadySigned && (
            <div className="bg-stone-800 p-4 rounded-lg space-y-4">
              <h3 className="text-white font-semibold">Chữ ký điện tử</h3>

              {/* Show loading state */}
              {pdfLoading && !profileError && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                  <p className="text-amber-300 text-sm">
                    Đang tải PDF hợp đồng...
                  </p>
                </div>
              )}

              {/* Show error if PDF failed to load (non-profile errors) */}
              {pdfError && !profileError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-300 text-sm">{pdfError}</p>
                  <p className="text-red-200/80 text-xs mt-1">
                    Vui lòng giải quyết vấn đề trên trước khi ký hợp đồng.
                  </p>
                </div>
              )}

              {!showSignaturePad && !signatureBase64 && (
                <button
                  onClick={() => {
                    if (userRole === "contractor" && !commissionPaid) return;
                    if (!pdfUrl) {
                      emitError(
                        "Vui lòng đợi PDF hợp đồng tải xong trước khi ký."
                      );
                      return;
                    }
                    setShowSignaturePad(true);
                  }}
                  disabled={
                    (userRole === "contractor" && !commissionPaid) ||
                    !pdfUrl ||
                    pdfLoading ||
                    !!pdfError ||
                    !!profileError
                  }
                  className={`w-full px-4 py-3 rounded-lg transition-colors ${
                    (userRole === "contractor" && !commissionPaid) ||
                    !pdfUrl ||
                    pdfLoading ||
                    !!pdfError ||
                    !!profileError
                      ? "bg-stone-700 text-stone-300 opacity-60 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                  title={
                    profileError
                      ? "Vui lòng cập nhật thông tin cá nhân trước khi ký hợp đồng"
                      : userRole === "contractor" && !commissionPaid
                      ? "Vui lòng thanh toán phí môi giới trước"
                      : !pdfUrl || pdfLoading
                      ? "Đang tải PDF hợp đồng..."
                      : pdfError
                      ? "PDF hợp đồng chưa tải được. Vui lòng kiểm tra lại."
                      : undefined
                  }
                >
                  {pdfLoading
                    ? "Đang tải PDF..."
                    : profileError
                    ? "Không thể ký (Thiếu thông tin)"
                    : pdfError
                    ? "Không thể ký (PDF lỗi)"
                    : "Bắt đầu ký tên"}
                </button>
              )}

              {showSignaturePad && (
                <div className="relative" style={{ isolation: "isolate" }}>
                  <SignaturePad
                    onSave={handleSaveSignature}
                    onClear={() => setSignatureBase64("")}
                    width={1120}
                    height={150}
                  />
                </div>
              )}

              {signatureBase64 && !showSignaturePad && (
                <div className="space-y-3">
                  <div className="border-2 border-green-600 rounded-lg p-2 bg-white">
                    <img
                      src={signatureBase64}
                      alt="Signature"
                      className="max-w-full h-auto"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSignatureBase64("");
                      setShowSignaturePad(true);
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Ký lại
                  </button>
                </div>
              )}
            </div>
          )}

          {alreadySigned && (
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-medium">
                ✓ Bạn đã ký hợp đồng này
              </p>
            </div>
          )}

          {!canSign && !alreadySigned && userRole === "contractor" && (
            <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-400 font-medium">
                ⏳ Đang chờ chủ nhà ký hợp đồng trước
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-stone-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors"
          >
            {alreadySigned ? "Đóng" : "Quay lại"}
          </button>

          {canSign &&
            !alreadySigned &&
            signatureBase64 &&
            (userRole !== "contractor" || commissionPaid) &&
            pdfUrl &&
            !pdfError &&
            !profileError && (
              <button
                onClick={handleSign}
                disabled={
                  signing ||
                  !pdfUrl ||
                  pdfLoading ||
                  !!pdfError ||
                  !!profileError
                }
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signing ? "Đang ký..." : "Xác nhận ký hợp đồng"}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};
