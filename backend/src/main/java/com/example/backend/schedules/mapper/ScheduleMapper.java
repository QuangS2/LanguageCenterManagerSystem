package com.example.backend.schedules.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.schedules.dto.request.ScheduleRequest;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.schedules.model.Schedule;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {
    Schedule toEntity(ScheduleRequest request);

    @Mapping(target = "scheduleId", source = "id")
    @Mapping(target = "classId", source = "classEntity.id")
    @Mapping(target = "classEntityId", source = "classEntity.id")
    ScheduleResponse toResponse(Schedule schedule);
}
