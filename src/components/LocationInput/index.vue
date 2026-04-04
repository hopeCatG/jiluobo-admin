<template>
    <div class="location-input">
        <el-input type="text" v-model="query" placeholder="输入省市区" @input="onInput" class="input-box" />
        <div v-if="loading">查询中...</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="location">
            经度: {{ location.lng }}, 纬度: {{ location.lat }}
        </div>
        <div v-if="reverseAddress && reverseAddress.length > 0">
            地址回显: {{ reverseAddress }}
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

// 👉 换成你的 OpenCage key
const OPENCAGE_KEY = '7316aad16ac84775b09066ebf005dc38'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({ address: '', lat: '', lng: '' })
    }
})

const emit = defineEmits(['update:modelValue'])

const query = ref('')
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

// 🌍 地址 → 经纬度（OpenCage）
const fetchLocation = async () => {
    loading.value = true
    error.value = ''
    location.value = null
    reverseAddress.value = ''

    try {
        const res = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                key: OPENCAGE_KEY,
                q: query.value,
                language: 'zh',
                limit: 1
            }
        })

        if (res.data.results.length > 0) {
            const result = res.data.results[0]
            const lat = result.geometry.lat
            const lng = result.geometry.lng

            location.value = { lat, lng }
            reverseAddress.value = result.formatted

            emit('update:modelValue', {
                address: query.value,
                lat,
                lng
            })
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

// 🌍 经纬度 → 地址（OpenCage 逆地理）
const fetchReverseAddress = async (lat, lng) => {
    try {
        const res = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                key: OPENCAGE_KEY,
                q: `${lat},${lng}`,
                language: 'zh',
                limit: 1
            }
        })

        if (res.data.results.length > 0) {
            reverseAddress.value = res.data.results[0].formatted
        } else {
            reverseAddress.value = ''
        }
    } catch (err) {
        console.error(err)
        reverseAddress.value = ''
    }
}

// 监听外部 v-model 更新（用于回显）
watch(
    () => props.modelValue,
    (newVal) => {
        query.value = newVal.address || ''

        if (newVal.lat && newVal.lng) {
            location.value = { lat: newVal.lat, lng: newVal.lng }
            fetchReverseAddress(newVal.lat, newVal.lng)
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