import { Injectable, HttpException, HttpStatus, Body } from '@nestjs/common'
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { Omix, OmixRequest } from '@/interface/global.resolver'
import * as schema from '@/modules/database/database.schema'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

export interface BaseConnectOption {
    /**是否停止执行**/
    next?: boolean
    /**描述**/
    comment?: string
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

/**使用keyId列表批量验证数据**/
export interface BaseConnectBatchNotNull extends BaseConnectOption {
    /**keyId字段别名**/
    alias?: string
    /**keyId列表**/
    keys: Array<string>
    /**异常状态码**/
    code?: number
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
        @InjectRepository(schema.SchemaDept) public readonly schemaDept: Repository<schema.SchemaDept>,
        @InjectRepository(schema.SchemaDeptUser) public readonly schemaDeptUser: Repository<schema.SchemaDeptUser>,
        @InjectRepository(schema.SchemaRole) public readonly schemaRole: Repository<schema.SchemaRole>,
        @InjectRepository(schema.SchemaRoleUser) public readonly schemaRoleUser: Repository<schema.SchemaRoleUser>,
        @InjectRepository(schema.SchemaRoleRouter) public readonly schemaRoleRouter: Repository<schema.SchemaRoleRouter>
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
    @AutoMethodDescriptor
    public async fetchConnectNull<T>(model: Repository<T>, data: BaseCommonConnectOption<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.findOne(data.dispatch).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node })
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
    @AutoMethodDescriptor
    public async fetchConnectNotNull<T>(model: Repository<T>, data: BaseCommonConnectOption<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.findOne(data.dispatch).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node })
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

    /**使用keyId列表批量验证数据是否不存在：不存在会抛出异常**/
    @AutoMethodDescriptor
    public async fetchConnectBatchNotNull<T>(model: Repository<T>, data: BaseConnectBatchNotNull) {
        if (data.keys.length === 0) {
            return { list: [], total: 0 }
        } else {
            const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
            return await this.fetchConnectBuilder(model, async qb => {
                const alias = data.alias || 'keyId'
                await qb.where(`t.${alias} IN(:keys)`, { keys: data.keys })
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    if (data.logger ?? true) {
                        logger.info({
                            comment: data.comment,
                            message: `[${model.metadata.name}]:查询出参`,
                            where: { keys: data.keys },
                            total,
                            list
                        })
                    }
                    if (data.keys.length !== total) {
                        throw new HttpException(`${alias}不存在`, HttpStatus.BAD_REQUEST, {
                            cause: data.keys.filter(key => !list.some((k: Omix) => k[alias] == key))
                        })
                    }
                    return { total, list }
                })
            })
        }
    }

    /**创建数据模型**/
    @AutoMethodDescriptor
    public async fetchConnectCreate<T>(model: Repository<T>, data: BaseConnectCreate<T>) {
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        const state = await model.create(data.body)
        return await model.save(state).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待创建结果`, body: data.body, node })
            }
            return node
        })
    }

    /**批量创建数据模型**/
    @AutoMethodDescriptor
    public async fetchConnectInsert<T>(model: Repository<T>, data: BaseConnectInsert<T>) {
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.save(data.body).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待批量创建结果`, body: data.body, node })
            }
            return node
        })
    }

    /**批量更新数据模型**/
    @AutoMethodDescriptor
    public async fetchConnectUpsert<T>(model: Repository<T>, data: BaseConnectUpsert<T>) {
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.save(data.body).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待批量更新结果`, body: data.body, node })
            }
            return node
        })
    }

    /**新增AND更新数据模型**/
    @AutoMethodDescriptor
    public async fetchConnecUpsert<T, K extends keyof T>(model: Repository<T>, data: BaseConnecUpsert<T, K>) {
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.upsert(data.body, data.where as Array<string>).then(async node => {
            if (data.logger ?? true) {
                logger.info({
                    comment: data.comment,
                    message: `[${model.metadata.name}]:事务等待新增AND更新结果`,
                    where: data.where,
                    body: data.body,
                    node
                })
            }
            return node
        })
    }

    /**更新数据模型**/
    @AutoMethodDescriptor
    public async fetchConnectUpdate<T>(model: Repository<T>, data: BaseConnectUpdate<T>) {
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.update(data.where, data.body).then(async node => {
            if (data.logger ?? true) {
                logger.info({
                    comment: data.comment,
                    message: `[${model.metadata.name}]:事务等待更新结果`,
                    where: data.where,
                    body: data.body,
                    node
                })
            }
            return node
        })
    }

    /**删除数据模型**/
    @AutoMethodDescriptor
    public async fetchConnectDelete<T>(model: Repository<T>, data: BaseConnectDelete<T>) {
        const logger = await this.fetchServiceLoggerTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.delete(data.where).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待删除结果`, where: data.where, node })
            }
            return node
        })
    }
}
