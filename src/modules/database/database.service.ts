import { Injectable } from '@nestjs/common'
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm'
import { isNotEmpty, isEmpty, isArray } from 'class-validator'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { fetchSelection, fetchCatchWherer } from '@/utils'
export { ClientService, WindowsService, SchemaService } from '@/modules/database/database.schema'
import * as env from '@/modules/database/database.interface'
export * as schema from '@/modules/database/schema'
export * as enums from '@/modules/database/enums'

@Injectable()
export class DataBaseService extends Logger {
    constructor(private readonly dataSource: DataSource) {
        super()
    }

    /**
     * 条件SQL组合
     * @param where 是否继续往下执行
     * @param handler 执行方法
     * @returns handler执行结果、where条件
     */
    public async brackets(where: boolean, handler?: Function) {
        if (where && handler) {
            return await handler(where)
        }
        return where
    }

    /**
     * 字段查询输出组合
     * @param qb orm实例
     * @param keys 字段列表
     * @returns orm实例
     */
    public async selection<T>(qb: SelectQueryBuilder<T>, keys: Array<[string, Array<string>]>) {
        const fields = new Set(keys.map(([alias, names]) => fetchSelection(alias, names)).flat(Infinity)) as never as Array<string>
        return await qb.select([...fields])
    }

    /**
     * typeorm事务
     * @param where 是否开启事务、默认true
     * @returns 事务实例
     */
    public async transaction(where: boolean = true) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        if (where) {
            await queryRunner.startTransaction()
        }
        return queryRunner
    }

    /**
     * 自定义查询
     * @param model 表实体
     * @param callback 回调函数
     * @returns 回调函数执行结果
     */
    public async builder<T, R>(model: Repository<T>, callback: (qb: SelectQueryBuilder<T>) => Promise<R>) {
        const qb = model.createQueryBuilder('t')
        return await callback(qb)
    }

    /**
     * 创建数据模型
     * @param model 表实体
     * @param data 参数对象
     * @returns 成功结果
     */
    @AutoDescriptor
    public async create<T>(model: Repository<T>, data: env.BaseCreateOptions<T>): Promise<Awaited<T> & T> {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data as never as Promise<Awaited<T> & T>
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        const state = await model.create(data.body)
        return await model.save(state).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待创建结果`, body: data.body, node })
            }
            return node
        })
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
        const fields = new Set(keys.map(([alias, names]) => fetchSelection(alias, names)).flat(Infinity)) as never as Array<string>
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
    @AutoDescriptor
    public async fetchConnectNull<T>(model: Repository<T>, data: env.BaseOneCommonOption<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.findOne(data.dispatch).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node })
            }
            if (data.transform) {
                const { where, form } = await data.transform(node, data)
                return await fetchCatchWherer(where, form).then(async () => {
                    return await this.fetchResolver(node)
                })
            } else {
                return await fetchCatchWherer(isNotEmpty(node), data).then(async () => {
                    return await this.fetchResolver(node)
                })
            }
        })
    }

    /**查询数据是否不存在：不存在会抛出异常**/
    @AutoDescriptor
    public async fetchConnectNotNull<T>(model: Repository<T>, data: env.BaseOneCommonOption<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.findOne(data.dispatch).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node })
            }
            if (data.transform) {
                const { where, form } = await data.transform(node, data)
                return await fetchCatchWherer(where, form).then(async () => {
                    return await this.fetchResolver(node)
                })
            } else {
                return await fetchCatchWherer(isEmpty(node), data).then(async () => {
                    return await this.fetchResolver(node)
                })
            }
        })
    }

    /**批量查询数据是否不存在：不存在会抛出异常**/
    @AutoDescriptor
    public async fetchConnectBatchNotNull<T>(model: Repository<T>, data: env.BaseBatchCommonOption<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.find(data.dispatch).then(async list => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:查询出参`, where: data.dispatch, list })
            }
            if (isArray(data.dispatch.where)) {
                if (data.transform) {
                    const { where, form } = await data.transform(list, data)
                    return await fetchCatchWherer(where, form).then(async () => {
                        return await this.fetchResolver(list)
                    })
                } else if (data.dispatch.where.length !== list.length) {
                    data.cause = Object.assign(data.cause ?? {}, {
                        items: data.dispatch.where.filter((item: Omix) => {
                            return !list.some((node: Omix) => node.keyId === item.keyId)
                        })
                    })
                    return await fetchCatchWherer(true, data)
                }
            }
            return await this.fetchResolver(list)
        })
    }

    /**创建数据模型**/
    @AutoDescriptor
    public async fetchConnectCreate<T>(model: Repository<T>, data: env.BaseCreateOptions<T>): Promise<Awaited<T> & T> {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data as never as Promise<Awaited<T> & T>
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        const state = await model.create(data.body)
        return await model.save(state).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待创建结果`, body: data.body, node })
            }
            return node
        })
    }

    /**批量创建数据模型**/
    @AutoDescriptor
    public async fetchConnectInsert<T>(model: Repository<T>, data: env.BaseInsertOptions<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.save(data.body).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待批量创建结果`, body: data.body, node })
            }
            return node
        })
    }

    /**更新数据模型**/
    @AutoDescriptor
    public async fetchConnectUpdate<T>(model: Repository<T>, data: env.BaseUpdateOptions<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
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
    @AutoDescriptor
    public async fetchConnectDelete<T>(model: Repository<T>, data: env.BaseDeleteOptions<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { deplayName: this.fetchDeplayName(data.deplayName) })
        return await model.delete(data.where).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待删除结果`, where: data.where, node })
            }
            return node
        })
    }
}
