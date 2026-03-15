package com.fitmeai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.*;
import java.util.concurrent.*;

@Service
@Slf4j
public class TryOnService {

    // =====================================================================
    // CONFIGURATION FASHN AI
    // =====================================================================
    @Value("${fashn.api.url:https://api.fashn.ai/v1}")
    private String fashnApiUrl;

    @Value("${fashn.api.key}")
    private String fashnApiKey;

    // =====================================================================
    // CONFIGURATION IDM-VTON / REPLICATE
    // =====================================================================
    @Value("${replicate.api.url}")
    private String replicateApiUrl;

    @Value("${replicate.api.token}")
    private String replicateApiToken;

    @Value("${replicate.model.version}")
    private String replicateModelVersion;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;

    public TryOnService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.executorService = Executors.newFixedThreadPool(2);
    }

    /**
     * Résultat d'un essayage virtuel
     */
    public static class TryOnResult {
        public final String modelName;
        public final byte[] imageData;
        public final String error;
        public final long durationMs;

        public TryOnResult(String modelName, byte[] imageData, String error, long durationMs) {
            this.modelName = modelName;
            this.imageData = imageData;
            this.error = error;
            this.durationMs = durationMs;
        }
    }

    /**
     * Méthode legacy pour compatibilité avec TryOnResultService
     * Utilise IDM-VTON par défaut
     */
    public byte[] processVirtualTryOn(MultipartFile personImg, MultipartFile garmentImg) throws IOException {
        byte[] personBytes = personImg.getBytes();
        byte[] garmentBytes = garmentImg.getBytes();
        String personContentType = personImg.getContentType();
        String garmentContentType = garmentImg.getContentType();

        return processWithReplicate(personBytes, garmentBytes, personContentType, garmentContentType);
    }

    /**
     * Traitement avec IDM-VTON (Replicate) - endpoint séparé
     */
    public TryOnResult processWithIdmVton(MultipartFile personImg, MultipartFile garmentImg) throws IOException {
        long start = System.currentTimeMillis();
        try {
            byte[] personBytes = personImg.getBytes();
            byte[] garmentBytes = garmentImg.getBytes();
            byte[] result = processWithReplicate(personBytes, garmentBytes, personImg.getContentType(), garmentImg.getContentType());
            long duration = System.currentTimeMillis() - start;
            log.info("IDM-VTON terminé en {}ms", duration);
            return new TryOnResult("IDM-VTON (Replicate)", result, null, duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.error("Erreur IDM-VTON: {}", e.getMessage());
            return new TryOnResult("IDM-VTON (Replicate)", null, e.getMessage(), duration);
        }
    }

    /**
     * Traitement avec FASHN AI - endpoint séparé
     */
    public TryOnResult processWithFashn(MultipartFile personImg, MultipartFile garmentImg) throws IOException {
        long start = System.currentTimeMillis();
        try {
            byte[] personBytes = personImg.getBytes();
            byte[] garmentBytes = garmentImg.getBytes();
            byte[] result = processWithFashnInternal(personBytes, garmentBytes, personImg.getContentType(), garmentImg.getContentType());
            long duration = System.currentTimeMillis() - start;
            log.info("FASHN AI terminé en {}ms", duration);
            return new TryOnResult("FASHN AI", result, null, duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.error("Erreur FASHN AI: {}", e.getMessage());
            return new TryOnResult("FASHN AI", null, e.getMessage(), duration);
        }
    }

    /**
     * Lance les deux modèles en parallèle et retourne les résultats
     */
    public Map<String, TryOnResult> processVirtualTryOnParallel(MultipartFile personImg, MultipartFile garmentImg) throws IOException {
        byte[] personBytes = personImg.getBytes();
        byte[] garmentBytes = garmentImg.getBytes();
        String personContentType = personImg.getContentType();
        String garmentContentType = garmentImg.getContentType();

        Map<String, TryOnResult> results = new ConcurrentHashMap<>();

        // Lancer IDM-VTON (Replicate) en parallèle
        CompletableFuture<Void> replicateFuture = CompletableFuture.runAsync(() -> {
            long start = System.currentTimeMillis();
            try {
                byte[] result = processWithReplicate(personBytes, garmentBytes, personContentType, garmentContentType);
                long duration = System.currentTimeMillis() - start;
                results.put("idm-vton", new TryOnResult("IDM-VTON (Replicate)", result, null, duration));
                log.info("IDM-VTON terminé en {}ms", duration);
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - start;
                log.error("Erreur IDM-VTON: {}", e.getMessage());
                results.put("idm-vton", new TryOnResult("IDM-VTON (Replicate)", null, e.getMessage(), duration));
            }
        }, executorService);

        // Lancer FASHN AI en parallèle
        CompletableFuture<Void> fashnFuture = CompletableFuture.runAsync(() -> {
            long start = System.currentTimeMillis();
            try {
                byte[] result = processWithFashnInternal(personBytes, garmentBytes, personContentType, garmentContentType);
                long duration = System.currentTimeMillis() - start;
                results.put("fashn", new TryOnResult("FASHN AI", result, null, duration));
                log.info("FASHN AI terminé en {}ms", duration);
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - start;
                log.error("Erreur FASHN AI: {}", e.getMessage());
                results.put("fashn", new TryOnResult("FASHN AI", null, e.getMessage(), duration));
            }
        }, executorService);

        // Attendre que les deux soient terminés (timeout 3 minutes)
        try {
            CompletableFuture.allOf(replicateFuture, fashnFuture).get(3, TimeUnit.MINUTES);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            log.error("Erreur attente parallèle: {}", e.getMessage());
        }

        return results;
    }

    // =====================================================================
    // IDM-VTON / REPLICATE IMPLEMENTATION
    // =====================================================================

    private byte[] processWithReplicate(byte[] personBytes, byte[] garmentBytes, String personType, String garmentType) throws IOException {
        String predictionId = createReplicatePrediction(personBytes, garmentBytes, personType, garmentType);
        String outputUrl = waitForReplicatePrediction(predictionId);
        return downloadImage(outputUrl);
    }

    private String createReplicatePrediction(byte[] personBytes, byte[] garmentBytes, String personType, String garmentType) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + replicateApiToken);

        String mimeType = personType != null ? personType : "image/png";
        String personB64 = "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(personBytes);
        String garmentB64 = "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(garmentBytes);

        Map<String, Object> payload = new HashMap<>();
        payload.put("version", replicateModelVersion);

        Map<String, Object> input = new HashMap<>();
        input.put("human_img", personB64);
        input.put("garm_img", garmentB64);
        input.put("garment_des", "Virtual try-on");
        input.put("category", "upper_body");
        payload.put("input", input);

        String jsonPayload = objectMapper.writeValueAsString(payload);
        HttpEntity<String> req = new HttpEntity<>(jsonPayload, headers);

        ResponseEntity<String> res = restTemplate.exchange(
            replicateApiUrl,
            HttpMethod.POST,
            req,
            String.class
        );

        JsonNode root = objectMapper.readTree(res.getBody());
        String predictionId = root.path("id").asText();
        log.info("Replicate prediction créée: {}", predictionId);
        return predictionId;
    }

    private String waitForReplicatePrediction(String predictionId) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + replicateApiToken);
        HttpEntity<String> req = new HttpEntity<>(headers);

        String getUrl = replicateApiUrl + "/" + predictionId;
        int maxAttempts = 60;
        int attempt = 0;

        while (attempt < maxAttempts) {
            try {
                Thread.sleep(3000);

                ResponseEntity<String> res = restTemplate.exchange(getUrl, HttpMethod.GET, req, String.class);
                JsonNode root = objectMapper.readTree(res.getBody());
                String status = root.path("status").asText();

                log.debug("Replicate status: {}", status);

                if ("succeeded".equals(status)) {
                    JsonNode output = root.path("output");
                    if (output.isTextual()) return output.asText();
                    if (output.isArray() && output.size() > 0) return output.get(0).asText();
                    if (output.isObject() && output.has("url")) return output.path("url").asText();
                    throw new RuntimeException("Format output Replicate invalide");
                } else if ("failed".equals(status) || "canceled".equals(status)) {
                    throw new RuntimeException("Replicate échoué: " + root.path("error").asText());
                }

                attempt++;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interruption Replicate", e);
            }
        }
        throw new RuntimeException("Timeout Replicate");
    }

    // =====================================================================
    // FASHN AI IMPLEMENTATION
    // =====================================================================

    private byte[] processWithFashnInternal(byte[] personBytes, byte[] garmentBytes, String personType, String garmentType) throws IOException {
        String predictionId = createFashnPrediction(personBytes, garmentBytes, personType, garmentType);
        String outputUrl = waitForFashnPrediction(predictionId);
        return downloadImage(outputUrl);
    }

    private String createFashnPrediction(byte[] personBytes, byte[] garmentBytes, String personType, String garmentType) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + fashnApiKey);

        String mimeType = personType != null ? personType : "image/png";
        String personB64 = "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(personBytes);
        String garmentB64 = "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(garmentBytes);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model_name", "tryon-v1.6");

        Map<String, Object> inputs = new HashMap<>();
        inputs.put("model_image", personB64);
        inputs.put("garment_image", garmentB64);
        payload.put("inputs", inputs);

        String jsonPayload = objectMapper.writeValueAsString(payload);
        HttpEntity<String> req = new HttpEntity<>(jsonPayload, headers);

        ResponseEntity<String> res = restTemplate.exchange(
            fashnApiUrl + "/run",
            HttpMethod.POST,
            req,
            String.class
        );

        JsonNode root = objectMapper.readTree(res.getBody());
        String predictionId = root.path("id").asText();
        log.info("FASHN prediction créée: {}", predictionId);
        return predictionId;
    }

    private String waitForFashnPrediction(String predictionId) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + fashnApiKey);
        HttpEntity<String> req = new HttpEntity<>(headers);

        String getUrl = fashnApiUrl + "/status/" + predictionId;
        int maxAttempts = 30;
        int attempt = 0;

        while (attempt < maxAttempts) {
            try {
                Thread.sleep(2000);

                ResponseEntity<String> res = restTemplate.exchange(getUrl, HttpMethod.GET, req, String.class);
                JsonNode root = objectMapper.readTree(res.getBody());
                String status = root.path("status").asText();

                log.debug("FASHN status: {}", status);

                if ("completed".equals(status)) {
                    JsonNode output = root.path("output");
                    if (output.isArray() && output.size() > 0) return output.get(0).asText();
                    if (output.isTextual()) return output.asText();
                    if (output.isObject() && output.has("url")) return output.path("url").asText();
                    throw new RuntimeException("Format output FASHN invalide");
                } else if ("failed".equals(status) || "canceled".equals(status) || "time_out".equals(status)) {
                    JsonNode error = root.path("error");
                    String errorMsg = error.has("message") ? error.path("message").asText() : error.asText();
                    throw new RuntimeException("FASHN échoué: " + errorMsg);
                }

                attempt++;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interruption FASHN", e);
            }
        }
        throw new RuntimeException("Timeout FASHN");
    }

    // =====================================================================
    // MÉTHODE COMMUNE : TÉLÉCHARGEMENT IMAGE
    // =====================================================================

    private byte[] downloadImage(String imageUrl) throws IOException {
        log.debug("Téléchargement image depuis: {}", imageUrl);
        try {
            URL url = new URL(imageUrl);
            byte[] imageBytes = restTemplate.getForObject(url.toURI(), byte[].class);
            log.info("Image téléchargée ({} bytes)", imageBytes != null ? imageBytes.length : 0);
            return imageBytes;
        } catch (java.net.URISyntaxException e) {
            throw new IOException("URL invalide: " + imageUrl, e);
        }
    }
}
