import request from '@/utils/request'

// 官网咨询表列表
export function apiConsultLists(params: any) {
    return request.get({ url: '/consultation.consult/lists', params })
}

// 添加官网咨询表
export function apiConsultAdd(params: any) {
    return request.post({ url: '/consultation.consult/add', params })
}

// 编辑官网咨询表
export function apiConsultEdit(params: any) {
    return request.post({ url: '/consultation.consult/edit', params })
}

// 删除官网咨询表
export function apiConsultDelete(params: any) {
    return request.post({ url: '/consultation.consult/delete', params })
}

// 官网咨询表详情
export function apiConsultDetail(params: any) {
    return request.get({ url: '/consultation.consult/detail', params })
}