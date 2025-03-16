import { omit } from 'lodash'

export const documentOptions = [
    {
        name: 'web-common-service',
        swaggerVersion: '1.0.0',
        prefix: '/api/common',
        baseUrl: `http://localhost:3010`,
        url: `/api/swagger-json`,
        location: `/api/swagger`
    },
    {
        name: 'web-system-service',
        swaggerVersion: '1.0.0',
        prefix: '/api/system',
        baseUrl: `http://localhost:3020`,
        url: `/api/swagger-json`,
        location: `/api/swagger`
    }
]

export const knife4jOption = documentOptions.map(item => {
    return Object.assign(omit(item, ['prefix', 'baseUrl']), {
        url: `${item.baseUrl}${item.url}`,
        location: `${item.baseUrl}${item.location}`
    })
})
