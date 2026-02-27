param location string
param appName string
param environmentId string
param containerImage string
param acrLoginServer string

@description('Resource ID of the User-Assigned Managed Identity for ACR pull')
param uamiId string

param targetPort int
param minReplicas int = 1
param maxReplicas int = 3
param secrets array = []
param envVars array = []

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location

  // Attach the shared UAMI — used for pulling images from ACR
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${uamiId}': {}
    }
  }

  properties: {
    managedEnvironmentId: environmentId

    configuration: {
      ingress: {
        external: true
        targetPort: targetPort
        transport: 'auto'
        allowInsecure: false
      }
      // Use UAMI (not admin creds) to authenticate to ACR
      registries: [
        {
          server: acrLoginServer
          identity: uamiId
        }
      ]
      secrets: secrets
    }

    template: {
      containers: [
        {
          name: appName
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: envVars
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

output fqdn        string = containerApp.properties.configuration.ingress.fqdn
output containerAppId string = containerApp.id
