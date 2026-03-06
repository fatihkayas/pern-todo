param location string
param appName string
param environmentId string
param containerImage string

@description('ACR login server — empty string for public images')
param acrLoginServer string = ''

@description('Resource ID of the User-Assigned Managed Identity for ACR pull — empty string for public images')
param uamiId string = ''

param targetPort int
param externalIngress bool = true
param minReplicas int = 1
param maxReplicas int = 3
param secrets array = []
param envVars array = []

var useAcr = !empty(acrLoginServer) && !empty(uamiId)

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location

  identity: useAcr ? {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${uamiId}': {}
    }
  } : { type: 'None' }

  properties: {
    managedEnvironmentId: environmentId

    configuration: {
      ingress: {
        external: externalIngress
        targetPort: targetPort
        transport: 'auto'
        allowInsecure: false
      }
      registries: useAcr ? [
        {
          server: acrLoginServer
          identity: uamiId
        }
      ] : []
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
