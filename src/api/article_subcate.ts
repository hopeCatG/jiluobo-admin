import request from '@/utils/request'

// 文章子分类表列表
export function apiArticleSubcateLists(params: any) {
    return request.get({ url: '/subcate.article_subcate/lists', params })
}

// 添加文章子分类表
export function apiArticleSubcateAdd(params: any) {
    return request.post({ url: '/subcate.article_subcate/add', params })
}

// 编辑文章子分类表
export function apiArticleSubcateEdit(params: any) {
    return request.post({ url: '/subcate.article_subcate/edit', params })
}

// 删除文章子分类表
export function apiArticleSubcateDelete(params: any) {
    return request.post({ url: '/subcate.article_subcate/delete', params })
}

// 文章子分类表详情
export function apiArticleSubcateDetail(params: any) {
    return request.get({ url: '/subcate.article_subcate/detail', params })
}