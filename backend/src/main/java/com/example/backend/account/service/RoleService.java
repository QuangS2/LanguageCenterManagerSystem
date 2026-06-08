package com.example.backend.account.service;

import java.util.List;
import java.util.Optional;

import com.example.backend.account.dto.request.RoleRequest;
import com.example.backend.account.dto.response.RoleResponse;

public interface RoleService {
    List<RoleResponse> getAllRoles();
    RoleResponse createRole(RoleRequest roleRequest);
    Optional<RoleResponse> updateRole(Long id, RoleRequest roleRequest);
}
