import { Module } from '@nestjs/common'
import { ChunkController } from '@web-windows-server/modules/chunk/chunk.controller'
import { ChunkService } from '@web-windows-server/modules/chunk/chunk.service'

@Module({
    providers: [ChunkService],
    controllers: [ChunkController],
    exports: [ChunkService]
})
export class ChunkModule {}
