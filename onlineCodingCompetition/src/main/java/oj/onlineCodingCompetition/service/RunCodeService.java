package oj.onlineCodingCompetition.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class RunCodeService {

    @Value("${docker.timeout:10}")
    private int dockerTimeout;

    @Value("${docker.code.path:/tmp/code}")
    private String codePath;

    private final Map<String, String> languageImages = new HashMap<>();

    public RunCodeService() {
        languageImages.put("cpp", "cpp-runner");
        languageImages.put("java", "java-runner");
        languageImages.put("python", "python-runner");
        languageImages.put("javascript", "js-runner");
    }

    public Map<String, Object> executeCode(String code, String language) throws IOException, InterruptedException {
        if (!languageImages.containsKey(language)) {
            throw new IllegalArgumentException("Unsupported language: " + language);
        }

        String sessionId = UUID.randomUUID().toString();
        Path codeDir = Paths.get(codePath, sessionId);
        Files.createDirectories(codeDir);

        String fileName = "Main";
        String extension = getFileExtension(language);
        Path sourceFile = codeDir.resolve(fileName + extension);
        Files.writeString(sourceFile, code);

        try {
            return runDockerContainer(sourceFile.toString(), language, sessionId);
        } finally {
            deleteDirectory(codeDir.toFile());
        }
    }

    private String getFileExtension(String language) {
        switch (language) {
            case "cpp": return ".cpp";
            case "java": return ".java";
            case "python": return ".py";
            case "javascript": return ".js";
            default: return ".txt";
        }
    }

    private Map<String, Object> runDockerContainer(String sourceFilePath, String language, String sessionId)
            throws IOException, InterruptedException {
        String imageName = languageImages.get(language);

        ProcessBuilder processBuilder = new ProcessBuilder(
                "docker", "run", "--rm",
                "-v", sourceFilePath + ":/app/code/Main" + getFileExtension(language),
                "--name", "code-execution-" + sessionId,
                imageName,
                "Main" + getFileExtension(language)
        );

        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        boolean completed = process.waitFor(dockerTimeout, TimeUnit.SECONDS);

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        Map<String, Object> result = new HashMap<>();
        if (!completed) {
            process.destroyForcibly();
            result.put("status", "TIME_LIMIT_EXCEEDED");
            result.put("output", "Time limit exceeded");
            Runtime.getRuntime().exec("docker rm -f code-execution-" + sessionId);
        } else {
            int exitCode = process.exitValue();
            if (exitCode == 0) {
                result.put("status", "SUCCESS");
                result.put("output", output.toString().trim());
            } else {
                result.put("status", "ERROR");
                result.put("output", output.toString().trim());
                result.put("exitCode", exitCode);
            }
        }

        return result;
    }

    private void deleteDirectory(File directory) {
        if (directory.exists()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteDirectory(file);
                    } else {
                        file.delete();
                    }
                }
            }
            directory.delete();
        }
    }
}
