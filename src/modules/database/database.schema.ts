import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as schema from '@/modules/database/schema'

@Injectable()
export class ClientService {}

@Injectable()
export class WindowsService {
    constructor(
        @InjectRepository(schema.WindowsChunk) readonly chunkOptions: Repository<schema.WindowsChunk>,
        @InjectRepository(schema.WindowsKines) readonly kinesOptions: Repository<schema.WindowsKines>,
        @InjectRepository(schema.WindowsAccount) readonly accountOptions: Repository<schema.WindowsAccount>,
        @InjectRepository(schema.WindowsDept) readonly deptOptions: Repository<schema.WindowsDept>,
        @InjectRepository(schema.WindowsDeptAccount) readonly deptAccountOptions: Repository<schema.WindowsDeptAccount>,
        @InjectRepository(schema.WindowsSheet) readonly sheetOptions: Repository<schema.WindowsSheet>,
        @InjectRepository(schema.WindowsRole) readonly roleOptions: Repository<schema.WindowsRole>,
        @InjectRepository(schema.WindowsRoleSheet) readonly roleSheetOptions: Repository<schema.WindowsRoleSheet>,
        @InjectRepository(schema.WindowsRoleAccount) readonly roleAccountOptions: Repository<schema.WindowsRoleAccount>,
        @InjectRepository(schema.WindowsPosition) readonly positionOptions: Repository<schema.WindowsPosition>,
        @InjectRepository(schema.WindowsPositionAccount) readonly positionAccountOptions: Repository<schema.WindowsPositionAccount>,
        @InjectRepository(schema.WindowsRank) readonly rankOptions: Repository<schema.WindowsRank>,
        @InjectRepository(schema.WindowsRankAccount) readonly rankAccountOptions: Repository<schema.WindowsRankAccount>,
        @InjectRepository(schema.WindowsClient) readonly clientOptions: Repository<schema.WindowsClient>
    ) {}
}
