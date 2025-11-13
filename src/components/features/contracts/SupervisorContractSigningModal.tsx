'use client';

import React, { useState, useEffect } from 'react';
import { SignaturePad } from '@/components/common/SignaturePad';
import { supervisorContractsApi, paymentsApi, type SupervisorContractDto } from '@/lib/contracts/contracts.api';
import { DownloadOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { useAuth, UserRole } from '@/hooks/useAuth';

interface SupervisorContractSigningModalProps {
  contract: SupervisorContractDto;
  onClose: () => void;
  onSigned?: (contract: SupervisorContractDto) => void;
}

export const SupervisorContractSigningModal: React.FC<SupervisorContractSigningModalProps> = ({
  contract: initialContract,
  onClose,
  onSigned,
}) => {
  const { user } = useAuth();
  const [contract, setContract] = useState<SupervisorContractDto>(initialContract);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string>('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [paymentPaidServer, setPaymentPaidServer] = useState<boolean | null>(null);

  const isHomeowner = user?.role === UserRole.Homeowner;
  const isSupervisor = user?.role === UserRole.Supervisor;

  useEffect(() => {
    loadContract();
    loadPdf();
    checkPaymentStatus();
  }, [initialContract.id]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await supervisorContractsApi.getById(initialContract.id);
      setContract(data);
    } catch (error: any) {
      alert('Lỗi tải hợp đồng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadPdf = async () => {
    try {
      // Generate PDF if not exists
      try {
        await supervisorContractsApi.generatePdf(initialContract.id);
      } catch (error) {
        console.log('PDF generation failed or not needed:', error);
      }
      
      // Download PDF
      const blob = await supervisorContractsApi.downloadPdf(initialContract.id);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error: any) {
      console.error('Error loading PDF:', error);
      // PDF might not be generated yet, that's okay
    }
  };

  const checkPaymentStatus = async () => {
    // Only check payment for homeowner (supervisor doesn't need to pay)
    if (!isHomeowner) {
      setPaymentPaidServer(true); // Supervisor doesn't need payment
      return;
    }
    try {
      const res = await paymentsApi.getSupervisorPaymentStatus(initialContract.projectId);
      setPaymentPaidServer(!!res?.paid);
    } catch (e) {
      setPaymentPaidServer(null);
    }
  };

  const handleSaveSignature = (signature: string) => {
    setSignatureBase64(signature);
    setShowSignaturePad(false);
  };

  const handleSign = async () => {
    if (!signatureBase64) {
      alert('Vui lòng ký tên trước!');
      return;
    }

    // Enforce payment before signing (only for homeowner)
    if (isHomeowner && !paymentPaidServer) {
      alert('Bạn cần thanh toán phí đăng ký giám sát viên trước khi ký hợp đồng.');
      return;
    }

    setSigning(true);
    try {
      const updatedContract = isHomeowner
        ? await supervisorContractsApi.signByHomeowner(contract.id, { signatureBase64 })
        : await supervisorContractsApi.signBySupervisor(contract.id, { signatureBase64 });

      alert('Ký hợp đồng thành công!');
      
      if (onSigned) {
        onSigned(updatedContract);
      }
      
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Lỗi không xác định';
      alert('Lỗi ký hợp đồng: ' + errorMsg);
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `supervisor_contract_${contract.id}.pdf`;
      a.click();
    }
  };

  const canSign = isHomeowner 
    ? !contract.homeownerSignatureBase64
    : !contract.supervisorSignatureBase64;
  const alreadySigned = isHomeowner
    ? !!contract.homeownerSignatureBase64
    : !!contract.supervisorSignatureBase64;
  const paymentPaid = paymentPaidServer === true;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-700">
          <h2 className="text-xl font-bold text-white">
            Ký hợp đồng giám sát viên {isHomeowner ? '(Chủ nhà)' : '(Giám sát viên)'}
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
                <p className="text-sm text-stone-400">Giá hàng tháng</p>
                <p className="text-amber-400 font-semibold">{contract.monthlyPrice.toLocaleString('vi-VN')} đồng</p>
              </div>
              <div>
                <p className="text-sm text-stone-400">Dự án</p>
                <p className="text-white">{contract.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-stone-400">Giám sát viên</p>
                <p className="text-white">{contract.supervisorName}</p>
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
                <span className={contract.homeownerSignatureBase64 ? 'text-green-400' : 'text-stone-400'}>
                  Chủ nhà đã ký {contract.signedByHomeownerAt && `(${new Date(contract.signedByHomeownerAt).toLocaleString('vi-VN')})`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {contract.supervisorSignatureBase64 ? (
                  <CheckOutlined className="text-green-500" />
                ) : (
                  <span className="text-stone-500">○</span>
                )}
                <span className={contract.supervisorSignatureBase64 ? 'text-green-400' : 'text-stone-400'}>
                  Giám sát viên đã ký {contract.signedBySupervisorAt && `(${new Date(contract.signedBySupervisorAt).toLocaleString('vi-VN')})`}
                </span>
              </div>
            </div>
          </div>

          {/* Payment requirement - show only for homeowner until paid and not already signed */}
          {isHomeowner && !alreadySigned && !paymentPaid && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-amber-300 font-semibold">Yêu cầu thanh toán phí đăng ký giám sát viên</p>
                  <p className="text-sm text-amber-200/80 mt-1">
                    Để ký hợp đồng, chủ nhà cần thanh toán phí đăng ký giám sát viên.
                  </p>
                  <p className="text-sm text-amber-200 mt-2">
                    Số tiền cần thanh toán: <span className="font-semibold">{contract.monthlyPrice.toLocaleString('vi-VN')} đồng</span>
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md"
                    onClick={async () => {
                      try {
                        const amount = contract.monthlyPrice;
                        if (!amount || amount <= 0) {
                          alert('Không xác định được số tiền thanh toán');
                          return;
                        }
                        const redirectUrl = `${window.location.origin}/projects?tab=contracts`;
                        const res = await paymentsApi.momoCreate({ 
                          amount, 
                          description: 'Phí đăng ký giám sát viên', 
                          projectId: contract.projectId,
                          redirectUrl,
                          purpose: 'supervisor'
                        });
                        if (res?.payUrl) {
                          window.location.href = res.payUrl;
                        } else {
                          alert('Không lấy được liên kết thanh toán');
                        }
                      } catch (e: any) {
                        alert(e?.response?.data || e?.message || 'Khởi tạo thanh toán MoMo thất bại');
                      }
                    }}
                  >
                    Thanh toán qua MoMo
                  </button>
                </div>
              </div>
              <p className="text-xs text-amber-200/70 mt-2">Sau khi thanh toán thành công, vui lòng quay lại và tiến hành ký hợp đồng.</p>
            </div>
          )}

          {/* PDF Preview */}
          {pdfUrl && (
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
                title="Supervisor Contract PDF"
              />
            </div>
          )}

          {/* Signature Section */}
          {canSign && !alreadySigned && (
            <div className="bg-stone-800 p-4 rounded-lg space-y-4">
              <h3 className="text-white font-semibold">Chữ ký điện tử</h3>
              
              {!showSignaturePad && !signatureBase64 && (
                <button
                  onClick={() => {
                    // Supervisor doesn't need payment, homeowner needs payment
                    if (isHomeowner && !paymentPaid) return;
                    setShowSignaturePad(true);
                  }}
                  disabled={isHomeowner && !paymentPaid}
                  className={`w-full px-4 py-3 rounded-lg transition-colors ${
                    (isHomeowner && !paymentPaid)
                      ? 'bg-stone-700 text-stone-300 opacity-60 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                  title={(isHomeowner && !paymentPaid) ? 'Vui lòng thanh toán phí đăng ký giám sát viên trước' : undefined}
                >
                  Bắt đầu ký tên
                </button>
              )}

              {showSignaturePad && (
                <div className="relative" style={{ isolation: 'isolate' }}>
                  <SignaturePad
                    onSave={handleSaveSignature}
                    onClear={() => setSignatureBase64('')}
                    width={1120}
                    height={150}
                  />
                </div>
              )}

              {signatureBase64 && !showSignaturePad && (
                <div className="space-y-3">
                  <div className="border-2 border-green-600 rounded-lg p-2 bg-white">
                    <img src={signatureBase64} alt="Signature" className="max-w-full h-auto" />
                  </div>
                  <button
                    onClick={() => {
                      setSignatureBase64('');
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-stone-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors"
          >
            {alreadySigned ? 'Đóng' : 'Quay lại'}
          </button>
          
          {canSign && !alreadySigned && signatureBase64 && (isSupervisor || paymentPaid) && (
            <button
              onClick={handleSign}
              disabled={signing}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signing ? 'Đang ký...' : 'Xác nhận ký hợp đồng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
