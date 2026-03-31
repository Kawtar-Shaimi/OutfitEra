package com.fitmeai.controller;

import org.springframework.transaction.annotation.Transactional;
import com.fitmeai.dto.response.NotificationResponse;
import com.fitmeai.model.Notification;
import com.fitmeai.model.User;
import com.fitmeai.service.AuthService;
import com.fitmeai.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        User user = authService.getCurrentUser();
        List<NotificationResponse> responses = new ArrayList<>();
        if (user != null) {
            List<Notification> notifications = notificationService.getUserNotifications(user.getId());
            for (Notification n : notifications) {
                NotificationResponse res = new NotificationResponse();
                res.setId(n.getId());
                res.setType(n.getType());
                res.setMessage(n.getMessage());
                res.setTargetId(n.getTargetId());
                res.setRead(n.isRead());
                res.setCreatedAt(n.getCreatedAt());
                responses.add(res);
            }
        }
        return ResponseEntity.ok(responses);
    }

    @Transactional(readOnly = true)
    @GetMapping("/admin")
    public ResponseEntity<List<NotificationResponse>> getAdminNotifications() {
        User user = authService.getCurrentUser();
        List<NotificationResponse> responses = new ArrayList<>();
        if (user != null && (user.getRoles().contains("ADMIN") || user.getRoles().contains("ROLE_ADMIN"))) {
            List<Notification> notifications = notificationService.getUserNotifications(user.getId());
            for (Notification n : notifications) {
                NotificationResponse res = new NotificationResponse();
                res.setId(n.getId());
                res.setType(n.getType());
                res.setMessage(n.getMessage());
                res.setTargetId(n.getTargetId());
                res.setRead(n.isRead());
                res.setCreatedAt(n.getCreatedAt());
                responses.add(res);
            }
            return ResponseEntity.ok(responses);
        }
        return ResponseEntity.status(403).build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User user = authService.getCurrentUser();
        notificationService.markAllAsReadForUser(user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/read-all")
    public ResponseEntity<Void> markAllAdminAsRead() {
        User user = authService.getCurrentUser();
        if (user.getRoles().contains("ADMIN") || user.getRoles().contains("ROLE_ADMIN")) {
            notificationService.markAllAsReadForAdmin();
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(403).build();
    }
}
