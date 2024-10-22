/**字典状态**/
export enum SimpleStatus {
    /**启用**/
    enable = 'enable',
    /**禁用**/
    disable = 'disable'
}

/**字典类型**/
export enum SimpleStalk {
    STALK_POST = 'SIMPLE_STALK_POST',
    STALK_RANK = 'SIMPLE_STALK_RANK'
}
/**字典类型描述**/
export const SimpleMapStalk = {
    [SimpleStalk.STALK_POST]: '职位',
    [SimpleStalk.STALK_RANK]: '职级'
}
