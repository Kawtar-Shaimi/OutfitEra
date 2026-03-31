package com.fitmeai.repository;

import com.fitmeai.model.TryOnResult;
import com.fitmeai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.fitmeai.model.enums.*;

@Repository
public interface TryOnResultRepository extends JpaRepository<TryOnResult, Long> {
    List<TryOnResult> findByUser(User user);
    List<TryOnResult> findByIsPublicTrue();
    List<TryOnResult> findByStatus(TryOnStatus status);
}
