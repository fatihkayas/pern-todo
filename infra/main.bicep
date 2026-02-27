targetScope = 'resourceGroup'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('App name prefix for all resources')
param appName string = 'seiko'

@description('Container image tag to deploy')
param imageTag string = 'latest'

@description('PostgreSQL admin password')
@secure()
param postgresPassword string

@description('Stripe secret key')
@secure()
param stripeSecretKey string

@description('Stripe webhook secret')
@secure()
param stripeWebhookSecret string

@description('JWT signing secret')
@secure()
param jwtSecret string

// ── Globally unique name suffixes ───────────────────────────────────────────
var suffix     = uniqueString(resourceGroup().id)
var acrName    = '${appName}acr${suffix}'

// ── User-Assigned Managed Identity (shared by both Container Apps) ──────────
// Created first so the ACR module can assign AcrPull before the apps start.
resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${appName}-identity'
  location: location
}

// ── Log Analytics (required by Container Apps Environment) ──────────────────
module logAnalytics 'modules/logAnalytics.bicep' = {
  name: 'deploy-log-analytics'
  params: {
    location: location
    workspaceName: '${appName}-logs'
  }
}

// ── Azure Container Registry ─────────────────────────────────────────────────
module acr 'modules/acr.bicep' = {
  name: 'deploy-acr'
  params: {
    location: location
    registryName: acrName
    uamiPrincipalId: uami.properties.principalId
  }
}

// ── Container Apps Environment ───────────────────────────────────────────────
module containerAppsEnv 'modules/containerAppsEnv.bicep' = {
  name: 'deploy-cae'
  params: {
    location: location
    environmentName: '${appName}-cae'
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
    logAnalyticsSharedKey: logAnalytics.outputs.sharedKey
  }
}

// ── PostgreSQL Flexible Server ───────────────────────────────────────────────
module postgres 'modules/postgres.bicep' = {
  name: 'deploy-postgres'
  params: {
    location: location
    serverName: '${appName}-postgres'
    administratorLogin: 'psqladmin'
    administratorLoginPassword: postgresPassword
    databaseName: 'jwtauth'
  }
}

// ── Backend Container App ────────────────────────────────────────────────────
module backend 'modules/containerApp.bicep' = {
  name: 'deploy-backend'
  params: {
    location: location
    appName: '${appName}-backend'
    environmentId: containerAppsEnv.outputs.environmentId
    containerImage: '${acr.outputs.loginServer}/seiko-backend:${imageTag}'
    acrLoginServer: acr.outputs.loginServer
    uamiId: uami.id
    targetPort: 5000
    minReplicas: 1
    maxReplicas: 3
    secrets: [
      { name: 'db-password',              value: postgresPassword }
      { name: 'stripe-secret-key',        value: stripeSecretKey }
      { name: 'stripe-webhook-secret',    value: stripeWebhookSecret }
      { name: 'jwt-secret',               value: jwtSecret }
    ]
    envVars: [
      { name: 'NODE_ENV',                value: 'production' }
      { name: 'DB_HOST',                 value: postgres.outputs.fqdn }
      { name: 'DB_PORT',                 value: '5432' }
      { name: 'DB_USER',                 value: 'psqladmin' }
      { name: 'DB_DATABASE',             value: 'jwtauth' }
      { name: 'DB_SSL',                  value: 'true' }
      { name: 'DB_PASSWORD',             secretRef: 'db-password' }
      { name: 'STRIPE_SECRET_KEY',       secretRef: 'stripe-secret-key' }
      { name: 'STRIPE_WEBHOOK_SECRET',   secretRef: 'stripe-webhook-secret' }
      { name: 'JWT_SECRET',              secretRef: 'jwt-secret' }
    ]
  }
}

// ── Frontend Container App ───────────────────────────────────────────────────
module frontend 'modules/containerApp.bicep' = {
  name: 'deploy-frontend'
  params: {
    location: location
    appName: '${appName}-frontend'
    environmentId: containerAppsEnv.outputs.environmentId
    containerImage: '${acr.outputs.loginServer}/seiko-frontend:${imageTag}'
    acrLoginServer: acr.outputs.loginServer
    uamiId: uami.id
    targetPort: 3000
    minReplicas: 1
    maxReplicas: 2
    secrets: []
    envVars: [
      { name: 'BROWSER',                        value: 'none' }
      { name: 'DANGEROUSLY_DISABLE_HOST_CHECK', value: 'true' }
    ]
  }
}

// ── Outputs ──────────────────────────────────────────────────────────────────
output acrLoginServer  string = acr.outputs.loginServer
output acrName         string = acrName
output backendUrl      string = 'https://${backend.outputs.fqdn}'
output frontendUrl     string = 'https://${frontend.outputs.fqdn}'
output postgresServer  string = postgres.outputs.fqdn
