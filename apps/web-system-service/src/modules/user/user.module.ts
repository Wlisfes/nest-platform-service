import { Module } from '@nestjs/common'
import { UserService } from '@web-system-service/modules/user/user.service'
import { UserController } from '@web-system-service/modules/user/user.controller'

@Module({
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
