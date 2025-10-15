// com.example.agent.aop.PermissionCheckAspect
package com.example.agent.aop;

import com.example.agent.annotation.PermissionCheck;
import com.example.agent.context.UserContext;
import com.example.agent.service.PermissionService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PermissionCheckAspect {

    @Autowired
    private PermissionService permissionService;

    @Around("@annotation(permissionCheck)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, PermissionCheck permissionCheck) throws Throwable {
        Long userId = UserContext.getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("未认证用户，无法执行操作");
        }

        Set<String> userPermissions = permissionService.getPermissionsByUserId(userId);
        String[] required = permissionCheck.value();

        boolean hasPermission = java.util.Arrays.stream(required)
                .anyMatch(userPermissions::contains);

        if (!hasPermission) {
            throw new SecurityException("权限不足：需要 [" + String.join(", ", required) + "]");
        }

        return joinPoint.proceed();
    }
}