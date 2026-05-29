import { Injectable, HttpException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { SystemService } from '@web-datetask-server/modules/system/system.service'
import { enums } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { firstValueFrom } from 'rxjs'
import { moment } from '@/utils'

@Injectable()
export class FormosanService extends Logger {
    /**任务处理器标识**/
    public readonly taskName: string = 'datetask-formosan-service'
}
