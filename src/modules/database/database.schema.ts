import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as schema from '@/modules/database/schema'

@Injectable()
export class ClientService {}

@Injectable()
export class WindowsService {
    constructor(
        /**管理端-字段自定义显示规则表**/
        @InjectRepository(schema.WindowsChunk) readonly chunkOptions: Repository<schema.WindowsChunk>,
        /**管理端-自定义json配置表**/
        @InjectRepository(schema.WindowsKines) readonly kines: Repository<schema.WindowsKines>,
        /**管理端-账号表**/
        @InjectRepository(schema.WindowsAccount) readonly account: Repository<schema.WindowsAccount>,
        @InjectRepository(schema.WindowsAccount) readonly accountOptions: Repository<schema.WindowsAccount>,
        /**管理端-部门组织表**/
        @InjectRepository(schema.WindowsDept) readonly deptOptions: Repository<schema.WindowsDept>,
        @InjectRepository(schema.WindowsDeptAccount) readonly deptAccountOptions: Repository<schema.WindowsDeptAccount>,
        @InjectRepository(schema.WindowsSheet) readonly sheetOptions: Repository<schema.WindowsSheet>,
        @InjectRepository(schema.WindowsRole) readonly roleOptions: Repository<schema.WindowsRole>,
        @InjectRepository(schema.WindowsRoleSheet) readonly roleSheetOptions: Repository<schema.WindowsRoleSheet>,
        @InjectRepository(schema.WindowsRoleAccount) readonly roleAccountOptions: Repository<schema.WindowsRoleAccount>
    ) {}
}
