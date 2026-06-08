# 📦 Git Cheat Sheet & Workflow

## I. Câu lệnh cơ bản
git status        # Kiểm tra trạng thái repo  
git add .         # Thêm tất cả file vào staging  
git commit -m ""  # Commit với message  
git push          # Đẩy code lên remote  
git pull          # Kéo code mới từ remote  

## II. Làm việc với branch (team)
git checkout <branch-name>        # Chuyển branch  
git checkout -b <branch-name>     # Tạo + chuyển sang branch mới  
git push origin <branch-name>     # Push branch lên remote  

## III. Stash (xử lý khi quên chuyển branch)
git stash        # Lưu tạm thay đổi hiện tại  
git stash pop    # Lấy lại thay đổi đã lưu  

Use case:
- Đang code dở ở main nhưng đáng ra phải ở feature  
→ stash → checkout branch → pop lại  

## IV. Quy trình khi làm việc

1. Đồng bộ code mới nhất  
git pull origin main  

2. Tạo branch mới từ main  
git checkout -b feature/<tên-chức-năng>  

3. Code chức năng  

4. Commit & push  
git add .  
git commit -m "feat: <mô tả chức năng>"  
git push origin feature/<tên-chức-năng>  

Ví dụ:  
git push origin feature/login-api  

5. Tiếp tục làm việc  
- Tiếp tục code trên branch hiện tại  
- Hoặc quay về main để cập nhật code mới:  
git checkout main  
git pull origin main  

## V. Lưu ý quan trọng
- Luôn pull trước khi tạo branch mới  
- Không code trực tiếp trên main  
- Mỗi chức năng = 1 branch riêng  
- Commit message rõ ràng (feat, fix, refactor...)