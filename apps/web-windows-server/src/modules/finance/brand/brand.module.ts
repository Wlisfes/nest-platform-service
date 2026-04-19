import { Module, Global } from '@nestjs/common'
import { FinanceBrandService } from '@web-windows-server/modules/finance/brand/brand.service'
import { FinanceBrandUtilsService } from '@web-windows-server/modules/finance/brand/brand.utils.service'
import { FinanceBrandController } from '@web-windows-server/modules/finance/brand/brand.controller'

@Global()
@Module({
    providers: [FinanceBrandUtilsService, FinanceBrandService],
    controllers: [FinanceBrandController],
    exports: [FinanceBrandUtilsService, FinanceBrandService]
})
export class FinanceBrandModule {}
