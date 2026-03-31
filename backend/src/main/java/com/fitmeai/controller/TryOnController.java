package com.fitmeai.controller;

import com.fitmeai.ai.TryOnService;
import com.fitmeai.dto.response.TryOnResultResponse;
import com.fitmeai.mapper.TryOnMapper;
import com.fitmeai.model.TryOnResult;
import com.fitmeai.service.TryOnResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tryon")
public class TryOnController {

    @Autowired
    private TryOnResultService tryOnService;

    @Autowired
    private TryOnService aiService;

    @Autowired
    private TryOnMapper tryOnMapper;

    @PostMapping("/process")
    public ResponseEntity<TryOnResultResponse> processTryOn(
            Authentication auth,
            @RequestParam("personImage") MultipartFile personImg,
            @RequestParam("clothingId") Long clothingId
    ) throws IOException {

        String email = auth.getName();
        TryOnResult result = tryOnService.tryOn(email, personImg, clothingId);
        return ResponseEntity.ok(tryOnMapper.toResponse(result));
    }

    /**
     * Endpoint IDM-VTON (Replicate) - Retourne dès que prêt
     */
    @PostMapping("/test/idm-vton")
    public ResponseEntity<Map<String, Object>> testIdmVton(
            @RequestParam("personImage") MultipartFile personImg,
            @RequestParam("garmentImage") MultipartFile garmentImg
    ) throws IOException {
        TryOnService.TryOnResult result = aiService.processWithIdmVton(personImg, garmentImg);
        return ResponseEntity.ok(buildResultMap(result));
    }

    /**
     * Endpoint FASHN AI - Retourne dès que prêt
     */
    @PostMapping("/test/fashn")
    public ResponseEntity<Map<String, Object>> testFashn(
            @RequestParam("personImage") MultipartFile personImg,
            @RequestParam("garmentImage") MultipartFile garmentImg
    ) throws IOException {
        TryOnService.TryOnResult result = aiService.processWithFashn(personImg, garmentImg);
        return ResponseEntity.ok(buildResultMap(result));
    }

    private Map<String, Object> buildResultMap(TryOnService.TryOnResult result) {
        Map<String, Object> data = new HashMap<>();
        data.put("modelName", result.modelName);
        data.put("durationMs", result.durationMs);
        if (result.imageData != null) {
            data.put("image", Base64.getEncoder().encodeToString(result.imageData));
            data.put("success", true);
        } else {
            data.put("error", result.error);
            data.put("success", false);
        }
        return data;
    }

    @Transactional(readOnly = true)
    @GetMapping("/my-results")
    public ResponseEntity<List<TryOnResultResponse>> getMyResults(Authentication auth) {
        String email = auth.getName();
        List<TryOnResult> results = tryOnService.getUserResults(email);
        return ResponseEntity.ok(results.stream()
                .map(tryOnMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @Transactional(readOnly = true)
    @GetMapping("/public")
    public ResponseEntity<List<TryOnResultResponse>> getPublicResults() {
        List<TryOnResult> results = tryOnService.getPublicResults();
        return ResponseEntity.ok(results.stream()
                .map(tryOnMapper::toResponse)
                .collect(Collectors.toList()));
    }

    /**
     * Sauvegarder une image base64 dans la galerie de l'utilisateur
     */
    @PostMapping("/save-to-gallery")
    public ResponseEntity<TryOnResultResponse> saveToGallery(
            Authentication auth,
            @RequestBody Map<String, Object> payload
    ) throws IOException {
        String email = auth.getName();
        String imageBase64 = (String) payload.get("image");
        String modelName = (String) payload.get("modelName");
        Long clothingId = payload.get("clothingId") != null ?
            Long.parseLong(payload.get("clothingId").toString()) : null;

        TryOnResult result = tryOnService.saveToGallery(email, imageBase64, modelName, clothingId);
        return ResponseEntity.ok(tryOnMapper.toResponse(result));
    }

    /**
     * Supprimer un résultat de la galerie
     */
    @DeleteMapping("/gallery/{id}")
    public ResponseEntity<Void> deleteFromGallery(
            Authentication auth,
            @PathVariable Long id
    ) {
        String email = auth.getName();
        tryOnService.deleteFromGallery(email, id);
        return ResponseEntity.ok().build();
    }
}
