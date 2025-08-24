package oj.onlineCodingCompetition.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.service.UITranslationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@RestController
@RequestMapping("/api/ui-translations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UITranslationController {

    private final UITranslationService uiTranslationService;

    /**
     * Get all UI translations for a specific language
     * GET /api/ui-translations?lang=vi
     * Returns: { "BTN_SAVE": "Lưu", "MSG_ERROR_404": "Không tìm thấy trang" }
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getUITranslations(
            @RequestParam(value = "lang", defaultValue = "en") String languageCode) {
        log.debug("Getting UI translations for language: {}", languageCode);
        return executeWithErrorHandling(
                () -> uiTranslationService.getTranslationsMap(languageCode),
                "Error getting UI translations for language " + languageCode
        );
    }

    /**
     * Get all available languages for UI translations
     * GET /api/ui-translations/languages
     */
    @GetMapping("/languages")
    public ResponseEntity<List<String>> getAvailableLanguages() {
        return executeWithErrorHandling(
                uiTranslationService::getAvailableLanguages,
                "Error getting available languages for UI translations"
        );
    }

    /**
     * Get all UI translation keys
     * GET /api/ui-translations/keys
     */
    @GetMapping("/keys")
    public ResponseEntity<List<String>> getAllTranslationKeys() {
        return executeWithErrorHandling(
                uiTranslationService::getAllTranslationKeys,
                "Error getting UI translation keys"
        );
    }

    /**
     * Create or update UI translation key
     * POST /api/ui-translations/keys
     */
    @PostMapping("/keys")
    public ResponseEntity<String> createTranslationKey(
            @RequestParam String code,
            @RequestParam String description) {
        return executeWithErrorHandling(
                () -> {
                    uiTranslationService.createOrUpdateTranslationKey(code, description);
                    return "UI translation key created/updated successfully";
                },
                "Error creating UI translation key " + code,
                error -> ResponseEntity.badRequest().body("Failed to create UI translation key: " + error)
        );
    }

    /**
     * Create or update UI translation value
     * POST /api/ui-translations/values
     */
    @PostMapping("/values")
    public ResponseEntity<String> createTranslationValue(
            @RequestParam String code,
            @RequestParam String languageCode,
            @RequestParam String content) {
        return executeWithErrorHandling(
                () -> {
                    uiTranslationService.createOrUpdateTranslationValue(code, languageCode, content);
                    return "UI translation value created/updated successfully";
                },
                String.format("Error creating UI translation value for %s in %s", code, languageCode),
                error -> ResponseEntity.badRequest().body("Failed to create UI translation value: " + error)
        );
    }

    /**
     * Get specific UI translation
     * GET /api/ui-translations/translate?code={code}&lang={lang}
     */
    @GetMapping("/translate")
    public ResponseEntity<String> getTranslation(
            @RequestParam String code,
            @RequestParam(value = "lang", defaultValue = "en") String languageCode) {
        return executeWithErrorHandling(
                () -> uiTranslationService.getTranslation(code, languageCode)
                        .orElse("Translation not found"),
                String.format("Error getting translation for %s in %s", code, languageCode)
        );
    }

    /**
     * Delete UI translation key
     * DELETE /api/ui-translations/keys/{code}
     */
    @DeleteMapping("/keys/{code}")
    public ResponseEntity<String> deleteTranslationKey(@PathVariable String code) {
        return executeWithErrorHandling(
                () -> {
                    uiTranslationService.deleteTranslationKey(code);
                    return "UI translation key deleted successfully";
                },
                "Error deleting UI translation key " + code,
                error -> ResponseEntity.badRequest().body("Failed to delete UI translation key: " + error)
        );
    }

    /**
     * Delete UI translation value
     * DELETE /api/ui-translations/values?code={code}&lang={lang}
     */
    @DeleteMapping("/values")
    public ResponseEntity<String> deleteTranslationValue(
            @RequestParam String code,
            @RequestParam String lang) {
        return executeWithErrorHandling(
                () -> {
                    uiTranslationService.deleteTranslationValue(code, lang);
                    return "UI translation value deleted successfully";
                },
                String.format("Error deleting UI translation value for %s in %s", code, lang),
                error -> ResponseEntity.badRequest().body("Failed to delete UI translation value: " + error)
        );
    }

    /**
     * Batch create UI translation keys
     * POST /api/ui-translations/batch-keys
     */
    @PostMapping("/batch-keys")
    public ResponseEntity<String> batchCreateTranslationKeys(
            @RequestBody Map<String, String> keyDescriptionMap) {
        return executeWithErrorHandling(
                () -> {
                    uiTranslationService.batchCreateTranslationKeys(keyDescriptionMap);
                    return String.format("Successfully created %d UI translation keys", keyDescriptionMap.size());
                },
                "Error batch creating UI translation keys",
                error -> ResponseEntity.badRequest().body("Failed to batch create UI translation keys: " + error)
        );
    }

    private <T> ResponseEntity<T> executeWithErrorHandling(
            Supplier<T> operation,
            String errorMessage) {
        return executeWithErrorHandling(operation, errorMessage,
                error -> ResponseEntity.internalServerError().build());
    }

    private <T> ResponseEntity<T> executeWithErrorHandling(
            Supplier<T> operation,
            String errorMessage,
            java.util.function.Function<String, ResponseEntity<T>> errorResponseBuilder) {
        try {
            T result = operation.get();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("{}: {}", errorMessage, e.getMessage());
            return errorResponseBuilder.apply(e.getMessage());
        }
    }
}
