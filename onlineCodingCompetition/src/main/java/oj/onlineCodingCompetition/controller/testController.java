package oj.onlineCodingCompetition.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class testController {

    @GetMapping
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("hehe");
    }
}
