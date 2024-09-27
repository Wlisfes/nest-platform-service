import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/services/logger.service'
import { JwtService as Jwt } from '@nestjs/jwt'
import { Omix } from '@/interface/instance.resolver'

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
    public async fetchJwtTokenSecret<T>(
        node: Omix<T>,
        scope: Omix<{ expire?: number; message?: string; status?: number }> = {}
    ): Promise<string> {
        try {
            if (scope.expire) {
                return await this.jwt.signAsync(Object.assign(node, {}), {
                    expiresIn: scope.expire,
                    secret: this.configService.get('JWT_SECRET')
                })
            } else {
                return await this.jwt.signAsync(node, { secret: this.configService.get('JWT_SECRET') })
            }
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }
}
