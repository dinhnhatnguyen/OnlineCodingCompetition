package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.TranslationKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface TranslationKeyRepository extends JpaRepository<TranslationKey, Long> {

    Optional<TranslationKey> findByCode(String code);

    @Query("SELECT tk FROM TranslationKey tk LEFT JOIN FETCH tk.translations WHERE tk.code = :code")
    Optional<TranslationKey> findByCodeWithTranslations(String code);

    @Query("SELECT DISTINCT tk.code FROM TranslationKey tk ORDER BY tk.code")
    List<String> findAllCodes();

    boolean existsByCode(String code);
}
