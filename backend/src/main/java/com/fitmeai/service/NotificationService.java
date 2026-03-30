package com.fitmeai.service;

import lombok.extern.slf4j.Slf4j;

import com.fitmeai.model.Notification;
import com.fitmeai.model.User;
import com.fitmeai.repository.NotificationRepository;
import com.fitmeai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import com.fitmeai.model.enums.*;

@Slf4j
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void createNotification(User user, NotificationType type, String message, Long targetId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notification.setTargetId(targetId);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAdmins(String message, Long targetId) {
        List<User> admins = userRepository.findAdmins();
        log.info("Found {} admins to notify", admins.size());
        for (User admin : admins) {
            log.info("Creating notification for admin: {}", admin.getEmail());
            createNotification(admin, NotificationType.ORDER_CONFIRMED, message, targetId);
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsReadForUser(Long userId) {
        List<Notification> unread = notificationRepository.findUnreadByUserId(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void markAllAsReadForAdmin() {
        List<User> admins = userRepository.findAdmins();
        for (User admin : admins) {
            markAllAsReadForUser(admin.getId());
        }
    }
}
