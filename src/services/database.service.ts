import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Repository, DataSource, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { JwtService } from '@nestjs/jwt'
import { divineCatchWherer, divineResolver } from '@/utils/utils-common'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

export interface OmixCustomOption<T, U> extends Omix {
    message?: string
    status?: number
    dispatch?: Omix<T>
    cause?: Omix
    transform?: (data: U) => boolean | Promise<boolean>
}

@Injectable()
export class DatabaseService extends LoggerService {
    constructor(
        private readonly configService: ConfigService,
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
        @InjectRepository(entities.tbUser) public readonly tbUser: Repository<entities.tbUser>,
        @InjectRepository(entities.tbDept) public readonly tbDept: Repository<entities.tbDept>,
        @InjectRepository(entities.tbMember) public readonly tbMember: Repository<entities.tbMember>
    ) {
        super()
    }

    /**jwtToken解析**/
    public async fetchJwtTokenParser<T>(token: string, scope: Omix<{ message?: string; status?: number }> = {}): Promise<T> {
        try {
            return (await this.jwtService.verifyAsync(token, { secret: this.configService.get('JWT_SECRET') })) as T
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }

    /**jwtToken加密**/
    public async fetchJwtTokenSecret<T>(
        node: Omix<T>,
        scope: Omix<{ expire?: number; message?: string; status?: number }> = {}
    ): Promise<string> {
        try {
            if (scope.expire) {
                return await this.jwtService.signAsync(Object.assign(node, {}), {
                    expiresIn: scope.expire,
                    secret: this.configService.get('JWT_SECRET')
                })
            } else {
                return await this.jwtService.signAsync(node, { secret: this.configService.get('JWT_SECRET') })
            }
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
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

    /**数据模型为空：抛出异常、存在-返回数据模型**/
    public async fetchConnectCatchWherer<T>(where: boolean, node: T, scope: OmixCustomOption<T, Omix>) {
        return await divineCatchWherer(where && Boolean(scope.message), {
            message: scope.message,
            cause: scope.cause,
            status: scope.status ?? HttpStatus.BAD_REQUEST
        }).then(() => node)
    }

    /**验证数据模型是否为空**/
    @Logger
    public async fetchConnectEmptyError<T>(
        headers: OmixHeaders,
        model: Repository<T>,
        scope: OmixCustomOption<Parameters<typeof model.findOne>['0'], T>
    ) {
        this.logger.info({ log: `[${model.metadata.name}]:查询入参`, dispatch: scope.dispatch })
        return await model.findOne(scope.dispatch).then(async node => {
            this.logger.info({ log: `[${model.metadata.name}]:查询出参`, where: scope.dispatch.where, node })
            if (scope.transform) {
                return await this.fetchConnectCatchWherer(await scope.transform(node), node, scope)
            } else {
                return await this.fetchConnectCatchWherer(!Boolean(node), node, scope)
            }
        })
    }

    /**验证数据模型是否不为空**/
    @Logger
    public async fetchConnectNotEmptyError<T>(
        headers: OmixHeaders,
        model: Repository<T>,
        scope: OmixCustomOption<Parameters<typeof model.findOne>['0'], T>
    ) {
        this.logger.info({ log: `[${model.metadata.name}]:查询入参`, dispatch: scope.dispatch })
        return await model.findOne(scope.dispatch).then(async node => {
            this.logger.info({ log: `[${model.metadata.name}]:查询出参`, where: scope.dispatch.where, node })
            if (scope.transform) {
                return await this.fetchConnectCatchWherer(await scope.transform(node), node, scope)
            } else {
                return await this.fetchConnectCatchWherer(Boolean(node), node, scope)
            }
        })
    }

    /**创建数据模型**/
    @Logger
    public async fetchConnectCreate<T>(headers: OmixHeaders, model: Repository<T>, scope: { body: DeepPartial<T> }) {
        this.logger.info({ log: `[${model.metadata.name}]:创建入参`, body: scope.body })
        const state = await model.create(scope.body)
        return await model.save(state).then(async node => {
            this.logger.info({ log: `[${model.metadata.name}]:创建结果`, node })
            return node
        })
    }

    /**更新数据模型**/
    @Logger
    public async fetchConnectUpdate<T>(
        headers: OmixHeaders,
        model: Repository<T>,
        scope: { where: Parameters<typeof model.update>['0']; body: Parameters<typeof model.update>['1'] }
    ) {
        this.logger.info({ log: `[${model.metadata.name}]:更新入参`, where: scope.where, body: scope.body })
        return await model.update(scope.where, scope.body).then(async node => {
            this.logger.info({ log: `[${model.metadata.name}]:更新入参`, where: scope.where, node })
            return node
        })
    }

    /**分页列表查询**/
    @Logger
    public async fetchConnectAndCount<T>(headers: OmixHeaders, model: Repository<T>, where: Parameters<typeof model.findAndCount>['0']) {
        this.logger.info({ log: `[${model.metadata.name}]:查询入参`, where })
        return await model.findAndCount(where).then(async ([list = [], total = 0]) => {
            this.logger.info({ log: `[${model.metadata.name}]:查询出参`, where, total })
            return await divineResolver({ list, total })
        })
    }

    /**自定义查询**/
    @Logger
    public async fetchConnectBuilder<T, R>(
        headers: OmixHeaders,
        model: Repository<T>,
        callback: (qb: SelectQueryBuilder<T>) => Promise<R>
    ) {
        const qb = model.createQueryBuilder('t')
        return await callback(qb)
    }
}
