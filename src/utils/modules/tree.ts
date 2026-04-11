import * as tree from 'tree-tool'

/**
 * 列表转树结构
 * @param data 列表数据
 * @param options 配置项 { id: 主键字段, pid: 父级字段 }
 * @returns 树结构数据
 */
export function fetchTreeFromList<T extends Omix>(data: Array<T>, options?: Omix<{ id?: string; pid?: string }>): Array<T> {
    return tree.fromList(data, options) as Array<T>
}

/**
 * 树结构转列表
 * @param data 树结构数据
 * @param options 配置项
 * @returns 列表数据
 */
export function fetchTreeToList<T extends Omix>(data: Array<T>, options?: Omix): Array<T> {
    return tree.toList(data, options) as Array<T>
}

/**
 * 查找树节点
 * @param data 树结构数据
 * @param callback 查找条件回调
 * @returns 匹配的节点
 */
export function fetchTreeFindNode<T extends Omix>(data: Array<T>, callback: (node: T) => boolean): T | null {
    return tree.findNode(data, callback) as T | null
}

/**
 * 查找树节点路径
 * @param data 树结构数据
 * @param callback 查找条件回调
 * @returns 匹配的节点路径
 */
export function fetchTreeFindPath<T extends Omix>(data: Array<T>, callback: (node: T) => boolean): Array<T> | null {
    return tree.findPath(data, callback) as Array<T> | null
}

/**
 * 过滤树节点
 * @param data 树结构数据
 * @param callback 过滤条件回调
 * @returns 过滤后的树结构数据
 */
export function fetchTreeFilter<T extends Omix>(data: Array<T>, callback: (node: T) => boolean): Array<T> {
    return tree.filter(data, callback) as Array<T>
}

/**
 * 移除空数据children字段
 * @param data 树结构数据
 * @returns 处理后的树结构数据
 */
export function fetchTreeNodeBlock<T extends Omix>(data: Array<T>, options: Omix<{ next: boolean }> = { next: true }): Array<T> {
    if (!options.next) {
        return data
    }
    data.forEach((node: Omix) => {
        if (node.children && node.children.length > 0) {
            return fetchTreeNodeBlock(node.children, options)
        } else if (node.children && node.children.length === 0) {
            return delete node.children
        }
    })
    return data
}

/**
 * 递归过滤禁用节点及其子树，可选收集指定节点值
 * @param data 树结构数据
 * @param options 配置项
 *   - status: 禁用状态值，匹配的节点及其子树将被移除
 *   - collect: 可选，收集回调函数，返回需要收集的值
 * @returns collect 为空时返回过滤后的树，否则返回收集的值数组
 */
export function fetchTreeFilterDisabled<T extends Omix, R = T>(
    data: Array<T>,
    options: { status: string; collect?: (node: T) => R | undefined }
): Array<R> {
    const { status, collect } = options
    const filterNodes = (list: Array<T>): Array<T> => {
        return list.reduce((result: Array<T>, node: Omix) => {
            if (node.status === status) {
                return result
            }
            if (node.children && node.children.length > 0) {
                node.children = filterNodes(node.children)
            }
            return [...result, node as T]
        }, [])
    }
    const filtered = filterNodes(data)
    if (!collect) {
        return filtered as unknown as Array<R>
    }
    const collectValues = (list: Array<T>): Array<R> => {
        return list.reduce((result: Array<R>, node: Omix) => {
            const value = collect(node as T)
            if (value !== undefined) {
                result.push(value)
            }
            if (node.children && node.children.length > 0) {
                result.push(...collectValues(node.children))
            }
            return result
        }, [])
    }
    return collectValues(filtered)
}
