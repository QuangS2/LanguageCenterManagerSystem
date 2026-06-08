package com.example.backend.account.controller;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.request.UserUpdateRequest;
import com.example.backend.account.dto.response.UserResponse;
import com.example.backend.account.model.User;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.account.service.UserService;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminImportController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private static final DataFormatter DATA_FORMATTER = new DataFormatter();

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/import-students")
    public ResponseEntity<Map<String, Object>> importStudents(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, String>> credentials = new ArrayList<>(); // kept for backward compatibility
        List<Map<String, Object>> reportRows = new ArrayList<>();
        Set<String> reservedUsernames = new HashSet<>();
        int created = 0;
        int failed = 0;

        try (InputStream is = file.getInputStream(); Workbook wb = WorkbookFactory.create(is)) {
            Sheet sheet = wb.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                result.put("error", "File Excel không có dòng tiêu đề.");
                return ResponseEntity.badRequest().body(result);
            }

            Map<String, Integer> headerIndex = parseHeaderIndex(headerRow);

            Integer fullNameCol = firstColumn(headerIndex, "fullname", "full name", "name", "ho va ten", "ho ten");
            Integer emailCol = firstColumn(headerIndex, "email");
            Integer dobCol = firstColumn(headerIndex, "dateofbirth", "date of birth", "dob", "ngay sinh");
            Integer phoneCol = firstColumn(headerIndex, "phone", "so dien thoai", "dien thoai");
            Integer addressCol = firstColumn(headerIndex, "address", "dia chi");
            Integer usernameCol = firstColumn(headerIndex, "username", "ten dang nhap");

            List<String> missingColumns = new ArrayList<>();
            if (fullNameCol == null)
                missingColumns.add("fullname/ho va ten");
            if (emailCol == null)
                missingColumns.add("email");
            if (dobCol == null)
                missingColumns.add("dateOfBirth/ngay sinh");
            if (phoneCol == null)
                missingColumns.add("phone/dien thoai");
            if (addressCol == null)
                missingColumns.add("address/dia chi");

            if (!missingColumns.isEmpty()) {
                result.put("error",
                        "Thiếu cột bắt buộc: " + String.join(", ", missingColumns)
                                + ". Cột hỗ trợ: fullname, username, email, dateOfBirth, phone, address.");
                return ResponseEntity.badRequest().body(result);
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header row
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                Map<String, Object> report = new LinkedHashMap<>();
                report.put("rowNumber", i + 1);

                try {
                    String fullname = getCellString(row, fullNameCol);
                    String email = getCellString(row, emailCol);
                    String dateOfBirth = getCellString(row, dobCol);
                    String phone = getCellString(row, phoneCol);
                    String address = getCellString(row, addressCol);
                    String providedUsername = usernameCol == null ? null : getCellString(row, usernameCol);

                    report.put("fullname", nullToEmpty(fullname));
                    report.put("email", nullToEmpty(email));
                    report.put("dateOfBirth", nullToEmpty(dateOfBirth));
                    report.put("phone", nullToEmpty(phone));
                    report.put("address", nullToEmpty(address));

                    List<String> validationErrors = new ArrayList<>();
                    if (isBlank(fullname)) {
                        validationErrors.add("Thiếu họ tên");
                    }
                    if (isBlank(email)) {
                        validationErrors.add("Thiếu email");
                    }
                    if (isBlank(dateOfBirth)) {
                        validationErrors.add("Thiếu ngày sinh");
                    }
                    if (isBlank(phone)) {
                        validationErrors.add("Thiếu số điện thoại");
                    }
                    if (isBlank(address)) {
                        validationErrors.add("Thiếu địa chỉ");
                    }

                    Integer age = null;
                    if (!isBlank(dateOfBirth)) {
                        age = inferAgeFromDateOfBirth(dateOfBirth);
                        if (age == null) {
                            validationErrors.add(
                                    "Ngày sinh không hợp lệ, hỗ trợ định dạng: yyyy-MM-dd, dd/MM/yyyy, dd-MM-yyyy");
                        } else if (age < 0 || age > 120) {
                            validationErrors.add("Tuổi suy ra từ ngày sinh không hợp lệ (0-120)");
                        }
                    }

                    if (!isBlank(email) && !email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
                        validationErrors.add("Email không đúng định dạng");
                    }

                    if (!validationErrors.isEmpty()) {
                        report.put("status", "FAILED");
                        report.put("errorReason", String.join("; ", validationErrors));
                        reportRows.add(report);
                        failed++;
                        continue;
                    }

                    String username = buildUniqueUsername(providedUsername, fullname, reservedUsernames);
                    report.put("username", username);
                    report.put("age", age == null ? "" : age);

                    String tempPassword = generateTempPassword(8);

                    UserRegisterRequest req = new UserRegisterRequest();
                    req.setFullname(fullname);
                    req.setUsername(username);
                    req.setPassword(tempPassword);
                    req.setRole("STUDENT");

                    UserResponse createdUser = userService.create(req);
                    UserUpdateRequest updateRequest = new UserUpdateRequest();
                    updateRequest.setFullname(fullname);
                    updateRequest.setAge(age);
                    updateRequest.setEmail(email);
                    userService.updateUser(createdUser.getId(), updateRequest);

                    User userEntity = userRepository.findById(createdUser.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found after creation"));

                    Student student = studentRepository.findByUserId(createdUser.getId()).orElseGet(Student::new);
                    student.setUser(userEntity);
                    student.setDateOfBirth(dateOfBirth);
                    student.setPhone(phone);
                    student.setAddress(address);
                    studentRepository.save(student);

                    created++;
                    reservedUsernames.add(username);

                    Map<String, String> cred = new HashMap<>();
                    cred.put("username", createdUser.getUsername());
                    cred.put("password", tempPassword);
                    cred.put("email", email == null ? "" : email);
                    credentials.add(cred);

                    report.put("status", "SUCCESS");
                    report.put("tempPassword", tempPassword);
                    report.put("errorReason", "");
                    reportRows.add(report);
                } catch (Exception ex) {
                    report.put("status", "FAILED");
                    report.put("errorReason", resolveErrorMessage(ex));
                    report.putIfAbsent("username", "");
                    report.put("tempPassword", "");
                    reportRows.add(report);
                    failed++;
                }
            }

            result.put("created", created);
            result.put("failed", failed);
            result.put("credentials", credentials);
            result.put("reportRows", reportRows);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    private Map<String, Integer> parseHeaderIndex(Row headerRow) {
        Map<String, Integer> index = new HashMap<>();
        for (Cell cell : headerRow) {
            String header = normalizeHeader(DATA_FORMATTER.formatCellValue(cell));
            if (!header.isBlank()) {
                index.put(header, cell.getColumnIndex());
            }
        }
        return index;
    }

    private String normalizeHeader(String value) {
        String normalized = stripAccents(value).toLowerCase();
        return normalized.replaceAll("[^a-z0-9]", "");
    }

    private Integer firstColumn(Map<String, Integer> headerIndex, String... aliases) {
        return Arrays.stream(aliases)
                .map(this::normalizeHeader)
                .filter(headerIndex::containsKey)
                .map(headerIndex::get)
                .findFirst()
                .orElse(null);
    }

    private String buildUniqueUsername(String providedUsername, String fullName, Set<String> reservedUsernames) {
        String base = buildStudentUsernameBase(fullName);
        if (base.isBlank()) {
            base = "stu";
        }

        String suffix = ".student";
        int maxBaseLength = 30 - suffix.length();
        if (base.length() > maxBaseLength) {
            base = base.substring(0, maxBaseLength).replaceAll("\\.$", "");
        }

        if (base.isBlank()) {
            base = "stu";
        }

        String candidate = base + suffix;
        int numericSuffix = 1;
        while (reservedUsernames.contains(candidate) || userRepository.existsByUsername(candidate)) {
            String numberText = "." + numericSuffix;
            int maxCandidateBaseLength = 30 - suffix.length() - numberText.length();
            String baseForCandidate = base;
            if (baseForCandidate.length() > maxCandidateBaseLength) {
                baseForCandidate = baseForCandidate.substring(0, maxCandidateBaseLength).replaceAll("\\.$", "");
            }
            if (baseForCandidate.isBlank()) {
                baseForCandidate = "stu";
            }
            candidate = baseForCandidate + suffix + numberText;
            numericSuffix++;
        }

        return candidate;
    }

    private String buildStudentUsernameBase(String fullName) {
        String normalized = stripAccents(fullName).toLowerCase();
        String[] parts = normalized.replaceAll("[^a-z0-9]+", " ").trim().split("\\s+");

        StringBuilder initials = new StringBuilder();
        StringBuilder compact = new StringBuilder();

        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }

            compact.append(part);
            if (initials.length() < 3) {
                initials.append(part.charAt(0));
            }
        }

        String base = initials.toString();
        for (int i = 1; i < compact.length() && base.length() < 3; i++) {
            base += compact.charAt(i);
        }

        if (base.isBlank()) {
            base = "student";
        }

        while (base.length() < 3) {
            base += base.charAt(base.length() - 1);
        }

        return base;
    }

    private String sanitizeUsername(String raw) {
        String normalized = stripAccents(raw).toLowerCase();
        normalized = normalized.replaceAll("[^a-z0-9._\\s-]", "");
        normalized = normalized.replaceAll("[\\s-]+", ".");
        normalized = normalized.replaceAll("\\.+", ".");
        normalized = normalized.replaceAll("^\\.|\\.$", "");
        if (normalized.length() > 30) {
            normalized = normalized.substring(0, 30);
            normalized = normalized.replaceAll("\\.$", "");
        }
        return normalized;
    }

    private String stripAccents(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        // Vietnamese specific chars
        return normalized.replace("đ", "d").replace("Đ", "D");
    }

    private String getCellString(Row row, Integer col) {
        if (col == null) {
            return null;
        }
        try {
            if (row.getCell(col) == null)
                return null;
            return DATA_FORMATTER.formatCellValue(row.getCell(col)).trim();
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isRowEmpty(Row row) {
        for (Cell cell : row) {
            if (!DATA_FORMATTER.formatCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String resolveErrorMessage(Exception ex) {
        Throwable current = ex;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        String message = current.getMessage();
        return message == null || message.isBlank() ? ex.getClass().getSimpleName() : message;
    }

    private Integer inferAgeFromDateOfBirth(String dateOfBirth) {
        List<DateTimeFormatter> formatters = List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yy"),
                DateTimeFormatter.ofPattern("M/d/yy"),
                DateTimeFormatter.ofPattern("yyyy/M/d"),
                DateTimeFormatter.ofPattern("yyyy-M-d"));

        for (DateTimeFormatter formatter : formatters) {
            try {
                LocalDate dob = LocalDate.parse(dateOfBirth.trim(), formatter);
                return Period.between(dob, LocalDate.now()).getYears();
            } catch (DateTimeParseException ignored) {
                // try next format
            }
        }

        // Fallback: try manual parsing to support two-digit years like 5/21/08 or
        // 12/31/10
        try {
            String cleaned = dateOfBirth.trim();
            String[] parts = cleaned.split("[/\\-]");
            if (parts.length == 3) {
                int p0 = Integer.parseInt(parts[0]);
                int p1 = Integer.parseInt(parts[1]);
                int p2 = Integer.parseInt(parts[2]);

                int year = p2;
                // interpret two-digit years as near to current century
                if (year < 100) {
                    int currentYear = LocalDate.now().getYear();
                    int century = (currentYear / 100) * 100;
                    int candidate = century + year;
                    if (candidate > currentYear) {
                        candidate -= 100;
                    }
                    year = candidate;
                }

                int month = p0;
                int day = p1;
                // If month seems >12, maybe the input is day/month/year
                if (month > 12) {
                    month = p1;
                    day = p0;
                }

                LocalDate dob = LocalDate.of(year, month, day);
                return Period.between(dob, LocalDate.now()).getYears();
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    private String generateTempPassword(int length) {
        String letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
        String digits = "0123456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        // ensure at least one letter and one digit
        sb.append(letters.charAt(rnd.nextInt(letters.length())));
        sb.append(digits.charAt(rnd.nextInt(digits.length())));
        for (int i = 2; i < length; i++) {
            String pool = (rnd.nextBoolean() ? letters : digits);
            sb.append(pool.charAt(rnd.nextInt(pool.length())));
        }
        return sb.toString();
    }
}
