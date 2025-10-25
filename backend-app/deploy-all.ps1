# Set AWS region and ECR repo prefix
$AWS_REGION = "eu-north-1"
$CLUSTER_NAME = "drccs-backend-cluster"
$env:AWS_PAGER = ""

# List of services

# Interactive prompt for deployment selection
Write-Host "Do you want to deploy all services or select specific ones?"
$deployChoice = Read-Host "Type 'all' to deploy all, or 'select' to choose specific services"


$allServices = @(
    "zookeeper",
    "kafka",
    "api-gateway",
    "department-service",
    "municipality-service",
    "incident-service",
    "notification-service",
    "discovery-service",
    "region-service"
)

if ($deployChoice -eq 'all') {
    $services = $allServices
} elseif ($deployChoice -eq 'select') {
    Write-Host "Available services: $($allServices -join ', ')"
    $selected = Read-Host "Enter a comma-separated list of services to deploy"
    $services = $selected -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -in $allServices }
    if ($services.Count -eq 0) {
        Write-Host "No valid services selected. Exiting."
        exit 1
    }
} else {
    Write-Host "Invalid choice. Exiting."
    exit 1
}

$results = @()


# Only run Maven build if deploying any service other than kafka/zookeeper
$needsMavenBuild = $false
foreach ($svc in $services) {
    if ($svc -ne "kafka" -and $svc -ne "zookeeper") {
        $needsMavenBuild = $true
        break
    }
}

Set-Location C:\Users\benjv\source\repos\DRCCS\06\backend-app
if ($needsMavenBuild) {
    try {
        Write-Host "Building all services with Maven..."
        mvn clean package -DskipTests > $null
    } catch {
        Write-Host "Maven build failed: $_"
        exit 1
    }
} else {
    Write-Host "Skipping Maven build (only deploying kafka and/or zookeeper)"
}

foreach ($service in $services) {

    $currentIndex = [array]::IndexOf($services, $service)
    $percentComplete = [int](($currentIndex + 1) / $services.Count * 100)
    Write-Progress -Activity "Deploying services" -Status "Processing $service..." -PercentComplete $percentComplete

    $result = @{Service=$service;Build=$false;Register=$false;Update=$false;Error=$null}

    if ($service -eq "kafka" -or $service -eq "zookeeper") {
        Write-Host "Skipping Docker build and push for $service (using official image)"
        $result.Build = $true
    } else {
        $servicePath = ".\$service"
        $imageName = "$service"
        $ecrUri = "$(aws sts get-caller-identity --query 'Account' --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$service"
        $tag = "latest"
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

Write-Host "Deployment Summary:"
foreach ($r in $results) {
    Write-Host "Service: $($r.Service)"
    Write-Host "  Build: $($r.Build)"
    Write-Host "  Registered: $($r.Register)"
    Write-Host "  Updated: $($r.Update)"
    if ($r.Error) { Write-Host "  Error: $($r.Error)" }
    Write-Host "---"
}
