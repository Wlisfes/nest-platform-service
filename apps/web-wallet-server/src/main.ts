import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from '@web-wallet-server/app.module'
import { closeHotModule, setupHotModule } from '@/utils/modules/hmr'

declare const module: any

async function bootstrap() {
    await closeHotModule(module).then(async () => {
        const app = await NestFactory.create<NestExpressApplication>(AppModule)
        await app.listen(process.env.NODE_WEB_WALLET_PORT).then(() => {
            console.log(`ChatBook管理平台钱包扣费服务启动[${process.env.NODE_ENV}]:`, `http://localhost:${process.env.NODE_WEB_WALLET_PORT}`)
        })
        return setupHotModule(module, app)
    })
}
bootstrap()
