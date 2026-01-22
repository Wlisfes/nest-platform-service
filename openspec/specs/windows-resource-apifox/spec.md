# windows-resource-apifox Specification

## Purpose
TBD - created by archiving change add-windows-rbac-permissions. Update Purpose after archive.
## Requirements
### Requirement: 接口资源新增

管理员 SHALL 可以为指定菜单新增接口权限，系统 MUST 校验归属资源存在性与 `path+method` 唯一性（同一资源下）。

#### Scenario: 成功新增接口权限

-   **WHEN** 管理员提交 `POST /system/resource/apifox/create`，包含合法的 `pid`（资源 keyId）、`name`、`path`、`method` 等信息
-   **THEN** 系统校验资源存在，校验 `path+method` 在该资源下唯一，写入 `tb_windows_resource_apifox`，返回成功消息

#### Scenario: 新增接口权限时 pid 不存在

-   **WHEN** 管理员提交的 `pid`（资源 keyId）不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

#### Scenario: 新增接口权限时 path+method 重复

-   **WHEN** 管理员提交的 `path` 与 `method` 组合在该资源下已存在
-   **THEN** 系统返回 400 错误，提示 `接口 xxx 已存在`

### Requirement: 接口资源编辑

管理员 SHALL 可以编辑接口资源，系统 MUST 校验接口存在、归属资源存在与 `path+method` 唯一性（排除自身）。

#### Scenario: 成功编辑接口权限

-   **WHEN** 管理员提交 `POST /system/resource/apifox/update`，包含合法的 `keyId` 与待更新字段
-   **THEN** 系统校验接口存在，校验归属资源存在，校验 `path+method` 唯一性（排除自身），更新记录并返回成功消息

#### Scenario: 编辑接口权限时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

#### Scenario: 编辑接口权限时 pid 不存在

-   **WHEN** 管理员提交的 `pid`（资源 keyId）不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

#### Scenario: 编辑接口权限时 path+method 重复

-   **WHEN** 管理员提交的 `path` 与 `method` 组合在该资源下已被其他接口使用
-   **THEN** 系统返回 400 错误，提示 `接口 xxx 已存在`

### Requirement: 接口资源详情查询

管理员 SHALL 可以查询指定接口资源的详细信息。

#### Scenario: 成功查询接口详情

-   **WHEN** 管理员提交 `POST /system/resource/apifox/resolver`，包含合法的 `keyId`
-   **THEN** 系统返回该接口资源的完整信息

#### Scenario: 查询接口时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

### Requirement: 接口资源列表查询

管理员 SHALL 可以查询指定资源下的接口权限列表。

#### Scenario: 成功查询接口列表

-   **WHEN** 管理员提交 `POST /system/resource/apifox/column`，包含 `pid`（资源 keyId）与分页条件
-   **THEN** 系统返回该资源下的接口权限列表

#### Scenario: 查询接口列表时 pid 不存在

-   **WHEN** 管理员提交的 `pid`（资源 keyId）不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

### Requirement: 接口资源状态变更

管理员 SHALL 可以批量变更接口资源的启用/禁用状态。

#### Scenario: 成功批量变更接口状态

-   **WHEN** 管理员提交 `POST /system/resource/apifox/switch`，包含 `keys`（接口 keyId 数组）与 `status`（enable/disable）
-   **THEN** 系统校验所有接口存在，批量更新 `status` 字段，返回成功消息

#### Scenario: 批量变更接口状态时部分接口不存在

-   **WHEN** 提交的 `keys` 中包含不存在的 keyId
-   **THEN** 系统返回 400 错误，提示哪些 keyId 不存在

### Requirement: 接口资源删除

管理员 SHALL 可以删除接口资源，系统 MUST 清理角色-接口关联。

#### Scenario: 成功删除接口权限

-   **WHEN** 管理员提交 `POST /system/resource/apifox/delete`，包含合法的 `keyId`
-   **THEN** 系统删除该接口权限，清理 `tb_windows_role_apifox` 中的关联记录，返回成功消息

#### Scenario: 删除接口权限时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

