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
 * The Titan text model properties.
 */
export interface TitanTextModelProps {

  /**
   * The name of the model.
   */
  name: string;

  /**
   * The maximum number of tokens supported by the model.
   */
  maxTokens: number;
}

/**
 * A helper to select the Titan text model to use.
 */
export class TitanTextModel {

  /**
   * The name of the model.
   */
  public readonly name: string;

  /**
   * The maximum number of tokens supported by the model.
   */
  public readonly maxTokens: number;

  /**
   * The Bedrock `amazon.titan-text-lite-v1` model.
   * @see https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html
   */
  public static AMAZON_TITAN_TEXT_LITE_V1 = new TitanTextModel({
    name: 'amazon.titan-text-lite-v1',
    maxTokens: 4000
  });

  /**
   * The Bedrock `amazon.titan-text-express-v1` model.
   * @see https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html
   */
  public static AMAZON_TITAN_TEXT_EXPRESS_V1 = new TitanTextModel({
    name: 'amazon.titan-text-express-v1',
    maxTokens: 8000
  });

  /**
   * Create a new instance of the `TitanTextModel`
   * by name.
   * @param props the properties of the model.
   * @returns a new instance of the `TitanTextModel`.
   */
  public static of(props: TitanTextModelProps) {
    return (new TitanTextModel(props));
  }

  constructor(props: TitanTextModelProps) {
    this.name = props.name;
    this.maxTokens = props.maxTokens;
  }
}
