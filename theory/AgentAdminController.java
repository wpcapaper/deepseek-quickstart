// com.example.agent.controller.AgentAdminController
package com.example.agent.controller;

import com.example.agent.annotation.PermissionCheck;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
public class AgentAdminController {

    // ———————— 模型管理 ————————
    @GetMapping("/models")
    @PermissionCheck({"model:read"})
    public String listModels() {
        return "返回所有可访问的AI模型列表";
    }

    @PostMapping("/models")
    @PermissionCheck({"model:write"})
    public String createModel(@RequestBody Object modelConfig) {
        return "成功创建新AI模型";
    }

    @DeleteMapping("/models/{modelId}")
    @PermissionCheck({"model:delete"})
    public String deleteModel(@PathVariable String modelId) {
        return "模型 " + modelId + " 已删除";
    }

    // ———————— 用户管理 ————————
    @GetMapping("/users")
    @PermissionCheck({"user:read"})
    public String listUsers() {
        return "返回平台用户列表";
    }

    @PostMapping("/users")
    @PermissionCheck({"user:write"})
    public String createUser(@RequestBody Object userInfo) {
        return "成功创建新用户";
    }

    @DeleteMapping("/users/{userId}")
    @PermissionCheck({"user:delete"})
    public String deleteUser(@PathVariable Long userId) {
        return "用户 " + userId + " 已删除";
    }
}