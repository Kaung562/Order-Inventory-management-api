pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "order-inventory"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'develop',
                credentialsId: 'jenkin-test',
                url: 'https://github.com/Kaung562/Order-Inventory-management-api'
            }
        }

        stage('Build & Deploy (Docker Compose)') {
            steps {
                sh '''
                    echo "Stopping old containers..."
                    docker compose down || true

                    echo "Building and starting services..."
                    docker compose up -d --build
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    sleep 5
                    curl -s http://localhost:${PORT:-5000} || true
                '''
            }
        }

    }

    post {
        always {
            sh 'docker compose ps || true'
        }

        success {
            echo "Deployment successful (no Docker Hub used)"
        }

        failure {
            echo "Deployment failed"
        }
    }
}