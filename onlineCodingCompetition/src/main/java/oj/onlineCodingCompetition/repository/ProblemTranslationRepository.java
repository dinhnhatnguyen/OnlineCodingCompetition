package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.ProblemTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemTranslationRepository extends JpaRepository<ProblemTranslation, Long> {

    /**
     * Find translation by problem ID and language
     */
    Optional<ProblemTranslation> findByProblemIdAndLanguage(Long problemId, String language);

    /**
     * Find all translations for a specific problem
     */
    List<ProblemTranslation> findByProblemId(Long problemId);

    /**
     * Find all translations for a specific language
     */
    List<ProblemTranslation> findByLanguage(String language);

    /**
     * Check if translation exists for problem and language
     */
    boolean existsByProblemIdAndLanguage(Long problemId, String language);

    /**
     * Delete all translations for a specific problem
     */
    void deleteByProblemId(Long problemId);

    /**
     * Get all available languages for translations
     */
    @Query("SELECT DISTINCT pt.language FROM ProblemTranslation pt ORDER BY pt.language")
    List<String> findAllAvailableLanguages();

    /**
     * Count translations by language
     */
    @Query("SELECT COUNT(pt) FROM ProblemTranslation pt WHERE pt.language = :language")
    Long countByLanguage(@Param("language") String language);

    /**
     * Find problems that don't have translation for specific language
     */
    @Query("SELECT p.id FROM Problem p WHERE p.deleted = false AND p.id NOT IN " +
           "(SELECT pt.problem.id FROM ProblemTranslation pt WHERE pt.language = :language)")
    List<Long> findProblemIdsWithoutTranslation(@Param("language") String language);
}
