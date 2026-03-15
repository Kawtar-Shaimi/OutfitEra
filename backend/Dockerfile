# Use official maven image for the build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Use lightweight JRE image for the runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create the upload directory
RUN mkdir -p /app/src/main/resources/static/uploads

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
