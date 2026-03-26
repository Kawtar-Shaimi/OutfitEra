package com.fitmeai.repository;

import com.fitmeai.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT n FROM Notification n WHERE n.user.id = ?1 AND n.isRead = false")
    List<Notification> findUnreadByUserId(Long userId);
}
