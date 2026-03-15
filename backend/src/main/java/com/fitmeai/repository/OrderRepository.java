package com.fitmeai.repository;

import com.fitmeai.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(o) FROM Order o")
    long countAll();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = ?1")
    long countByStatus(String status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    Double sumDeliveredAmount();
}
