// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'tn5deo8k6k'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-kfrsv3fk.us.auth0.com',      // Auth0 domain
  clientId: 'ensQFNN8K1mME6MOC67Vduv17ZX0mjKr',     // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
