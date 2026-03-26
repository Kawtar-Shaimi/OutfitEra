pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "fitmeai-backend"
        DOCKER_IMAGE_FRONTEND = "fitmeai-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from Git
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backEnd') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontEnd') {
                    sh 'npm install'
                    sh 'npm run build -- --configuration production'
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    sh "docker-compose build"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh "docker-compose up -d"
                }
            }
        }
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
