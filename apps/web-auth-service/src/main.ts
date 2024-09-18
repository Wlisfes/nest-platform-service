import { NestFactory } from '@nestjs/core'
import { WebAuthModule } from '@web-auth-service/web-auth.module'

async function bootstrap() {
    const app = await NestFactory.create(WebAuthModule)
    await app.listen(4080).then(() => {
        console.log('[web-auth-service]基础授权服务启动:', `http://localhost:4080`)
    })
}
bootstrap()
