// src/amplify-config.js
import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-2',
      userPoolId: 'us-east-2_Sc5brmFIa',
      userPoolClientId: '3vfkkd98ojno79j9tgg4kv4mic',
      loginWith: {
        username: true,
        email: false
      }
    }
  },
  API: {
    REST: {
      oneface_gateway: {
        endpoint: 'https://yns4a3sej4.execute-api.us-east-2.amazonaws.com/default',
        region: 'us-east-2'
      }
    }
  }
};

Amplify.configure(amplifyConfig);