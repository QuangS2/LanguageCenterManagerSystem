package com.example.backend.schedules.service;

import com.example.backend.schedules.dto.request.ScheduleRequest;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import java.util.List;

public interface ScheduleService {
    ScheduleResponse createSchedule(ScheduleRequest request);

    ScheduleResponse updateSchedule(Long id, ScheduleRequest request);

    ScheduleResponse getScheduleById(Long id);

    List<ScheduleResponse> getAllSchedules();

    List<ScheduleResponse> getSchedulesByClassId(Long classId);

    List<ScheduleResponse> getSchedulesByTeacherId(Long teacherId);

    void deleteSchedule(Long id);

    boolean isTeacherOfSchedule(String name, Long scheduleId);
}
