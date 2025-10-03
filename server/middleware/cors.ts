import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
export default defineEventHandler(async (event) => {
  // Chỉ áp dụng cho API routes
  if (!event.node.req.url?.startsWith('/api/') && !event.node.req.url?.startsWith('/enfyra/api/')) {
    return
  }

  // Lấy thông tin về origin và referer từ request headers
  const origin = event.node.req.headers.origin
  const referer = event.node.req.headers.referer
  
  // Chỉ cho phép domain hiện tại
  const config = useRuntimeConfig()
  const currentDomain = config.public.baseUrl
  
  // Kiểm tra CORS - chỉ cho phép domain hiện tại
  let isAllowed = false

  // Kiểm tra origin
  if (origin) {
    isAllowed = origin === currentDomain
  }
  // Kiểm tra referer nếu không có origin
  else if (referer) {
    isAllowed = referer.startsWith(currentDomain)
  }
  // Nếu không có cả origin và referer, có thể là request nội bộ (cho phép)
  else {
    isAllowed = true
  }

  // Nếu request không được phép, chặn ngay lập tức
  if (!isAllowed) {
    console.warn('🚫 CORS BLOCKED: Request from unauthorized origin:', {
      origin,
      referer,
      url: event.node.req.url,
      method: event.node.req.method
    })
    
    // Trả về lỗi 403 Forbidden
    event.node.res.statusCode = 403
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Access denied: Request not allowed from this domain'
    }))
    return
  }

  // Set CORS headers cho request được phép
  event.node.res.setHeader('Access-Control-Allow-Origin', currentDomain)
  event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  event.node.res.setHeader('Access-Control-Allow-Credentials', 'true')

  // Xử lý preflight request
  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 200
    event.node.res.end()
    return
  }

  console.log('✅ CORS ALLOWED: Request from authorized origin:', origin || referer || 'internal')
})
