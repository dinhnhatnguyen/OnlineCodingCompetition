package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.TranslationValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranslationRepository extends JpaRepository<TranslationValue, Long> {
    List<TranslationValue> findByLanguageCode(String languageCode);
}
