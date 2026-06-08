import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../service/apiClient";
import { useApp } from "../context/AppContext";

const SEARCH_DEBOUNCE_MS = 350;
const formatTime = (value) => (value ? value.slice(0, 5) : "--:--");
const formatDate = (value) => {
  if (!value) return "Lịch đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
};

const formatDateTime = (value) => {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatClassSchedule = (classItem) => {
  if (!classItem?.startDate || !classItem?.endDate) {
    return "Thời gian lớp đang cập nhật";
  }

  return `${formatDateTime(classItem.startDate)} - ${formatDateTime(classItem.endDate)}`;
};

const enrichCourse = (course) => {
  const numericId = Number(course.id) || 0;
  const tuitionFee = Number(course.tuitionFee) || 0;

  return {
    ...course,
    tuitionFee,
    rating: Number((4.5 + (numericId % 5) * 0.1).toFixed(1)),
    students: 250 + numericId * 37,
    originalPrice: tuitionFee * 1.3,
    imageUrl:
      course.imageUrl ||
      "https://res.cloudinary.com/dxbdccipi/image/upload/v1777278394/khoa-hoc-tieng-anh-online-danh-cho-sinh-vien_ouviir.jpg",
    teacherName: course.teacherName || "Đang sắp xếp giáo viên",
    defaultClassName: course.defaultClassName || "Đang mở lớp mới",
    defaultScheduleLabel:
      course.defaultLessonDate && course.defaultStartTime
        ? `${formatDate(course.defaultLessonDate)} • ${formatTime(course.defaultStartTime)} - ${formatTime(course.defaultEndTime)}`
        : "Giờ học đang cập nhật",
    defaultRoomNumber: course.defaultRoomNumber || "TBA",
  };
};

const CourseRegistration = () => {
  const { addToCart, searchQuery, setIsCartOpen } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("popular");

  // inline picker state
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classPickerLoading, setClassPickerLoading] = useState(false);
  const [classPickerError, setClassPickerError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/courses", {
          params: {
            keyword: (searchQuery || "").trim(),
            visible: true,
          },
        });
        const enriched = (response.data || []).map(enrichCourse);
        setCourses(enriched);
      } catch (err) {
        console.error("Lỗi tải khóa học:", err);
        setError("Không thể tải dữ liệu tìm kiếm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    const id = setTimeout(fetchCourses, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const selectedClass = useMemo(
    () =>
      availableClasses.find(
        (item) => String(item.classId) === String(selectedClassId),
      ),
    [availableClasses, selectedClassId],
  );

  const openClassPicker = async (course) => {
    // toggle expansion
    if (String(expandedCourseId) === String(course.id)) {
      setExpandedCourseId(null);
      setSelectedCourse(null);
      setAvailableClasses([]);
      setSelectedClassId(null);
      return;
    }

    setSelectedCourse(course);
    setExpandedCourseId(course.id);
    setAvailableClasses([]);
    setSelectedClassId(null);
    setClassPickerError("");
    setClassPickerLoading(true);

    try {
      const response = await apiClient.get(`/courses/${course.id}/classes`, {
        params: { visible: true },
      });
      const classes = response.data || [];
      setAvailableClasses(classes);
      setSelectedClassId(classes[0]?.classId || null);
    } catch (fetchError) {
      console.error("Lỗi tải lớp học:", fetchError);
      setClassPickerError(
        "Không thể tải danh sách lớp đang mở. Vui lòng thử lại.",
      );
    } finally {
      setClassPickerLoading(false);
    }
  };

  const handleAddClick = async (course) => {
    // Always open the inline class picker; pre-select first class if available
    setClassPickerError("");
    setClassPickerLoading(true);
    try {
      const response = await apiClient.get(`/courses/${course.id}/classes`, {
        params: { visible: true },
      });
      const classes = response.data || [];
      setSelectedCourse(course);
      setExpandedCourseId(course.id);
      setAvailableClasses(classes);
      setSelectedClassId(classes[0]?.classId || null);
    } catch (fetchError) {
      console.error("Lỗi tải lớp học (handleAddClick):", fetchError);
      setClassPickerError(
        "Không thể tải danh sách lớp đang mở. Vui lòng thử lại.",
      );
    } finally {
      setClassPickerLoading(false);
    }
  };

  const handleAddSelectedClass = () => {
    if (!selectedCourse || !selectedClass) {
      setClassPickerError("Vui lòng chọn một lớp đang mở để đăng ký.");
      return;
    }

    addToCart({
      ...selectedCourse,
      courseId: selectedCourse.id,
      classId: selectedClass.classId,
      className: selectedClass.className,
      selectedClass,
      tuitionFee: selectedCourse.tuitionFee,
      imageUrl: selectedCourse.imageUrl,
      name: selectedCourse.name,
      cartKey: `${selectedCourse.id}-${selectedClass.classId}`,
    });

    // close inline picker
    setExpandedCourseId(null);
    setSelectedCourse(null);
    setAvailableClasses([]);
    setSelectedClassId(null);
    setClassPickerError("");
    setIsCartOpen(true);
  };

  const filteredAndSortedCourses = [...courses].sort((a, b) => {
    if (activeFilter === "popular") return b.students - a.students;
    if (activeFilter === "top-rated") return b.rating - a.rating;
    if (activeFilter === "newest") return b.id - a.id;
    return 0;
  });

  if (loading)
    return (
      <div className="cr-container" style={{ padding: "32px" }}>
        Đang tải danh sách khóa học...
      </div>
    );
  if (error)
    return (
      <div className="cr-container" style={{ padding: "32px" }}>
        {error}
      </div>
    );

  return (
    <div className="cr-container">
      <div className="cr-filters">
        <div className="cr-filter-group">
          <button
            className={`filter-pill ${activeFilter === "popular" ? "active" : ""}`}
            onClick={() => setActiveFilter("popular")}
          >
            Phổ biến nhất
          </button>
          <button
            className={`filter-pill ${activeFilter === "top-rated" ? "active" : ""}`}
            onClick={() => setActiveFilter("top-rated")}
          >
            Rating cao nhất
          </button>
          <button
            className={`filter-pill ${activeFilter === "newest" ? "active" : ""}`}
            onClick={() => setActiveFilter("newest")}
          >
            Mới nhất
          </button>
        </div>
        <div className="cr-course-count">
          {filteredAndSortedCourses.length} khóa học
        </div>
      </div>

      <div className="courses-grid">
        {filteredAndSortedCourses.length === 0 && (
          <div className="empty-state">
            Không tìm thấy khóa học phù hợp với từ khóa "{searchQuery}".
          </div>
        )}

        {filteredAndSortedCourses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-img-wrapper">
              <img
                src={course.imageUrl}
                alt={course.name}
                className="course-img"
              />
              <span className="course-level-badge">{course.level}</span>
            </div>

            <div className="course-content">
              <h3 className="course-title">{course.name}</h3>
              <p className="course-desc">{course.description}</p>

              {/* Course is a logical container only; schedule/teacher/room belong to Class entities */}

              <div className="course-stats">
                <div className="course-rating">
                  {course.rating} <i className="ph-fill ph-star"></i>
                </div>
                <div className="course-students">
                  <i className="ph ph-users"></i>{" "}
                  {course.students.toLocaleString("vi-VN")} học viên
                </div>
              </div>

              <div className="course-footer">
                <div className="price-block">
                  <div className="current-price">
                    {course.tuitionFee?.toLocaleString("vi-VN")} VNĐ
                  </div>
                  <div className="original-price">
                    {course.originalPrice?.toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
                <button
                  onClick={() => handleAddClick(course)}
                  className="btn-add-cart"
                  title="Chọn lớp để đăng ký"
                >
                  <i className="ph ph-chalkboard-teacher">+</i>
                </button>
              </div>

              {String(expandedCourseId) === String(course.id) && (
                <div className="class-picker-inline">
                  <div className="class-picker-header-inline">
                    <div>
                      <span className="class-picker-kicker">
                        Chọn lớp đang mở
                      </span>
                      <h4>{course.name}</h4>
                      <p>
                        Chọn lớp phù hợp nhất trước khi thêm vào giỏ thanh toán.
                      </p>
                    </div>
                    <button
                      className="btn-close-cart"
                      onClick={() => {
                        setExpandedCourseId(null);
                        setSelectedCourse(null);
                        setAvailableClasses([]);
                        setSelectedClassId(null);
                      }}
                    >
                      <i className="ph ph-x"></i>
                    </button>
                  </div>

                  {classPickerLoading ? (
                    <div className="empty-state">Đang tải lớp học...</div>
                  ) : classPickerError ? (
                    <div className="empty-state">{classPickerError}</div>
                  ) : availableClasses.length === 0 ? (
                    <div className="empty-state">
                      Khóa học này hiện chưa có lớp mở đăng ký.
                    </div>
                  ) : (
                    <div className="class-picker-list-inline">
                      {availableClasses.map((classItem) => {
                        const isSelected =
                          String(classItem.classId) === String(selectedClassId);
                        return (
                          <button
                            key={classItem.classId}
                            type="button"
                            className={`class-picker-card ${isSelected ? "selected" : ""}`}
                            onClick={() =>
                              setSelectedClassId(classItem.classId)
                            }
                          >
                            <div className="class-picker-card-topline">
                              <strong>{classItem.className}</strong>
                              <span>{classItem.status || "ACTIVE"}</span>
                            </div>
                            <div className="class-picker-card-body">
                              <div>{formatClassSchedule(classItem)}</div>
                              <div>
                                Giáo viên:{" "}
                                {classItem.teacher?.user?.fullname ||
                                  "Đang cập nhật"}
                              </div>
                              <div>
                                Sĩ số: {classItem.enrolledStudents}/
                                {classItem.maxStudents}
                              </div>
                              <div>
                                Đăng ký:{" "}
                                {formatDateTime(classItem.registrationStart)} -{" "}
                                {formatDateTime(classItem.registrationEnd)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="class-picker-footer-inline">
                    <button
                      className="btn-cart-secondary"
                      onClick={() => {
                        setExpandedCourseId(null);
                        setSelectedCourse(null);
                        setAvailableClasses([]);
                        setSelectedClassId(null);
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn-checkout"
                      onClick={handleAddSelectedClass}
                      disabled={!selectedClass}
                    >
                      Thêm lớp đã chọn vào giỏ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRegistration;
