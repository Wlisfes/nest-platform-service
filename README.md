# nest-platform-service

基于 **NestJS 10** 的后台权限服务平台，采用 Monorepo 架构，承载后台管理 API、API 网关与文档聚合等核心能力。

## 项目概览

| 应用 | 说明 | 入口 | 默认端口 |
| --- | --- | --- | --- |
| `web-windows-server` | 后台管理 API 服务 | `apps/web-windows-server/src/main.ts` | `5471` |
| `web-gateway-server` | 网关与文档聚合服务 | `apps/web-gateway-server/src/main.ts` | `5000` |
| `web-common-service` | 预留目录，当前未接入 | `apps/web-common-service/` | — |

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | NestJS 10、TypeScript 5 |
| ORM / 数据库 | TypeORM 0.3 + MySQL 8 |
| 缓存 | ioredis + Redis 6 |
| 认证 | JWT（`@nestjs/jwt`） |
| 文档 | Swagger + `nest-knife4j` |
| 日志 | Winston + `winston-daily-rotate-file` |
| 构建 | Webpack（通过 nest-cli） |
| 包管理 | Yarn 1.x |

## 目录结构

```text
nest-platform-service/
├── apps/
│   ├── web-gateway-server/        # 网关与文档聚合
│   ├── web-windows-server/        # 后台管理 API
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       └── modules/
│   │           ├── auth/          # 登录、验证码、Token 续签
│   │           ├── chunk/         # 通用字典、列表列/搜索栏配置
│   │           └── system/        # 账号、角色、部门、菜单管理
│   │               ├── account/
│   │               ├── role/
│   │               ├── dept/
│   │               └── sheet/
│   └── web-common-service/        # 预留
├── src/                            # 共享基础设施
│   ├── decorator/                  # 自定义装饰器
│   ├── filters/                    # 全局异常过滤器
│   ├── guard/                      # 鉴权守卫
│   ├── interceptor/                # 响应拦截器
│   ├── middleware/                  # 中间件
│   ├── modules/
│   │   ├── config/                 # 环境配置加载
│   │   ├── database/               # TypeORM 与实体管理
│   │   ├── redis/                  # Redis 缓存封装
│   │   ├── jwt/                    # JWT 签发与解析
│   │   ├── logger/                 # Winston 日志
│   │   └── common/                 # 验证码等通用能力
│   ├── swagger/                    # Swagger 配置
│   └── utils/                      # 工具函数
├── env/                            # 环境变量文件
├── docs/                           # 补充文档
├── openspec/                       # OpenSpec 规范
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## 核心能力

### 业务功能

- 后台账号登录、图形验证码、Token 自动续期
- 账号 / 角色 / 部门 / 菜单权限 CRUD 管理
- 角色关联账号与菜单的多对多绑定
- 列表查询字段、搜索条件自定义配置（Chunk）

### 基础设施

| 层 | 模块 | 说明 |
| --- | --- | --- |
| 守卫 | `AuthWindowsGuard` | 后台 JWT 鉴权守卫 |
| 守卫 | `AuthClientGuard` | 客户端鉴权守卫（预留） |
| 守卫 | `AuthThrottlerGuard` | 限流守卫 |
| 拦截器 | `TransformInterceptor` | 统一响应包装 `{ data, code, message, timestamp }` |
| 过滤器 | `HttpExceptionFilter` | 全局异常捕获与格式化 |
| 中间件 | `LoggerMiddleware` | 请求日志记录 |
| 中间件 | `UserAgentMiddleware` | UA 解析注入 |
| 装饰器 | `IsCustomize` / `IsDateCustomize` | 自定义参数校验 |
| 装饰器 | `request.decorator` | 请求上下文参数提取 |
| 装饰器 | `apifox.decorator` | Apifox/Swagger 元数据 |
| 工具 | `fetchIntNumber` | 雪花 ID / 随机数生成 |
| 工具 | `fetchIPClient` | 客户端 IP 获取 |
| 工具 | `fetchGlobalEnv` | 环境变量读取 |
| 工具 | `gateway` | 网关代理中间件配置 |
| 工具 | `tree` | 树形数据转换 |

## 数据模型

实体定义位于 `src/modules/database/schema/windows/`：

| 实体 | 说明 |
| --- | --- |
| `tb_windows_account` | 后台账号 |
| `tb_windows_role` | 角色 |
| `tb_windows_dept` | 部门组织 |
| `tb_windows_sheet` | 菜单与按钮权限 |
| `tb_windows_chunk` | 通用字典配置 |
| `tb_windows_kines` | 关联关系 |

> 开发环境下 TypeORM `synchronize` 自动开启，生产环境请务必关闭。

## 环境要求

- Node.js ≥ 18
- Yarn 1.x
- MySQL ≥ 8
- Redis ≥ 6

## 环境配置

项目通过 `@nestjs/config` 按 `NODE_ENV` 加载对应环境文件：

```text
env/.env.${NODE_ENV}
```

### 快速开始

```powershell
# 1. 复制示例配置
Copy-Item env/.env.example env/.env.development

