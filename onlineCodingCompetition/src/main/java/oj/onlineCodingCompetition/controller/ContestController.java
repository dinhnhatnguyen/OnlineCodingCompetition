package oj.onlineCodingCompetition.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.entity.Contest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ContestRegistrationDTO;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.service.ContestService;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
@Slf4j
public class ContestController {

    private final ContestService contestService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ContestDTO>> getAllContests() {
        log.debug("REST request to get all contests");
        return ResponseEntity.ok(contestService.getAllContests());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<ContestDTO>> getContestsPage(Pageable pageable) {
        log.debug("REST request to get a page of contests");
        return ResponseEntity.ok(contestService.getContestsPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestDTO> getContestById(@PathVariable Long id) {
        log.debug("REST request to get contest by ID: {}", id);
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<ContestRegistrationDTO>> getLeaderboard(@PathVariable Long id) {
        log.debug("REST request to get leaderboard for contest ID: {}", id);
        return ResponseEntity.ok(contestService.getLeaderboard(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ContestDTO> createContest(
            @Valid @RequestBody ContestDTO contestCreateDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("REST request to create contest: {} by user: {}",
                contestCreateDTO.getTitle(), userDetails != null ? userDetails.getUsername() : "null");

        if (userDetails == null) {
            log.error("AuthenticationPrincipal user is null");
            throw new IllegalStateException("User authentication required");
        }

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Contest createdContest = contestService.createContest(contestCreateDTO, user.getId());
        ContestDTO createdContestDTO = contestService.convertToDTO(createdContest);
        return new ResponseEntity<>(createdContestDTO, HttpStatus.CREATED);
    }

//    public ResponseEntity<ContestDTO> createContest(
//            @Valid @RequestBody ContestDTO contestDTO,
//            @AuthenticationPrincipal UserDetails userDetails) {
//        log.debug("REST request to create contest: {}", contestDTO);
//        User user = userRepository.findByUsername(userDetails.getUsername())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        ContestDTO createdContest = contestService.createContest(contestDTO, user.getId());
//        return new ResponseEntity<>(createdContest, HttpStatus.CREATED);
//    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ContestDTO> updateContest(
            @PathVariable Long id,
            @Valid @RequestBody ContestDTO contestDTO) {

        log.debug("REST request to update contest with ID: {}", id);
        return ResponseEntity.ok(contestService.updateContest(id, contestDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteContest(@PathVariable Long id) {
        log.debug("REST request to delete contest with ID: {}", id);
        contestService.deleteContest(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ContestRegistrationDTO> registerUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("REST request to register user for contest ID: {}", id);
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(contestService.registerUser(id, user.getId()));
    }

    @PostMapping("/registrations/{registrationId}/approve")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> approveRegistration(@PathVariable Long registrationId) {
        log.debug("REST request to approve registration with ID: {}", registrationId);
        contestService.approveRegistration(registrationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/registrations/{registrationId}/reject")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> rejectRegistration(@PathVariable Long registrationId) {
        log.debug("REST request to reject registration with ID: {}", registrationId);
        contestService.rejectRegistration(registrationId);
        return ResponseEntity.ok().build();
    }
}