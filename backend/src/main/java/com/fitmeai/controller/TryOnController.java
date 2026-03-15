package com.fitmeai.controller;

import com.fitmeai.ai.TryOnService;
import com.fitmeai.model.TryOnResult;
import com.fitmeai.service.TryOnResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/tryon")
public class TryOnController {

    @Autowired
    private TryOnResultService tryOnService;

    @Autowired
    private TryOnService aiService;

    @PostMapping("/process")
    public ResponseEntity<TryOnResult> processTryOn(
            Authentication auth,
            @RequestParam("personImage") MultipartFile personImg,
            @RequestParam("clothingId") Long clothingId
    ) throws IOException {

        String email = auth.getName();
        TryOnResult result = tryOnService.tryOn(email, personImg, clothingId);
        return ResponseEntity.ok(result);
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

    @GetMapping("/my-results")
    public ResponseEntity<List<TryOnResult>> getMyResults(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(tryOnService.getUserResults(email));
    }

    @GetMapping("/public")
    public ResponseEntity<List<TryOnResult>> getPublicResults() {
        return ResponseEntity.ok(tryOnService.getPublicResults());
    }

    /**
     * Sauvegarder une image base64 dans la galerie de l'utilisateur
     */
    @PostMapping("/save-to-gallery")
    public ResponseEntity<TryOnResult> saveToGallery(
            Authentication auth,
            @RequestBody Map<String, Object> payload
    ) throws IOException {
        String email = auth.getName();
        String imageBase64 = (String) payload.get("image");
        String modelName = (String) payload.get("modelName");
        Long clothingId = payload.get("clothingId") != null ?
            Long.parseLong(payload.get("clothingId").toString()) : null;

        TryOnResult result = tryOnService.saveToGallery(email, imageBase64, modelName, clothingId);
        return ResponseEntity.ok(result);
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