# 2. 按本地环境修改配置
notepad env/.env.development
```

### 环境变量说明

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `NODE_WEB_GATEWAY_PORT` | 网关端口 | `5000` |
| `NODE_WEB_WINDOWS_PORT` | 后台 API 端口 | `5100` |
| `NODE_WEB_CLIENT_PORT` | 客户端 API 端口（预留） | `5200` |
| `NODE_JWT_SECRET` | JWT 密钥 | `JT6zZpdFknLS8fKt` |
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

## 安装依赖

```bash
yarn install --ignore-scripts
```

## 本地启动

### 启动后台 API 服务

```bash
yarn dev:web-windows-server
```

启动后可访问：

- 后台 API：`http://localhost:5471/api/windows`
- Swagger 文档：`http://localhost:5471/api/swagger`

### 启动网关与聚合文档服务

```bash
yarn dev:web-gateway-server
```

启动后可访问：

- 网关首页：`http://localhost:5000/`
- Knife4j 聚合文档：`http://localhost:5000/doc.html`

> 如需通过网关访问后台接口，请先确保 `web-windows-server` 已启动。

## 构建与生产运行

```bash
# 构建后台 API
yarn build:web-windows-server

# 运行后台 API（生产）
yarn start:web-windows-server

# 构建网关
yarn build:web-gateway-server

# 运行网关（生产）
yarn start:web-gateway-server
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `yarn dev` | 等同于 `yarn dev:web-gateway-server` |
| `yarn dev:web-gateway-server` | 启动网关开发模式 |
| `yarn dev:web-windows-server` | 启动后台 API 开发模式 |
| `yarn build:web-gateway-server` | 构建网关 |
| `yarn build:web-windows-server` | 构建后台 API |
| `yarn start:web-gateway-server` | 运行网关生产构建 |
| `yarn start:web-windows-server` | 运行后台 API 生产构建 |

## 接口约定

- 全局路由前缀：`/api/windows`
- 鉴权方式：`Authorization: Bearer <token>`
- 统一成功响应格式：

```json
{
  "data": {},
  "code": 200,
  "message": "success",
  "timestamp": "2026-04-04 20:00:00"
}
```

- 异常响应由 `HttpExceptionFilter` 统一处理，返回 HTTP 200 并将业务状态码放在响应体 `code` 字段中

## 日志与文档

- 运行日志输出至 `logs/` 目录，按日自动切分
- Swagger 挂载于后台服务 `/api/swagger`
- 网关通过 Knife4j 聚合下游服务文档
- 补充文档：
  - `docs/项目基础文档.md`
  - `docs/通用工具相关文档.md`
  - `openspec/project.md`

## 开发建议

1. 新增功能前优先检查 `src/modules/database`、`src/modules/redis`、`src/decorator` 是否已有可复用能力
2. 新接口复用现有装饰器体系，保持 Swagger 注解、限流和鉴权行为一致
3. 涉及能力新增、架构调整或 Breaking Change 请先查阅 `openspec/AGENTS.md`
4. 生产环境务必关闭 TypeORM `synchronize`，使用 Migration 管理表结构变更

## 当前状态

- `web-gateway-server` 配置了 `/api/windows` 和 `/api/client` 两个下游代理，但仓库内仅包含 `web-windows-server`
- `apps/web-common-service` 为预留目录，尚未接入构建
- Jest 已配置但暂无已提交的 `*.spec.ts` 测试文件
