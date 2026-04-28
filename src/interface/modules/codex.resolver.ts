import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

/**创建图形验证码**/
export class CodexCreateOptions {
    @ApiProperty({ description: '图形验证码宽度', required: false, example: 120 })
    @IsNumber({}, { message: 'width必须是数字' })
    @Type(type => Number)
    width: number = 120

    @ApiProperty({ description: '图形验证码高度', required: false, example: 40 })
    @IsNumber({}, { message: 'height必须是数字' })
    @Type(type => Number)
    height: number = 40

    @ApiProperty({ description: '图形验证码字符大小', required: false, example: 40 })
    @IsNumber({}, { message: 'fontSize必须是数字' })
    @Type(type => Number)
    fontSize: number = 40

    @ApiProperty({ description: '图形验证码主题', required: false, example: 0 })
    @IsNumber({}, { message: 'inverse必须是数字' })
    @Type(type => Number)
    inverse: number = 0
}

/**写入图形验证码**/
export class CodexWriteOptions {
    /**输出日志方法名**/
    stack?: string
    /**创建图形验证码配置**/
    body: CodexCreateOptions
}

/**校验redis图形验证码**/
export class BaseCommonCookiesCodex {
    /**输出日志方法名**/
    stack?: string
    /**验证码**/
    code: string
}
