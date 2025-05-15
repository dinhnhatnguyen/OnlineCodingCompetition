package oj.onlineCodingCompetition.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ProblemDTO;
import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.security.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import oj.onlineCodingCompetition.repository.ContestRepository;
import oj.onlineCodingCompetition.security.repository.UserRepository;

import oj.onlineCodingCompetition.security.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestService {
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;

    public ContestDTO convertToDTO(Contest contest) {
        if (contest == null) {
            return null;
        }

        ContestDTO dto = new ContestDTO();
        dto.setId(contest.getId());
        dto.setTitle(contest.getTitle());
        dto.setDescription(contest.getDescription());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());
        dto.setProblems(contest.getProblems());
        dto.setIsActive(contest.getIsActive());
        dto.setCreatedAt(contest.getCreatedAt());

        if (contest.getCreatedBy() != null) {
            dto.setCreatedById(contest.getCreatedBy().getId());
            dto.setCreatedByUsername(contest.getCreatedBy().getUsername());
        }

        return dto;
    }

    private Contest convertToEntity(ContestDTO dto, User creator) {
        if (dto == null) {
            return null;
        }
        Contest contest = new Contest();

        if (dto.getId() != null) {
            contest.setId(dto.getId());
        }

        contest.setId(dto.getId());
        contest.setTitle(dto.getTitle());
        contest.setDescription(dto.getDescription());
        contest.setStartTime(dto.getStartTime());
        contest.setEndTime(dto.getEndTime());
        contest.setProblems(dto.getProblems());
        contest.setIsActive(dto.getIsActive());
        contest.setCreatedAt(dto.getCreatedAt());
        contest.setCreatedBy(creator);

        // Set creation time only for new problems
        if (dto.getId() == null) {
            contest.setCreatedAt(LocalDateTime.now());
        } else {
            // For updates, preserve the original creation time
            Contest existingContest = contestRepository.findById(dto.getId()).orElse(null);
            if (existingContest != null) {
                contest.setCreatedAt(existingContest.getCreatedAt());
            } else {
                contest.setCreatedAt(LocalDateTime.now());
            }
        }

        return contest;
    }

    @Transactional(readOnly = true)
    public List<ContestDTO> getAllContest() {
        log.debug("Fetching all contests");
        return contestRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ContestDTO> getContestsPage(Pageable pageable) {
        log.debug("Fetching contests page with pageable: {}", pageable);
        return contestRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public ContestDTO getContestById(Long id) {
        log.debug("Fetching contest by ID: {}", id);
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Contest not found with ID: {}", id);
                    return new EntityNotFoundException("Contest not found with id: " + id);
                });
        return convertToDTO(contest);
    }

    @Transactional
    public ContestDTO createContest(ContestDTO contestDTO, Long creatorId) {
        log.debug("Creating contest with creator ID: {}", creatorId);
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", creatorId);
                    return new EntityNotFoundException("User not found with id: " + creatorId);
                });

        Contest contest = convertToEntity(contestDTO, creator);
        Contest savedContest = contestRepository.save(contest);
        log.info("Problem created successfully with ID: {}", savedContest.getId());

        return convertToDTO(savedContest);
    }

    @Transactional
    public ContestDTO updateContest(Long id, ContestDTO contestDTO) {
        log.debug("Updating contest with ID: {}", id);
        Contest existingContest = contestRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Contest not found with ID: {}", id);
                    return new EntityNotFoundException("Contest not found with id: " + id);
                });

        // Update fields
        existingContest.setTitle(contestDTO.getTitle());
        existingContest.setDescription(contestDTO.getDescription());
        existingContest.setStartTime(contestDTO.getStartTime());
        existingContest.setEndTime(contestDTO.getEndTime());
        existingContest.setIsActive(contestDTO.getIsActive());
        existingContest.setProblems(contestDTO.getProblems());

        Contest updatedContest = contestRepository.save(existingContest);
        log.info("Contest updated successfully with ID: {}", updatedContest.getId());

        return convertToDTO(updatedContest);
    }

    @Transactional
    public void deleteContest(Long id) {
        log.debug("Deleting contest with ID: {}", id);
        if (!contestRepository.existsById(id)) {
            log.error("Contest not found with ID: {}", id);
            throw new EntityNotFoundException("Contest not found with id: " + id);
        }

        contestRepository.deleteById(id);
        log.info("Contest deleted successfully with ID: {}", id);
    }


}
