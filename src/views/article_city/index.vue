<template>
    <div>
        <el-card class="!border-none mb-4" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" inline>
                <!-- <el-form-item label="区域" prop="region_id">
                    <el-input class="w-[280px]" v-model="queryParams.region_id" clearable placeholder="请输入区域" />
                </el-form-item> -->
                <el-form-item label="网点名" prop="city_name">
                    <el-input class="w-[280px]" v-model="queryParams.city_name" clearable placeholder="请输入网点名" />
                </el-form-item>
                <!-- <el-form-item label="经纬度" prop="lat_lng">
                    <el-input class="w-[280px]" v-model="queryParams.lat_lng" clearable placeholder="请输入经纬度" />
                </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none" v-loading="pager.loading" shadow="never">
            <el-button v-perms="['city.article_city/add']" type="primary" @click="handleAdd">
                <template #icon>
                    <icon name="el-icon-Plus" />
                </template>
                新增
            </el-button>

            <el-button v-perms="['city.article_city/delete']" :disabled="!selectData.length"
                @click="handleDelete(selectData)">
                删除
            </el-button>
            <div class="mt-4">
                <el-table :data="tableLists" @selection-change="handleSelectionChange">
                    <!-- <el-table-column label="区域" prop="region_id" show-overflow-tooltip /> -->
                    <el-table-column label="州" prop="cate_name" min-width="100" />
                    <el-table-column label="国家" prop="branch_name" min-width="100" />
                    <el-table-column label="网点名" prop="city_name" show-overflow-tooltip />
                    <el-table-column label="经纬度" min-width="200">
                        <template #default="{ row }">
                            <location-input :editable="false" :model-value="{
                                address: row.address,
                                lat: row.lat_lng.lat,
                                lng: row.lat_lng.lng
                            }" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <el-button v-perms="['city.article_city/edit']" type="primary" link
                                @click="handleEdit(row)">
                                编辑
                            </el-button>
                            <el-button v-perms="['city.article_city/delete']" type="danger" link
                                @click="handleDelete(row.id)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="flex mt-4 justify-end">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
        <edit-popup v-if="showEdit" ref="editRef" :dict-data="dictData" @success="getLists" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup name="articleCityLists">
import { usePaging } from '@/hooks/usePaging'
import { useDictData } from '@/hooks/useDictOptions'
import { apiArticleCityLists, apiArticleCityDelete } from '@/api/article_city'
import { timeFormat } from '@/utils/util'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'
import LocationInput from '@/components/LocationInput/index.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
// 是否显示编辑框
const showEdit = ref(false)



// 转换列表数据中的 lat_lng 字段为 location-input 所需格式
const tableLists = computed(() => {
    return pager.lists.map((row: any) => {
        let parsed = { address: '', lat: '', lng: '' }
        if (row.lat_lng) {
            try {
                const obj = JSON.parse(row.lat_lng)
                console.log(obj.coordinates[0])
                parsed = {
                    address: row.city || '',
                    lat: obj.coordinates?.[1] || '',
                    lng: obj.coordinates?.[0] || ''
                }
            } catch { /* ignore */ }
        }
        return {
            ...row,
            lat_lng: parsed
        }
    })
})

// 查询条件
const queryParams = reactive({
    region_id: '',
    city_name: '',
    lat_lng: ''
})

// 选中数据
const selectData = ref<any[]>([])

// 表格选择后回调事件
const handleSelectionChange = (val: any[]) => {
    selectData.value = val.map(({ id }) => id)
}

// 获取字典数据
const { dictData } = useDictData('')

// 分页相关
const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: apiArticleCityLists,
    params: queryParams
})

// 添加
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

// 编辑
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.setFormData(data)
}

// 删除
const handleDelete = async (id: number | any[]) => {
    await feedback.confirm('确定要删除？')
    await apiArticleCityDelete({ id })
    getLists()
}

getLists()
</script>
