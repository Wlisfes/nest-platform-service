# windows-resource-menu Specification

## Purpose
TBD - created by archiving change add-windows-rbac-permissions. Update Purpose after archive.
## Requirements
### Requirement: 菜单资源新增

管理员 SHALL 可以通过接口新增菜单资源，系统 MUST 校验必要字段唯一性并记录创建人。

#### Scenario: 成功新增菜单资源

-   **WHEN** 管理员提交 `POST /system/resource/create`，包含合法的 `key`、`name`、`router`、`pid`（可选）等信息
-   **THEN** 系统校验 `key` 与 `router` 全局唯一，校验 `pid` 存在（如提供），写入 `tb_windows_resource`，返回成功消息

#### Scenario: 新增菜单时 key 重复

-   **WHEN** 管理员提交的 `key` 已存在
-   **THEN** 系统返回 400 错误，提示 `key: xxx 已存在`

#### Scenario: 新增菜单时 router 重复

-   **WHEN** 管理员提交的 `router` 已存在
-   **THEN** 系统返回 400 错误，提示 `router: xxx 已存在`

#### Scenario: 新增菜单时 pid 不存在

-   **WHEN** 管理员提交的 `pid` 不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

### Requirement: 菜单资源编辑

管理员 SHALL 可以编辑菜单资源，系统 MUST 校验资源存在性与字段唯一性（排除自身）。

#### Scenario: 成功编辑菜单资源

-   **WHEN** 管理员提交 `POST /system/resource/update`，包含合法的 `keyId` 与待更新字段
-   **THEN** 系统校验资源存在，校验 `key` 与 `router` 唯一性（排除自身），校验 `pid` 存在（如提供），更新记录并返回成功消息

#### Scenario: 编辑菜单时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

#### Scenario: 编辑菜单时 key 重复

-   **WHEN** 管理员提交的 `key` 已被其他菜单使用
-   **THEN** 系统返回 400 错误，提示 `key: xxx 已存在`

### Requirement: 菜单资源详情查询

管理员 SHALL 可以查询指定菜单资源的详细信息。

#### Scenario: 成功查询菜单详情

-   **WHEN** 管理员提交 `POST /system/resource/resolver`，包含合法的 `keyId`
-   **THEN** 系统返回该菜单资源的完整信息

#### Scenario: 查询菜单时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

### Requirement: 菜单资源树结构查询

管理员 SHALL 可以查询所有菜单资源的树形结构。

#### Scenario: 成功查询菜单树

-   **WHEN** 管理员提交 `POST /system/resource/select`
-   **THEN** 系统返回所有菜单资源，按 `pid` 构建成树形结构

### Requirement: 菜单资源列表查询

管理员 SHALL 可以分页查询菜单资源列表（支持树形展示）。

#### Scenario: 成功查询菜单列表

-   **WHEN** 管理员提交 `POST /system/resource/column`，包含分页与过滤条件
-   **THEN** 系统返回符合条件的菜单列表，并返回树形结构数据

### Requirement: 菜单资源状态变更

管理员 SHALL 可以批量变更菜单资源的启用/禁用状态。

#### Scenario: 成功批量变更菜单状态

-   **WHEN** 管理员提交 `POST /system/resource/switch`，包含 `keys`（菜单 keyId 数组）与 `status`（enable/disable）
-   **THEN** 系统校验所有菜单存在，批量更新 `status` 字段，返回成功消息

#### Scenario: 批量变更状态时部分菜单不存在

-   **WHEN** 提交的 `keys` 中包含不存在的 keyId
-   **THEN** 系统返回 400 错误，提示哪些 keyId 不存在

### Requirement: 菜单资源删除

管理员 SHALL 可以删除菜单资源，系统 MUST 级联删除子菜单、关联按钮与关联接口。

#### Scenario: 成功删除菜单（无子菜单）

-   **WHEN** 管理员提交 `POST /system/resource/delete`，包含合法的 `keyId`，且该菜单无子菜单
-   **THEN** 系统删除该菜单，清理关联的按钮与接口权限，返回成功消息

#### Scenario: 删除菜单时存在子菜单

-   **WHEN** 管理员尝试删除存在子菜单的菜单
-   **THEN** 系统返回 400 错误，提示 `存在子菜单，不可删除`

#### Scenario: 删除菜单时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

