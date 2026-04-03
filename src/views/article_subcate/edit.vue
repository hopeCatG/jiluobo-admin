<template>
    <div class="edit-popup">
        <popup ref="popupRef" :title="popupTitle" :async="true" width="550px" @confirm="handleSubmit"
            @close="handleClose">
            <el-form ref="formRef" :model="formData" label-width="140px" :rules="formRules">
                <el-form-item label="归属洲" prop="article_cate_id">
                    <el-select v-model="formData.article_cate_id">
                        <el-option label="请选择归属洲" value />
                        <el-option v-for="item in optionsData.article_cate" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="区域/子分类代码" prop="code">
                    <el-input v-model="formData.code" clearable placeholder="请输入区域/子分类代码" />
                </el-form-item>
                <el-form-item label="区域名称" prop="name">
                    <el-input v-model="formData.name" clearable placeholder="请输入区域名称" />
                </el-form-item>
                <el-form-item label="区域英文名称" prop="name_en">
                    <el-input v-model="formData.name_en" clearable placeholder="请输入区域英文名称" />
                </el-form-item>
                <el-form-item label="图标" prop="flag">
                    <material-picker v-model="formData.flag" />
                </el-form-item>
                <el-form-item label="是否显示" prop="is_show">
                    <el-radio-group v-model="formData.is_show" placeholder="请选择是否显示">
                        <el-radio v-for="(item, index) in dictData.yes_no" :key="index" :label="parseInt(item.value)">
                            {{ item.name }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="articleSubcateEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { useDictOptions } from '@/hooks/useDictOptions'
import { articleCateAll } from '@/api/article'

import { apiArticleSubcateAdd, apiArticleSubcateEdit, apiArticleSubcateDetail } from '@/api/article_subcate'
import { timeFormat } from '@/utils/util'
import type { PropType } from 'vue'
defineProps({
    dictData: {
        type: Object as PropType<Record<string, any[]>>,
        default: () => ({})
    }
})
const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')
const { optionsData } = useDictOptions<{
    article_cate: any[]
}>({
    article_cate: {
        api: articleCateAll
    }
})


// 弹窗标题
const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑文章子分类表' : '新增文章子分类表'
})

// 表单数据
const formData = reactive({
    id: '',
    article_cate_id: '',
    code: '',
    name: '',
    name_en: '',
    flag: '',
    is_show: '',
})


// 表单验证
const formRules = reactive<any>({
    article_cate_id: [{
        required: true,
        message: '请输入对应父表 admin_article_cate.id',
        trigger: ['blur']
    }]
})


// 获取详情
const setFormData = async (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
            //@ts-ignore
            formData[key] = data[key]
        }
    }


}

const getDetail = async (row: Record<string, any>) => {
    const data = await apiArticleSubcateDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData, }
    mode.value == 'edit'
        ? await apiArticleSubcateEdit(data)
        : await apiArticleSubcateAdd(data)
    popupRef.value?.close()
    emit('success')
}

//打开弹窗
const open = (type = 'add') => {
    mode.value = type
    popupRef.value?.open()
}

// 关闭回调
const handleClose = () => {
    emit('close')
}



defineExpose({
    open,
    setFormData,
    getDetail
})
</script>
