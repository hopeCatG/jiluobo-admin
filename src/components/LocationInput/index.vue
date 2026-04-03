<template>
    <div class="location-input">
        <el-input type="text" v-model="query" placeholder="输入省市区" @input="onInput" class="input-box" />
        <div v-if="loading">查询中...</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="location">
            经度: {{ location.lng }}, 纬度: {{ location.lat }}
        </div>
        <div v-if="reverseAddress && reverseAddress.length > 0">地址回显: {{ reverseAddress }}</div>
    </div>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue'
import axios from 'axios'

const AMAP_KEY = 'c66071b0f92594199fd7a82821bd46a6'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({ address: '', lat: '', lng: '' })
    }
})

const emit = defineEmits(['update:modelValue'])

const query = ref(props.modelValue.address || '')
const location = ref(
    props.modelValue.lat && props.modelValue.lng
        ? { lat: props.modelValue.lat, lng: props.modelValue.lng }
        : null
)
const reverseAddress = ref('')
const error = ref('')
const loading = ref(false)

let timer = null

// 输入防抖
const onInput = () => {
    clearTimeout(timer)
    emit('update:modelValue', { address: query.value, lat: '', lng: '' })
    if (!query.value.trim()) {
        location.value = null
        reverseAddress.value = ''
        error.value = ''
        return
    }

    timer = setTimeout(fetchLocation, 500)
}

// 地址 → 经纬度
const fetchLocation = async () => {
    loading.value = true
    error.value = ''
    location.value = null
    reverseAddress.value = ''
    try {
        const res = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
            params: { key: AMAP_KEY, address: query.value }
        })
        if (res.data.status === '1' && res.data.geocodes.length > 0) {
            const [lng, lat] = res.data.geocodes[0].location.split(',')
            location.value = { lng, lat }
            emit('update:modelValue', { address: query.value, lat, lng })
        } else {
            error.value = '未找到该地区经纬度'
            emit('update:modelValue', { address: query.value, lat: '', lng: '' })
        }
    } catch (err) {
        console.error(err)
        error.value = '查询失败'
        emit('update:modelValue', { address: query.value, lat: '', lng: '' })
    } finally {
        loading.value = false
    }
}

// 经纬度 → 地址（回显）
const fetchReverseAddress = async (lat, lng) => {
    try {
        const res = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
            params: {
                key: AMAP_KEY,
                location: `${lng},${lat}`,
                extensions: 'base'
            }
        })
        if (res.data.status === '1' && res.data.regeocode) {
            reverseAddress.value = res.data.regeocode.formatted_address
        } else {
            reverseAddress.value = ''
        }
    } catch (err) {
        console.error(err)
        reverseAddress.value = ''
    }
}

// 监听外部 v-model 更新
watch(
    () => props.modelValue,
    (newVal) => {
        query.value = newVal.address || ''
        if (newVal.lat && newVal.lng) {
            location.value = { lat: newVal.lat, lng: newVal.lng }
            fetchReverseAddress(newVal.lat, newVal.lng) // 回显地址
        } else {
            location.value = null
            reverseAddress.value = ''
        }
    },
    { deep: true, immediate: true }
)
</script>

<style scoped>
.location-input {
    max-width: 300px;
}

.error {
    color: red;
    margin-top: 4px;
}
</style>