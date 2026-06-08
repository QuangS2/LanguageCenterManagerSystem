export const ROLES = {
  student: {
    name: "Nguyễn Văn An",
    initials: "N",
    roleName: "Học viên",
    defaultPage: "s-dashboard",
    nav: [
      {
        section: "Học tập",
        items: [
          { id: "s-dashboard", icon: "ph-house", label: "Tổng quan" },
          {
            id: "s-courses",
            icon: "ph-graduation-cap",
            label: "Đăng ký Khóa học",
          },
        ],
      },
      {
        section: "Tài chính",
        items: [
          {
            id: "s-payment",
            icon: "ph-wallet",
            label: "Thanh toán & Học phí",
            badge: "1",
          },
        ],
      },
    ],
  },
  teacher: {
    name: "Trần Minh Khoa",
    initials: "K",
    roleName: "Giáo viên",
    defaultPage: "t-dashboard",
    nav: [
      {
        section: "Giảng dạy",
        items: [
          {
            id: "t-dashboard",
            icon: "ph-presentation-chart",
            label: "Lớp học & Lịch",
          },
          { id: "t-attendance", icon: "ph-hand-pointing", label: "Điểm danh" },
          { id: "t-grades", icon: "ph-exam", label: "Nhập điểm" },
        ],
      },
    ],
  },
  admin: {
    name: "Admin Hệ thống",
    initials: "A",
    roleName: "Quản trị viên",
    defaultPage: "a-dashboard",
    nav: [
      {
        section: "Quản trị",
        items: [
          { id: "a-dashboard", icon: "ph-chart-pie-slice", label: "Tổng quan" },
          { id: "a-courses", icon: "ph-books", label: "QL Khóa học" },
          { id: "a-classes", icon: "ph-chalkboard", label: "QL Lớp học" },
          { id: "a-users", icon: "ph-users", label: "GV & Học viên" },
          {
            id: "a-policies",
            icon: "ph-receipt",
            label: "Học phí & Chính sách",
          },
        ],
      },
    ],
  },
};

export const STUDENTS = [
  { id: "HV001", name: "Nguyễn Văn An" },
  { id: "HV002", name: "Trần Thị Bích" },
  { id: "HV003", name: "Lê Quang Cường" },
  { id: "HV004", name: "Phạm Hồng Dung" },
];
