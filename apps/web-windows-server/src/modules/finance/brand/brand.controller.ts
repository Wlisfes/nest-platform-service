import { Post, Body, Request } from '@nestjs/common'
import { BrandService } from '@web-windows-server/modules/finance/brand/brand.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('品牌管理', 'finance/brand')
export class BrandController {
    constructor(private readonly brandService: BrandService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '新增品牌' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceCreateBrand(@Request() request: OmixRequest, @Body() body: windows.CreateBrandOptions) {
        return await this.brandService.httpBaseFinanceCreateBrand(request, body)
    }

    @ApiServiceDecorator(Post('update'), {
        windows: true,
        operation: { summary: '编辑品牌' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateBrand(@Request() request: OmixRequest, @Body() body: windows.UpdateBrandOptions) {
        return await this.brandService.httpBaseFinanceUpdateBrand(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '品牌分页列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnBrandOptionsResponse }
    })
    public async httpBaseFinanceColumnBrand(@Request() request: OmixRequest, @Body() body: windows.ColumnBrandOptions) {
        return await this.brandService.httpBaseFinanceColumnBrand(request, body)
    }

    @ApiServiceDecorator(Post('update/status'), {
        windows: true,
        operation: { summary: '品牌状态修改' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateBrandStatus(@Request() request: OmixRequest, @Body() body: windows.UpdateBrandStatusOptions) {
        return await this.brandService.httpBaseFinanceUpdateBrandStatus(request, body)
    }

    @ApiServiceDecorator(Post('select'), {
        windows: true,
        operation: { summary: '品牌下拉列表' },
        response: { status: 200, description: 'OK', type: windows.SelectBrandOptionsResponse }
    })
    public async httpBaseFinanceSelectBrand(@Request() request: OmixRequest) {
        return await this.brandService.httpBaseFinanceSelectBrand(request)
    }
}
