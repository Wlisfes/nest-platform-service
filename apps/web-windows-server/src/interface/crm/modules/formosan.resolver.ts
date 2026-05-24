import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { IsNotEmpty, IsArray, IsOptional, IsNumber, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { OmixColumnOptions, OmixColumnResponse, OmixPayloadResponse } from '@/interface'
import { schema } from '@/modules/database/database.service'

/**报价草稿-初始化选中项**/
export class SmsFormosanDraftInitItem {
    @ApiProperty({ description: '国家/地区编码', example: '86' })
    @IsNotEmpty({ message: '国家/地区编码必填' })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    mcc: string

    @ApiProperty({ required: false, description: '已有报价主键ID', example: 1000 })
    @IsOptional()
    formosanId: number
}

/**报价草稿-初始化**/
export class SmsFormosanDraftInitOptions {
    @ApiProperty({ description: '客户ID', example: 1008600 })
    @IsNotEmpty({ message: '客户ID必填' })
    clientId: number

    @ApiProperty({ description: '应用ID', example: '09SYfmEt' })
    @IsNotEmpty({ message: '应用ID必填' })
    appId: string

    @ApiProperty({ description: '选中的国家/地区列表', type: [SmsFormosanDraftInitItem] })
    @IsArray({ message: 'items必须为数组' })
    @ValidateNested({ each: true })
    @Type(() => SmsFormosanDraftInitItem)
    items: SmsFormosanDraftInitItem[]
}

/**报价草稿-分页列表查询**/
export class SmsFormosanDraftColumnOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PickType(schema.TbSmsAppFormosanDraft, ['clientId', 'appId'])
) {}

/**报价草稿-分页列表响应**/
export class SmsFormosanDraftColumnOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.TbSmsAppFormosanDraft] })
    list: schema.TbSmsAppFormosanDraft[]
}

/**报价草稿-修改单条**/
export class SmsFormosanDraftUpdateOptions extends IntersectionType(
    PickType(schema.TbSmsAppFormosanDraft, ['keyId']),
    PartialType(PickType(schema.TbSmsAppFormosanDraft, ['upUsd', 'downUsd', 'effectiveTime', 'expiryTime', 'status']))
) {}

/**报价草稿-删除单条**/
export class SmsFormosanDraftDeleteOptions extends PickType(schema.TbSmsAppFormosanDraft, ['keyId']) {}

/**报价预览**/
export class SmsFormosanPreviewOptions extends PickType(schema.TbSmsAppFormosanDraft, ['clientId', 'appId']) {}

/**报价预览-汇总统计**/
export class SmsFormosanPreviewSummary {
    @ApiProperty({ description: '草稿总数', example: 10 })
    totalCount: number

    @ApiProperty({ description: '新增方向数', example: 5 })
    additionCount: number

    @ApiProperty({ description: '修改方向数', example: 5 })
    existingCount: number

    @ApiProperty({ description: '定时生效数量', example: 2 })
    scheduledCount: number

    @ApiProperty({ description: '涨价数量', example: 3 })
    priceUpCount: number

    @ApiProperty({ description: '降价数量', example: 1 })
    priceDownCount: number
}

/**报价预览-响应**/
export class SmsFormosanPreviewOptionsResponse {
    @ApiProperty({ description: '草稿列表', type: [schema.TbSmsAppFormosanDraft] })
    drafts: schema.TbSmsAppFormosanDraft[]

    @ApiProperty({ description: '已生效报价列表', type: [schema.TbSmsAppFormosan] })
    actives: schema.TbSmsAppFormosan[]

    @ApiProperty({ description: '汇总统计', type: SmsFormosanPreviewSummary })
    summary: SmsFormosanPreviewSummary
}

/**报价发布**/
export class SmsFormosanPublishOptions extends PickType(schema.TbSmsAppFormosanDraft, ['clientId', 'appId']) {
    @ApiProperty({ required: false, description: '自定义邮件内容', example: '<p>Dear Customer, ...</p>' })
    @IsOptional()
    mailContent: string
}
