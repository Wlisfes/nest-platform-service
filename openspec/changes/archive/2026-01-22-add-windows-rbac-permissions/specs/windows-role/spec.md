## ADDED Requirements

### Requirement: 角色新增

管理员 SHALL 可以新增角色，系统 MUST 校验角色名称唯一性并设置默认值。

#### Scenario: 成功新增角色

-   **WHEN** 管理员提交 `POST /system/role/create`，包含合法的 `name`、`comment`（可选）、`model`（数据权限模型）
-   **THEN** 系统校验 `name` 全局唯一，设置默认 `sort` 为 0，写入 `tb_windows_role`，返回成功消息

#### Scenario: 新增角色时 name 重复

-   **WHEN** 管理员提交的 `name` 已存在
-   **THEN** 系统返回 400 错误，提示 `name: xxx 已存在`

### Requirement: 角色编辑

管理员 SHALL 可以编辑角色信息，系统 MUST 校验角色存在性与名称唯一性（排除自身）。

#### Scenario: 成功编辑角色

-   **WHEN** 管理员提交 `POST /system/role/update`，包含合法的 `keyId` 与待更新字段
-   **THEN** 系统校验角色存在，校验 `name` 唯一性（排除自身），更新记录并返回成功消息

#### Scenario: 编辑角色时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

#### Scenario: 编辑角色时 name 重复

-   **WHEN** 管理员提交的 `name` 已被其他角色使用
-   **THEN** 系统返回 400 错误，提示 `name: xxx 已存在`

### Requirement: 角色详情查询

管理员 SHALL 可以查询指定角色的详细信息。

#### Scenario: 成功查询角色详情

-   **WHEN** 管理员提交 `POST /system/role/resolver`，包含合法的 `keyId`
-   **THEN** 系统返回该角色的完整信息

#### Scenario: 查询角色时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

### Requirement: 角色列表查询

管理员 SHALL 可以分页查询角色列表。

#### Scenario: 成功查询角色列表

-   **WHEN** 管理员提交 `POST /system/role/column`，包含分页与过滤条件
-   **THEN** 系统返回符合条件的角色列表

### Requirement: 角色删除

管理员 SHALL 可以删除角色，系统 MUST 清理角色与资源/按钮/接口/账号的关联。

#### Scenario: 成功删除角色

-   **WHEN** 管理员提交 `POST /system/role/delete`，包含合法的 `keyId`
-   **THEN** 系统删除该角色，清理 `tb_windows_role_resource`、`tb_windows_role_sheet`、`tb_windows_role_apifox`、`tb_windows_role_account` 中的关联记录，返回成功消息

#### Scenario: 删除角色时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

### Requirement: 角色授权

管理员 SHALL 可以为角色分配菜单、按钮、接口权限，系统 MUST 原子性写入三张关联表。

#### Scenario: 成功授权角色

-   **WHEN** 管理员提交 `POST /system/role/grant`，包含 `roleId`、`resourceIds`、`sheetIds`、`apifoxIds`
-   **THEN** 系统校验角色存在，校验所有资源 ID 存在，使用事务先清后插三张关联表，返回成功消息

#### Scenario: 授权时 roleId 不存在

-   **WHEN** 管理员提交的 `roleId` 不存在
-   **THEN** 系统返回 400 错误，提示 `roleId 不存在`

#### Scenario: 授权时部分资源 ID 不存在

-   **WHEN** 提交的 `resourceIds`/`sheetIds`/`apifoxIds` 中包含不存在的 ID
-   **THEN** 系统返回 400 错误，提示哪些 ID 不存在

#### Scenario: 授权时事务失败

-   **WHEN** 写入关联表时发生错误
-   **THEN** 系统回滚事务，返回 500 错误，不产生部分授权

### Requirement: 角色权限查询

管理员 SHALL 可以查询角色已授权的菜单、按钮、接口权限。

#### Scenario: 成功查询角色权限

-   **WHEN** 管理员提交 `POST /system/role/permissions`，包含合法的 `roleId`
-   **THEN** 系统返回该角色已授权的菜单、按钮、接口权限列表（可按资源分组或树形展示）

#### Scenario: 查询角色权限时 roleId 不存在

-   **WHEN** 管理员提交的 `roleId` 不存在
-   **THEN** 系统返回 400 错误，提示 `roleId 不存在`
