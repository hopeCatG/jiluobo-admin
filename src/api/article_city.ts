import request from '@/utils/request'

// 城市表列表
export function apiArticleCityLists(params: any) {
    return request.get({ url: '/city.article_city/lists', params })
}

// 添加城市表
export function apiArticleCityAdd(params: any) {
    return request.post({ url: '/city.article_city/add', params })
}

// 编辑城市表
export function apiArticleCityEdit(params: any) {
    return request.post({ url: '/city.article_city/edit', params })
}

// 删除城市表
export function apiArticleCityDelete(params: any) {
    return request.post({ url: '/city.article_city/delete', params })
}

// 城市表详情
export function apiArticleCityDetail(params: any) {
    return request.get({ url: '/city.article_city/detail', params })
}