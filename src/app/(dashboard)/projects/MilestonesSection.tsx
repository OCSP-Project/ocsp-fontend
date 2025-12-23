"use client";

import React, { useEffect, useMemo, useState } from "react";
import { notification, Modal } from "antd";
import {
  contractsApi,
  ContractListItemDto,
  milestonesApi,
  MilestoneDto,
  CreateMilestoneDto,
  BulkCreateMilestonesDto,
  UpdateMilestoneDto,
} from "@/lib/contracts/contracts.api";
import { escrowApi, paymentsApi } from "@/lib/contracts/contracts.api";

export default function MilestonesSection() {
  const [contracts, setContracts] = useState<ContractListItemDto[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    id: string;
    name: string;
    amountText: string;
    dueDate?: string | null;
    note?: string | null;
  } | null>(null);
  const [fundAmountText, setFundAmountText] = useState<string>("");
  const [escrowBalance, setEscrowBalance] = useState<number | null>(null);
  const selectedContract = useMemo(
    () => contracts.find((c) => c.id === selectedContractId) || null,
    [contracts, selectedContractId]
  );
  // UI tokens (align with teal/indigo light theme)
  const wrapperCls =
    "relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-white to-indigo-50 border border-teal-100/60 shadow-xl p-6";
  const cardCls =
    "bg-white/90 backdrop-blur-xl rounded-2xl border border-white/70 shadow-lg p-5 text-slate-800";
  const ghostBtnCls =
    "px-3 py-2 rounded-lg bg-white/80 text-slate-700 border border-slate-200 hover:border-teal-200 hover:text-teal-700 transition";
  const primaryBtnCls =
    "px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition";
  const subtleTextCls = "text-sm text-slate-500";

  // Single-create removed; use bulk with one row instead
  const [bulkRows, setBulkRows] = useState<
    Array<{
      name: string;
      amountText: string;
      dueDate?: string | null;
      note?: string | null;
    }>
  >([{ name: "", amountText: "", dueDate: undefined, note: "" }]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const data = await contractsApi.getAll();
        setContracts(data);
        if (data.length > 0) setSelectedContractId(data[0].id);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load contracts"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const fetchMilestones = async (contractId: string) => {
    if (!contractId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await milestonesApi.listByContract(contractId);
      setMilestones(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load milestones"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedContractId) fetchMilestones(selectedContractId);
  }, [selectedContractId]);

  useEffect(() => {
    const fetchEscrow = async () => {
      if (!selectedContractId) return;
      try {
        const acc = await escrowApi.getByContract(selectedContractId);
        setEscrowBalance(acc?.balance ?? null);
      } catch {
        setEscrowBalance(null);
      }
    };
    fetchEscrow();
  }, [selectedContractId]);

  // onCreateSingle removed

  const onCreateBulk = async () => {
    if (!selectedContractId) return;
    try {
      setLoading(true);
      const milestones = bulkRows.map((r) => ({
        name: r.name,
        amount: Number(r.amountText || "0"),
        dueDate: r.dueDate,
        note: r.note,
      }));
      // basic validate
      if (
        milestones.some(
          (m) => !m.name || !m.amount || isNaN(m.amount) || m.amount <= 0
        )
      ) {
        throw new Error("Vui lòng nhập tên và số tiền hợp lệ cho tất cả dòng");
      }
      const payload: BulkCreateMilestonesDto = {
        contractId: selectedContractId,
        milestones,
      };
      await milestonesApi.createBulk(payload);
      setBulkRows([{ name: "", amountText: "", dueDate: undefined, note: "" }]);
      await fetchMilestones(selectedContractId);
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description: e?.response?.data || e?.message || "Bulk create failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBulkRow = () =>
    setBulkRows((rows) => [
      ...rows,
      { name: "", amountText: "", dueDate: undefined, note: "" },
    ]);
  const removeBulkRow = (idx: number) =>
    setBulkRows((rows) => rows.filter((_, i) => i !== idx));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  const formatVndDigits = (digits: string) => {
    if (!digits) return "";
    const n = Number(digits);
    if (!isFinite(n)) return "";
    return n.toLocaleString("vi-VN");
  };

  // Direct escrow top-up removed; use MoMo

  return (
    <div className={wrapperCls + " space-y-8"}>
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-slate-700 font-medium">Chọn hợp đồng:</label>
        <select
          className="bg-white/90 border border-slate-200 text-slate-800 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
          value={selectedContractId}
          onChange={(e) => setSelectedContractId(e.target.value)}
        >
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.projectName} • {formatCurrency(c.totalPrice)}{" "}
            </option>
          ))}
        </select>
      </div>
      {selectedContract && (
        <div className="flex items-center justify-between text-sm text-slate-600 flex-wrap gap-2">
          <div>
            Tổng giá trị hợp đồng:{" "}
            <span className="text-slate-900 font-semibold">
              {formatCurrency(selectedContract.totalPrice)}
            </span>
          </div>
          <div>
            Số dư Escrow:{" "}
            <span className="text-emerald-600 font-semibold">
              {escrowBalance != null ? formatCurrency(escrowBalance) : "0"}
            </span>
          </div>
        </div>
      )}

      {/* Homeowner fund escrow section */}
      {selectedContract && (
        <div className={cardCls}>
          <h3 className="text-slate-900 font-semibold mb-2">
            Nạp tiền vào ví Escrow (qua MoMo)
          </h3>
          <p className={subtleTextCls}>
            Tối thiểu: {formatCurrency(selectedContract.totalPrice)} (bằng tổng
            giá trị hợp đồng)
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full sm:w-64 bg-white/80 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200 shadow-sm"
              placeholder="Số tiền VND"
              value={formatVndDigits(fundAmountText)}
              onChange={(e) =>
                setFundAmountText(e.target.value.replace(/[^0-9]/g, ""))
              }
            />
            <div className="flex gap-2">
              <button
                disabled={loading || !selectedContractId}
                className={`${primaryBtnCls} disabled:opacity-60`}
                onClick={async () => {
                  if (!selectedContract || !selectedContractId) return;
                  const amount = Number(fundAmountText || "0");
                  if (!isFinite(amount) || amount <= 0) {
                    notification.warning({
                      message: "Số tiền không hợp lệ",
                      description: "Vui lòng nhập số tiền hợp lệ",
                    });
                    return;
                  }
                  if (amount < selectedContract.totalPrice) {
                    notification.warning({
                      message: "Số tiền không đủ",
                      description: `Số tiền nạp tối thiểu là ${formatCurrency(
                        selectedContract.totalPrice
                      )}`,
                    });
                    return;
                  }
                  try {
                    setLoading(true);
                    const res = await paymentsApi.momoCreate({
                      amount,
                      description: "Nạp ví Escrow qua MoMo",
                      contractId: selectedContractId,
                    });
                    window.location.href = res.payUrl;
                  } catch (e: any) {
                    notification.error({
                      message: "Lỗi",
                      description:
                        e?.response?.data ||
                        e?.message ||
                        "Khởi tạo thanh toán MoMo thất bại",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Nạp qua MoMo
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          Danh sách Milestones
        </h2>
        <div className={cardCls + " overflow-hidden"}>
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr className="text-slate-600 text-left">
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Số tiền</th>
                <th className="px-4 py-2">Hạn</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Ghi chú</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {milestones.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Chưa có milestone
                  </td>
                </tr>
              ) : (
                milestones.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-slate-200 text-slate-800"
                  >
                    <td className="px-4 py-2">
                      {editing?.id === m.id ? (
                        <input
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                          value={editing.name}
                          onChange={(e) =>
                            setEditing({ ...editing, name: e.target.value })
                          }
                        />
                      ) : (
                        m.name
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editing?.id === m.id ? (
                        <input
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={editing.amountText}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              amountText: e.target.value.replace(/[^0-9]/g, ""),
                            })
                          }
                        />
                      ) : (
                        formatCurrency(m.amount)
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editing?.id === m.id ? (
                        <input
                          type="date"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                          value={editing.dueDate || ""}
                          onChange={(e) =>
                            setEditing({ ...editing, dueDate: e.target.value })
                          }
                        />
                      ) : m.dueDate ? (
                        new Date(m.dueDate).toLocaleDateString("vi-VN")
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2">{m.status}</td>
                    <td className="px-4 py-2">
                      {editing?.id === m.id ? (
                        <input
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                          value={editing.note || ""}
                          onChange={(e) =>
                            setEditing({ ...editing, note: e.target.value })
                          }
                        />
                      ) : (
                        m.note || "-"
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {m.status.toLowerCase() === "planned" &&
                        (editing?.id === m.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              className={ghostBtnCls}
                              onClick={() => setEditing(null)}
                            >
                              Hủy
                            </button>
                            <button
                              className={primaryBtnCls}
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  if (!editing) return;
                                  const payload: UpdateMilestoneDto = {
                                    name: editing.name,
                                    amount: Number(editing.amountText || "0"),
                                    dueDate: editing.dueDate,
                                    note: editing.note,
                                  };
                                  if (
                                    !payload.name ||
                                    !payload.amount ||
                                    isNaN(payload.amount) ||
                                    payload.amount <= 0
                                  ) {
                                    throw new Error(
                                      "Tên và số tiền không hợp lệ"
                                    );
                                  }
                                  await milestonesApi.update(m.id, payload);
                                  setEditing(null);
                                  await fetchMilestones(selectedContractId);
                                } catch (e: any) {
                                  notification.error({
                                    message: "Lỗi",
                                    description:
                                      e?.response?.data ||
                                      e?.message ||
                                      "Update failed",
                                  });
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              Lưu
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              className={ghostBtnCls}
                              onClick={() =>
                                setEditing({
                                  id: m.id,
                                  name: m.name,
                                  amountText: String(m.amount),
                                  dueDate: m.dueDate || "",
                                  note: m.note || "",
                                })
                              }
                            >
                              Sửa
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white transition"
                              onClick={async () => {
                                Modal.confirm({
                                  title: "Xác nhận xóa",
                                  content: "Xóa milestone này?",
                                  okText: "Xóa",
                                  cancelText: "Hủy",
                                  okButtonProps: { danger: true },
                                  onOk: async () => {
                                    try {
                                      setLoading(true);
                                      await milestonesApi.delete(m.id);
                                      await fetchMilestones(selectedContractId);
                                    } catch (e: any) {
                                      notification.error({
                                        message: "Lỗi",
                                        description:
                                          e?.response?.data ||
                                          e?.message ||
                                          "Delete failed",
                                      });
                                    } finally {
                                      setLoading(false);
                                    }
                                  },
                                });
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className={cardCls}>
          <h3 className="text-slate-900 font-semibold mb-3">
            Tạo nhiều milestones
          </h3>
          <div className="space-y-3">
            {bulkRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center"
              >
                <input
                  className="md:col-span-2 bg-white border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  placeholder="Tên"
                  value={row.name}
                  onChange={(e) =>
                    setBulkRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, name: e.target.value } : r
                      )
                    )
                  }
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="bg-white border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  placeholder="Số tiền (đơn vị VND)"
                  value={formatVndDigits(row.amountText)}
                  onChange={(e) =>
                    setBulkRows((prev) =>
                      prev.map((r, i) =>
                        i === idx
                          ? {
                              ...r,
                              amountText: e.target.value.replace(/[^0-9]/g, ""),
                            }
                          : r
                      )
                    )
                  }
                />
                <input
                  type="date"
                  className="bg-white border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  value={row.dueDate || ""}
                  onChange={(e) =>
                    setBulkRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, dueDate: e.target.value } : r
                      )
                    )
                  }
                />
                <input
                  className="md:col-span-2 bg-white border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  placeholder="Ghi chú"
                  value={row.note || ""}
                  onChange={(e) =>
                    setBulkRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, note: e.target.value } : r
                      )
                    )
                  }
                />
                <div className="flex gap-2">
                  <button
                    className={ghostBtnCls}
                    onClick={() => removeBulkRow(idx)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <button className={ghostBtnCls} onClick={addBulkRow}>
                + Thêm dòng
              </button>
              <button
                disabled={loading || !selectedContractId}
                className={`${primaryBtnCls} disabled:opacity-60`}
                onClick={onCreateBulk}
              >
                Tạo tất cả
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-rose-500 text-sm">{error}</div>}
    </div>
  );
}
