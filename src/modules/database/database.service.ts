import { Injectable, HttpStatus } from '@nestjs/common'
import { Repository, DataSource, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { isEmpty, isNotEmpty } from 'class-validator'
import { Logger } from '@/modules/logger/logger.service'
import { Omix } from '@/interface/global.resolver'
import * as schema from '@/modules/database/database.schema'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

export interface ConnectOption<T, U> extends Omix {
    message: string
    dispatch?: Omix<U>
    code?: number
    cause?: Omix
    transform?: (data: T) => boolean | Promise<boolean>
}

@Injectable()
export class DatabaseService extends Logger {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(schema.SchemaUser) public readonly schemaUser: Repository<schema.SchemaUser>,
        @InjectRepository(schema.SchemaSystem) public readonly schemaSystem: Repository<schema.SchemaSystem>
    ) {
        super()
    }

    /**typeorm事务**/
    public async fetchConnectTransaction<T>(start: boolean = true) {
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
    public async fetchConnectNull<T>(model: Repository<T>, data: ConnectOption<T, Parameters<typeof model.findOne>['0']>) {
        const datetime = Date.now()
        return await model.findOne(data.dispatch).then(async node => {
            this.logger.info(`${DatabaseService.name}:fetchConnectNull`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node }
            })
            if (data.transform) {
                return await plugin.fetchCatchWherer(await data.transform(node), data).then(async () => {
                    return await utils.fetchResolver(node)
                })
            } else {
                return await plugin.fetchCatchWherer(isNotEmpty(node), data).then(async () => {
                    return await utils.fetchResolver(node)
                })
            }
        })
    }

    /**查询数据是否不存在：不存在会抛出异常**/
    public async fetchConnectNotNull<T>(model: Repository<T>, data: ConnectOption<T, Parameters<typeof model.findOne>['0']>) {
        const datetime = Date.now()
        return await model.findOne(data.dispatch).then(async node => {
            this.logger.info(`${DatabaseService.name}:fetchConnectNotNull`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `[${model.metadata.name}]:查询出参`, where: data.dispatch.where, node }
            })
            if (data.transform) {
                return await plugin.fetchCatchWherer(await data.transform(node), data).then(async () => {
                    return await utils.fetchResolver(node)
                })
            } else {
                return await plugin.fetchCatchWherer(isEmpty(node), data).then(async () => {
                    return await utils.fetchResolver(node)
                })
            }
        })
    }

    /**创建数据模型**/
    public async fetchConnectCreate<T>(model: Repository<T>, data: { body: DeepPartial<T> }) {
        const datetime = Date.now()
        const state = await model.create(data.body)
        return await model.save(state).then(async node => {
            this.logger.info(`${DatabaseService.name}:fetchConnectCreate`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `[${model.metadata.name}]:创建结果`, node }
            })
            return node
        })
    }

    /**批量创建数据模型**/
    public async fetchConnectInsert<T>(model: Repository<T>, data: { body: Array<Omix<DeepPartial<T>>> }) {
        const datetime = Date.now()
        return await this.fetchConnectBuilder(model, async qb => {
            const node = await qb.insert().values(data.body).execute()
            this.logger.info(`${DatabaseService.name}:fetchConnectInsert`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `[${model.metadata.name}]:批量创建结果`, identifiers: node.identifiers, row: node.raw }
            })
            return node
        })
    }

    /**批量创建OR更新数据模型**/
    public async fetchConnectUpsert<T>(
        model: Repository<T>,
        data: { body: Parameters<typeof model.upsert>['0']; where: Parameters<typeof model.upsert>['1'] }
    ) {
        const datetime = Date.now()
        return await model.upsert(data.body, data.where).then(async node => {
            this.logger.info(`${DatabaseService.name}:fetchConnectUpsert`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `[${model.metadata.name}]:批量创建OR更新结果`, identifiers: node.identifiers, row: node.raw }
            })
            return node
        })
    }

    /**更新数据模型**/
    public async fetchConnectUpdate<T>(
        model: Repository<T>,
        data: { where: Parameters<typeof model.update>['0']; body: Parameters<typeof model.update>['1'] }
    ) {
        const datetime = Date.now()
        return await model.update(data.where, data.body).then(async node => {
            this.logger.info(`${DatabaseService.name}:fetchConnectUpdate`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `[${model.metadata.name}]:更新结果`, where: data.where, node }
            })
            return node
        })
    }

    /**分页列表查询**/
    public async fetchConnectAndCount<T>(model: Repository<T>, where: Parameters<typeof model.findAndCount>['0']) {
        const datetime = Date.now()
        return await model.findAndCount(where).then(async ([list = [], total = 0]) => {
            this.logger.info(`${DatabaseService.name}:fetchConnectAndCount`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `[${model.metadata.name}]:查询出参`, where, total }
            })
            return await utils.fetchResolver({ list, total })
        })
    }
}
