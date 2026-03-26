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
            agent {
                docker { image 'maven:3.9.6-eclipse-temurin-17' }
            }
            steps {
                dir('backEnd') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            agent {
                docker { image 'node:18-alpine' }
            }
            steps {
                dir('frontEnd') {
                    sh 'npm install'
                    sh 'npm run build -- --configuration production'
                }
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
    // ... post blocks remain same
}

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
    }
}
