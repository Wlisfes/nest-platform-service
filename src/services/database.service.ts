import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Repository, EntityManager, DataSource, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { JwtService } from '@nestjs/jwt'
import { divineResolver, divineLogger } from '@/utils/utils-common'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class DatabaseService {
    constructor(
        private readonly configService: ConfigService,
        private readonly entityManager: EntityManager,
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectRepository(entities.tbUser) public readonly tbUser: Repository<entities.tbUser>,
        @InjectRepository(entities.tbMember) public readonly tbMember: Repository<entities.tbMember>
    ) {}
}
