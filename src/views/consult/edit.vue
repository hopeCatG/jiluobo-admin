<template>
    <div class="edit-popup">
        <popup
            ref="popupRef"
            :title="popupTitle"
            :async="true"
            width="550px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <el-form ref="formRef" :model="formData" label-width="140px" :rules="formRules">
                <el-form-item label="主题" prop="theme">
                    <el-input v-model="formData.theme" disabled clearable placeholder="请输入主题" />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="formData.name" disabled clearable placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" disabled clearable placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="formData.mobile" disabled clearable placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="咨询内容" prop="content">
                    <el-input type="textarea" disabled v-model="formData.content" clearable placeholder="请输入咨询内容" />
                </el-form-item>
                <el-form-item label="咨询类型" prop="type">
                    <el-select class="flex-1" disabled v-model="formData.type" clearable placeholder="请选择咨询类型">
                        <el-option 
                            v-for="(item, index) in dictData.consultation_type"
                            :key="index" 
                            :label="item.name"
                            :value="parseInt(item.value)"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="处理状态" prop="status">
                    <el-radio-group v-model="formData.status" placeholder="请选择处理状态">
                        <el-radio 
                            v-for="(item, index) in dictData.consultation_status"
                            :key="index"
                            :label="parseInt(item.value)"
                        >
                            {{ item.name }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="consultEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiConsultAdd, apiConsultEdit, apiConsultDetail } from '@/api/consult'
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


// 弹窗标题
const popupTitle = computed(() => {
    return mode.value == 'edit' ? '处理咨询' : '新增咨询'
})

// 表单数据
const formData = reactive({
    id: '',
    theme: '',
    name: '',
    email: '',
    mobile: '',
    content: '',
    type: '',
    status: '',
})


// 表单验证
const formRules = reactive<any>({
    theme: [{
        required: true,
        message: '请输入主题',
        trigger: ['blur']
    }],
    name: [{
        required: true,
        message: '请输入姓名',
        trigger: ['blur']
    }],
    email: [{
        required: true,
        message: '请输入邮箱',
        trigger: ['blur']
    }],
    mobile: [{
        required: true,
        message: '请输入手机号',
        trigger: ['blur']
    }],
    content: [{
        required: true,
        message: '请输入咨询内容',
        trigger: ['blur']
    }],
    type: [{
        required: true,
        message: '请选择咨询类型',
        trigger: ['blur']
    }],
    status: [{
        required: true,
        message: '请选择处理状态',
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
    const data = await apiConsultDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData,  }
    mode.value == 'edit' 
        ? await apiConsultEdit(data) 
        : await apiConsultAdd(data)
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
