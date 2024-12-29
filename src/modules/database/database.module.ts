import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from '@/modules/database/database.service'
import * as schema from '@/modules/database/database.schema'

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('ORM_HOST'),
                port: configService.get('ORM_PORT'),
                username: configService.get('ORM_USERNAME'),
                password: configService.get('ORM_PASSWORD'),
                database: configService.get('ORM_DATABASE'),
                charset: configService.get('ORM_CHARSET'),
                synchronize: true,
                entities: Object.values(schema)
            })
        })
    ],
    providers: [DatabaseService],
    exports: [DatabaseService]
})
export class DatabaseModule {}
