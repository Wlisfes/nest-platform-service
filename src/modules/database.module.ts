import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { forEntities } from '@/entities/instance'

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    type: config.get('ORM_TYPE'),
                    host: config.get('ORM_HOST'),
                    port: config.get('ORM_PORT'),
                    username: config.get('ORM_USERNAME'),
                    password: config.get('ORM_PASSWORD'),
                    database: config.get('ORM_DATABASE'),
                    charset: config.get('ORM_CHARSET'),
                    synchronize: true,
                    entities: forEntities
                } as TypeOrmModuleOptions
            }
        }),
        TypeOrmModule.forFeature(forEntities)
    ],
    providers: [],
    exports: []
})
export class DatabaseModule {}
