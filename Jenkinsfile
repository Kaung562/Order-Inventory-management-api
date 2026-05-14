pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "order-inventory"

        // Application Config
        APP_PORT = "3000"
        NODE_ENV = "production"
        API_PREFIX = "api"

        // Database Config
        DATABASE_SYNC = "false"
        POSTGRES_USER = "postgres"
        POSTGRES_PASSWORD = "root" // later -> "${PASSWORD}"
        POSTGRES_DB = "orders_inventory"

        // Ports
        POSTGRES_PORT = "5444"
        REDIS_PORT = "6380"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                git branch: 'develop',
                    credentialsId: 'cwk-test',
                    url: 'https://github.com/Kaung562/Order-Inventory-management-api'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh '''
                    echo "Stopping existing containers..."
                    docker compose down --remove-orphans || true
                '''
            }
        }

        stage('Build & Deploy') {
            steps {
                sh '''
                    echo "Building and deploying application..."

                    PORT=${APP_PORT} \
                    NODE_ENV=${NODE_ENV} \
                    API_PREFIX=${API_PREFIX} \
                    DATABASE_SYNC=${DATABASE_SYNC} \
                    POSTGRES_USER=${POSTGRES_USER} \
                    POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
                    POSTGRES_DB=${POSTGRES_DB} \
                    POSTGRES_PORT=${POSTGRES_PORT} \
                    REDIS_PORT=${REDIS_PORT} \
                    DATABASE_URL_DOCKER=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/orders_inventory \
                    REDIS_URL_DOCKER=redis://redis:6379 \
                    docker compose up -d --build
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Running health check..."

                    sleep 10

                    curl -f http://localhost:${APP_PORT} || exit 1
                '''
            }
        }
    }

    post {

        always {
            sh '''
                echo "========== CONTAINER STATUS =========="
                docker compose ps || true

                echo "========== LAST 50 LOGS =========="
                docker compose logs --tail=50 || true
            '''
        }

        success {
            echo "Deployment SUCCESS"
        }

        failure {
            echo "Deployment FAILED"
        }
    }
}