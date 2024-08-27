import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileFieldsInterceptor implements NestInterceptor {
  constructor(private readonly fieldNames: { name: string; maxCount: number }[]) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // Aquí puedes añadir lógica adicional si es necesario
    return next.handle();
  }
}
