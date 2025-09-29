import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as schema from '@/modules/database/schema'

@Injectable()
export class SchemaService {
    constructor(
        /**管理端-自定义json配置表**/
        @InjectRepository(schema.WindowsKines) readonly WindowsKines: Repository<schema.WindowsKines>,
        /**管理端-账号表**/
        @InjectRepository(schema.WindowsAccount) readonly WindowsAccount: Repository<schema.WindowsAccount>,
        /**管理端-部门组织表**/
        @InjectRepository(schema.WindowsDept) readonly WindowsDept: Repository<schema.WindowsDept>,
        /**管理端-部门关联账号表**/
        @InjectRepository(schema.WindowsDeptAccount) readonly WindowsDeptAccount: Repository<schema.WindowsDeptAccount>,
        /**管理端-菜单资源表**/
        @InjectRepository(schema.WindowsResource) readonly WindowsResource: Repository<schema.WindowsResource>,
        /**管理端-接口权限表**/
        @InjectRepository(schema.WindowsResourceApifox) readonly WindowsResourceApifox: Repository<schema.WindowsResourceApifox>,
        /**管理端-操作按钮权限表**/
        @InjectRepository(schema.WindowsResourceSheet) readonly WindowsResourceSheet: Repository<schema.WindowsResourceSheet>,
        /**管理端-角色配置表**/
        @InjectRepository(schema.WindowsRole) readonly WindowsRole: Repository<schema.WindowsRole>,
        /**管理端-角色关联账号表**/
        @InjectRepository(schema.WindowsRoleAccount) readonly WindowsRoleAccount: Repository<schema.WindowsRoleAccount>,
        /**管理端-角色菜单资源表**/
        @InjectRepository(schema.WindowsRoleResource) readonly WindowsRoleResource: Repository<schema.WindowsRoleResource>
    ) {}
}

@Injectable()
export class ClientService {}

@Injectable()
export class WindowsService {
    constructor(
        /**管理端-自定义json配置表**/
        @InjectRepository(schema.WindowsKines) readonly kines: Repository<schema.WindowsKines>,
        /**管理端-账号表**/
        @InjectRepository(schema.WindowsAccount) readonly account: Repository<schema.WindowsAccount>,
        /**管理端-部门组织表**/
        @InjectRepository(schema.WindowsDept) readonly dept: Repository<schema.WindowsDept>,
        /**管理端-部门关联账号表**/
        @InjectRepository(schema.WindowsDeptAccount) readonly deptAccount: Repository<schema.WindowsDeptAccount>,
        /**管理端-菜单资源表**/
        @InjectRepository(schema.WindowsResource) readonly resource: Repository<schema.WindowsResource>,
        /**管理端-接口权限表**/
        @InjectRepository(schema.WindowsResourceApifox) readonly resourceApifox: Repository<schema.WindowsResourceApifox>,
        /**管理端-操作按钮权限表**/
        @InjectRepository(schema.WindowsResourceSheet) readonly resourceSheet: Repository<schema.WindowsResourceSheet>,
        /**管理端-角色配置表**/
        @InjectRepository(schema.WindowsRole) readonly role: Repository<schema.WindowsRole>,
        /**管理端-角色关联账号表**/
        @InjectRepository(schema.WindowsRoleAccount) readonly roleAccount: Repository<schema.WindowsRoleAccount>,
        /**管理端-角色菜单资源表**/
        @InjectRepository(schema.WindowsRoleResource) readonly roleResource: Repository<schema.WindowsRoleResource>
    ) {}
}
