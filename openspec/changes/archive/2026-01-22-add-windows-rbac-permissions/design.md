## Context

web-windows-server 项目已具备基础认证（JWT）与数据库表结构（菜单/按钮/接口/角色/部门），但缺少完整的 RBAC 授权体系与对应的管理接口。当前 `AuthWindowsGuard` 仅做 JWT 解析，无权限校验；资源、角色、部门的 controller/service 多数为空或未完成。本次变更需补齐：

-   资源（菜单/按钮/接口）的完整 CRUD 与状态管理
-   角色与部门的 CRUD 与授权机制
-   RBAC 校验机制（从 JWT → 角色 → 权限 → 拦截）
-   必要的数据库表补齐与缓存策略

## Goals / Non-Goals

-   **Goals**:
    -   提供完整的 RBAC 权限管控能力
    -   所有受控接口受权限校验保护
    -   权限查询性能满足线上要求（缓存优化）
    -   接口设计统一、文档完整、可测试
-   **Non-Goals**:
    -   多租户权限隔离
    -   数据权限（行级）过滤（已有 `role.model` 字段但本次不实现）
    -   权限模板或继承机制（本次采用独立勾选）

## Decisions

### 1. 数据库表设计

-   **新增关联表**：
    -   `tb_windows_role_sheet`（角色-按钮关联）
    -   `tb_windows_role_apifox`（角色-接口关联）
-   **字段设计**：
    -   每张关联表包含 `id`（自增主键）、`roleId`、`resourceId`（`sheetId`/`apifoxId`）、`createBy`、`createTime`、`modifyBy`、`modifyTime`
    -   唯一索引 `(roleId, resourceId)` 保证同一角色下资源不重复
-   **删除策略**：
    -   菜单/按钮/接口采用硬删除，删除时需清理关联表
    -   角色删除时需清理三张关联表与账号关联表

### 2. 权限模型

-   **RBAC 模型**：用户 → 角色 → 权限（菜单/按钮/接口）
-   **授权方式**：角色授权时分别勾选菜单、按钮、接口，写入三张关联表
-   **权限 key**：
    -   菜单：`resource.key`
    -   按钮：`resource_sheet.key`
    -   接口：`resource_apifox.path + ':' + method`（如 `/system/resource:create`）

### 3. 授权校验执行点

-   **统一在 `AuthWindowsGuard` 完成**：
    -   JWT 解析后查询用户角色与权限
    -   通过反射器或路由约定获取接口所需权限 key
    -   检查 `request.permissions` 是否包含所需权限，未授权则抛出 `HttpStatus.FORBIDDEN`
-   **权限声明方式**：
    -   方案 A（推荐）：在 controller 方法上使用 `@RequirePermission('resource.key')` 装饰器声明所需权限
    -   方案 B：通过路由自动推断（例如 `POST /system/resource` 对应 `system/resource:create`）
    -   本次采用方案 A，便于显式控制与文档生成

### 4. 缓存策略

-   **缓存用户权限**：
    -   缓存键：`windows:permissions:{uid}`
    -   TTL：5 分钟
    -   内容：用户拥有权限的 key 列表（数组）
-   **缓存失效**：
    -   角色授权/权限变更时，主动清除该角色下所有用户的权限缓存
    -   用户角色变更时，清除该用户权限缓存
-   **缓存查询流程**：
    1. 先查 Redis，命中则直接返回
    2. 未命中则查库（三表联查），写入缓存并返回

### 5. 接口设计约定

-   **路由风格**：
    -   菜单：`system/resource/*`
    -   按钮：`system/resource/sheet/*`
    -   接口：`system/resource/apifox/*`
    -   角色：`system/role/*`
    -   部门：`system/dept/*`
-   **请求方法**：
    -   新增：`POST /create`
    -   编辑：`POST /update`
    -   详情：`POST /resolver`
    -   列表：`POST /column`
    -   树结构：`POST /select`
    -   状态变更：`POST /switch`
    -   删除：`POST /delete`
-   **统一响应格式**：沿用现有 `fetchResolver` 包装格式

### 6. 事务与一致性

-   **角色授权**：使用事务确保三张关联表原子性写入（先清后插）
-   **删除级联**：在 service 层手动清理关联表，避免外键约束导致的级联删除不可控
-   **状态变更**：批量状态变更使用事务，保证部分失败时整体回滚

## Risks / Trade-offs

-   **风险**：RBAC 校验逻辑复杂，可能影响接口性能  
    **缓解**：引入 Redis 缓存用户权限，设置合理 TTL；在 Guard 中做批量权限查询；避免 N+1 查询
-   **风险**：角色授权接口并发写入可能导致数据不一致  
    **缓解**：使用数据库事务，确保三张关联表原子性写入；加唯一索引防止重复
-   **风险**：菜单/按钮/接口的删除级联逻辑复杂  
    **缓解**：明确删除策略（硬删除），并在 service 层做级联清理；提供删除前的依赖检查接口
-   **权衡**：权限声明装饰器 vs 路由自动推断  
    **决策**：采用装饰器显式声明，便于文档生成与权限审计，后续可扩展为自动推断

## Migration Plan

1. **数据库变更**：
    - 新增 `tb_windows_role_sheet` 与 `tb_windows_role_apifox` 表
    - 添加必要索引与外键约束
    - 编写 TypeORM Entity 并注册到 `WindowsService`
2. **代码实现**：
    - 按模块实现资源/角色/部门的 CRUD 与授权接口
    - 扩展 `AuthWindowsGuard` 实现 RBAC 校验
    - 引入 Redis 缓存层
3. **测试与验证**：
    - 单元测试覆盖所有 service 方法
    - 集成测试覆盖 RBAC 校验流程
    - E2E 测试覆盖完整权限管理流程
4. **上线与监控**：
    - 灰度发布，监控权限校验性能
    - 监控缓存命中率与接口响应时间
    - 提供权限管理操作日志

## Open Questions

-   是否需要权限审计日志（记录谁在何时授权/撤销了哪些权限）？
-   是否需要权限模板或批量授权功能？
-   是否需要权限继承（角色继承、菜单继承按钮/API）？
-   是否需要权限导出/导入功能？
