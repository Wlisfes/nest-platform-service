import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as schema from '@/modules/database/schema'

@Injectable()
export class SmsWindowsService {
    constructor(
        @InjectRepository(schema.TbSmsApp) readonly tbSmsAppOptions: Repository<schema.TbSmsApp>,
        @InjectRepository(schema.TbSmsAppQuotation) readonly tbSmsQuotationOptions: Repository<schema.TbSmsAppQuotation>,
        @InjectRepository(schema.TbSmsAppTasks) readonly tbSmsTasksOptions: Repository<schema.TbSmsAppTasks>,
        @InjectRepository(schema.TbSmsAppRecord) readonly tbSmsRecordOptions: Repository<schema.TbSmsAppRecord>
    ) {}
}

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
        @InjectRepository(schema.WindowsClient) readonly clientOptions: Repository<schema.WindowsClient>,
        @InjectRepository(schema.WindowsClientSettings) readonly clientSettingsOptions: Repository<schema.WindowsClientSettings>,
        @InjectRepository(schema.WindowsClientShare) readonly clientShareOptions: Repository<schema.WindowsClientShare>,
        @InjectRepository(schema.WindowsClientTags) readonly clientTagsOptions: Repository<schema.WindowsClientTags>,
        @InjectRepository(schema.WindowsBrand) readonly brandOptions: Repository<schema.WindowsBrand>,
        @InjectRepository(schema.WindowsCurrency) readonly currencyOptions: Repository<schema.WindowsCurrency>
    ) {}
}
