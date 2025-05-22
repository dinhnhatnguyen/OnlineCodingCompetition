package oj.onlineCodingCompetition.security.dto;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private Set<Long> contestRegistrationIds;

    public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles, Set<Long> contestRegistrationIds) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = roles.get(0).replace("ROLE_", "").toLowerCase();
        this.contestRegistrationIds = contestRegistrationIds;
    }
}