## ADDED Requirements

### Requirement: 按钮资源新增

管理员 SHALL 可以为指定菜单新增操作按钮，系统 MUST 校验归属菜单存在性与按钮 key 唯一性（同一菜单下）。

#### Scenario: 成功新增按钮

-   **WHEN** 管理员提交 `POST /system/resource/sheet/create`，包含合法的 `pid`（菜单 keyId）、`key`、`name` 等信息
-   **THEN** 系统校验菜单存在，校验 `key` 在该菜单下唯一，写入 `tb_windows_resource_sheet`，返回成功消息

#### Scenario: 新增按钮时 pid 不存在

-   **WHEN** 管理员提交的 `pid`（菜单 keyId）不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

#### Scenario: 新增按钮时 key 重复

-   **WHEN** 管理员提交的 `key` 在该菜单下已存在
-   **THEN** 系统返回 400 错误，提示 `key: xxx 已存在`

### Requirement: 按钮资源编辑

管理员 SHALL 可以编辑按钮资源，系统 MUST 校验按钮存在、归属菜单存在与 key 唯一性（排除自身）。

#### Scenario: 成功编辑按钮

-   **WHEN** 管理员提交 `POST /system/resource/sheet/update`，包含合法的 `keyId` 与待更新字段
-   **THEN** 系统校验按钮存在，校验归属菜单存在，校验 `key` 唯一性（排除自身），更新记录并返回成功消息

#### Scenario: 编辑按钮时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

#### Scenario: 编辑按钮时 pid 不存在

-   **WHEN** 管理员提交的 `pid`（菜单 keyId）不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

#### Scenario: 编辑按钮时 key 重复

-   **WHEN** 管理员提交的 `key` 在该菜单下已被其他按钮使用
-   **THEN** 系统返回 400 错误，提示 `key: xxx 已存在`

### Requirement: 按钮资源详情查询

管理员 SHALL 可以查询指定按钮资源的详细信息。

#### Scenario: 成功查询按钮详情

-   **WHEN** 管理员提交 `POST /system/resource/sheet/resolver`，包含合法的 `keyId`
-   **THEN** 系统返回该按钮资源的完整信息

#### Scenario: 查询按钮时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

### Requirement: 按钮资源列表查询

管理员 SHALL 可以查询指定菜单下的按钮列表。

#### Scenario: 成功查询按钮列表

-   **WHEN** 管理员提交 `POST /system/resource/sheet/column`，包含 `pid`（菜单 keyId）与分页条件
-   **THEN** 系统返回该菜单下的按钮列表

#### Scenario: 查询按钮列表时 pid 不存在

-   **WHEN** 管理员提交的 `pid`（菜单 keyId）不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

### Requirement: 按钮资源状态变更

管理员 SHALL 可以批量变更按钮资源的启用/禁用状态。

#### Scenario: 成功批量变更按钮状态

-   **WHEN** 管理员提交 `POST /system/resource/sheet/switch`，包含 `keys`（按钮 keyId 数组）与 `status`（enable/disable）
-   **THEN** 系统校验所有按钮存在，批量更新 `status` 字段，返回成功消息

#### Scenario: 批量变更按钮状态时部分按钮不存在

-   **WHEN** 提交的 `keys` 中包含不存在的 keyId
-   **THEN** 系统返回 400 错误，提示哪些 keyId 不存在

### Requirement: 按钮资源删除

管理员 SHALL 可以删除按钮资源，系统 MUST 清理角色-按钮关联。

#### Scenario: 成功删除按钮

-   **WHEN** 管理员提交 `POST /system/resource/sheet/delete`，包含合法的 `keyId`
-   **THEN** 系统删除该按钮，清理 `tb_windows_role_sheet` 中的关联记录，返回成功消息

#### Scenario: 删除按钮时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`
