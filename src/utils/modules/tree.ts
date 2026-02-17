import { fromList, toList, findNode, findPath, filter } from 'tree-tool'

/**
 * 列表转树结构
 * @param data 列表数据
 * @param options 配置项 { id: 主键字段, pid: 父级字段 }
 * @returns 树结构数据
 */
export function fetchTreeFromList<T extends Omix>(data: Array<T>, options?: Omix<{ id?: string; pid?: string }>): Array<T> {
    return fromList(data, options) as Array<T>
}

/**
 * 树结构转列表
 * @param data 树结构数据
 * @param options 配置项
 * @returns 列表数据
 */
export function fetchTreeToList<T extends Omix>(data: Array<T>, options?: Omix): Array<T> {
    return toList(data, options) as Array<T>
}

/**
 * 查找树节点
 * @param data 树结构数据
 * @param callback 查找条件回调
 * @returns 匹配的节点
 */
export function fetchTreeFindNode<T extends Omix>(data: Array<T>, callback: (node: T) => boolean): T | null {
    return findNode(data, callback) as T | null
}

/**
 * 查找树节点路径
 * @param data 树结构数据
 * @param callback 查找条件回调
 * @returns 匹配的节点路径
 */
export function fetchTreeFindPath<T extends Omix>(data: Array<T>, callback: (node: T) => boolean): Array<T> | null {
    return findPath(data, callback) as Array<T> | null
}

/**
 * 过滤树节点
 * @param data 树结构数据
 * @param callback 过滤条件回调
 * @returns 过滤后的树结构数据
 */
export function fetchTreeFilter<T extends Omix>(data: Array<T>, callback: (node: T) => boolean): Array<T> {
    return filter(data, callback) as Array<T>
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
