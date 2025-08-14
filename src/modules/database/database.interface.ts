import { HttpExceptionOptions } from '@nestjs/common'
import { Repository } from 'typeorm'
import { OmixRequest } from '@/interface'

/**基础配置**/
export interface BaseOptions extends Omix {
    /**是否停止执行**/
    next?: boolean
    /**描述**/
    comment?: string
    /**请求实例**/
    request: OmixRequest
    /**开启日志**/
    logger?: boolean
    /**输出日志方法名**/
    deplayName?: string
}

/**自定义校验配置**/
export interface BaseTransformOptions extends Omix {
    /**是否抛出异常**/
    where: boolean
    /**异常信息**/
    form: Omix<{ message: string; code?: number; cause?: Omix<HttpExceptionOptions> }>
}

/**通用查询配置**/
export interface BaseCommonOption<T, R> extends BaseOptions {
    /**异常提示文案**/
    message: string
    /**异常状态码**/
    code?: number
    /**额外异常数据**/
    cause?: Omix
    /**自定义转换验证**/
    transform?: (data: R, node: BaseCommonOption<T, R>) => BaseTransformOptions | Promise<BaseTransformOptions>
}

/**单条通用查询配置**/
export interface BaseOneCommonOption<T> extends BaseCommonOption<T, T> {
    /**findOne查询入参**/
    dispatch?: Omix<Parameters<Repository<T>['findOne']>['0']>
}

/**批量通用查询配置**/
export interface BaseBatchCommonOption<T> extends BaseCommonOption<T, Array<T>> {
    /**find查询入参**/
    dispatch?: Omix<Parameters<Repository<T>['find']>['0']>
}

/**创建数据模型**/
export interface BaseCreateOptions<T> extends BaseOptions {
    /**创建数据**/
    body: Parameters<Repository<T>['save']>['0']
}

/**批量创建数据模型**/
export interface BaseInsertOptions<T> extends BaseOptions {
    /**创建数据**/
    body: Array<Parameters<Repository<T>['save']>['0']>
}

/**更新数据模型**/
export interface BaseUpdateOptions<T> extends BaseOptions {
    /**更新条件**/
    where: Parameters<Repository<T>['update']>['0']
    /**更新数据**/
    body: Parameters<Repository<T>['update']>['1']
}

/**删除数据模型**/
export interface BaseDeleteOptions<T> extends BaseOptions {
    /**删除条件**/
    where: Parameters<Repository<T>['delete']>['0']
}
