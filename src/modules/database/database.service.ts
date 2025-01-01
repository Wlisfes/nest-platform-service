import { Injectable, HttpStatus } from '@nestjs/common'
import { Repository, DataSource, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { isEmpty, isNotEmpty } from 'class-validator'
import { Logger } from '@/modules/logger/logger.service'
import { Omix } from '@/interface/global.resolver'
import { SchemaUser } from '@/modules/database/database.schema'
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
    constructor(private readonly dataSource: DataSource, @InjectRepository(SchemaUser) public readonly schemaUser: Repository<SchemaUser>) {
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
}
