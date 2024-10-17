import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/services/logger.service'
import { JwtService as Jwt } from '@nestjs/jwt'
import { Omix } from '@/interface/instance.resolver'

export interface BodySecret extends Omix {
    expires?: number
    message?: string
    status?: number
}
export interface RestSecret extends Omix {
    expires: number
    token: string
    secret: string
}

@Injectable()
export class JwtService extends LoggerService {
    constructor(private readonly configService: ConfigService, private readonly jwt: Jwt) {
        super()
    }

    /**jwtToken解析**/
    public async fetchJwtTokenParser<T>(token: string, scope: Omix<{ message?: string; status?: number }> = {}): Promise<T> {
        try {
            return (await this.jwt.verifyAsync(token, { secret: this.configService.get('JWT_SECRET') })) as T
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }

    /**jwtToken加密**/
    public async fetchJwtTokenSecret<T>(node: Omix<T>, scope: BodySecret = {}): Promise<RestSecret> {
        try {
            const jwtSecret = this.configService.get('JWT_SECRET')
            const expires = scope.expires ?? 7200
            const dateTime = new Date().getTime()
            const token = await this.jwt.signAsync({ ...node, dateTime, auth: 'token' }, { expiresIn: expires, secret: jwtSecret })
            const secret = await this.jwt.signAsync({ ...node, dateTime, auth: 'secret' }, { expiresIn: expires * 2, secret: jwtSecret })
            return { expires, token, secret }
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }
}
