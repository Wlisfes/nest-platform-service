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
