# nest-platform-service

基于 NestJS 10 的后台权限服务仓库，当前主要承载后台管理 API、接口文档聚合和通用基础设施能力。

项目现状以源码为准，当前仓库中真正接入构建和启动的是 `web-windows-server` 与 `web-gateway-server` 两个应用。

## 项目概览

| 应用 | 说明 | 入口 | 默认端口 |
| --- | --- | --- | --- |
| `web-windows-server` | 后台管理 API 服务 | `apps/web-windows-server/src/main.ts` | `5471` |
| `web-gateway-server` | 网关与文档聚合服务 | `apps/web-gateway-server/src/main.ts` | `5000` |
| `web-common-service` | 预留目录，当前未接入 `nest-cli.json` | `apps/web-common-service/` | - |

## 核心能力

- 后台账号登录、验证码、Token 续期
- 账号、角色、部门、菜单权限管理
- 列表查询字段和搜索条件自定义配置
- Swagger 与 Knife4j 文档挂载
- MySQL 持久化、Redis 缓存、JWT 鉴权、Winston 日志

## 技术栈

- NestJS 10
- TypeScript 5
- TypeORM + MySQL
- ioredis
- JWT
- Swagger + `nest-knife4j`
- Winston + `winston-daily-rotate-file`

## 目录结构

```text
nest-platform-service/
|-- apps/
|   |-- web-gateway-server/
|   |-- web-windows-server/
|   `-- web-common-service/
|-- docs/
|-- env/
|   |-- .env.example
|   `-- .env.development
|-- openspec/
|-- src/
|   |-- decorator/
|   |-- filters/
|   |-- guard/
|   |-- interceptor/
|   |-- interface/
|   |-- middleware/
|   |-- modules/
|   |   |-- common/
|   |   |-- config/
|   |   |-- database/
|   |   |-- jwt/
|   |   |-- logger/
|   |   `-- redis/
|   |-- swagger/
|   `-- utils/
|-- nest-cli.json
|-- package.json
`-- tsconfig.json
```

## 环境要求

- Node.js 18+
- Yarn 1.x
- MySQL 8+
- Redis 6+

## 环境配置

项目通过 `@nestjs/config` 按 `NODE_ENV` 加载环境文件：

```text
env/.env.${NODE_ENV}
```

本地开发建议使用 `env/.env.development`。

1. 复制示例文件

```powershell
Copy-Item env/.env.example env/.env.development
```

2. 按本地环境修改数据库、Redis、JWT 和端口配置

### 关键环境变量

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `NODE_ENV` | 运行环境 | `development` |
| `NODE_WEB_GATEWAY_PORT` | 网关端口 | `5000` |
| `NODE_WEB_WINDOWS_PORT` | 后台 API 端口 | `5471` |
| `NODE_WEB_CLIENT_PORT` | 预留客户端 API 端口 | `5481` |
| `NODE_JWT_SECRET` | JWT 密钥 | `your-secret` |
| `NODE_JWT_EXPIRES` | JWT 过期秒数 | `7200` |
| `NODE_ORM_MYSQL_HOST` | MySQL 主机 | `localhost` |
| `NODE_ORM_MYSQL_PORT` | MySQL 端口 | `3306` |
| `NODE_ORM_MYSQL_USERNAME` | MySQL 用户名 | `root` |
| `NODE_ORM_MYSQL_PASSWORD` | MySQL 密码 | `123456` |
| `NODE_ORM_MYSQL_DATABASE` | MySQL 数据库名 | `root` |
| `NODE_ORM_MYSQL_CHARSET` | MySQL 字符集 | `utf8mb4` |
| `NODE_REDIS_HOST` | Redis 主机 | `localhost` |
| `NODE_REDIS_PORT` | Redis 端口 | `6379` |
| `NODE_REDIS_PASSWORD` | Redis 密码 | `123456` |
| `NODE_REDIS_DB` | Redis DB 编号 | `3` |

### 配置注意事项

- `src/modules/config/config.module.ts` 会读取 `env/.env.${NODE_ENV}`，因此本地直接跑开发模式时要确保 `NODE_ENV=development`。
- `src/modules/database/database.module.ts` 在 `development` 环境下开启了 TypeORM `synchronize`。
- 当前 Redis 模块读取的是 `REDIS_DB`，而示例环境文件使用的是 `NODE_REDIS_DB`。如果启动时报 Redis DB 未配置，请在环境文件中额外补一行 `REDIS_DB=3`，或统一调整代码与环境变量名称。

## 安装依赖

仓库当前使用 `yarn.lock`，推荐使用 Yarn：

```bash
yarn install --ignore-scripts
```

## 本地启动

### 1. 启动后台 API 服务

```bash
yarn dev:web-windows-server
```

启动后可访问：

- 后台 API: `http://localhost:5471/api/windows`
- Swagger: `http://localhost:5471/api/swagger`

