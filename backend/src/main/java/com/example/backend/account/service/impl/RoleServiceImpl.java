package com.example.backend.account.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.account.dto.request.RoleRequest;
import com.example.backend.account.dto.response.RoleResponse;
import com.example.backend.account.service.RoleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    @Override
    public List<RoleResponse> getAllRoles() {
        throw new UnsupportedOperationException("Unimplemented method 'getAllRoles'");
    }

    @Override
    public RoleResponse createRole(RoleRequest roleRequest) {
        throw new UnsupportedOperationException("Unimplemented method 'createRole'");
    }

    @Override
    public Optional<RoleResponse> updateRole(Long id, RoleRequest roleRequest) {
        throw new UnsupportedOperationException("Unimplemented method 'updateRole'");
    }

}
