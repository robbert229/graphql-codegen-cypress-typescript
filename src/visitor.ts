import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  getConfigValue,
  indentMultiline,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode } from 'graphql';

import { RawGraphQLRequestPluginConfig } from './config';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
}

const additionalExportedTypes = ``;

export class GraphQLRequestVisitor extends ClientSideBaseVisitor<
  RawGraphQLRequestPluginConfig,
  GraphQLRequestPluginConfig
> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawGraphQLRequestPluginConfig) {
    super(schema, fragments, rawConfig, {
      rawRequest: getConfigValue(rawConfig.rawRequest, false),
    });

    autoBind(this);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    return null;
  }

  public get sdkContent(): string {
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        
          const doc = `${o.documentVariableName}`;
        
          return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Cypress.Chainable<{data: ${o.operationResultType} }> {
  return cy.gql(
    ${doc}, 
    variables,
  ).then(response => {
    expect(response.status).to.eq(200);
    return response.body as { data: ${o.operationResultType }}
  });  
}`;
      })
      .map(s => indentMultiline(s, 2));

    return `${additionalExportedTypes}
  export default {
${allPossibleActions.join(',\n')}
  };
`;
  }
}
