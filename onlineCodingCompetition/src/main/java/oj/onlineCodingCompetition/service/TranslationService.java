package oj.onlineCodingCompetition.service;

import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.ProblemTranslation;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.ProblemTranslationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class TranslationService {

    private final ProblemTranslationRepository translationRepository;
    private final ProblemRepository problemRepository;
    private final Translate translate;

    public TranslationService(
            ProblemTranslationRepository translationRepository,
            ProblemRepository problemRepository,
            @Value("${google.translate.api.key}") String apiKey) {
        this.translationRepository = translationRepository;
        this.problemRepository = problemRepository;
        this.translate = TranslateOptions.newBuilder()
                .setApiKey(apiKey)
                .build()
                .getService();
    }

    /**
     * Get translation for a problem in specific language
     * If translation doesn't exist, create it automatically
     */
    @Transactional
    public Optional<ProblemTranslation> getOrCreateTranslation(Long problemId, String targetLanguage) {
        // If requesting English, return empty (use original)
        if ("en".equalsIgnoreCase(targetLanguage)) {
            return Optional.empty();
        }

        // Check if translation already exists
        Optional<ProblemTranslation> existing = translationRepository.findByProblemIdAndLanguage(problemId, targetLanguage);
        if (existing.isPresent()) {
            log.debug("Found existing translation for problem {} in language {}", problemId, targetLanguage);
            return existing;
        }

        // Get original problem
        Optional<Problem> problemOpt = problemRepository.findById(problemId);
        if (problemOpt.isEmpty()) {
            log.warn("Problem not found with id: {}", problemId);
            return Optional.empty();
        }

        Problem problem = problemOpt.get();
        
        try {
            // Create new translation
            ProblemTranslation translation = translateProblem(problem, targetLanguage);
            ProblemTranslation saved = translationRepository.save(translation);
            log.info("Created new translation for problem {} in language {}", problemId, targetLanguage);
            return Optional.of(saved);
        } catch (Exception e) {
            log.error("Failed to create translation for problem {} in language {}: {}", problemId, targetLanguage, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Translate a problem to target language using Google Translate API
     */
    private ProblemTranslation translateProblem(Problem problem, String targetLanguage) {
        try {
            log.debug("Translating problem {} to language {}", problem.getId(), targetLanguage);

            // Translate title
            String translatedTitle = translateText(problem.getTitle(), targetLanguage);
            
            // Translate description
            String translatedDescription = translateText(problem.getDescription(), targetLanguage);
            
            // Translate constraints
            String translatedConstraints = problem.getConstraints() != null ? 
                translateText(problem.getConstraints(), targetLanguage) : null;

            return new ProblemTranslation(
                problem,
                targetLanguage,
                translatedTitle,
                translatedDescription,
                translatedConstraints
            );

        } catch (Exception e) {
            log.error("Error translating problem {}: {}", problem.getId(), e.getMessage());
            throw new RuntimeException("Translation failed", e);
        }
    }

    /**
     * Translate text using Google Translate API
     */
    private String translateText(String text, String targetLanguage) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        try {
            Translation translation = translate.translate(
                text,
                Translate.TranslateOption.sourceLanguage("en"),
                Translate.TranslateOption.targetLanguage(targetLanguage)
            );
            
            return translation.getTranslatedText();
        } catch (Exception e) {
            log.warn("Failed to translate text, returning original: {}", e.getMessage());
            return text; // Return original text if translation fails
        }
    }

    /**
     * Get existing translation without creating new one
     */
    public Optional<ProblemTranslation> getTranslation(Long problemId, String language) {
        return translationRepository.findByProblemIdAndLanguage(problemId, language);
    }

    /**
     * Get all translations for a problem
     */
    public List<ProblemTranslation> getAllTranslations(Long problemId) {
        return translationRepository.findByProblemId(problemId);
    }

    /**
     * Delete translation
     */
    @Transactional
    public void deleteTranslation(Long problemId, String language) {
        translationRepository.findByProblemIdAndLanguage(problemId, language)
            .ifPresent(translationRepository::delete);
    }

    /**
     * Get all available languages
     */
    public List<String> getAvailableLanguages() {
        return translationRepository.findAllAvailableLanguages();
    }

    /**
     * Batch translate problems for a specific language
     */
    @Transactional
    public void batchTranslateProblems(String targetLanguage, List<Long> problemIds) {
        log.info("Starting batch translation for {} problems to language {}", problemIds.size(), targetLanguage);
        
        int successCount = 0;
        int failCount = 0;
        
        for (Long problemId : problemIds) {
            try {
                getOrCreateTranslation(problemId, targetLanguage);
                successCount++;
                log.debug("Successfully translated problem {}", problemId);
            } catch (Exception e) {
                failCount++;
                log.error("Failed to translate problem {}: {}", problemId, e.getMessage());
            }
        }
        
        log.info("Batch translation completed. Success: {}, Failed: {}", successCount, failCount);
    }
}
