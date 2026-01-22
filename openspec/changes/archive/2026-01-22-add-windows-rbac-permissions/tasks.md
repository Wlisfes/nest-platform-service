## 1. 数据库补齐与迁移

-   [x] 1.1 新增 `tb_windows_role_sheet` 表（角色-按钮关联）
    -   字段：`id`（自增主键）、`roleId`、`sheetId`、`createBy`、`createTime`、`modifyBy`、`modifyTime`
    -   索引：`(roleId, sheetId)` 唯一索引
-   [x] 1.2 新增 `tb_windows_role_apifox` 表（角色-接口关联）
    -   字段：`id`（自增主键）、`roleId`、`apifoxId`、`createBy`、`createTime`、`modifyBy`、`modifyTime`
    -   索引：`(roleId, apifoxId)` 唯一索引
-   [x] 1.3 编写 TypeORM Entity 定义并注册到 `WindowsService`
-   [ ] 1.4 编写迁移脚本（可选，视项目是否已有迁移机制）

## 2. 资源管理接口（菜单）

-   [x] 2.1 完善 `ResourceService.httpBaseSystemSwitchResource`（菜单状态变更）
    -   支持批量变更 `status`（enable/disable）
    -   支持事务，确保状态一致性
-   [x] 2.2 完善 `ResourceService.httpBaseSystemDeleteResource`（菜单删除）
    -   支持级联删除子菜单、关联按钮、关联接口
    -   支持软删除或硬删除（根据决策）
-   [x] 2.3 完善 `ResourceController` 对应路由与文档
-   [ ] 2.4 编写单元测试覆盖新增/编辑/状态变更/删除场景

## 3. 资源管理接口（按钮）

-   [x] 3.1 实现 `ResourceService.httpBaseSystemCreateSheet`（新增按钮）
    -   校验归属菜单 `pid` 存在
    -   校验 `key` 唯一性（同一菜单下）
-   [x] 3.2 实现 `ResourceService.httpBaseSystemUpdateSheet`（编辑按钮）
    -   校验按钮存在、归属菜单存在
    -   校验 `key` 唯一性（排除自身）
-   [x] 3.3 实现 `ResourceService.httpBaseSystemResolverSheet`（按钮详情）
-   [x] 3.4 实现 `ResourceService.httpBaseSystemColumnSheet`（按钮列表，按菜单过滤）
-   [x] 3.5 实现 `ResourceService.httpBaseSystemSwitchSheet`（按钮状态变更）
    -   批量变更 `status`（enable/disable）
-   [x] 3.6 实现 `ResourceService.httpBaseSystemDeleteSheet`（按钮删除）
    -   清理角色-按钮关联
-   [x] 3.7 在 `ResourceController` 添加对应路由与 Swagger 文档
-   [ ] 3.8 编写单元测试

## 4. 资源管理接口（接口权限）

-   [x] 4.1 实现 `ResourceService.httpBaseSystemCreateApifox`（新增接口权限）
    -   校验归属资源 `pid` 存在
    -   校验 `path+method` 唯一性（同一资源下）
-   [x] 4.2 实现 `ResourceService.httpBaseSystemUpdateApifox`（编辑接口权限）
-   [x] 4.3 实现 `ResourceService.httpBaseSystemResolverApifox`（接口权限详情）
-   [x] 4.4 实现 `ResourceService.httpBaseSystemColumnApifox`（接口权限列表，按资源过滤）
-   [x] 4.5 实现 `ResourceService.httpBaseSystemSwitchApifox`（接口状态变更）
-   [x] 4.6 实现 `ResourceService.httpBaseSystemDeleteApifox`（接口删除）
    -   清理角色-接口关联
-   [x] 4.7 在 `ResourceController` 添加对应路由与 Swagger 文档
-   [ ] 4.8 编写单元测试

## 5. 角色管理接口

-   [x] 5.1 实现 `RoleService.httpBaseSystemCreateRole`（新增角色）
    -   校验 `name` 唯一性
    -   默认排序为 0，默认数据权限模型为 `self`
-   [x] 5.2 实现 `RoleService.httpBaseSystemUpdateRole`（编辑角色）
    -   校验角色存在、`name` 唯一性（排除自身）
-   [x] 5.3 实现 `RoleService.httpBaseSystemResolverRole`（角色详情）
-   [x] 5.4 实现 `RoleService.httpBaseSystemColumnRole`（角色列表）
-   [x] 5.5 实现 `RoleService.httpBaseSystemDeleteRole`（角色删除）
    -   清理角色-菜单/按钮/接口关联
    -   清理角色-账号关联（如存在）
-   [x] 5.6 实现 `RoleService.httpBaseSystemGrantRole`（角色授权）
    -   入参：`roleId`、`resourceIds`、`sheetIds`、`apifoxIds`
    -   事务写入三张关联表，先清后插
-   [x] 5.7 实现 `RoleService.httpBaseSystemRolePermissions`（查询角色已授权权限）
    -   返回菜单/按钮/接口的树或列表结构
-   [x] 5.8 在 `RoleController` 添加对应路由与 Swagger 文档
-   [ ] 5.9 编写单元测试

## 6. 部门管理接口

-   [x] 6.1 实现 `DeptService.httpBaseSystemCreateDept`（新增部门）
    -   校验 `name` 唯一性（同级）
    -   校验 `pid` 存在（如提供）
-   [x] 6.2 实现 `DeptService.httpBaseSystemUpdateDept`（编辑部门）
-   [x] 6.3 实现 `DeptService.httpBaseSystemResolverDept`（部门详情）
-   [x] 6.4 实现 `DeptService.httpBaseSystemSelectDept`（部门树）
-   [x] 6.5 实现 `DeptService.httpBaseSystemColumnDept`（部门列表）
-   [x] 6.6 实现 `DeptService.httpBaseSystemDeleteDept`（部门删除）
    -   级联删除子部门
    -   清理部门-账号关联（如存在）
-   [x] 6.7 在 `DeptController` 添加对应路由与 Swagger 文档
-   [ ] 6.8 编写单元测试

## 7. RBAC 授权机制

-   [x] 7.1 扩展 `AuthWindowsGuard`：在 JWT 解析后查询用户角色与权限
    -   从 `request.user.uid` 查询关联角色
    -   从角色关联表查询菜单/按钮/接口权限 key
    -   将权限列表挂载到 `request.permissions`
-   [x] 7.2 实现权限拦截逻辑
    -   通过反射器或路由约定获取接口所需权限 key（例如 `resource.key` 或 `resource_apifox.path+method`）
    -   检查 `request.permissions` 是否包含所需权限
    -   未授权则抛出 `HttpStatus.FORBIDDEN`
-   [x] 7.3 引入 Redis 缓存用户权限
    -   缓存键：`windows:permissions:{uid}`
    -   TTL：建议 5-10 分钟
    -   在角色授权/权限变更时主动清除缓存
-   [ ] 7.4 编写 `AuthWindowsGuard` 单元测试与集成测试
-   [x] 7.5 为受控接口添加权限声明装饰器或元数据（如需要）

## 8. 验证与文档

-   [ ] 8.1 编写 E2E 测试覆盖完整 RBAC 流程
    -   创建角色、授权菜单/按钮/接口、创建账号并分配角色、验证权限生效
-   [ ] 8.2 编写权限体系使用文档（接口说明、权限 key 规则、缓存策略）
-   [ ] 8.3 运行 `openspec validate --strict --no-interactive` 并修复所有问题
-   [ ] 8.4 代码审查与性能测试（权限校验对接口响应时间的影响）
