import { Module, Global, DynamicModule } from '@nestjs/common'
import { isNotEmpty } from 'class-validator'
import { WinstonModule } from 'nest-winston'
import { Logger } from '@/modules/logger/logger.service'
import * as utils from '@/utils/utils-common'
import * as winston from 'winston'
import * as chalk from 'chalk'
import 'winston-daily-rotate-file'

@Global()
@Module({
    providers: [Logger],
    exports: [Logger]
})
export class LoggerModule {
    public static forRoot(option: { name: string }): DynamicModule {
        return {
            module: LoggerModule,
            imports: [
                WinstonModule.forRoot({
                    transports: [
                        new winston.transports.DailyRotateFile({
                            level: 'debug',
                            dirname: `logs/${option.name.toLowerCase()}`, // 日志保存的目录
                            filename: '%DATE%.log', // 日志名称，占位符 %DATE% 取值为 datePattern 值。
                            datePattern: 'YYYY-MM-DD', // 日志轮换的频率，此处表示每天。
                            zippedArchive: true, // 是否通过压缩的方式归档被轮换的日志文件。
                            maxSize: '20m', // 设置日志文件的最大大小，m 表示 mb 。
                            maxFiles: '30d', // 保留日志文件的最大天数，此处表示自动删除超过30天的日志文件。
                            //prettier-ignore
                            format: winston.format.combine(
                                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
                                winston.format.json(),
                                winston.format.printf(data => {
                                    const name = chalk.hex('#ff5c93')(`服务名称:[${option.name}]`)
                                    const pid = chalk.hex('#fc5404 ')(`服务进程:[${process.pid}]`)
                                    const timestamp = chalk.hex('#fb9300')(`${data.timestamp}`)
                                    const message = chalk.hex('#ff3d68')(`执行方法:[${data.message}]`)
                                    const contextId = utils.fetchCaseWherer(Boolean(data.context), {
                                        value: chalk.hex("#536dfe")(`日志ID:[${data.context?? ''}]`),
                                        defaultValue: ""
                                    })
                                    const level = utils.fetchCaseWherer(data.level === 'error', {
                                        value: chalk.red('ERROR'),
                                        fallback: chalk.green(data.level.toUpperCase())
                                    })
                                    const duration = utils.fetchCaseWherer(isNotEmpty(data.duration), {
                                        value: chalk.hex('#ff3d68')(`耗时:${data.duration ?? '[]'}`),
                                        defaultValue: ''
                                    })
                                    const module = [name, pid, timestamp, level, contextId, message].filter(isNotEmpty).join(`  `)
                                    if (['LoggerMiddleware'].includes(data.message)) {
                                        /**中间件日志**/
                                        const url = utils.fetchCaseWherer(Boolean(data.log.url), { value: chalk.hex('#fc5404')(`接口地址:[${data.log.url ?? ''}]`, ''), defaultValue: '' })
                                        const text = Object.keys(data.log ?? {}).reduce((current, key) => {
                                            return (current += `	"${key.toString()}": ${JSON.stringify(data.log[key.toString()])}, \n`)
										}, '')
                                        console[data.level](`${module}  ${url}  ${duration}`, { ...data.log })
                                        return `服务名称:[${option.name}]  服务进程:[${process.pid}]  ${data.timestamp}  ${data.level.toUpperCase()}  上下文ID:[${data.context ?? ''}]  执行方法:[${data.message}]  接口地址:${data.log.url}  耗时:${data.duration}  {\n${text}}`
                                    } else if(typeof data.log === 'string') {
                                        console[data.level](`${module}  ${duration}  {\n    log: ${chalk.red(data.log)}\n}`)
                                        return `服务名称:[${option.name}] ${process.pid} ${data.timestamp} ${data.level.toUpperCase()}  上下文ID:[${data.context ?? ''}]  执行方法:[${data.message}]  耗时:${data.duration}  {\n    "log": ${data.log}\n}`
                                    } else {
                                        const text = Object.keys(data.log ?? {}).reduce((current, key) => {
                                            return (current += `	"${key.toString()}": ${JSON.stringify(data.log[key.toString()])}, \n`)
										}, '')
                                        console[data.level](`${module}  ${duration}`, { ...data.log })
                                        return `服务名称:[${option.name}]  服务进程:[${process.pid}]  ${data.timestamp}  ${data.level.toUpperCase()}  上下文ID:[${data.context ?? ''}]  执行方法:[${data.message}]  耗时:${data.duration}  {\n${text}}`
                                    }
                                })
                            )
                        })
                    ]
                })
            ]
        }
    }
}
