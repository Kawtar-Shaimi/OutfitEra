# Use lightweight JRE image for the runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/src/main/resources/static/uploads

# Copy the pre-built JAR from the target folder
COPY target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
