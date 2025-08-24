package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.TranslationValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface TranslationValueRepository extends JpaRepository<TranslationValue, Long> {

    Optional<TranslationValue> findByTranslationKeyCodeAndLanguageCode(String code, String languageCode);

    List<TranslationValue> findByLanguageCode(String languageCode);

    @Query("SELECT tv FROM TranslationValue tv JOIN tv.translationKey tk WHERE tk.code = :code")
    List<TranslationValue> findByTranslationKeyCode(@Param("code") String code);

    @Query("SELECT DISTINCT tv.languageCode FROM TranslationValue tv ORDER BY tv.languageCode")
    List<String> findAllAvailableLanguages();

    @Query("SELECT tk.code as code, tv.content as content FROM TranslationValue tv " +
           "JOIN tv.translationKey tk WHERE tv.languageCode = :languageCode")
    List<TranslationMapping> findTranslationsByLanguage(@Param("languageCode") String languageCode);

    interface TranslationMapping {
        String getCode();
        String getContent();
    }
}
