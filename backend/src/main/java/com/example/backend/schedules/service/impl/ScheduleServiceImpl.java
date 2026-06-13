package com.example.backend.schedules.service.impl;

import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.dto.request.ScheduleRequest;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.schedules.mapper.ScheduleMapper;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.schedules.service.ScheduleService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final ClassRepository classRepository;
    private final ScheduleMapper scheduleMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"schedules", "schedules_all", "schedules_by_class", "schedules_by_teacher"}, allEntries = true)
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        // Validate class exists
        EntityClass classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        // Validate time logic (startTime < endTime)
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Create and save schedule
        Schedule schedule = scheduleMapper.toEntity(request);
        schedule.setClassEntity(classEntity);

        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"schedules", "schedules_all", "schedules_by_class", "schedules_by_teacher"}, allEntries = true)
    public ScheduleResponse updateSchedule(Long id, ScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        // Validate time logic
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Update fields
        schedule.setLessonDate(request.getLessonDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setRoomNumber(request.getRoomNumber());

        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    @Cacheable(value = "schedules", key = "#id")
    public ScheduleResponse getScheduleById(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
        return scheduleMapper.toResponse(schedule);
    }

    @Override
    @Cacheable(value = "schedules_all")
    public List<ScheduleResponse> getAllSchedules() {
        List<Schedule> schedules = scheduleRepository.findAll();
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "schedules_by_class", key = "#classId")
    public List<ScheduleResponse> getSchedulesByClassId(Long classId) {
        List<Schedule> schedules = scheduleRepository.findByClassEntityId(classId);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "schedules_by_teacher", key = "#teacherId")
    public List<ScheduleResponse> getSchedulesByTeacherId(Long teacherId) {
        List<Schedule> schedules = scheduleRepository.findByClassEntityTeacherId(teacherId);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"schedules", "schedules_all", "schedules_by_class", "schedules_by_teacher"}, allEntries = true)
    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Schedule not found");
        }
        scheduleRepository.deleteById(id);
    }

    @Override
    public boolean isTeacherOfSchedule(String name, Long scheduleId) {
        return scheduleRepository.existsByIdAndClassEntityTeacherUserUsername(scheduleId, name);
    }
}
