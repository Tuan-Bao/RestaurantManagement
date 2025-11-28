import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ordersApi } from "../../services/orders";

const MoMoResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [callbackTriggered, setCallbackTriggered] = useState(false);

  const resultCode = searchParams.get("resultCode");
  const message = searchParams.get("message");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");

  const isSuccess = resultCode === "0";

  useEffect(() => {
    // Trigger callback thủ công khi thanh toán thành công
    if (isSuccess && orderId && amount && !callbackTriggered) {
      setCallbackTriggered(true);

      ordersApi
        .triggerMoMoCallback(
          orderId,
          parseInt(amount),
          parseInt(resultCode || "0")
        )
        .then(response => {
          console.log("✅ Callback triggered successfully:", response.data);
        })
        .catch(error => {
          console.error("❌ Failed to trigger callback:", error);
        });
    }
  }, [isSuccess, orderId, amount, resultCode, callbackTriggered]);

  useEffect(() => {
    // Countdown và redirect về trang chủ
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="card shadow-lg"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <div className="card-body text-center p-5">
          {isSuccess ? (
            <>
              <div className="mb-4">
                <i
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: "80px" }}
                ></i>
              </div>
              <h2 className="text-success mb-3">Thanh toán thành công!</h2>
              <p className="text-muted mb-4">
                Đơn hàng của bạn đã được thanh toán thành công qua MoMo
              </p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <i
                  className="bi bi-x-circle-fill text-danger"
                  style={{ fontSize: "80px" }}
                ></i>
              </div>
              <h2 className="text-danger mb-3">Thanh toán thất bại</h2>
              <p className="text-muted mb-4">
                {message || "Có lỗi xảy ra trong quá trình thanh toán"}
              </p>
            </>
          )}

          <div className="bg-light rounded p-3 mb-4">
            {orderId && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Mã đơn hàng:</span>
                <strong>{orderId}</strong>
              </div>
            )}
            {amount && (
              <div className="d-flex justify-content-between">
                <span className="text-muted">Số tiền:</span>
                <strong className="text-primary">
                  {parseInt(amount).toLocaleString("vi-VN")}đ
                </strong>
              </div>
            )}
          </div>

          <p className="text-muted small mb-4">
            Tự động chuyển về trang chủ sau {countdown} giây...
          </p>

          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-house-fill me-2"></i>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoMoResult;
