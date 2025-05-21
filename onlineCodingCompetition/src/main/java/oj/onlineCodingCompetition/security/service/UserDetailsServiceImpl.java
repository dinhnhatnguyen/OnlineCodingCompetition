package oj.onlineCodingCompetition.security.service;

import jakarta.transaction.Transactional;
import oj.onlineCodingCompetition.security.entity.User;

import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);
    
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            logger.debug("Loading user by username: {}", username);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));
            
            logger.debug("User found: {}", user.getUsername());
            
            // Do not eagerly load collections here - let UserDetailsImpl handle it safely
            return UserDetailsImpl.build(user);
        } catch (Exception e) {
            // Log the exception for debugging
            logger.error("Error loading user by username: {}", username, e);
            throw e;
        }
    }
}