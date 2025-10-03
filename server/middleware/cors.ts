import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30 // Max requests per minute per IP

export default defineEventHandler(async (event) => {
  // Chỉ áp dụng cho API routes
  if (!event.node.req.url?.startsWith('/api/') && !event.node.req.url?.startsWith('/enfyra/api/')) {
    return
  }

  // Lấy thông tin chi tiết về request
  const origin = event.node.req.headers.origin
  const referer = event.node.req.headers.referer
  const userAgent = event.node.req.headers['user-agent']
  const xForwardedFor = event.node.req.headers['x-forwarded-for']
  const xRealIp = event.node.req.headers['x-real-ip']
  const host = event.node.req.headers.host
  
  // Lấy IP thật từ request
  const xForwardedForStr = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor
  const clientIp = xRealIp || xForwardedForStr?.split(',')[0]?.trim() || event.node.req.socket?.remoteAddress || 'unknown'
  
  // Rate limiting check
  const now = Date.now()
  const rateLimitKey = `${clientIp}:${origin || 'no-origin'}`
  const rateLimitData = rateLimitMap.get(rateLimitKey)
  
  if (rateLimitData) {
    if (now < rateLimitData.resetTime) {
      // Trong window time
      if (rateLimitData.count >= RATE_LIMIT_MAX_REQUESTS) {
        console.warn('🚫 RATE LIMIT EXCEEDED:', {
          ip: clientIp,
          origin,
          count: rateLimitData.count,
          resetTime: new Date(rateLimitData.resetTime).toISOString()
        })
        
        event.node.res.statusCode = 429
        event.node.res.setHeader('Content-Type', 'application/json')
        event.node.res.setHeader('Retry-After', Math.ceil((rateLimitData.resetTime - now) / 1000))
        event.node.res.end(JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
        }))
        return
      }
      rateLimitData.count++
    } else {
      // Reset window
      rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    }
  } else {
    // First request
    rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
  }
  
  // Cleanup old entries (prevent memory leak)
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [key, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }
  
  // Chỉ cho phép domain hiện tại
  const config = useRuntimeConfig()
  const currentDomain = config.public.baseUrl
  
  // Log tất cả thông tin request để debug
  console.log('🔍 CORS DEBUG:', {
    clientIp,
    origin,
    referer,
    host,
    userAgent: userAgent?.substring(0, 100),
    xForwardedFor,
    xRealIp,
    url: event.node.req.url,
    method: event.node.req.method,
    allowedDomain: currentDomain,
    rateLimitCount: rateLimitData?.count || 1
  })
  
  // Kiểm tra CORS nghiêm ngặt
  let isAllowed = false
  let reason = ''

  // Kiểm tra origin
  if (origin) {
    if (origin === currentDomain) {
      isAllowed = true
      reason = 'Valid origin'
    } else {
      isAllowed = false
      reason = `Invalid origin: ${origin} !== ${currentDomain}`
    }
  }
  // Kiểm tra referer nếu không có origin
  else if (referer) {
    if (referer.startsWith(currentDomain)) {
      isAllowed = true
      reason = 'Valid referer'
    } else {
      isAllowed = false
      reason = `Invalid referer: ${referer}`
    }
  }
  // Nếu không có cả origin và referer, có thể là request nội bộ
  else {
    // Chỉ cho phép nếu không có origin/referer và là request nội bộ
    if (!userAgent || userAgent.includes('curl') || userAgent.includes('Postman')) {
      isAllowed = false
      reason = 'No origin/referer but suspicious user agent'
    } else {
      isAllowed = true
      reason = 'Internal request (no origin/referer)'
    }
  }

  // Nếu request không được phép, chặn ngay lập tức
  if (!isAllowed) {
    console.warn('🚫 CORS BLOCKED:', reason, {
      origin,
      referer,
      host,
      userAgent,
      url: event.node.req.url,
      method: event.node.req.method
    })
    
    // Trả về lỗi 403 Forbidden
    event.node.res.statusCode = 403
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Access denied: Request not allowed from this domain',
      reason
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

  console.log('✅ CORS ALLOWED:', reason, {
    clientIp,
    origin: origin || 'none',
    referer: referer || 'none',
    host: host || 'none',
    rateLimitCount: rateLimitData?.count || 1
  })
})
