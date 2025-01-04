import { Module } from '@nestjs/common'
import { UserService } from '@web-common-service/modules/user/user.service'
import { UserController } from '@web-common-service/modules/user/user.controller'

@Module({
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
