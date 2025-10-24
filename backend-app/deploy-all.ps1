# Set AWS region and ECR repo prefix
$AWS_REGION = "eu-north-1"
$CLUSTER_NAME = "drccs-backend-cluster"
$env:AWS_PAGER = ""

# List of services
$services = @(
    "api-gateway",
    "department-service",
    "municipality-service",
    "incident-service",
    "notification-service",
    "discovery-service",
    "region-service"
    )
    
$results = @()

Set-Location C:\Users\benjv\source\repos\DRCCS\06\backend-app
try {
    Write-Host "Building all services with Maven..."
    mvn clean package -DskipTests > $null
} catch {
    Write-Host "Maven build failed: $_"
    exit 1
}

foreach ($service in $services) {
    $currentIndex = [array]::IndexOf($services, $service)
    $percentComplete = [int](($currentIndex + 1) / $services.Count * 100)
    Write-Progress -Activity "Deploying services" -Status "Processing $service..." -PercentComplete $percentComplete

    $servicePath = ".\$service"
    $imageName = "$service"
    $ecrUri = "$(aws sts get-caller-identity --query 'Account' --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$service"
    $tag = "latest"

    $result = @{Service=$service;Build=$false;Register=$false;Update=$false;Error=$null}

    try {
        docker build -t "${imageName}:${tag}" $servicePath > $null
        $result.Build = $true
    } catch {
        $result.Error = "Docker build failed: $_"
    }

    if ($result.Build) {
        try {
            docker tag "${imageName}:${tag}" "${ecrUri}:${tag}" > $null
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin "${ecrUri}" > $null
            docker push "${ecrUri}:${tag}" > $null
        } catch {
            $result.Error = "Docker push failed: $_"
        }
    }

    # Register new task definition revision
    $taskDefFile = "taskdefinitions\${service}_taskdef.json"
    if (-not $result.Error) {
        try {
            $registerOutput = aws ecs register-task-definition --cli-input-json file://$taskDefFile --region $AWS_REGION --no-paginate | ConvertFrom-Json
            $result.Register = $true
            $taskDefArn = $registerOutput.taskDefinition.taskDefinitionArn
        } catch {
            $result.Error = "Task registration failed: $_"
        }
    }

    # Update ECS service to use the latest task definition revision
    if ($result.Register -and $taskDefArn) {
        try {
            aws ecs update-service --cluster $CLUSTER_NAME --service $service --task-definition $taskDefArn --region $AWS_REGION --no-paginate > $null
            $result.Update = $true
        } catch {
            $result.Error = "Service update failed: $_"
        }
    }

    $results += $result
}

Write-Host "\nDeployment Summary:"
foreach ($r in $results) {
    Write-Host "Service: $($r.Service)"
    Write-Host "  Build: $($r.Build)"
    Write-Host "  Registered: $($r.Register)"
    Write-Host "  Updated: $($r.Update)"
    if ($r.Error) { Write-Host "  Error: $($r.Error)" }
    Write-Host "---"
}

Write-Host "All services have been built, pushed, and redeployed."