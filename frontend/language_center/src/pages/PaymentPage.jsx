import React, { useCallback, useEffect, useState } from "react";
import apiClient from "../service/apiClient";
import { useApp } from "../context/AppContext";

const METHOD_OPTIONS = [
  {
    id: "bank-transfer",
    apiValue: "BANK_TRANSFER",
    title: "Chuyển khoản ngân hàng",
    subtitle: "Ưu tiên cho học phí trung tâm",
    icon: "ph-bank",
    accentClass: "teal",
  },
  {
    id: "credit-card",
    apiValue: "CARD",
    title: "Thẻ nội địa / quốc tế",
    subtitle: "Xác nhận nhanh trong vài phút",
    icon: "ph-credit-card",
    accentClass: "amber",
  },
  {
    id: "e-wallet",
    apiValue: "E_WALLET",
    title: "Ví điện tử",
    subtitle: "Hỗ trợ MoMo, ZaloPay, VNPay",
    icon: "ph-device-mobile",
    accentClass: "navy",
  },
];

const PROMO_CODES = {
  EARLY5: 0.05,
  LINGUA10: 0.1,
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

const normalizeStatus = (status) => String(status || "").toLowerCase();

const formatPaymentDate = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatClassSchedule = (classItem) => {
  if (!classItem) return "Lịch học đang cập nhật";
  const start = classItem.startDate
    ? formatPaymentDate(classItem.startDate)
    : null;
  const end = classItem.endDate ? formatPaymentDate(classItem.endDate) : null;
  if (start && end) return `${start} - ${end}`;
  return classItem.startDate ? start : "Lịch học đang cập nhật";
};

const mapStatusLabel = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "paid") return "Đã thanh toán";
  if (normalizedStatus === "pending") return "Đang chờ xử lý";
  return "Chưa xác định";
};

