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

        stage('Create .env') {
            steps {
                sh '''
                    cat > .env <<EOF
PORT=3000
NODE_ENV=development
API_PREFIX=api

DATABASE_SYNC=true

POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
POSTGRES_DB=orders_inventory
POSTGRES_PORT=5432
REDIS_PORT=6379

DATABASE_URL_DOCKER=postgresql://postgres:root@postgres:5432/orders_inventory
REDIS_URL_DOCKER=redis://redis:6379
EOF
                '''
            }
        }

        stage('Deploy (Docker Compose)') {
            steps {
                sh '''
                    echo "Stopping old containers..."
                    docker compose down || true

                    echo "Building and starting services..."
                    docker compose up -d --build

                    echo "Waiting for services..."
                    sleep 10
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    echo "Testing API..."
                    curl -s http://localhost:3000 || true
                '''
            }
        }

    }

    post {
        always {
            sh '''
                echo "Container status:"
                docker compose ps || true
            '''
        }

        success {
            echo "Deployment SUCCESS (Docker Compose, no Docker Hub)"
        }

        failure {
            echo "Deployment FAILED"
        }
    }
}