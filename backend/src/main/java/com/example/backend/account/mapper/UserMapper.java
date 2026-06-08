package com.example.backend.account.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.request.UserUpdateRequest;
import com.example.backend.account.dto.response.UserResponse;
import com.example.backend.account.model.Role;
import com.example.backend.account.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "name", source = "fullname")
    @Mapping(target = "active", source = "active")
    @Mapping(target = "roles", source = "roles")
    UserResponse toResponse(User user);

    default Set<String> map(Set<Role> roles) {
        if (roles == null) {
            return Set.of();
        }
        return roles.stream()
            .map(Role::getName)
            .collect(Collectors.toSet());
    }
    void updateFromRequest(@MappingTarget User user, UserUpdateRequest request);
    User createToEntity(UserRegisterRequest request);

    
}
