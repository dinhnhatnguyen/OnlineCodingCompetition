package oj.onlineCodingCompetition.security.service;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import oj.onlineCodingCompetition.entity.ContestRegistration;
import oj.onlineCodingCompetition.security.entity.User;
import org.hibernate.Hibernate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@Builder
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    private Set<Long> contestRegistrationIds;

    public static UserDetailsImpl build(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase());

        // Safely handle the IDs without triggering lazy loading issues
        Set<Long> contestRegistrationIds = Collections.emptySet();
        try {
            // First check if the collection is already initialized to avoid unnecessary queries
            if (user.getContestRegistrations() != null && 
               !Hibernate.isInitialized(user.getContestRegistrations())) {
                // Skip loading contestRegistrations to avoid ConcurrentModificationException
                // They'll be loaded when actually needed
                return UserDetailsImpl.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .password(user.getPassword())
                        .authorities(Collections.singletonList(authority))
                        .contestRegistrationIds(Collections.emptySet())
                        .build();
            } else if (user.getContestRegistrations() != null) {
                // Collection is already initialized, safe to use
                contestRegistrationIds = user.getContestRegistrations().stream()
                        .filter(reg -> reg != null) // Defensive filter for null elements
                        .map(ContestRegistration::getId)
                        .collect(Collectors.toSet());
            }
        } catch (Exception e) {
            // In case of any issues, log and continue with empty set
            System.err.println("Could not load contest registrations: " + e.getMessage());
        }

        return UserDetailsImpl.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.singletonList(authority))
                .contestRegistrationIds(contestRegistrationIds)
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    /**
     * Get user role from authorities
     * Lấy role của user từ authorities
     */
    public String getRole() {
        if (authorities != null && !authorities.isEmpty()) {
            String authority = authorities.iterator().next().getAuthority();
            // Remove "ROLE_" prefix if present
            return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
        }
        return "STUDENT"; // Default role
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}