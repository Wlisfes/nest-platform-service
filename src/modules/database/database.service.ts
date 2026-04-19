import { Injectable } from '@nestjs/common'
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm'
import { isNotEmpty, isEmpty, isArray } from 'class-validator'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { fetchSelection, fetchCatchWherer } from '@/utils'
export { ClientService, WindowsService } from '@/modules/database/database.schema'
import * as env from '@/modules/database/database.interface'
import * as schema from '@/modules/database/schema'
import * as enums from '@/modules/database/enums'
export { schema, enums }

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
     * @param options 事务配置
     * @returns 事务实例、挂载schema对应的Repository
     */
    public async transaction<S extends Array<keyof typeof schema> = []>(
        options: env.BaseTransactionOptions<S> = {} as env.BaseTransactionOptions<S>
    ): Promise<env.BaseTransactionResult<S>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        if (options.where ?? true) {
            await queryRunner.startTransaction()
        }
        if (isArray(options.schema)) {
            for (const key of options.schema) {
                ;(queryRunner as Omix)[key] = queryRunner.manager.getRepository(schema[key] as any)
            }
        }
        return queryRunner as env.BaseTransactionResult<S>
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
        const logger = await this.fetchServiceTransaction(data.request, { stack: this.stack })
        const state = await model.create(data.body)
        return await model.save(state).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待创建结果`, body: data.body, node })
            }
            return node
        })
    }

    /**
     * 批量创建数据模型
     * @param model 表实体
     * @param data 参数对象
     * @returns 成功结果
     */
    @AutoDescriptor
    public async insert<T>(model: Repository<T>, data: env.BaseInsertOptions<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { stack: this.stack })
        const state = model.create(data.body)
        return await model.save(state).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待批量创建结果`, body: data.body, node })
            }
            return node
        })
    }

    /**
     * 更新数据模型
     * @param model 表实体
     * @param data 参数对象
     * @returns 成功结果
     */
    @AutoDescriptor
    public async update<T>(model: Repository<T>, data: env.BaseUpdateOptions<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { stack: this.stack })
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

    /**
     * 删除数据模型
     * @param model 表实体
     * @param data 参数对象
     * @returns 成功结果
     */
    @AutoDescriptor
    public async delete<T>(model: Repository<T>, data: env.BaseDeleteOptions<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { stack: this.stack })
        return await model.delete(data.where).then(async node => {
            if (data.logger ?? true) {
                logger.info({ comment: data.comment, message: `[${model.metadata.name}]:事务等待删除结果`, where: data.where, node })
            }
            if (data.transaction) {
                return await data.transaction(node as never)
            }
            return node
        })
    }

    /**
     * 查询数据是否存在：存在会抛出异常
     * @param model 表实体
     * @param data 参数对象
     * @returns 成功结果
     */
    @AutoDescriptor
    public async notempty<T>(model: Repository<T>, data: env.BaseOneCommonOption<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { stack: this.stack })
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

    /**
     * 查询数据是否不存在：不存在会抛出异常
     * @param model 表实体
     * @param data 参数对象
     * @returns 成功结果
     */
    @AutoDescriptor
    public async empty<T>(model: Repository<T>, data: env.BaseOneCommonOption<T>) {
        if ([false, 'false'].includes(data.next ?? true)) {
            /**next等于false停止执行**/
            return data
        }
        const logger = await this.fetchServiceTransaction(data.request, { stack: this.stack })
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
}