### 2. 启动网关与聚合文档服务

```bash
yarn dev:web-gateway-server
```

启动后可访问：

- 网关首页: `http://localhost:5000/`
- Knife4j 聚合文档: `http://localhost:5000/doc.html`

如果需要通过网关访问后台接口，请先确保 `web-windows-server` 已启动。

## 构建与运行

```bash
# 构建后台 API
yarn build:web-windows-server

# 运行后台 API
yarn start:web-windows-server

# 构建网关
yarn build:web-gateway-server

# 运行网关
yarn start:web-gateway-server
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `yarn dev` | 等同于 `yarn dev:web-gateway-server` |
| `yarn dev:web-gateway-server` | 启动网关开发模式 |
| `yarn build:web-gateway-server` | 构建网关 |
| `yarn start:web-gateway-server` | 运行网关生产构建 |
| `yarn dev:web-windows-server` | 启动后台 API 开发模式 |
| `yarn build:web-windows-server` | 构建后台 API |
| `yarn start:web-windows-server` | 运行后台 API 生产构建 |

## 主要业务模块

### `web-windows-server`

- `auth`: 验证码、登录、续签、当前用户信息、权限资源
- `chunk`: 通用下拉字典、列表列配置、搜索栏配置
- `system/account`: 账号管理
- `system/role`: 角色管理与角色关联账号/菜单
- `system/dept`: 部门组织管理
- `system/sheet`: 菜单与按钮权限管理

### 共享基础模块

- `src/modules/config`: 环境配置加载
- `src/modules/database`: TypeORM、实体与仓储聚合
- `src/modules/redis`: Redis 连接与缓存封装
- `src/modules/jwt`: JWT 签发与解析
- `src/modules/logger`: Winston 日志与按日切分
- `src/modules/common`: 当前主要提供验证码能力

## 数据模型

当前后台服务主要使用以下表：

- `tb_windows_account`
- `tb_windows_chunk`
- `tb_windows_dept`
- `tb_windows_kines`
- `tb_windows_role`
- `tb_windows_sheet`

实体定义位于 `src/modules/database/schema/windows/`。

## 接口约定

- 后台 API 全局前缀为 `/api/windows`
- 受保护接口通过 `authorization: Bearer <token>` 传递令牌
- 成功响应会被统一包装为：

```json
{
  "data": {},
  "code": 200,
  "message": "success",
  "timestamp": "2026-03-15 12:00:00"
}
```

- 异常响应由全局过滤器统一处理，当前实现会返回 HTTP 200，并把业务状态码放在响应体 `code` 字段中

## 日志与文档

- 运行日志写入 `logs/`
- Swagger 挂载在后台服务 `/api/swagger`
- 网关通过 Knife4j 聚合下游服务文档
- 项目补充文档见：
  - `docs/项目基础文档.md`
  - `docs/通用工具相关文档.md`
  - `openspec/project.md`

## 当前状态说明

- `web-gateway-server` 当前配置了 `/api/windows` 和 `/api/client` 两个下游代理，但仓库内只实际包含 `web-windows-server`
- `apps/web-common-service` 目前是预留目录，尚未接入构建
- 仓库已经配置 Jest，但当前未发现已提交的 `*.spec.ts` 测试文件

## 开发建议

- 新增功能前优先确认是否已有共享能力可以复用，尤其是 `src/modules/database`、`src/modules/redis` 与 `src/decorator`
- 新接口尽量复用现有装饰器体系，保持 Swagger、限流和鉴权行为一致
- 如果涉及能力新增、架构调整或 breaking change，请先查看 `openspec/AGENTS.md`
