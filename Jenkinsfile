pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "fitmeai-backend"
        DOCKER_IMAGE_FRONTEND = "fitmeai-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker run --rm -v ${WORKSPACE}/backEnd:/usr/src/app -w /usr/src/app maven:3.9.6-eclipse-temurin-17 mvn clean package -DskipTests'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker run --rm -v ${WORKSPACE}/frontEnd:/usr/src/app -w /usr/src/app node:18-alpine sh -c "npm install && npm run build -- --configuration production"'
            }
        }

        stage('Docker Build & Deploy') {
            steps {
                script {
                    sh "docker-compose build"
                    sh "docker-compose up -d"
                }
            }
        }
    }

    post {
        always {
            echo 'Finalizing...'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
    }
}
