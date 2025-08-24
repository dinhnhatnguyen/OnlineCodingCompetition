package oj.onlineCodingCompetition.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.entity.TranslationKey;
import oj.onlineCodingCompetition.entity.TranslationValue;
import oj.onlineCodingCompetition.repository.TranslationKeyRepository;
import oj.onlineCodingCompetition.repository.TranslationValueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UITranslationService {

    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationValueRepository translationValueRepository;

    /**
     * Get all translations for a specific language as a Map
     * Returns format: { "BTN_SAVE": "Lưu", "MSG_ERROR_404": "Không tìm thấy trang" }
     */
    public Map<String, String> getTranslationsMap(String languageCode) {
        log.debug("Getting translations for language: {}", languageCode);

        Map<String, String> translationsMap = new HashMap<>();

        List<TranslationValueRepository.TranslationMapping> mappings = 
            translationValueRepository.findTranslationsByLanguage(languageCode);

        for (TranslationValueRepository.TranslationMapping mapping : mappings) {
            translationsMap.put(mapping.getCode(), mapping.getContent());
        }

        log.debug("Found {} translations for language {}", translationsMap.size(), languageCode);
        return translationsMap;
    }

    /**
     * Get translation for a specific key and language
     */
    public Optional<String> getTranslation(String code, String languageCode) {
        return translationValueRepository.findByTranslationKeyCodeAndLanguageCode(code, languageCode)
                .map(TranslationValue::getContent);
    }

    /**
     * Get all available languages
     */
    public List<String> getAvailableLanguages() {
        return translationValueRepository.findAllAvailableLanguages();
    }

    /**
     * Create or update a translation key
     */
    @Transactional
    public TranslationKey createOrUpdateTranslationKey(String code, String description) {
        Optional<TranslationKey> existingKey = translationKeyRepository.findByCode(code);

        if (existingKey.isPresent()) {
            TranslationKey key = existingKey.get();
            key.setDescription(description);
            return translationKeyRepository.save(key);
        } else {
            TranslationKey newKey = new TranslationKey();
            newKey.setCode(code);
            newKey.setDescription(description);
            return translationKeyRepository.save(newKey);
        }
    }

    /**
     * Create or update a translation value
     */
    @Transactional
    public TranslationValue createOrUpdateTranslationValue(String code, String languageCode, String content) {
        // First ensure translation key exists
        TranslationKey key = translationKeyRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Translation key not found: " + code));

        // Find existing translation value or create new one
        Optional<TranslationValue> existingValue = 
            translationValueRepository.findByTranslationKeyCodeAndLanguageCode(code, languageCode);

        if (existingValue.isPresent()) {
            TranslationValue value = existingValue.get();
            value.setContent(content);
            return translationValueRepository.save(value);
        } else {
            TranslationValue newValue = new TranslationValue();
            newValue.setTranslationKey(key);
            newValue.setLanguageCode(languageCode);
            newValue.setContent(content);
            return translationValueRepository.save(newValue);
        }
    }

    /**
     * Delete a translation key and all its values
     */
    @Transactional
    public void deleteTranslationKey(String code) {
        translationKeyRepository.findByCode(code)
                .ifPresent(translationKeyRepository::delete);
    }

    /**
     * Delete a specific translation value
     */
    @Transactional
    public void deleteTranslationValue(String code, String languageCode) {
        translationValueRepository.findByTranslationKeyCodeAndLanguageCode(code, languageCode)
                .ifPresent(translationValueRepository::delete);
    }

    /**
     * Get all translation keys
     */
    public List<String> getAllTranslationKeys() {
        return translationKeyRepository.findAllCodes();
    }

    /**
     * Batch create translation keys with initial English values
     */
    @Transactional
    public void batchCreateTranslationKeys(Map<String, String> keyDescriptionMap) {
        for (Map.Entry<String, String> entry : keyDescriptionMap.entrySet()) {
            String code = entry.getKey();
            String description = entry.getValue();

            if (!translationKeyRepository.existsByCode(code)) {
                TranslationKey key = new TranslationKey();
                key.setCode(code);
                key.setDescription(description);
                translationKeyRepository.save(key);
                log.info("Created translation key: {}", code);
            }
        }
    }
}
