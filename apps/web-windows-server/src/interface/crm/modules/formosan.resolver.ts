import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { IsArray, IsOptional, IsNumber } from 'class-validator'
import { OmixColumnOptions, OmixColumnResponse, OmixPayloadResponse } from '@/interface'
import { schema } from '@/modules/database/database.service'

/**批量查询报价**/
export interface UtilsByColumnFormosanOptions extends Omix {
    keyIds: Array<number>
    fields?: Array<keyof schema.TbSmsAppFormosan>
}

/**批量查询报价草稿**/
export interface UtilsByColumnFormosanDraftOptions extends Omix {
    keyIds: Array<number>
    fields?: Array<keyof schema.TbSmsAppFormosanDraft>
}

/**报价草稿-初始化**/
export class SmsFormosanDraftInitOptions extends PickType(schema.TbSmsAppFormosanDraft, ['clientId', 'appId']) {
    @ApiProperty({ description: '选中的国家/地区keyId列表', type: [Number], example: [1, 2, 3] })
    @IsArray({ message: 'items必须为数组' })
    @IsNumber({}, { each: true, message: 'items每项必须为数字' })
    items: number[]
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

