pipeline {
    agent any
    environment {
       IMAGE = 'lilkaungmyat/order-inventory-management-api'
        TAG = "${env.BUILD_NUMBER}"
    }
    stages {
        stage('build') {
            steps {
                sh 'docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .'
            }
        }
       stage('push') {
            steps {
               withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'DOCKERHUB_PWD', usernameVariable: 'DOCKERHUB_USER')])
               {
                sh 'echo "$DOCKERHUB_PWD" | docker login -u "$DOCKERHUB_USER" --password-stdin'
                sh 'docker push "$IMAGE:$TAG"'
                sh 'docker push "$IMAGE:latest"'
                }
            }
    }
        stage('deploy') {
            steps {
                sh 'docker pull "$IMAGE:$TAG"'
                sh 'docker rm -f cwk-test || true'
                sh 'docker run -d --name cwk-test -p 5001:5000 "$IMAGE:$TAG"'
                sh ''' 
                cat > deploy-info-$BUILD_NUMBER.txt <<EOL
                build_number: $BUILD_NUMBER
                image: $IMAGE:$TAG
                commit: $GIT_COMMIT
                branch: $GIT_BRANCH
                timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
                url: $BUILD_URL
                EOL
                '''
                archiveArtifacts artifacts: "deploy-info-$BUILD_NUMBER.txt", fingerprint: true, 
                followSymlinks: false
            }
    }
        stage('test') {
            steps {
                sh 'sleep 2; curl -s http://localhost:5000 || true'
            }

    }
        stage('cleanup') {
            steps {
               cleanWs()
            }

    }
    post{
       success {
           echo "Build ${env.BUILD_NUMBER} succeeded."
       }
       failure {
           echo "Build ${env.BUILD_NUMBER} failed."
       }
       always {  
        echo "Build ${env.BUILD_NUMBER} completed."
    }
    }

}