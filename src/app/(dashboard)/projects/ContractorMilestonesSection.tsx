"use client";

import React, { useEffect, useState } from 'react';
import { contractsApi, ContractListItemDto, milestonesApi, MilestoneDto } from '@/lib/contracts/contracts.api';

export default function ContractorMilestonesSection() {
  const [contracts, setContracts] = useState<ContractListItemDto[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const data = await contractsApi.getAll();
        setContracts(data);
        if (data.length > 0) setSelectedContractId(data[0].id);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load contracts');
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
      setError(e?.response?.data?.message || e?.message || 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedContractId) fetchMilestones(selectedContractId); }, [selectedContractId]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <label className="text-stone-300">Chọn hợp đồng:</label>
        <select
          className="bg-stone-800 border border-stone-700 text-stone-100 px-3 py-2 rounded-md"
          value={selectedContractId}
          onChange={(e) => setSelectedContractId(e.target.value)}
        >
          {contracts.map(c => (
            <option key={c.id} value={c.id}>{c.projectName} • {formatCurrency(c.totalPrice)}</option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-amber-300 mb-3">Milestones</h2>
        <div className="bg-stone-800/60 border border-stone-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-800">
              <tr className="text-stone-400 text-left">
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Số tiền</th>
                <th className="px-4 py-2">Hạn</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {milestones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-400">Chưa có milestone</td>
                </tr>
              ) : milestones.map(m => (
                <tr key={m.id} className="border-t border-stone-700/60 text-stone-200">
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2">{formatCurrency(m.amount)}</td>
                  <td className="px-4 py-2">{m.dueDate ? new Date(m.dueDate).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="px-4 py-2">{m.status}</td>
                  <td className="px-4 py-2">{m.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


