# Introduction
This is a plugin for the graphql-codegen platform. It allows typesafe wrappers to Cypress's cy.request function for more easily accessable type safe testing wrappers in your e2e test code.

## Usage

It doesn't directly call `cy.request`, instead it calls `cy.gql` which is a function that you will need to provide. This function should have the following schema.

```
declare namespace Cypress {
  interface Chainable {
    gql(
      query: string, 
      variables?: {[key: string] : any}, 
      headers?: {[key: string] : any}
    ) : Cypress.Chainable<Cypress.Response>
  }
}
```

Here is an example implementation.

```
Cypress.Commands.add('gql', (query, variables, headers = {}) => {
  cy.request({
    method: 'POST',
    body: {
      variables,
      query: query.loc.source.body,
    },
    url: '/api/graphql',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
});
```

Currently the plugin doesn't have any configuration options.