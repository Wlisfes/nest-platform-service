import { Injectable } from '@nestjs/common'
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Logger } from '@/modules/logger/logger.service'
import { Omix, OmixRequest } from '@/interface/global.resolver'
import * as schema from '@/modules/database/database.schema'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

export interface BaseConnectOption {
    /**请求实例**/
    request: OmixRequest
    /**开启日志**/
    logger?: boolean
    /**输出日志方法名**/
    deplayName?: string
}

/**通用查询配置**/
export interface BaseCommonConnectOption<T> extends BaseConnectOption {
    /**异常提示文案**/
    message: string
    /**findOne查询入参**/
    dispatch?: Omix<Parameters<Repository<T>['findOne']>['0']>
    /**异常状态码**/
    code?: number
    /**额外异常数据**/
    cause?: Omix
    /**自定义转换验证**/
    transform?: (data: T) => boolean | Promise<boolean>
}

/**删除数据模型**/
export interface BaseConnectDelete<T> extends BaseConnectOption {
    /**删除条件**/
    where: Parameters<Repository<T>['delete']>['0']
}

/**新增AND更新数据模型**/
export interface BaseConnecUpsert<T, K extends keyof T> extends BaseConnectOption {
    /**条件**/
    where: Array<K>
    /**更新数据**/
    body: Parameters<Repository<T>['upsert']>['0']
}

/**更新数据模型**/
export interface BaseConnectUpdate<T> extends BaseConnectOption {
    /**更新条件**/
    where: Parameters<Repository<T>['update']>['0']
    /**更新数据**/
    body: Parameters<Repository<T>['update']>['1']
}

/**批量更新数据模型：需要主键ID**/
export interface BaseConnectUpsert<T> extends BaseConnectOption {
    /**更新数据**/
    body: Array<Parameters<Repository<T>['save']>['0']>
}

/**批量创建数据模型**/
export interface BaseConnectInsert<T> extends BaseConnectOption {
    /**创建数据**/
    body: Array<Parameters<Repository<T>['save']>['0']>
}

/**创建数据模型**/
export interface BaseConnectCreate<T> extends BaseConnectOption {
    /**创建数据**/
    body: Parameters<Repository<T>['save']>['0']
}

@Injectable()
export class DatabaseService extends Logger {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(schema.SchemaKines) public readonly schemaKines: Repository<schema.SchemaKines>,
        @InjectRepository(schema.SchemaChunk) public readonly schemaChunk: Repository<schema.SchemaChunk>,
        @InjectRepository(schema.SchemaUser) public readonly schemaUser: Repository<schema.SchemaUser>,
        @InjectRepository(schema.SchemaRouter) public readonly schemaRouter: Repository<schema.SchemaRouter>,
        @InjectRepository(schema.SchemaRole) public readonly schemaRole: Repository<schema.SchemaRole>
    ) {
        super()
    }

    /**条件SQL组合**/
    public async fetchBrackets(where: boolean, handler?: Function) {
        if (where && handler) {
            return await handler(where)
        }
        return where
    }

    /**字段查询输出组合**/
    public async fetchSelection<T>(qb: SelectQueryBuilder<T>, keys: Array<[string, Array<string>]>) {
        const fields = new Set(keys.map(([alias, names]) => plugin.fetchSelection(alias, names)).flat(Infinity)) as never as Array<string>
        return await qb.select([...fields])
    }

    /**typeorm事务**/
    public async fetchConnectTransaction(start: boolean = true) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        if (start) {
            await queryRunner.startTransaction()
        }
        return queryRunner
    }

    /**自定义查询**/
    public async fetchConnectBuilder<T, R>(model: Repository<T>, callback: (qb: SelectQueryBuilder<T>) => Promise<R>) {
        const qb = model.createQueryBuilder('t')
        return await callback(qb)
    }

    /**查询数据是否存在：存在会抛出异常**/
    public async fetchConnectNull<T>(model: Repository<T>, data: BaseCommonConnectOption<T>) {
        const datetime = Date.now()
        return await model.findOne(data.dispatch).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName || `${DatabaseService.name}:fetchConnectNull`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node }
                })
            }
            if (data.transform) {
                return await plugin.fetchCatchWherer(await data.transform(node), data).then(async () => {
                    return await this.fetchResolver(node)
                })
            } else {
                return await plugin.fetchCatchWherer(utils.isNotEmpty(node), data).then(async () => {
                    return await this.fetchResolver(node)
                })
            }
        })
    }

    /**查询数据是否不存在：不存在会抛出异常**/
    public async fetchConnectNotNull<T>(model: Repository<T>, data: BaseCommonConnectOption<T>) {
        const datetime = Date.now()
        return await model.findOne(data.dispatch).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName || `${DatabaseService.name}:fetchConnectNotNull`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node }
                })
            }
            if (data.transform) {
                return await plugin.fetchCatchWherer(await data.transform(node), data).then(async () => {
                    return await this.fetchResolver(node)
                })
            } else {
                return await plugin.fetchCatchWherer(utils.isEmpty(node), data).then(async () => {
                    return await this.fetchResolver(node)
                })
            }
        })
    }

    /**创建数据模型**/
    public async fetchConnectCreate<T>(model: Repository<T>, data: BaseConnectCreate<T>) {
        const datetime = Date.now()
        const state = await model.create(data.body)
        return await model.save(state).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName ?? `${DatabaseService.name}:fetchConnectCreate`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:事务等待创建结果`, node }
                })
            }
            return node
        })
    }

    /**批量创建数据模型**/
    public async fetchConnectInsert<T>(model: Repository<T>, data: BaseConnectInsert<T>) {
        const datetime = Date.now()
        return await model.save(data.body).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName || `${DatabaseService.name}:fetchConnectUpsert`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:事务等待批量创建结果`, node }
                })
            }
            return node
        })
    }

    /**批量更新数据模型**/
    public async fetchConnectUpsert<T>(model: Repository<T>, data: BaseConnectUpsert<T>) {
        const datetime = Date.now()
        return await model.save(data.body).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName || `${DatabaseService.name}:fetchConnectUpsert`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:事务等待批量更新结果`, node }
                })
            }
            return node
        })
    }

    /**新增AND更新数据模型**/
    public async fetchConnecUpsert<T, K extends keyof T>(model: Repository<T>, data: BaseConnecUpsert<T, K>) {
        const datetime = Date.now()
        return await model.upsert(data.body, data.where as Array<string>).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName || `${DatabaseService.name}:fetchConnecUpsert`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:事务等待新增AND更新结果`, where: data.where, node }
                })
            }
            return node
        })
    }

    /**更新数据模型**/
    public async fetchConnectUpdate<T>(model: Repository<T>, data: BaseConnectUpdate<T>) {
        const datetime = Date.now()
        return await model.update(data.where, data.body).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName || `${DatabaseService.name}:fetchConnectUpdate`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:事务等待更新结果`, where: data.where, node }
                })
            }
            return node
        })
    }

    /**删除数据模型**/
    public async fetchConnectDelete<T>(model: Repository<T>, data: BaseConnectDelete<T>) {
        const datetime = Date.now()
        return await model.delete(data.where).then(async node => {
            if (data.logger ?? true) {
                this.logger.info(data.deplayName || `${DatabaseService.name}:fetchConnectDelete`, {
                    duration: `${Date.now() - datetime}ms`,
                    context: data.request.headers?.context,
                    log: { message: `[${model.metadata.name}]:事务等待删除结果`, where: data.where, node }
                })
            }
            return node
        })
    }
}
