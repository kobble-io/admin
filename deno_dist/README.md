![Manage your Kobble project and users from your server with Kobble Admin SDK](https://firebasestorage.googleapis.com/v0/b/kobble-prod.appspot.com/o/docs%2Fbanners%2Fkobbleio-admin.png?alt=media&token=a6c10667-8619-4bdd-bb59-c91fa1ae5ed9)

[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/:status-stable-green.svg?style=flat)
![Deno](https://img.shields.io/:deno-compatible-green.svg?style=flat)
![Node](https://img.shields.io/:node.js-compatible-green.svg?style=flat)
![Supabase](https://img.shields.io/:supabase_edge_functions-compatible-green.svg?style=flat)


## Getting started

Initialize a `Kobble` instance from a secret generated from your [Kobble dashboard](https://app.kobble.io/p/project/admin-sdk).

```ts
import { Kobble } from '@kobbleio/admin'

const main = async () => {
    const kobble = new Kobble('YOUR_SECRET');
    const whoami = await kobble.whoami();

    // To verify your setup
    console.log(whoami);
}

main();
```

## Verify User Tokens

### Verify ID Token

You can verify **ID tokens** obtained using Kobble frontend SDKs as follows:


```ts
import { Kobble } from '@kobbleio/admin'

const main = async () => {
    const kobble = new Kobble('YOUR_SECRET');
    const result = await kobble.auth.verifyIdToken('ID_TOKEN');
    
    console.log(result)
    // Output:
    // {
    //     userId: 'clu9ob5480001mdhwk9qt00hv',
    //     user: {
    //         id: 'clu9ob5480001mdhwk9qt00hv',
    //         email: 'kevinpiac@gmail.com',
    //         name: null,
    //         pictureUrl: null,
    //         isVerified: true,
    //         stripeId: null,
    //         updatedAt: 2024-03-27T10:39:02.000Z,
    //         createdAt: 2024-03-27T10:39:02.000Z
    //     },
    //     claims: { ... }
    // }
}
```

### Verify Access Token

You can verify **access tokens** obtained using Kobble frontend SDKs as follows:

```ts
import { Kobble } from '@kobbleio/admin'

const main = async () => {
    const kobble = new Kobble('YOUR_SECRET');
    
    const result = await kobble.auth.verifyAccessToken('ACCESS_TOKEN');
    
    console.log(result)
    // Output:
    // {
    //     projectId: 'cltxiphfv000129anb0kuagow',
    //     userId: 'clu9ob5480001mdhwk9qt00hv',
    //     claims: {
    //         sub: 'clu9ob5480001mdhwk9qt00hv',
    //         project_id: 'cltxiphfv000129anb0kuagow',
    //         iat: 1713183109,
    //         exp: 1713186709689,
    //         iss: 'https://kobble.io',
    //         aud: 'clu9ntcvr0000o9yfz87ybo4a'
    //     }
    // }
}
```

> The main difference between the two tokens is that the ID token contains user information, while the access token contains project and User ID only.

## Documentation
Exported functions are extensively documented, and more documentation can be found on our [official docs](https://docs.kobble.io).

___

## What is Kobble?

<p align="center">
  <picture>
    <img alt="Kobble Logo" src="https://firebasestorage.googleapis.com/v0/b/kobble-prod.appspot.com/o/docs%2Fbanners%2Flogo.png?alt=media&token=35c9e52e-6a90-4192-aa98-fe99c76be15a" width="150">
  </picture>
</p>
<p align="center">
 Kobble is the one-stop solution for monetizing modern SaaS and APIs. It allows to add authentication, analytics and payment to any app in under 10 minutes.
</p>