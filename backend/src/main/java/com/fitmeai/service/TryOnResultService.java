package com.fitmeai.service;

import com.fitmeai.ai.TryOnService;
import com.fitmeai.model.Clothing;
import com.fitmeai.model.TryOnResult;
import com.fitmeai.model.User;
import com.fitmeai.repository.ClothingRepository;
import com.fitmeai.repository.TryOnResultRepository;
import com.fitmeai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class TryOnResultService {

    @Autowired
    private TryOnService aiService;

    @Autowired
    private FileStorageService fileStorage;

    @Autowired
    private TryOnResultRepository resultRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ClothingRepository clothingRepo;

    public TryOnResult tryOn(String userEmail, MultipartFile personImg, Long clothingId) throws IOException {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Clothing clothing = clothingRepo.findById(clothingId)
                .orElseThrow(() -> new RuntimeException("Clothing not found"));

        // Récupérer l'image du vêtement depuis le système de fichiers
        // Pour simplifier, on suppose que clothing.getImageUrl() pointe vers un fichier local
        // Dans un cas réel, il faudrait charger l'image depuis le path

        // Appel IA (IDM-VTON via HF)
        // Note: ici on passe null pour garmentImg car il faudrait charger le fichier
        // Pour l'instant, on simule juste la structure
        byte[] resultImg = aiService.processVirtualTryOn(personImg, personImg); // TODO: charger vraie image vêtement

        // Sauvegarder les images
        String userImgUrl = fileStorage.saveFile(personImg);
        String resultFilename = UUID.randomUUID().toString() + "_result.png";
        fileStorage.saveBytes(resultImg, resultFilename);
        String resultImgUrl = "/uploads/" + resultFilename;

        TryOnResult result = new TryOnResult();
        result.setUser(user);
        result.setClothing(clothing);
        result.setUserImageUrl(userImgUrl);
        result.setResultImageUrl(resultImgUrl);
        result.setStatus("PENDING");

        return resultRepo.save(result);
    }

    public List<TryOnResult> getUserResults(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resultRepo.findByUser(user);
    }

    public List<TryOnResult> getPublicResults() {
        return resultRepo.findByIsPublicTrue();
    }

    public TryOnResult saveToGallery(String userEmail, String imageBase64, String modelName, Long clothingId) throws IOException {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Décoder l'image base64
        String base64Data = imageBase64;
        if (base64Data.contains(",")) {
            base64Data = base64Data.split(",")[1];
        }
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        // Sauvegarder l'image
        String resultFilename = UUID.randomUUID().toString() + "_gallery.png";
        fileStorage.saveBytes(imageBytes, resultFilename);
        String resultImgUrl = "/uploads/" + resultFilename;

        TryOnResult result = new TryOnResult();
        result.setUser(user);
        result.setUserImageUrl("");
        result.setResultImageUrl(resultImgUrl);
        result.setModelName(modelName);
        result.setStatus("APPROVED");

        if (clothingId != null) {
            Clothing clothing = clothingRepo.findById(clothingId).orElse(null);
            result.setClothing(clothing);
        }

        return resultRepo.save(result);
    }

    public void deleteFromGallery(String userEmail, Long resultId) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TryOnResult result = resultRepo.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        if (!result.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this result");
        }

        resultRepo.delete(result);
    }
}
