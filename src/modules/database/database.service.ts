import { Injectable, HttpStatus } from '@nestjs/common'
import { Repository, DataSource, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class DatabaseService {
    constructor(private readonly dataSource: DataSource) {}
}
