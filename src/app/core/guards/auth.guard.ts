import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  state: RouterStateSnapshot
): Observable<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.loginRedirect();

    return false;
  }

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        const requiredRoles = route.data['roles'] as string[] | undefined;
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRequiredRole = authService.hasAnyRole(requiredRoles);

          if (!hasRequiredRole) {
            router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      }

      authService.loginRedirect();
      return false;
    })
  );
};

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.loginRedirect();
    return false;
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const hasRequiredRole = authService.hasAnyRole(requiredRoles);

  if (hasRequiredRole) {
    return true;
  }

  router.navigate(['/unauthorized'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
