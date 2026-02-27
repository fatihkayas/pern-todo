using './main.bicep'

param appName   = 'seiko'
param location  = 'westeurope'
param imageTag  = 'latest'

// Secrets — pass via CLI to keep out of source control:
//   az deployment group create \
//     --parameters @infra/main.bicepparam \
//     --parameters postgresPassword="..." stripeSecretKey="..." \
//                  stripeWebhookSecret="..." jwtSecret="..."
