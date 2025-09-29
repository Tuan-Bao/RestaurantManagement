import React, { useState } from 'react';
import { ordersApi } from '../../services/orders';

type PaymentMethod = 'cash' | 'card' | 'e_wallet';

interface PaymentModalProps {
  isOpen: boolean;
  order: {
    id: number;
    table_id: number;
    tableName?: string;
    total_amount?: number;
    totalAmount?: number;  // Support both naming conventions
  } | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  order,
  onClose,
  onPaymentSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<'method' | 'cash-details'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Get total amount from either field name
  const totalAmount = order?.total_amount || order?.totalAmount || 0;
  const tableName = order?.tableName || `Bàn ${order?.table_id}`;

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen && order) {
      setCurrentStep('method');
      setSelectedMethod(null);
      setCashReceived(totalAmount);
    }
  }, [isOpen, order, totalAmount]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    
    if (method === 'cash') {
      setCurrentStep('cash-details');
    } else {
      // For card and e_wallet, show not available message
      alert('Phương thức thanh toán này hiện chưa khả dụng');
    }
  };

  const handleCashPayment = async () => {
    if (!order || cashReceived < totalAmount) {
      alert('Số tiền khách đưa không đủ');
      return;
    }

    try {
      setLoading(true);

      const paymentData = {
        amount: totalAmount,
        discount: 0,
        tax: 0,
        method: 'cash' as const,
      };

      const response = await ordersApi.createPayment(order.id, paymentData);

      if (response.data.success) {
        onPaymentSuccess();
        onClose();
      } else {
        alert('Không thể thanh toán. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Có lỗi xảy ra khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const getChange = () => {
    return Math.max(0, cashReceived - totalAmount);
  };

  if (!isOpen || !order) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-credit-card me-2"></i>
                Thanh toán - {tableName}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {currentStep === 'method' ? (
                /* Payment Method Selection */
                <>
                  <div className="alert alert-info mb-4">
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted d-block">Bàn:</small>
                        <strong>{tableName}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Tổng tiền:</small>
                        <strong className="text-primary fs-5">
                          {totalAmount.toLocaleString('vi-VN')}đ
                        </strong>
                      </div>
                    </div>
                  </div>

                  <h6 className="mb-3">Chọn phương thức thanh toán:</h6>
                  
                  <div className="d-grid gap-3">
                    <button
                      className="btn btn-outline-success btn-lg text-start"
                      onClick={() => handleMethodSelect('cash')}
                    >
                      <i className="bi bi-cash-coin fs-3 me-3"></i>
                      <div className="d-inline-block">
                        <div className="fw-bold">Tiền mặt</div>
                        <small className="text-muted">Thanh toán bằng tiền mặt</small>
                      </div>
                    </button>

                    <button
                      className="btn btn-outline-primary btn-lg text-start"
                      onClick={() => handleMethodSelect('card')}
                      disabled
                    >
                      <i className="bi bi-credit-card fs-3 me-3"></i>
                      <div className="d-inline-block">
                        <div className="fw-bold">Thẻ ngân hàng</div>
                        <small className="text-muted">Chức năng đang phát triển</small>
                      </div>
                    </button>

                    <button
                      className="btn btn-outline-info btn-lg text-start"
                      onClick={() => handleMethodSelect('e_wallet')}
                      disabled
                    >
                      <i className="bi bi-wallet2 fs-3 me-3"></i>
                      <div className="d-inline-block">
                        <div className="fw-bold">Ví điện tử</div>
                        <small className="text-muted">Chức năng đang phát triển</small>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                /* Cash Payment Details */
                <>
                  <div className="alert alert-info mb-4">
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted d-block">Phương thức:</small>
                        <strong>
                          <i className="bi bi-cash-coin me-1"></i>
                          Tiền mặt
                        </strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Bàn:</small>
                        <strong>{tableName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-cash me-1"></i>
                      Tiền khách đưa:
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type="number"
                        className="form-control"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        min={totalAmount}
                      />
                      <span className="input-group-text">đ</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-receipt me-1"></i>
                      Tiền phải thanh toán:
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type="text"
                        className="form-control"
                        value={totalAmount.toLocaleString('vi-VN')}
                        disabled
                      />
                      <span className="input-group-text">đ</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-arrow-return-left me-1"></i>
                      Tiền thừa:
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type="text"
                        className={`form-control ${
                          getChange() < 0 ? 'is-invalid' : 'is-valid'
                        }`}
                        value={getChange().toLocaleString('vi-VN')}
                        disabled
                      />
                      <span className="input-group-text">đ</span>
                    </div>
                    {getChange() < 0 && (
                      <div className="invalid-feedback">
                        Tiền khách đưa không đủ
                      </div>
                    )}
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="mb-3">
                    <small className="text-muted mb-2 d-block">Số tiền nhanh:</small>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        totalAmount,
                        Math.ceil(totalAmount / 50000) * 50000,
                        Math.ceil(totalAmount / 100000) * 100000,
                        Math.ceil(totalAmount / 200000) * 200000,
                      ].map((amount, index) => (
                        <button
                          key={index}
                          className={`btn btn-sm ${
                            cashReceived === amount ? 'btn-primary' : 'btn-outline-primary'
                          }`}
                          onClick={() => setCashReceived(amount)}
                        >
                          {amount.toLocaleString('vi-VN')}đ
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (currentStep === 'cash-details') {
                    setCurrentStep('method');
                  } else {
                    onClose();
                  }
                }}
              >
                <i className="bi bi-arrow-left me-1"></i>
                {currentStep === 'cash-details' ? 'Trở về' : 'Hủy'}
              </button>

              {currentStep === 'cash-details' && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCashPayment}
                  disabled={loading || cashReceived < totalAmount}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-1"></i>
                      Xác nhận thanh toán
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default PaymentModal;