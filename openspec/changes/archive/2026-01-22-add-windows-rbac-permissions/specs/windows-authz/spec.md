## ADDED Requirements

### Requirement: JWT 解析与用户身份挂载

AuthWindowsGuard MUST 解析 Bearer Token 并将用户信息挂载到 request.user。

#### Scenario: 有效 Token 解析成功

-   **WHEN** 请求头包含合法的 Bearer Token
-   **THEN** Guard 解析 Token，将用户信息（uid、number、name、status）挂载到 `request.user`，继续执行

#### Scenario: Token 无效或过期

-   **WHEN** Token 无效、过期或格式错误
-   **THEN** Guard 返回 401 Unauthorized，提示 `身份验证失败`

#### Scenario: 无 Token 但接口允许匿名

-   **WHEN** 请求无 Token 且接口通过 `ApiWindowsGuardReflector({ next: true })` 允许匿名
-   **THEN** Guard 跳过解析，继续执行

### Requirement: 用户权限查询与缓存

Guard MUST 查询用户的所有权限（菜单/按钮/接口）并缓存，避免每次请求查库。

#### Scenario: 权限缓存命中

-   **WHEN** Redis 中存在 `windows:permissions:{uid}` 缓存
-   **THEN** Guard 直接从缓存读取权限列表，挂载到 `request.permissions`

#### Scenario: 权限缓存未命中

-   **WHEN** Redis 中无权限缓存
-   **THEN** Guard 查询数据库（用户角色 → 角色-菜单/按钮/接口关联），将权限 key 列表写入缓存（TTL 5 分钟），挂载到 `request.permissions`

#### Scenario: 权限缓存写入失败

-   **WHEN** Redis 写入失败
-   **THEN** Guard 仍将权限列表挂载到 `request.permissions`，记录错误日志，不阻断请求

### Requirement: 接口权限声明与校验

Guard MUST 根据接口声明的权限 key 校验用户是否具备访问权限。

#### Scenario: 接口声明单一权限且用户具备

-   **WHEN** 接口通过装饰器声明 `@RequirePermission('system.resource:create')`，用户权限列表包含该 key
-   **THEN** Guard 允许请求继续执行

#### Scenario: 接口声明单一权限但用户不具备

-   **WHEN** 接口声明权限 key，用户权限列表不包含该 key
-   **THEN** Guard 返回 403 Forbidden，提示 `权限不足`

#### Scenario: 接口声明多个权限且用户具备其中之一

-   **WHEN** 接口声明多个权限 key（OR 逻辑），用户权限列表包含至少一个
-   **THEN** Guard 允许请求继续执行

#### Scenario: 接口声明多个权限但用户均不具备

-   **WHEN** 接口声明多个权限 key，用户权限列表均不包含
-   **THEN** Guard 返回 403 Forbidden，提示 `权限不足`

#### Scenario: 接口未声明权限

-   **WHEN** 接口未使用权限装饰器
-   **THEN** Guard 允许请求继续执行（默认开放，仅需登录）

### Requirement: 权限缓存失效与更新

当用户的角色或权限发生变更时，系统 MUST 主动清除相关用户的权限缓存。

#### Scenario: 角色授权后清除缓存

-   **WHEN** 管理员调用角色授权接口
-   **THEN** 系统清除该角色下所有用户的权限缓存

#### Scenario: 用户角色变更后清除缓存

-   **WHEN** 用户的角色关联发生变更
-   **THEN** 系统清除该用户的权限缓存

#### Scenario: 资源权限状态变更后清除缓存

-   **WHEN** 菜单/按钮/接口的 `status` 变更为 `disable`
-   **THEN** 系统清除所有相关权限缓存（可选，视实时性要求）

### Requirement: 权限校验性能与监控

Guard MUST 保证权限校验的性能，并提供监控指标。

#### Scenario: 权限校验耗时监控

-   **WHEN** Guard 执行权限校验
-   **THEN** 记录校验耗时，超过阈值（如 50ms）时记录警告日志

#### Scenario: 缓存命中率监控

-   **WHEN** Guard 查询权限缓存
-   **THEN** 记录缓存命中/未命中指标，供监控系统采集

#### Scenario: 权限校验异常监控

-   **WHEN** 权限校验过程中发生异常（如数据库连接失败）
-   **THEN** 记录错误日志，返回 500 Internal Server Error，不泄露系统信息
