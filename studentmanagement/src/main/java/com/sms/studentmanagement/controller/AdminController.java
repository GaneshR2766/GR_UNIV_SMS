package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.entity.Admin;
import com.sms.studentmanagement.repository.AdminRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminRepository adminRepo;

    public AdminController(AdminRepository adminRepo) {
        this.adminRepo = adminRepo;
    }

    // Get all admins (already present)
    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminRepo.findAll();
    }

    // ✅ Authenticate Admin (for login)
    @PostMapping("/login")
    public Admin login(@RequestParam String username, @RequestParam String password) {
        Optional<Admin> adminOptional = adminRepo.findByUsername(username);

        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            if (admin.getPassword().equals(password)) {
                return admin;
            } else {
                throw new RuntimeException("Invalid password");
            }
        } else {
            throw new RuntimeException("Admin not found");
        }
    }

    // ✅ Optional: Get admin by username
    @GetMapping("/{username}")
    public Admin getAdminByUsername(@PathVariable String username) {
        return adminRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
}
