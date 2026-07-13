<template>
    <div class="edit-popup">
        <popup ref="popupRef" :title="popupTitle" :async="true" width="550px" @confirm="handleSubmit"
            @close="handleClose">
            <el-form ref="formRef" :model="formData" label-width="140px" :rules="formRules">
                <el-form-item label="五大洲" prop="cid">
                    <el-select v-model="formData.cid" placeholder="请选择五大洲" clearable @change="getArticleSubcateList">
                        <el-option v-for="item in optionsData.article_cate" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="区域" prop="region_id">
                    <el-select v-model="formData.region_id" placeholder="请选择区域" clearable>
                        <el-option v-for="item in articleSubcateList" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="网点名" prop="city_name">
                    <el-input v-model="formData.city_name" clearable placeholder="请输入网点名" />
                </el-form-item>
                <el-form-item label="经纬度" prop="lat_lng">
                    <location-input v-model="formData.lat_lng" />
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="articleCityEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
// @ts-ignore
import LocationInput from '@/components/LocationInput/index.vue'
import { apiArticleCityAdd, apiArticleCityEdit, apiArticleCityDetail } from '@/api/article_city'
import { articleCateAll } from '@/api/article'
import { apiArticleSubcateLists } from '@/api/article_subcate'
import { useDictOptions } from '@/hooks/useDictOptions'
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
    return mode.value == 'edit' ? '编辑城市表' : '新增城市表'
})

// 表单数据
const formData = reactive({
    id: '',
    cid: '',
    region_id: '',
    city_name: '',
    address:'',
    lat_lng: '',
}) as any;


// 表单验证
const formRules = reactive<any>({
    cid: [{
        required: true,
        message: '请选择文章栏目',
        trigger: ['blur']
    }],
    city_name: [{
        required: true,
        message: '请输入网点名',
        trigger: ['blur']
    }]
})


const articleSubcateList = ref([])

const getArticleSubcateList = async () => {
    const data = await apiArticleSubcateLists({
        article_cate_id: formData.cid,
        page_no: 1,
        page_size: 1000
    })
    articleSubcateList.value = data?.lists || []
}

const { optionsData } = useDictOptions<{
    article_cate: any[]
}>({
    article_cate: {
        api: articleCateAll
    }
})

// 获取详情
const setFormData = async (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
            //@ts-ignore
            if (key === 'region') {
                let obj = JSON.parse(data['latLng']);
                formData.region = {
                    address: data.address,
                    lat: obj.coordinates[1],
                    lng: obj.coordinates[0]
                }
            } else if (key === 'cid') {
                formData[key] = Number(data[key])
                getArticleSubcateList()
            } else {
                formData[key] = data[key]
            }
        }
    }


}

const getDetail = async (row: Record<string, any>) => {
    const data = await apiArticleCityDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData, }
    data.address = data.lat_lng?.address || ''
    data.lat_lng = JSON.stringify({
        type: "Point",
        coordinates: [data.lat_lng.lng, data.lat_lng.lat]
    })
    mode.value == 'edit'
        ? await apiArticleCityEdit(data)
        : await apiArticleCityAdd(data)
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
