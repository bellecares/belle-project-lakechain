/*
 * Copyright (C) 2023 Amazon.com, Inc. or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * CDK Nag for Opensearch Index
 *
 * @group nag/opensearch-index
 */

import path from 'path';
import fs from 'fs';

import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { OpenSearchIndex } from '../../src'
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Domain, EngineVersion, TLSSecurityPolicy } from 'aws-cdk-lib/aws-opensearchservice';

const mockApp = new App();
const mockStack = new Stack(mockApp, 'NagStack');

const oldResolve = path.resolve;

/**
 * Mock the `path.resolve` function to point to the `dist`
 * directory instead of the `src` directory when running
 * in the context of the test suite.
 * @param args the path segments.
 * @returns a resolved path.
 */
path.resolve = (...args: string[]) => {
  const endsWithJs = args[args.length - 1].endsWith('.js');
  const pathExists = fs.existsSync(oldResolve(...args));

  if (endsWithJs && !pathExists) {
    // Replace the `src` directory by `dist` in the entire path
    const newPath = oldResolve(...args).replace(/src/g, 'dist');
    return (oldResolve(newPath));
  }
  return (oldResolve(...args));
};

const vpc = new Vpc(mockStack, 'vpc', {subnetConfiguration: [{
    cidrMask: 24,
    name: 'ingress',
    subnetType: SubnetType.PUBLIC,
  },
    {
      cidrMask: 24,
      name: 'application',
      subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    },
    {
      cidrMask: 28,
      name: 'rds',
      subnetType: SubnetType.PRIVATE_ISOLATED,
    }]});

const domain = new Domain(mockStack, 'domain', {
  vpc,
  version: EngineVersion.OPENSEARCH_2_9,
  tlsSecurityPolicy: TLSSecurityPolicy.TLS_1_2,
  encryptionAtRest: {
    enabled: true
  }
});

// Instantiate Construct
new OpenSearchIndex(mockStack, 'opensearch', {
  vpc,
  indexName: 'index',
  body: {
    mappings: {
      properties: {
        time: {
          type: 'date'
        }
      }
    }
  },
  endpoint: domain
});

Aspects.of(mockStack).add(new AwsSolutionsChecks({ verbose: true }));

NagSuppressions.addResourceSuppressionsByPath(
    mockStack,
    '/NagStack/vpc/Resource',
    [{ id: 'AwsSolutions-VPC7', reason: 'VPC is provided by the customer, not part of the construct' }],
);

NagSuppressions.addStackSuppressions(mockStack, [
  { id: 'AwsSolutions-IAM4', reason: 'Using standard managed policies' }
]);

NagSuppressions.addResourceSuppressions(domain, [
  { id: 'AwsSolutions-OS2', reason: 'Resource provided by the customer, not part of the construct' },
  { id: 'AwsSolutions-OS3', reason: 'Resource provided by the customer, not part of the construct' },
  { id: 'AwsSolutions-OS4', reason: 'Resource provided by the customer, not part of the construct' },
  { id: 'AwsSolutions-OS5', reason: 'Resource provided by the customer, not part of the construct' },
  { id: 'AwsSolutions-OS7', reason: 'Resource provided by the customer, not part of the construct' },
  { id: 'AwsSolutions-OS8', reason: 'Resource provided by the customer, not part of the construct' },
  { id: 'AwsSolutions-OS9', reason: 'Resource provided by the customer, not part of the construct' }
]);

NagSuppressions.addResourceSuppressionsByPath(
    mockStack,
    '/NagStack/opensearch/Compute/Resource',
    [
      { id: 'AwsSolutions-L1', reason: 'Using NodeJS 18 which was the latest until very recently' },
    ],
);

NagSuppressions.addResourceSuppressionsByPath(
    mockStack,
    '/NagStack/opensearch/Compute/ServiceRole/DefaultPolicy/Resource',
    [
      { id: 'AwsSolutions-IAM5', reason: 'Limited to the domain (using grantWrite on Lambda)' },
    ],
);

NagSuppressions.addResourceSuppressionsByPath(
    mockStack,
    '/NagStack/opensearch/Provider/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
    [
      { id: 'AwsSolutions-IAM5', reason: 'CDK Custom resource, access to the lambda function, the function itself has restricted permissions' },
    ],
);

NagSuppressions.addResourceSuppressionsByPath(
    mockStack,
    '/NagStack/opensearch/Provider/framework-onEvent/Resource',
    [
      { id: 'AwsSolutions-L1', reason: 'CDK Custom resource, Lambda generated by CDK' },
    ],
);

describe('CDK Nag', () => {

  test('No unsuppressed Errors', () => {
    const errors = Annotations.fromStack(mockStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    if (errors && errors.length > 0) {
      console.log(errors);
    }
    expect(errors).toHaveLength(0);
  });

});
