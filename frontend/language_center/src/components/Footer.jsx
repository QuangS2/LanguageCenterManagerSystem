import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>LinguaHub</h3>
          <p>Hệ thống quản lý trung tâm ngoại ngữ thông minh và toàn diện.</p>
        </div>
        
        <div className="footer-contact">
          <div className="contact-item">
            <i className="ph ph-phone"></i>
            <span>Hotline: <strong>0123 456 789</strong></span>
          </div>
          <div className="contact-item">
            <i className="ph ph-envelope-simple"></i>
            <span>Email: <strong>support@linguahub.vn</strong></span>
          </div>
          <div className="contact-item">
            <i className="ph ph-map-pin"></i>
            <span>Địa chỉ: <strong>97 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3, TP.HCM</strong></span>
          </div>
          <div className="contact-item">
            <i className="ph ph-facebook-logo"></i>
            <span>Fanpage: <strong>fb.com/LinguaHub.vn</strong></span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} LinguaHub. All rights reserved.
      </div>
    </footer>
  );
}