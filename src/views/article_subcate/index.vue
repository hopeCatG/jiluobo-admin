<template>
    <div>
        <el-card class="!border-none mb-4" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" inline>
                <el-form-item class="w-[280px]" label="归属洲">
                    <el-select v-model="queryParams.article_cate_id">
                        <el-option label="全部" value />
                        <el-option v-for="item in optionsData.article_cate" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="区域/子分类代码" prop="code">
                    <el-input class="w-[280px]" v-model="queryParams.code" clearable placeholder="请输入区域/子分类代码" />
                </el-form-item>
                <el-form-item label="子分类名称" prop="name">
                    <el-input class="w-[280px]" v-model="queryParams.name" clearable placeholder="请输入子分类名称" />
                </el-form-item>
                <el-form-item label="子分类英文名称" prop="name_en">
                    <el-input class="w-[280px]" v-model="queryParams.name_en" clearable placeholder="请输入子分类英文名称" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none" v-loading="pager.loading" shadow="never">
            <el-button v-perms="['subcate.article_subcate/add']" type="primary" @click="handleAdd">
                <template #icon>
                    <icon name="el-icon-Plus" />
                </template>
                新增
            </el-button>
            <el-button v-perms="['subcate.article_subcate/delete']" :disabled="!selectData.length"
                @click="handleDelete(selectData)">
                删除
            </el-button>
            <div class="mt-4">
                <el-table :data="pager.lists" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column label="归属洲" prop="article_cate_id" show-overflow-tooltip>
                        <template #default="{ row }">
                            <span>{{optionsData.article_cate.find((item) => item.id == row.article_cate_id)?.name ||
                                '-'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="区域/子分类代码" prop="code" show-overflow-tooltip />
                    <el-table-column label="区域名称" prop="name" show-overflow-tooltip />
                    <el-table-column label="区域英文名称" prop="name_en" show-overflow-tooltip />
                    <el-table-column label="图标" prop="flag">
                        <template #default="{ row }">
                            <el-image style="width:50px;height:50px;" :src="row.flag" />
                        </template>
                    </el-table-column>
                    <el-table-column label="是否显示" prop="is_show">
                        <template #default="{ row }">
                            <dict-value :options="dictData.yes_no" :value="row.is_show" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <el-button v-perms="['subcate.article_subcate/edit']" type="primary" link
                                @click="handleEdit(row)">
                                编辑
                            </el-button>
                            <el-button v-perms="['subcate.article_subcate/delete']" type="danger" link
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

<script lang="ts" setup name="articleSubcateLists">
import { usePaging } from '@/hooks/usePaging'
import { articleCateAll } from '@/api/article'
import { useDictOptions } from '@/hooks/useDictOptions'

import { useDictData } from '@/hooks/useDictOptions'
import { apiArticleSubcateLists, apiArticleSubcateDelete } from '@/api/article_subcate'
import { timeFormat } from '@/utils/util'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
// 是否显示编辑框
const showEdit = ref(false)
const { optionsData } = useDictOptions<{
    article_cate: any[]
}>({
    article_cate: {
        api: articleCateAll
    }
})

// 查询条件
const queryParams = reactive({
    article_cate_id: '',
    code: '',
    name: '',
    name_en: ''
})

// 选中数据
const selectData = ref<any[]>([])

// 表格选择后回调事件
const handleSelectionChange = (val: any[]) => {
    selectData.value = val.map(({ id }) => id)
}

// 获取字典数据
const { dictData } = useDictData('yes_no')

// 分页相关
const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: apiArticleSubcateLists,
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
    await apiArticleSubcateDelete({ id })
    getLists()
}

getLists()
</script>
