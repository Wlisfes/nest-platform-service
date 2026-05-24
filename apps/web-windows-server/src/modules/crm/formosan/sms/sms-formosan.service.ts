import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, SmsService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'
import dayjs from 'dayjs'

@Injectable()
export class SmsFormosanService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly smsService: SmsService,
        private readonly windows: WindowsService
    ) {
        super()
    }

    /**阶段一：初始化草稿**/
    @AutoDescriptor
    public async httpSmsFormosanDraftInit(request: OmixRequest, body: windows.SmsFormosanDraftInitOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证客户存在**/
            await this.database.empty(this.windows.clientOptions, {
                request,
                message: '客户不存在',
                dispatch: { where: { keyId: body.clientId } }
            })
            /**验证应用存在且属于该客户**/
            await this.database.empty(this.smsService.tbSmsAppOptions, {
                request,
                message: '应用不存在或不属于该客户',
                dispatch: { where: { appId: body.appId, clientId: body.clientId } }
            })
            /**清除该客户+应用的所有旧草稿**/
            await this.database.delete(this.smsService.tbSmsAppFormosanDraftOptions, {
                request,
                stack: this.stack,
                where: { clientId: body.clientId, appId: body.appId } as Omix
            })
            /**根据keyId批量查询国家/地区信息**/
            const countrys = await this.windows.countryOptions.find({
                where: body.items.map(keyId => ({ keyId }))
            })
            if (countrys.length === 0) {
                throw new HttpException('未找到对应的国家/地区信息', HttpStatus.BAD_REQUEST)
            }
            /**批量查询该客户+应用下所有已有报价**/
            const formosans = await this.smsService.tbSmsAppFormosanOptions.find({
                where: { clientId: body.clientId, appId: body.appId }
            })
            /**批量查询所有相关基础价格**/
            const codes = countrys.map(c => c.code)
            const basicRates = codes.length > 0 ? await this.windows.basicSmsRateOptions.find({ where: codes.map(code => ({ code })) }) : []
            /**构建所有草稿数据**/
            const drafts = countrys.map(country => {
                const formosan = formosans.find(f => f.code === country.code && f.mcc === country.mcc)
                if (formosan) {
                    return {
                        clientId: body.clientId,
                        appId: body.appId,
                        code: country.code,
                        mcc: country.mcc,
                        upUsd: formosan.upUsd,
                        downUsd: formosan.downUsd,
                        effectiveTime: formosan.effectiveTime,
                        expiryTime: formosan.expiryTime,
                        source: enums.CHUNK_SMS_FORMOSAN_SOURCE.existing.value,
                        formosanId: formosan.keyId,
                        status: enums.CHUNK_CLIENT_STATUS.enable.value,
                        createBy: request.user.uid
                    }
                } else {
                    const basicRate = basicRates.find(r => r.code === country.code && r.mcc === country.mcc)
                    return {
                        clientId: body.clientId,
                        appId: body.appId,
                        code: country.code,
                        mcc: country.mcc,
                        upUsd: basicRate?.upUsd ?? 0,
                        downUsd: basicRate?.downUsd ?? 0,
                        source: enums.CHUNK_SMS_FORMOSAN_SOURCE.addition.value,
                        status: enums.CHUNK_CLIENT_STATUS.enable.value,
                        createBy: request.user.uid
                    }
                }
            })
            /**批量插入草稿**/
            await this.database.insert(ctx.manager.getRepository(schema.TbSmsAppFormosanDraft), {
                request,
                stack: this.stack,
                body: drafts as any
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '草稿初始化成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**阶段二：草稿分页列表**/
    @AutoDescriptor
    public async httpSmsFormosanDraftColumn(request: OmixRequest, body: windows.SmsFormosanDraftColumnOptions) {
        try {
            return await this.database.builder(this.smsService.tbSmsAppFormosanDraftOptions, async qb => {
                qb.where(`t.clientId = :clientId`, { clientId: body.clientId })
                qb.andWhere(`t.appId = :appId`, { appId: body.appId })
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }

    /**阶段二：修改单条草稿**/
    @AutoDescriptor
    public async httpSmsFormosanDraftUpdate(request: OmixRequest, body: windows.SmsFormosanDraftUpdateOptions) {
        try {
            await this.database.empty(this.smsService.tbSmsAppFormosanDraftOptions, {
                request,
                message: '草稿记录不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            const updateBody: Omix = {}
            if (isNotEmpty(body.upUsd)) updateBody.upUsd = body.upUsd
            if (isNotEmpty(body.downUsd)) updateBody.downUsd = body.downUsd
            if (isNotEmpty(body.effectiveTime)) updateBody.effectiveTime = body.effectiveTime
            if (body.expiryTime !== undefined) updateBody.expiryTime = body.expiryTime
            if (isNotEmpty(body.status)) updateBody.status = body.status
            await this.database.update(this.smsService.tbSmsAppFormosanDraftOptions, {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: updateBody
            })
            return await this.fetchResolver({ message: '修改成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }

    /**阶段二：删除单条草稿**/
    @AutoDescriptor
    public async httpSmsFormosanDraftDelete(request: OmixRequest, body: windows.SmsFormosanDraftDeleteOptions) {
        try {
            await this.database.empty(this.smsService.tbSmsAppFormosanDraftOptions, {
                request,
                message: '草稿记录不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.delete(this.smsService.tbSmsAppFormosanDraftOptions, {
                request,
                stack: this.stack,
                where: { keyId: body.keyId }
            })
            return await this.fetchResolver({ message: '删除成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }

    /**阶段三：预览报价**/
    @AutoDescriptor
    public async httpSmsFormosanPreview(request: OmixRequest, body: windows.SmsFormosanPreviewOptions) {
        try {
            const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
            /**查询所有草稿**/
            const drafts = await this.smsService.tbSmsAppFormosanDraftOptions.find({
                where: { clientId: body.clientId, appId: body.appId }
            })
            /**查询已生效的正式报价**/
            const actives = await this.database.builder(this.smsService.tbSmsAppFormosanOptions, async qb => {
                qb.where(`t.clientId = :clientId`, { clientId: body.clientId })
                qb.andWhere(`t.appId = :appId`, { appId: body.appId })
                qb.andWhere(`t.status = :status`, { status: enums.CHUNK_CLIENT_STATUS.enable.value })
                qb.andWhere(`t.effectiveTime <= :now`, { now })
                qb.andWhere(`(t.expiryTime IS NULL OR t.expiryTime > :now)`, { now })
                return await qb.getMany()
            })
            /**计算汇总统计**/
            const additionDrafts = drafts.filter(d => d.source === enums.CHUNK_SMS_FORMOSAN_SOURCE.addition.value)
            const existingDrafts = drafts.filter(d => d.source === enums.CHUNK_SMS_FORMOSAN_SOURCE.existing.value)
            let priceUpCount = 0
            let priceDownCount = 0
            /**对比existing草稿与原报价的价格变化**/
            for (const draft of existingDrafts) {
                if (isNotEmpty(draft.formosanId)) {
                    const original = actives.find((a: Omix) => a.keyId === draft.formosanId)
                    if (original) {
                        if (draft.upUsd > original.upUsd || draft.downUsd > original.downUsd) {
                            priceUpCount++
                        } else if (draft.upUsd < original.upUsd || draft.downUsd < original.downUsd) {
                            priceDownCount++
                        }
                    }
                }
            }
            const summary: windows.SmsFormosanPreviewSummary = {
                totalCount: drafts.length,
                additionCount: additionDrafts.length,
                existingCount: existingDrafts.length,
                scheduledCount: drafts.filter(d => isNotEmpty(d.effectiveTime) && dayjs(d.effectiveTime).isAfter(now)).length,
                priceUpCount,
                priceDownCount
            }
            return await this.fetchResolver({ drafts, actives, summary })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }

    /**阶段四：发布报价**/
    @AutoDescriptor
    public async httpSmsFormosanPublish(request: OmixRequest, body: windows.SmsFormosanPublishOptions) {
        const ctx = await this.database.transaction()
        try {
            const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
            /**查询所有草稿**/
            const drafts = await this.smsService.tbSmsAppFormosanDraftOptions.find({
                where: { clientId: body.clientId, appId: body.appId }
            })
            if (drafts.length === 0) {
                throw new HttpException('没有待发布的草稿数据', HttpStatus.BAD_REQUEST)
            }
            const formosanRepo = ctx.manager.getRepository(schema.TbSmsAppFormosan)
            const draftRepo = ctx.manager.getRepository(schema.TbSmsAppFormosanDraft)
            for (const draft of drafts) {
                if (draft.source === enums.CHUNK_SMS_FORMOSAN_SOURCE.existing.value && isNotEmpty(draft.formosanId)) {
                    /**已有报价：将原记录设为失效，创建新记录保留历史**/
                    await formosanRepo.update({ keyId: draft.formosanId }, { expiryTime: now as any })
                    if (draft.status !== enums.CHUNK_CLIENT_STATUS.disable.value) {
                        await this.database.create(formosanRepo, {
                            request,
                            stack: this.stack,
                            body: {
                                clientId: draft.clientId,
                                appId: draft.appId,
                                code: draft.code,
                                mcc: draft.mcc,
                                upUsd: draft.upUsd,
                                downUsd: draft.downUsd,
                                effectiveTime: draft.effectiveTime ?? now,
                                expiryTime: draft.expiryTime,
                                status: enums.CHUNK_CLIENT_STATUS.enable.value
                            }
                        })
                    }
                } else {
                    /**新增报价：直接创建formosan记录**/
                    if (draft.status !== enums.CHUNK_CLIENT_STATUS.disable.value) {
                        await this.database.create(formosanRepo, {
                            request,
                            stack: this.stack,
                            body: {
                                clientId: draft.clientId,
                                appId: draft.appId,
                                code: draft.code,
                                mcc: draft.mcc,
                                upUsd: draft.upUsd,
                                downUsd: draft.downUsd,
                                effectiveTime: draft.effectiveTime ?? now,
                                expiryTime: draft.expiryTime,
                                status: enums.CHUNK_CLIENT_STATUS.enable.value
                            }
                        })
                    }
                }
            }
            /**清除草稿**/
            await draftRepo.delete({ clientId: body.clientId, appId: body.appId } as Omix)
            await ctx.commitTransaction()

            /**事务后：发送邮件（异步，不阻塞响应）**/
            this.sendFormosanEmail(request, body).catch(err => {
                this.logger.error({ message: '报价邮件发送失败', error: err.message })
            })

            return await this.fetchResolver({ message: '报价发布成功' })
        } catch (err) {
            await ctx.rollbackTransaction()
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**发送报价邮件（含XLSX附件）**/
    private async sendFormosanEmail(request: OmixRequest, body: windows.SmsFormosanPublishOptions) {
        try {
            const ExcelJS = require('exceljs')
            const nodemailer = require('nodemailer')

            /**查询客户信息**/
            const client = await this.windows.clientOptions.findOne({
                where: { keyId: body.clientId }
            })
            if (!client || !client.email) {
                this.logger.info({ message: '客户邮箱为空，跳过发送报价邮件', clientId: body.clientId })
                return
            }

            /**查询该客户+应用的所有生效报价**/
            const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
            const formosans = await this.database.builder(this.smsService.tbSmsAppFormosanOptions, async qb => {
                qb.where(`t.clientId = :clientId`, { clientId: body.clientId })
                qb.andWhere(`t.appId = :appId`, { appId: body.appId })
                qb.andWhere(`t.status = :status`, { status: enums.CHUNK_CLIENT_STATUS.enable.value })
                qb.andWhere(`(t.expiryTime IS NULL OR t.expiryTime > :now)`, { now })
                qb.orderBy('t.code', 'ASC')
                return await qb.getMany()
            })

            /**生成XLSX**/
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('SMS Pricing')
            worksheet.columns = [
                { header: 'Country Code', key: 'code', width: 15 },
                { header: 'MCC', key: 'mcc', width: 10 },
                { header: 'MO Price (USD)', key: 'upUsd', width: 18 },
                { header: 'MT Price (USD)', key: 'downUsd', width: 18 },
                { header: 'Effective Time', key: 'effectiveTime', width: 22 },
                { header: 'Expiry Time', key: 'expiryTime', width: 22 }
            ]
            for (const item of formosans) {
                worksheet.addRow({
                    code: item.code,
                    mcc: item.mcc,
                    upUsd: (item.upUsd / 1000000).toFixed(6),
                    downUsd: (item.downUsd / 1000000).toFixed(6),
                    effectiveTime: item.effectiveTime ?? '',
                    expiryTime: item.expiryTime ?? 'Permanent'
                })
            }
            const buffer = await workbook.xlsx.writeBuffer()

            /**发送邮件**/
            // TODO: 邮件模板暂定，后续完善
            const transporter = nodemailer.createTransport({
                host: process.env.NODE_MAIL_HOST,
                port: Number(process.env.NODE_MAIL_PORT ?? 465),
                secure: true,
                auth: {
                    user: process.env.NODE_MAIL_USER,
                    pass: process.env.NODE_MAIL_PASS
                }
            })
            await transporter.sendMail({
                from: process.env.NODE_MAIL_USER,
                to: client.email,
                subject: `SMS Pricing - ${client.name}`,
                html:
                    body.mailContent || `<p>Dear ${client.name},</p><p>Please find the attached SMS pricing sheet.</p><p>Best regards</p>`,
                attachments: [
                    {
                        filename: `SMS_Pricing_${body.appId}_${dayjs().format('YYYYMMDD')}.xlsx`,
                        content: buffer,
                        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                ]
            })
            this.logger.info({ message: '报价邮件发送成功', clientId: body.clientId, email: client.email })
        } catch (err) {
            this.logger.error({ message: '报价邮件发送异常', error: err.message })
            throw err
        }
    }
}
