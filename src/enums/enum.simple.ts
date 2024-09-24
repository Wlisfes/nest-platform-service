/**字典状态**/
export enum SimpleState {
    /**启用**/
    enable = 'enable',
    /**禁用**/
    disable = 'disable',
    /**删除**/
    delete = 'delete'
}

/**字典类型**/
export enum SimpleStalk {
    post = 'post',
    rank = 'rank'
}
/**字典类型描述**/
export const SimpleMapStalk = {
    [SimpleStalk.post]: '职位',
    [SimpleStalk.rank]: '职级'
}
