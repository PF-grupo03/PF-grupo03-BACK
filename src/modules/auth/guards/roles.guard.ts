import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/modules/users/roles.enum';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const requiredRoles =
    this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    
  if (!user || !user.roles || user.roles.length === 0) {
    throw new ForbiddenException('No tiene permisos para acceder a esta ruta');
  }
    
    const hasRole = () =>
      requiredRoles.some((role) => user?.roles?.includes(role)); 
    const valid = user && user.roles && hasRole();

    if(!valid) {
      throw  new ForbiddenException('No tiene permisos para acceder a esta ruta');
    }

    return true;
  }
}