import {
  ByProjectKeyRequestBuilder,
  ShippingMethod,
  ShippingMethodPagedQueryResponse,
} from '@commercetools/platform-sdk';
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { isSDKError } from '../types/error.type';
import { ObjectNotFoundException } from '../errors/object-not-found.error';
import { RequestParamMalformedException } from '../errors/request-param-malformed.error';
import { API_ROOT } from 'src/commercetools/api-client.module';

@Injectable()
export class ShippingMethodsService {
  constructor(
    @Inject(API_ROOT) private readonly apiRoot: ByProjectKeyRequestBuilder,
  ) {}

  getAllShippingMethods(): Promise<ShippingMethodPagedQueryResponse> {
    return this.apiRoot
      .shippingMethods()
      .get({ queryArgs: { expand: 'zoneRates[*].zone' } })
      .execute()
      .then((response) => response.body);
  }

  getShippingMethodByKey(key: string): Promise<ShippingMethod> {
    return this.apiRoot
      .shippingMethods()
      .withKey({ key })
      .get()
      .execute()
      .then((response) => response.body);
  }

  checkShippingMethodExists(key: string): Promise<void> {
    return this.apiRoot
      .shippingMethods()
      .withKey({ key })
      .head()
      .execute()
      .then((response) => response.body)
      .catch((error) => {
        if (isSDKError(error) && error.statusCode === 404) {
          throw new ObjectNotFoundException(
            `Shipping method with key '${key}' does not exist`,
          );
        }
        throw error;
      });
  }

  getShippingMethodsByLocation(
    countryCode: string,
  ): Promise<ShippingMethodPagedQueryResponse> {
    return this.apiRoot
      .shippingMethods()
      .matchingLocation()
      .get({ queryArgs: { country: countryCode } })
      .execute()
      .then((response) => response.body);
  }

  getMatchingShippingMethods(
    storeKey: string,
    cartId: string,
  ): Promise<ShippingMethodPagedQueryResponse> {
    return this.apiRoot
      .inStoreKeyWithStoreKeyValue({ storeKey })
      .shippingMethods()
      .matchingCart()
      .get({
        queryArgs: {
          cartId,
        },
      })
      .execute()
      .then((response) => response.body);
  }
}
