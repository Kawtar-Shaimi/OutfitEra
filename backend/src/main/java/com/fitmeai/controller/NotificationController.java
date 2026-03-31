package com.fitmeai.controller;

import com.fitmeai.dto.response.NotificationResponse;
import com.fitmeai.mapper.NotificationMapper;
import com.fitmeai.model.Notification;
import com.fitmeai.model.User;
import com.fitmeai.service.AuthService;
import com.fitmeai.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationMapper notificationMapper;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        User user = authService.getCurrentUser();
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<NotificationResponse>> getAdminNotifications() {
        User user = authService.getCurrentUser();
        if (user.getRoles().contains("ADMIN") || user.getRoles().contains("ROLE_ADMIN")) {
            List<Notification> notifications = notificationService.getUserNotifications(user.getId());
            return ResponseEntity.ok(notifications.stream()
                    .map(notificationMapper::toResponse)
                    .collect(Collectors.toList()));
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
