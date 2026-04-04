<template>
    <div class="article-edit">
        <el-card class="!border-none" shadow="never">
            <el-page-header :content="$route.meta.title" @back="$router.back()" />
        </el-card>
        <el-card class="mt-4 !border-none" shadow="never">
            <el-form ref="formRef" class="ls-form" :model="formData" label-width="100px" :rules="rules">
                <div class="xl:flex">
                    <div>
                        <el-form-item label="文章标题" prop="title">
                            <div class="w-80">
                                <el-input v-model="formData.title" placeholder="请输入文章标题" type="textarea"
                                    :autosize="{ minRows: 3, maxRows: 3 }" maxlength="64" show-word-limit clearable />
                            </div>
                        </el-form-item>
                        <el-form-item label="文章州栏目" prop="cid">
                            <el-select class="w-80" v-model="formData.cid" placeholder="请选择文章栏目" clearable
                                @change="getArticleSubcateList">
                                <el-option v-for="item in optionsData.article_cate" :key="item.id" :label="item.name"
                                    :value="item.id" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="区域" prop="article_subcate_id">
                            <el-select class="w-80" v-model="formData.article_subcate_id" placeholder="请选择区域" clearable>
                                <el-option v-for="item in articleSubcateList" :key="item.id" :label="item.name"
                                    :value="item.id" />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="文章封面" prop="image">
                            <div>
                                <div>
                                    <material-picker v-model="formData.image" :limit="1" />
                                </div>
                                <div class="form-tips">建议尺寸：240*180px</div>
                            </div>
                        </el-form-item>
                        <el-form-item label="作者" prop="author">
                            <div class="w-80">
                                <el-input v-model="formData.author" placeholder="请输入作者名称" />
                            </div>
                        </el-form-item>


                        <el-form-item label="文章状态" required prop="is_show">
                            <el-radio-group v-model="formData.is_show">
                                <el-radio :value="1">显示</el-radio>
                                <el-radio :value="0">隐藏</el-radio>
                            </el-radio-group>
                        </el-form-item>


                        <el-form-item label="地区经纬度" required prop="region">
                            <location-input v-model="formData.region" />
                        </el-form-item>
                            <el-form-item label="发布时间" required prop="post_time">
                            <el-date-picker v-model="formData.post_time" value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="请选择发布时间" />
                        </el-form-item>
                    </div>
                    <div class="xl:flex-1">
                        <el-form-item label="文章内容" prop="content">
                            <editor v-model="formData.content" height="70vh" width="100%" />
                        </el-form-item>
                    </div>
                </div>
            </el-form>
        </el-card>
        <footer-btns>
            <el-button type="primary" @click="handleSave">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="articleListsEdit">
import type { FormInstance } from 'element-plus'

import { articleAdd, articleCateAll, articleDetail, articleEdit } from '@/api/article'
import { useDictOptions } from '@/hooks/useDictOptions'
import useMultipleTabs from '@/hooks/useMultipleTabs'
import LocationInput from '@/components/LocationInput/index.vue'
import { apiArticleSubcateLists } from '@/api/article_subcate'

const route = useRoute()
const router = useRouter()
const formData = reactive({
    id: '',
    title: '',
    image: '',
    cid: '',
    desc: '',
    author: '',
    content: '',
    click_virtual: 0,
    sort: 0,
    is_show: 1,
    abstract: '',
    article_subcate_id: '',
    post_time: '',
    region: { address: '', lat: '', lng: '' }
})

const { removeTab } = useMultipleTabs()
const formRef = shallowRef<FormInstance>()
const rules = reactive({
    title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
    cid: [{ required: true, message: '请选择文章栏目', trigger: 'blur' }]
})

const getDetails = async () => {
    const data = await articleDetail({
        id: route.query.id
    })
    Object.keys(formData).forEach((key) => {
        //@ts-ignore
        if (key === 'region') {
            let obj = JSON.parse(data['latLng']);
            formData.region = {
                address: data.city,
                lat: obj.coordinates[1],
                lng: obj.coordinates[0]
            }
        }
        else if (key === 'cid') {
            formData[key] = Number(data[key])
            getArticleSubcateList()
        } else {
            formData[key] = data[key]
        }
    })

    console.log(formData)
}

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

const handleSave = async () => {
    await formRef.value?.validate()
    let form = JSON.parse(JSON.stringify(formData))
    form.city = form.region.address
    form.latLng = JSON.stringify({
        type: "Point",
        coordinates: [form.region.lng, form.region.lat]
    })

    if (route.query.id) {
        await articleEdit(form)
    } else {
        await articleAdd(form)
    }
    removeTab()
    router.back()
}

route.query.id && getDetails()
</script>
