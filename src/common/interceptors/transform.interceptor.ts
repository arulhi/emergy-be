import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse, IPaginatedMeta } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response && typeof response === 'object' && 'statusCode' in response) {
          return response;
        }
        const isPaginated =
          response &&
          typeof response === 'object' &&
          'data' in response &&
          'meta' in response;
        if (isPaginated) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode || 200,
            message: 'OK',
            data: response.data,
            meta: response.meta as IPaginatedMeta,
          };
        }
        return {
          statusCode: context.switchToHttp().getResponse().statusCode || 200,
          message: 'OK',
          data: response,
        };
      }),
    );
  }
}
