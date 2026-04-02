# Use lightweight JRE image for the runtime stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/src/main/resources/static/uploads

# Copy the pre-built JAR from the target folder
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
