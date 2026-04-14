import { Module } from '@nestjs/common'
import { BrandService } from '@web-windows-server/modules/finance/brand/brand.service'
import { BrandController } from '@web-windows-server/modules/finance/brand/brand.controller'

@Module({
    providers: [BrandService],
    controllers: [BrandController],
    exports: [BrandService]
})
export class FinanceModule {}
