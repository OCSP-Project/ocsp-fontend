"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { notification } from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import {
  contractsApi,
  paymentsApi,
  escrowApi,
  supervisorContractsApi,
  type ContractListItemDto,
  type ContractDetailDto,
  type ContractItemDto,
  type SupervisorContractListItemDto,
  type SupervisorContractDto,
} from "@/lib/contracts/contracts.api";
import { proposalsApi } from "@/lib/proposals/proposals.api";
import { type ProposalDto } from "@/lib/proposals/proposal.types";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { ContractSigningModal } from "@/components/features/contracts";
import { SupervisorContractSigningModal } from "@/components/features/contracts/SupervisorContractSigningModal";
import ProposalDisplay from "@/components/features/proposals/components/ProposalDisplay";

interface ContractsSectionProps {
  projectId?: string;
}

export default function ContractsSection({ projectId }: ContractsSectionProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [contracts, setContracts] = useState<ContractListItemDto[]>([]);
  const [supervisorContracts, setSupervisorContracts] = useState<
    SupervisorContractListItemDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>(
    {}
  );
  const [proposalTotals, setProposalTotals] = useState<Record<string, number>>(
    {}
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Contract signing modal state
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [signingContract, setSigningContract] =
    useState<ContractListItemDto | null>(null);

  // Supervisor contract signing modal state
  const [showSupervisorSigningModal, setShowSupervisorSigningModal] =
    useState(false);
  const [signingSupervisorContract, setSigningSupervisorContract] =
    useState<SupervisorContractDto | null>(null);

  // Ref for scrolling to supervisor contract section
  const supervisorContractRef = React.useRef<HTMLDivElement>(null);
  // Refs for individual contract items
  const contractItemRefs = React.useRef<Record<string, HTMLDivElement | null>>(
    {}
  );
  const messageTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [highlightedContractId, setHighlightedContractId] = useState<
    string | null
  >(null);

  // Proposal detail modal state
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalDto | null>(
    null
  );
  const [loadingProposal, setLoadingProposal] = useState(false);

  // UI tokens to align with the light teal/indigo palette
  const wrapperCls =
    "relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-white to-indigo-50 border border-teal-100/60 shadow-xl p-6";
  const cardCls =
    "bg-white/90 backdrop-blur-xl rounded-2xl border border-white/70 shadow-lg p-6 text-slate-800";
  const ghostBtnCls =
    "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 text-slate-700 border border-slate-200 hover:border-teal-200 hover:text-teal-700 transition";
  const primaryBtnCls =
    "flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition";
  const subtleTextCls = "text-sm text-slate-500";

  const showBannerMessage = useCallback((message: string, duration = 10000) => {
    setSuccessMessage(message);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    if (duration > 0) {
      messageTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
        messageTimeoutRef.current = null;
      }, duration);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const handleContractModalError = useCallback(
    (message: string) => {
      const formatted = message.startsWith("✗") ? message : `✗ ${message}`;
      showBannerMessage(formatted, 10000);
    },
    [showBannerMessage]
  );

  // Track processed orders to prevent duplicate webhook calls
  // Use both ref (for current session) and localStorage (persists across refreshes)
  const processedOrdersRef = React.useRef<Set<string>>(new Set());

  // Load processed orders from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("processedMoMoOrders");
      if (stored) {
        const orderIds = JSON.parse(stored) as string[];
        orderIds.forEach((id) => processedOrdersRef.current.add(id));
      }
    } catch (e) {
      console.error("Failed to load processed orders from localStorage:", e);
    }
  }, []);

  // Check MoMo payment result and call manual webhook
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const requestId = searchParams.get("requestId");
    const resultCode = searchParams.get("resultCode");
    const extraData = searchParams.get("extraData");

    if (orderId && requestId && extraData && resultCode !== null) {
      // Check if already processed (in memory or localStorage)
      if (processedOrdersRef.current.has(orderId)) {
        console.log("Webhook already processed for orderId:", orderId);
        return;
      }

      // Mark as processed (both in memory and localStorage)
      processedOrdersRef.current.add(orderId);
      try {
        const stored = localStorage.getItem("processedMoMoOrders");
        const orderIds = stored ? (JSON.parse(stored) as string[]) : [];
        if (!orderIds.includes(orderId)) {
          orderIds.push(orderId);
          // Keep only last 100 orderIds to avoid localStorage bloat
          const recentOrderIds = orderIds.slice(-100);
          localStorage.setItem(
            "processedMoMoOrders",
            JSON.stringify(recentOrderIds)
          );
        }
      } catch (e) {
        console.error("Failed to save processed order to localStorage:", e);
      }

      // Call manual webhook to update payment status
      const payload = {
        PartnerCode: searchParams.get("partnerCode") || "MOMO",
        OrderId: orderId,
        RequestId: requestId,
        Amount: Number(searchParams.get("amount")) || 0,
        ResponseTime: searchParams.get("responseTime") || Date.now().toString(),
        Message: searchParams.get("message") || "",
        ResultCode: Number(resultCode) || 0,
        PayUrl: searchParams.get("payUrl") || "",
        ShortLink: searchParams.get("shortLink") || "",
        OrderInfo: searchParams.get("orderInfo") || "",
        PayType: searchParams.get("payType") || "",
        TransId: searchParams.get("transId") || "",
        ExtraData: extraData,
        Signature: searchParams.get("signature") || "",
      };

      paymentsApi
        .manualWebhook(payload)
        .then(() => {
          console.log("Payment webhook successful");
          if (resultCode === "0") {
            // Check if this is supervisor payment
            const purpose = extraData
              ? (() => {
                  try {
                    const decoded = atob(extraData);
                    const parsed = JSON.parse(decoded);
                    return parsed.purpose;
                  } catch {
                    return null;
                  }
                })()
              : null;

            if (purpose === "supervisor") {
              showBannerMessage(
                "✓ Thanh toán đăng ký giám sát viên thành công! Bạn có thể ký hợp đồng ngay bây giờ.",
                10000
              );
            } else {
              showBannerMessage(
                "✓ Thanh toán phí môi giới thành công! Bạn có thể tiếp tục ký hợp đồng.",
                10000
              );
            }
            // Trigger contracts reload
            setRefreshTrigger((prev) => prev + 1);
          }
        })
        .catch((error) => {
          console.error("Manual webhook failed:", error);
          // Remove from processed set on error to allow retry
          processedOrdersRef.current.delete(orderId);
        });
    } else if (resultCode !== null && resultCode !== "0") {
      showBannerMessage(
        "✗ Thanh toán không thành công. Vui lòng thử lại.",
        10000
      );
    }
  }, [searchParams, showBannerMessage]);

  // Load contracts
  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      try {
        console.log("Loading contracts...");
        // Load both contractor and supervisor contracts
        const [contractorData, supervisorData] = await Promise.all([
          contractsApi.getAll(),
          supervisorContractsApi.getAll().catch(() => []), // Ignore errors for supervisor contracts
        ]);
        console.log("Contracts loaded:", contractorData);
        console.log("Supervisor contracts loaded:", supervisorData);
        setContracts(contractorData);
        setSupervisorContracts(supervisorData);

        // Check if we need to scroll to a specific supervisor contract
        const supervisorContractId = searchParams.get("supervisorContractId");
        if (supervisorContractId && supervisorData.length > 0) {
          // Find the contract in the list
          const contractExists = supervisorData.some(
            (c) => c.id === supervisorContractId
          );
          if (contractExists) {
            setHighlightedContractId(supervisorContractId);
            // Scroll after a short delay to ensure DOM is updated
            setTimeout(() => {
              // Try to scroll to the specific contract item first
              const contractElement =
                contractItemRefs.current[supervisorContractId];
              if (contractElement) {
                contractElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else {
                // Fallback: scroll to section
                supervisorContractRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
              // Remove query param after scrolling
              const url = new URL(window.location.href);
              url.searchParams.delete("supervisorContractId");
              window.history.replaceState({}, "", url.toString());
              // Remove highlight after 3 seconds
              setTimeout(() => {
                setHighlightedContractId(null);
              }, 3000);
            }, 300);
          }
        }
      } catch (error) {
        console.error("Failed to load contracts:", error);
        // Show error message to user
        showBannerMessage(
          `✗ Lỗi tải hợp đồng: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          10000
        );
      } finally {
        setLoading(false);
      }
    };

    loadContracts();

    // Load wallet balance for contractors (overall, not shown in header anymore)
    if (user?.role === UserRole.Contractor) {
      const loadWalletBalance = async () => {
        try {
          const data = await paymentsApi.getWalletBalance();
          setWalletBalance(data.balance);
        } catch (error) {
          console.error("Failed to load wallet balance:", error);
          setWalletBalance(0);
        }
      };
      loadWalletBalance();
    }
  }, [user?.role, refreshTrigger, searchParams, showBannerMessage]);

  // Load escrow balances per contract
  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        const entries = await Promise.all(
          contracts.map(async (c) => {
            try {
              const acc = await escrowApi.getByContract(c.id);
              return [c.id, acc?.balance ?? 0] as const;
            } catch {
              return [c.id, 0] as const;
            }
          })
        );
        const map: Record<string, number> = {};
        for (const [id, bal] of entries) map[id] = bal;
        setEscrowBalances(map);
      } catch (e) {
        // ignore; leave balances as 0
      }
    };
    if (contracts.length > 0) fetchEscrows();
  }, [contracts]);

  // Load proposal totals per contract (use proposal.priceTotal)
  useEffect(() => {
    const fetchProposalTotals = async () => {
      try {
        const entries = await Promise.all(
          contracts.map(async (c) => {
            try {
              // Ensure we have proposalId; fetch detail if missing
              const proposalId =
                c.proposalId ||
                (await contractsApi.getDetailById(c.id)).proposalId;
              const p = await proposalsApi.getMineById(proposalId);
              return [c.id, p.priceTotal] as const;
            } catch {
              return [c.id, c.totalPrice] as const; // fallback
            }
          })
        );
        const map: Record<string, number> = {};
        for (const [id, total] of entries) map[id] = total;
        setProposalTotals(map);
      } catch {
        // ignore
      }
    };
    if (contracts.length > 0) fetchProposalTotals();
  }, [contracts]);

  // Check for success message from localStorage
  useEffect(() => {
    const message = localStorage.getItem("contractSuccess");
    if (message) {
      showBannerMessage(message, 5000);
      localStorage.removeItem("contractSuccess"); // Clear after reading
    }
  }, [showBannerMessage]);

  const handleUpdateContractStatus = async (
    contractId: string,
    newStatus: number
  ) => {
    setUpdatingStatus(contractId);
    try {
      await contractsApi.updateStatus(contractId, newStatus.toString());

      // Reload contracts list
      const updatedContracts = await contractsApi.getAll();
      setContracts(updatedContracts);

      // Show success message
      const statusNames = {
        0: "Draft",
        1: "PendingSignatures",
        2: "Active",
        3: "Completed",
        4: "Cancelled",
      };
      showBannerMessage(
        `✓ Cập nhật trạng thái hợp đồng thành công: ${
          statusNames[newStatus as keyof typeof statusNames]
        }`,
        5000
      );
    } catch (error) {
      console.error("Failed to update contract status:", error);
      showBannerMessage(
        `✗ Lỗi cập nhật trạng thái: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        10000
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle contract signing
  const handleSignContract = (contract: ContractListItemDto) => {
    setSigningContract(contract);
    setShowSigningModal(true);
  };

  const handleSigningComplete = async () => {
    setShowSigningModal(false);
    setSigningContract(null);

    // Reload contracts to show updated status
    const updatedContracts = await contractsApi.getAll();
    setContracts(updatedContracts);

    showBannerMessage("✓ Ký hợp đồng thành công!", 5000);
  };

  // Handle view proposal
  const handleViewProposal = async (contract: ContractListItemDto) => {
    setLoadingProposal(true);
    setShowProposalModal(true);
    try {
      // Get contract detail to get proposalId
      const detail = await contractsApi.getDetailById(contract.id);

      // Then load proposal by proposalId
      const proposal = await proposalsApi.getMineById(detail.proposalId);
      setSelectedProposal(proposal as any); // Type compatibility fix
    } catch (error: any) {
      console.error("Failed to load proposal:", error);
      notification.error({
        message: "Lỗi",
        description:
          "Lỗi tải thông tin proposal: " + (error.message || "Unknown error"),
      });
      setShowProposalModal(false);
    } finally {
      setLoadingProposal(false);
    }
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Draft: "Nháp",
      PendingSignatures: "Chờ ký",
      Active: "Đang hiệu lực",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "text-yellow-400";
      case "PendingSignatures":
        return "text-orange-400";
      case "Active":
        return "text-green-400";
      case "Completed":
        return "text-blue-400";
      case "Cancelled":
        return "text-red-400";
      default:
        return "text-stone-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Đang tải hợp đồng...</div>
      </div>
    );
  }

  return (
    <div className={wrapperCls + " space-y-6"}>
      {/* Success/Error Message */}
      {successMessage && (
        <div
          className={`rounded-lg p-4 ${
            successMessage.includes("✗") ||
            successMessage.includes("Lỗi") ||
            successMessage.includes("Error") ||
            successMessage.includes("không thành công")
              ? "bg-red-50 border border-red-200 text-red-600"
              : "bg-emerald-50 border border-emerald-200 text-emerald-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {successMessage.includes("✗") ||
            successMessage.includes("Lỗi") ||
            successMessage.includes("Error") ||
            successMessage.includes("không thành công") ? (
              <span className="text-red-500">⚠️</span>
            ) : (
              <CheckCircleOutlined className="text-emerald-500" />
            )}
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Hợp đồng</h2>
      </div>

      {contracts.length === 0 && supervisorContracts.length === 0 ? (
        <div className="text-center py-12">
          <FileTextOutlined className="text-6xl text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg">Chưa có hợp đồng nào</p>
          <p className={subtleTextCls}>
            Hợp đồng sẽ được tạo sau khi bạn chấp nhận proposal hoặc đăng ký
            giám sát viên
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Contractor Contracts */}
          {contracts.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Hợp đồng nhà thầu
              </h3>
              <div className="grid gap-4">
                {contracts.map((contract) => (
                  <div key={contract.id} className={cardCls}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <FileTextOutlined className="text-amber-500" />
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              Hợp đồng #{contract.id.slice(-8)}
                            </h3>
                            <p className={subtleTextCls}>
                              Dự án: {contract.projectName}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className={subtleTextCls}>Nhà thầu</p>
                            <p className="text-slate-900">
                              {contract.contractorName}
                            </p>
                          </div>
                          <div>
                            <p className={subtleTextCls}>Dự án</p>
                            <p className="text-slate-900">
                              {contract.projectName}
                            </p>
                          </div>
                          <div>
                            <p className={subtleTextCls}>Trạng thái</p>
                            <p
                              className={`font-medium ${getStatusColor(
                                contract.status
                              )}`}
                            >
                              {getStatusDisplayName(contract.status)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className={subtleTextCls}>Ngày tạo</p>
                            <p className="text-slate-900">
                              {formatDate(contract.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className={subtleTextCls}>Tổng giá trị</p>
                            <p className="text-amber-500 font-semibold text-lg">
                              {formatCurrency(
                                proposalTotals[contract.id] ??
                                  contract.totalPrice
                              )}
                            </p>
                          </div>
                          {user?.role === UserRole.Contractor &&
                            (escrowBalances[contract.id] ?? 0) > 0 && (
                              <div>
                                <p className={subtleTextCls}>Đã thanh toán</p>
                                <p className="text-emerald-600 font-semibold text-lg">
                                  {formatCurrency(
                                    escrowBalances[contract.id] ?? 0
                                  )}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewProposal(contract)}
                          className={ghostBtnCls}
                        >
                          <ProjectOutlined />
                          Xem dự án
                        </button>
                        <button
                          onClick={() => handleSignContract(contract)}
                          className={primaryBtnCls}
                        >
                          <EditOutlined />
                          Ký hợp đồng
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supervisor Contracts */}
          {supervisorContracts.length > 0 && (
            <div ref={supervisorContractRef}>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Hợp đồng giám sát viên
              </h3>
              <div className="grid gap-4">
                {supervisorContracts.map((contract) => (
                  <div
                    key={contract.id}
                    ref={(el) => {
                      contractItemRefs.current[contract.id] = el;
                    }}
                    className={`${cardCls} transition-all duration-500 ${
                      highlightedContractId === contract.id
                        ? "border-teal-300 shadow-lg shadow-teal-200/60 ring-2 ring-teal-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <FileTextOutlined className="text-amber-500" />
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              Hợp đồng giám sát #{contract.id.slice(-8)}
                            </h3>
                            <p className={subtleTextCls}>
                              Dự án: {contract.projectName}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className={subtleTextCls}>Giám sát viên</p>
                            <p className="text-slate-900">
                              {contract.supervisorName}
                            </p>
                          </div>
                          <div>
                            <p className={subtleTextCls}>
                              Phí đăng ký giám sát viên
                            </p>
                            <p className="text-amber-500 font-semibold text-lg">
                              {formatCurrency(contract.monthlyPrice)}
                            </p>
                          </div>
                          <div>
                            <p className={subtleTextCls}>Trạng thái</p>
                            <p
                              className={`font-medium ${getStatusColor(
                                contract.status
                              )}`}
                            >
                              {getStatusDisplayName(contract.status)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className={subtleTextCls}>Ngày tạo</p>
                          <p className="text-slate-900">
                            {formatDate(contract.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {(user?.role === UserRole.Homeowner ||
                          user?.role === UserRole.Supervisor) && (
                          <button
                            onClick={async () => {
                              try {
                                const contractDetail =
                                  await supervisorContractsApi.getById(
                                    contract.id
                                  );
                                setSigningSupervisorContract(contractDetail);
                                setShowSupervisorSigningModal(true);
                              } catch (error) {
                                notification.error({
                                  message: "Lỗi",
                                  description:
                                    "Lỗi tải hợp đồng: " +
                                    (error instanceof Error
                                      ? error.message
                                      : "Unknown error"),
                                });
                              }
                            }}
                            className={primaryBtnCls}
                          >
                            <EditOutlined />
                            Ký hợp đồng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contract Signing Modal */}
      {showSigningModal && signingContract && (
        <ContractSigningModal
          contractId={signingContract.id}
          userRole={
            user?.role === UserRole.Homeowner ? "homeowner" : "contractor"
          }
          onClose={() => setShowSigningModal(false)}
          onSigned={handleSigningComplete}
          onError={handleContractModalError}
        />
      )}

      {/* Supervisor Contract Signing Modal */}
      {showSupervisorSigningModal && signingSupervisorContract && (
        <SupervisorContractSigningModal
          contract={signingSupervisorContract}
          onClose={() => {
            setShowSupervisorSigningModal(false);
            setSigningSupervisorContract(null);
          }}
          onSigned={async () => {
            setShowSupervisorSigningModal(false);
            setSigningSupervisorContract(null);

            // Reload contracts
            const [contractorData, supervisorData] = await Promise.all([
              contractsApi.getAll(),
              supervisorContractsApi.getAll().catch(() => []),
            ]);
            setContracts(contractorData);
            setSupervisorContracts(supervisorData);

            showBannerMessage("✓ Ký hợp đồng giám sát viên thành công!", 5000);
          }}
          onError={handleContractModalError}
        />
      )}

      {/* Proposal Detail Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Chi tiết Proposal
              </h2>
              <button
                onClick={() => {
                  setShowProposalModal(false);
                  setSelectedProposal(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {loadingProposal ? (
              <div className="text-center py-12 text-slate-500">
                Đang tải thông tin proposal...
              </div>
            ) : selectedProposal ? (
              <>
                {/* Proposal Details */}
                <ProposalDisplay proposal={selectedProposal} />

                {/* Close Button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                  <button
                    onClick={() => {
                      setShowProposalModal(false);
                      setSelectedProposal(null);
                    }}
                    className={ghostBtnCls}
                  >
                    Đóng
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Không tìm thấy thông tin proposal
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