const formatDateTimeForApi = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const extractErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  if (responseData?.details && typeof responseData.details === "object") {
    const detailMessage = Object.values(responseData.details).find(
      (value) => typeof value === "string" && value.trim(),
    );

    if (detailMessage) {
      return detailMessage;
    }
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

const pickClassForCourse = (classes) => {
  if (!Array.isArray(classes) || !classes.length) {
    return null;
  }

  const availableClasses = classes.filter((item) => {
    const maxStudents = Number(item.maxStudents);
    const enrolledStudents = Number(item.enrolledStudents);

    if (!Number.isFinite(maxStudents) || !Number.isFinite(enrolledStudents)) {
      return true;
    }

    return enrolledStudents < maxStudents;
  });

  const source = availableClasses.length ? availableClasses : classes;

  return [...source].sort((left, right) => {
    const leftDate = left?.startDate
      ? new Date(left.startDate).getTime()
      : Number.MAX_SAFE_INTEGER;
    const rightDate = right?.startDate
      ? new Date(right.startDate).getTime()
      : Number.MAX_SAFE_INTEGER;
    return leftDate - rightDate;
  })[0];
};

export default function PaymentPage() {
  const { cart, cartTotal, cartOriginalTotal, clearCart } = useApp();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("bank-transfer");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationTone, setConfirmationTone] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPaymentData = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const [profileResult, paymentResult] = await Promise.allSettled([
        apiClient.get("/me/profile"),
        apiClient.get("/me/payments"),
      ]);

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data);
        setInvoiceEmail(
          (currentValue) =>
            currentValue || profileResult.value.data.email || "",
        );
      } else {
        console.error("Lỗi khi tải hồ sơ học viên:", profileResult.reason);
      }

      if (paymentResult.status === "fulfilled") {
        setHistory(paymentResult.value.data || []);
      } else {
        console.error("Lỗi khi tải lịch sử thanh toán:", paymentResult.reason);
        setHistoryError("Không thể tải lịch sử thanh toán lúc này.");
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const promoRate = PROMO_CODES[promoCode.trim().toUpperCase()] || 0;
  const courseSavings = Math.max(cartOriginalTotal - cartTotal, 0);
  const promoDiscount = Math.round(cartTotal * promoRate);
  const finalTotal = Math.max(cartTotal - promoDiscount, 0);
  const totalCourses = cart.length;
  const pendingPaymentCount = history.filter(
    (item) => normalizeStatus(item.status) === "pending",
  ).length;

  const handleApplyPromo = () => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      setPromoMessage("Nhập mã ưu đãi để kiểm tra.");
      return;
    }

    if (!PROMO_CODES[normalizedCode]) {
      setPromoMessage("Mã ưu đãi chưa hợp lệ hoặc đã hết hạn.");
      return;
    }

    setPromoMessage(
      `Đã áp dụng ${normalizedCode}. Bạn được giảm ${Math.round(PROMO_CODES[normalizedCode] * 100)}%.`,
    );
  };

  const handleSubmit = async () => {
    if (!cart.length || !acceptedTerms) {
      return;
    }

    if (!invoiceEmail.trim()) {
      setConfirmationTone("error");
      setConfirmationMessage(
        "Vui lòng nhập email nhận hóa đơn trước khi thanh toán.",
      );
      return;
    }

    setIsSubmitting(true);
    setConfirmationMessage("");
    setConfirmationTone("success");

    try {
      const activeProfile = profile?.studentInfo?.id
        ? profile
        : (await apiClient.get("/me/profile")).data;
      const studentId = activeProfile?.studentInfo?.id;

      if (!studentId) {
        throw new Error("Không tìm thấy mã học viên để tạo thanh toán.");
      }

      setProfile(activeProfile);

      const courseClassPairs = await Promise.all(
        cart.map(async (course) => {
          const courseId = Number(course.courseId || course.id);

          if (!Number.isFinite(courseId) || courseId <= 0) {
            throw new Error(
              `Khóa học "${course.name}" chưa có mã hợp lệ để tạo đăng ký lớp.`,
            );
          }

          if (course.selectedClass?.classId) {
            return {
              course,
              selectedClass: course.selectedClass,
            };
          }

          const classResponse = await apiClient.get(
            `/courses/${courseId}/classes`,
          );
          const selectedClass = pickClassForCourse(classResponse.data);

          if (!selectedClass?.classId) {
            throw new Error(
              `Khóa học "${course.name}" hiện chưa có lớp mở để xếp thời khóa biểu.`,
            );
          }

          return {
            course,
            selectedClass,
          };
        }),
      );

      const enrollmentResponses = await Promise.all(
        courseClassPairs.map(({ selectedClass }) =>
          apiClient.post("/enrollments", {
            classId: selectedClass.classId,
            studentId,
          }),
        ),
      );

      const enrollmentIds = enrollmentResponses
        .map((response) => response.data?.id)
        .filter((value) => Number.isFinite(Number(value)));

      if (!enrollmentIds.length) {
        throw new Error(
          "Không tạo được đăng ký lớp học để liên kết với thanh toán.",
        );
      }

      const methodConfig = METHOD_OPTIONS.find(
        (item) => item.id === selectedMethod,
      );
      const paymentResponse = await apiClient.post("/payments", {
        studentId,
        enrollmentIds,
        amount: finalTotal,
        date: formatDateTimeForApi(),
        method: methodConfig?.apiValue || selectedMethod.toUpperCase(),
        status: "pending",
      });

      await apiClient.post(`/payments/${paymentResponse.data.id}/payed`);

      clearCart();
      setPromoCode("");
      setPromoMessage("");
      setConfirmationTone("success");
      // Refresh payments/profile and also refresh my classes so UI shows new enrollments immediately
      await fetchPaymentData();
      try {
        await apiClient.get("/me/classes");
        setConfirmationMessage(
          "Thanh toán thành công. Lớp đã được ghi nhận và sẽ hiển thị ngay trong danh sách lớp của bạn.",
        );
      } catch (e) {
        setConfirmationMessage(
          "Thanh toán thành công. Lớp đã được ghi nhận — làm mới lại trang nếu bạn không thấy lớp mới.",
        );
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error);
      setConfirmationTone("error");
      setConfirmationMessage(
        extractErrorMessage(
          error,
          "Không thể hoàn tất thanh toán lúc này. Vui lòng thử lại sau vài phút.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-page">
      <section className="payment-hero">
        <div>
          <span className="payment-kicker">Tài chính học viên</span>
          <h1>Thanh toán học phí rõ ràng, gọn và đúng hạn</h1>
        </div>

        <div className="payment-hero-metrics">
          <div className="payment-metric-card">
            <span>Khóa học chờ thanh toán</span>
            <strong>{totalCourses}</strong>
            <small>
              {totalCourses > 0
                ? "Sẵn sàng xác nhận học phí"
                : "Chưa có khóa học trong giỏ"}
            </small>
          </div>
          <div className="payment-metric-card">
            <span>Hóa đơn đang chờ</span>
            <strong>{pendingPaymentCount}</strong>
            <small>Dữ liệu lấy từ lịch sử thanh toán của học viên</small>
          </div>
          <div className="payment-metric-card accent">
            <span>Tổng cần thu hôm nay</span>
            <strong>{formatCurrency(finalTotal)} đ</strong>
            <small>Đã tính ưu đãi từ giỏ học phí hiện tại</small>
          </div>
        </div>
      </section>

      <section className="payment-layout">
        <div className="payment-main-column">
          <div className="payment-panel">
            <div className="panel-heading">
              <div>
                <h2>Khoản học phí cần xác nhận</h2>
                <p>
                  Danh sách này lấy trực tiếp từ giỏ đăng ký khóa học của bạn.
                </p>
              </div>
              <span
                className={`payment-chip ${cart.length ? "warning" : "neutral"}`}
              >
                {cart.length ? "Cần thanh toán" : "Chưa phát sinh"}
              </span>
            </div>

            {cart.length > 0 ? (
              <div className="payment-course-list">
                {cart.map((course) => (
                  <article key={course.id} className="payment-course-card">
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="payment-course-thumb"
                    />
                    <div className="payment-course-copy">
                      <div className="payment-course-topline">
                        <span className="payment-level-tag">
                          {course.level || "COURSE"}
                        </span>
                        <span className="payment-duration">
                          <i className="ph ph-clock"></i>{" "}
                          {course.duration ||
                            `${course.durationWeeks || 0} tuần`}
                        </span>
                      </div>
                      <h3>{course.name}</h3>
                      <p>
                        {course.description ||
                          "Khóa học được chuẩn bị để thanh toán học phí."}
                      </p>
                      <div className="payment-course-facts">
                        {course.selectedClass ? (
                          <>
                            <span>
                              <i className="ph ph-chalkboard-teacher"></i>{" "}
                              {course.selectedClass.teacher?.user?.fullname ||
                                "Đang xếp giáo viên"}
                            </span>
                            <span>
                              <i className="ph ph-calendar-dots"></i>{" "}
                              {formatClassSchedule(course.selectedClass)}
                            </span>
                            <span>
                              <i className="ph ph-door"></i>{" "}
                              {course.selectedClass.className || "Lớp đã chọn"}{" "}
                              • Phòng {course.selectedClass.roomNumber || "TBA"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              <i className="ph ph-chalkboard-teacher"></i>{" "}
                              {course.teacherName || "Đang xếp giáo viên"}
                            </span>
                            <span>
                              <i className="ph ph-calendar-dots"></i>{" "}
                              {course.defaultScheduleLabel ||
                                "Lịch học đang cập nhật"}
                            </span>
                            <span>
                              <i className="ph ph-door"></i>{" "}
                              {course.defaultClassName || "Lớp mới"} • Phòng{" "}
                              {course.defaultRoomNumber || "TBA"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="payment-course-price">
                      <strong>{formatCurrency(course.tuitionFee)} đ</strong>
                      {Number(course.originalPrice) >
                        Number(course.tuitionFee) && (
                        <span>{formatCurrency(course.originalPrice)} đ</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="payment-empty">
                <div className="payment-empty-icon">
                  <i className="ph ph-wallet"></i>
                </div>
                <div>
                  <h3>Chưa có học phí trong giỏ thanh toán</h3>
                  <p>
                    Thêm khóa học từ trang đăng ký để hệ thống tạo bảng thanh
                    toán cho bạn.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="payment-panel">
            <div className="panel-heading">
              <div>
                <h2>Phương thức thanh toán</h2>
              </div>
            </div>

            <div className="payment-method-grid">
              {METHOD_OPTIONS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`payment-method-card ${selectedMethod === method.id ? "active" : ""}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className={`payment-method-icon ${method.accentClass}`}>
                    <i className={`ph ${method.icon}`}></i>
                  </div>
                  <div className="payment-method-copy">
                    <strong>{method.title}</strong>
                    <span>{method.subtitle}</span>
                  </div>
                  <i
                    className={`ph ${selectedMethod === method.id ? "ph-radio-button" : "ph-circle"}`}
                  ></i>
                </button>
              ))}
            </div>

            <div className="payment-form-grid">
              <label className="payment-field">
                <span>Email nhận hóa đơn</span>
                <input
                  type="email"
                  value={invoiceEmail}
                  onChange={(event) => setInvoiceEmail(event.target.value)}
                  placeholder="tenban@email.com"
                />
              </label>
              <label className="payment-field">
                <span>Người thanh toán</span>
                <input
                  type="text"
                  value={profile?.fullName || ""}
                  readOnly
                  placeholder="Đang cập nhật hồ sơ học viên"
                />
              </label>
            </div>

            <div className="payment-bank-note">
              <div className="payment-bank-visual">
                <i className="ph ph-qr-code"></i>
              </div>
              <div>
                <strong>Nội dung chuyển khoản</strong>
                <p>
                  {profile?.username
                    ? `LINGUA-${profile.username.toUpperCase()}`
                    : "LINGUA-STUDENT"}{" "}
                  | HOC PHI THANG 5
                </p>
              </div>
            </div>
          </div>

          <div className="payment-panel">
            <div className="panel-heading">
              <div>
                <h2>Lịch sử thanh toán gần đây</h2>
              </div>
            </div>

            {historyLoading ? (
              <div className="payment-history-state">
                Đang tải lịch sử thanh toán...
              </div>
            ) : historyError ? (
              <div className="payment-history-state error">{historyError}</div>
            ) : history.length > 0 ? (
              <div className="payment-history-list">
                {history.map((item) => (
                  <div key={item.id} className="payment-history-row">
                    <div>
                      <strong>{formatCurrency(item.amount)} đ</strong>
                      <span>{formatPaymentDate(item.date)}</span>
                    </div>
                    <div>
                      <strong>{item.method || "Chưa rõ phương thức"}</strong>
                      <span>Mã giao dịch #{item.id}</span>
                    </div>
                    <span
                      className={`payment-chip ${normalizeStatus(item.status) === "paid" ? "success" : "warning"}`}
                    >
                      {mapStatusLabel(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="payment-history-state">
                Chưa có lịch sử thanh toán nào được ghi nhận.
              </div>
            )}
          </div>
        </div>

        <aside className="payment-summary-column">
          <div className="payment-summary-card">
            <div className="panel-heading compact">
              <div>
                <h2>Tóm tắt học phí</h2>
              </div>
            </div>

            <div className="payment-summary-lines">
              <div>
                <span>Tạm tính</span>
                <strong>{formatCurrency(cartTotal)} đ</strong>
              </div>
              <div>
                <span>Ưu đãi từ khóa học</span>
                <strong>-{formatCurrency(courseSavings)} đ</strong>
              </div>
              <div>
                <span>Giảm thêm theo mã</span>
                <strong>-{formatCurrency(promoDiscount)} đ</strong>
              </div>
            </div>

            <div className="payment-summary-total">
              <span>Cần thanh toán</span>
              <strong>{formatCurrency(finalTotal)} đ</strong>
            </div>

            <div className="payment-coupon-box">
              <label className="payment-field">
                <span>Mã ưu đãi</span>
                <div className="payment-coupon-row">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    placeholder="EARLY5 hoặc LINGUA10"
                  />
                  <button
                    type="button"
                    className="btn-apply-coupon"
                    onClick={handleApplyPromo}
                  >
                    Áp dụng
                  </button>
                </div>
              </label>
              {promoMessage && (
                <div className="payment-inline-note">{promoMessage}</div>
              )}
            </div>

            <label className="payment-terms">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>
                Tôi đã kiểm tra học phí, thông tin xuất hóa đơn và đồng ý với
                quy định thu phí của trung tâm.
              </span>
            </label>

            <button
              type="button"
              className="btn-confirm-payment"
              disabled={!cart.length || !acceptedTerms || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Đang xác nhận..." : "Xác nhận thanh toán"}
            </button>

            {confirmationMessage && (
              <div
                className={`payment-confirmation ${confirmationTone === "error" ? "error" : ""}`}
              >
                <i
                  className={`ph ${confirmationTone === "error" ? "ph-warning-circle" : "ph-check-circle"}`}
                ></i>
                <span>{confirmationMessage}</span>
              </div>
            )}

            <div className="payment-support-card">
              <a href="mailto:finance@linguahub.vn">finance@linguahub.vn</a>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
