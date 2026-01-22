# windows-dept Specification

## Purpose
TBD - created by archiving change add-windows-rbac-permissions. Update Purpose after archive.
## Requirements
### Requirement: 部门新增

管理员 SHALL 可以新增部门，系统 MUST 校验部门名称唯一性（同级）与上级部门存在性。

#### Scenario: 成功新增部门

-   **WHEN** 管理员提交 `POST /system/dept/create`，包含合法的 `name`、`alias`（可选）、`pid`（可选）
-   **THEN** 系统校验 `name` 在同级唯一，校验 `pid` 存在（如提供），写入 `tb_windows_dept`，返回成功消息

#### Scenario: 新增部门时 name 重复

-   **WHEN** 管理员提交的 `name` 在同级已存在
-   **THEN** 系统返回 400 错误，提示 `name: xxx 已存在`

#### Scenario: 新增部门时 pid 不存在

-   **WHEN** 管理员提交的 `pid` 不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

### Requirement: 部门编辑

管理员 SHALL 可以编辑部门信息，系统 MUST 校验部门存在性、名称唯一性（同级，排除自身）与上级部门存在性。

#### Scenario: 成功编辑部门

-   **WHEN** 管理员提交 `POST /system/dept/update`，包含合法的 `keyId` 与待更新字段
-   **THEN** 系统校验部门存在，校验 `name` 在同级唯一（排除自身），校验 `pid` 存在（如提供），更新记录并返回成功消息

#### Scenario: 编辑部门时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

#### Scenario: 编辑部门时 name 重复

-   **WHEN** 管理员提交的 `name` 在同级已被其他部门使用
-   **THEN** 系统返回 400 错误，提示 `name: xxx 已存在`

#### Scenario: 编辑部门时 pid 不存在

-   **WHEN** 管理员提交的 `pid` 不存在
-   **THEN** 系统返回 400 错误，提示 `pid 不存在`

#### Scenario: 编辑部门时形成循环引用

-   **WHEN** 管理员提交的 `pid` 指向该部门自身或其子部门
-   **THEN** 系统返回 400 错误，提示 `不能将部门设置为自己的子部门`

### Requirement: 部门详情查询

管理员 SHALL 可以查询指定部门的详细信息。

#### Scenario: 成功查询部门详情

-   **WHEN** 管理员提交 `POST /system/dept/resolver`，包含合法的 `keyId`
-   **THEN** 系统返回该部门的完整信息

#### Scenario: 查询部门时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

### Requirement: 部门树结构查询

管理员 SHALL 可以查询所有部门的树形结构。

#### Scenario: 成功查询部门树

-   **WHEN** 管理员提交 `POST /system/dept/select`
-   **THEN** 系统返回所有部门，按 `pid` 构建成树形结构

### Requirement: 部门列表查询

管理员 SHALL 可以分页查询部门列表（支持树形展示）。

#### Scenario: 成功查询部门列表

-   **WHEN** 管理员提交 `POST /system/dept/column`，包含分页与过滤条件
-   **THEN** 系统返回符合条件的部门列表，并返回树形结构数据

### Requirement: 部门删除

管理员 SHALL 可以删除部门，系统 MUST 级联删除子部门并清理部门-账号关联。

#### Scenario: 成功删除部门（无子部门）

-   **WHEN** 管理员提交 `POST /system/dept/delete`，包含合法的 `keyId`，且该部门无子部门
-   **THEN** 系统删除该部门，清理 `tb_windows_dept_account` 中的关联记录，返回成功消息

#### Scenario: 删除部门时存在子部门

-   **WHEN** 管理员尝试删除存在子部门的部门
-   **THEN** 系统返回 400 错误，提示 `存在子部门，不可删除`

#### Scenario: 删除部门时 keyId 不存在

-   **WHEN** 管理员提交的 `keyId` 不存在
-   **THEN** 系统返回 400 错误，提示 `keyId 不存在`

