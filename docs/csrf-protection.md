# CSRF Protection Implementation

## Overview

Cross-Site Request Forgery (CSRF) protection has been implemented for order submission to prevent malicious websites from making unauthorized requests on behalf of authenticated users.

## Implementation Details

### Backend Implementation

#### 1. CSRF Service (`apps/backend/src/auth/csrf.service.ts`)
- **Token Generation**: Creates cryptographically secure tokens using HMAC-SHA256
- **Token Validation**: Verifies token signature and expiration (24 hours)
- **Security Features**:
  - Random bytes + timestamp for uniqueness
  - HMAC signature for integrity
  - Time-based expiration
  - Secret key configuration

#### 2. CSRF Guard (`apps/backend/src/auth/csrf.guard.ts`)
- **Protection Scope**: Applied to POST, PUT, DELETE requests
- **Token Extraction**: Reads `x-csrf-token` header
- **Validation**: Ensures token is present and valid
- **Error Handling**: Returns 401 for missing/invalid tokens

#### 3. Auth Controller (`apps/backend/src/auth/auth.controller.ts`)
- **Endpoint**: `GET /api/auth/csrf`
- **Response**: Returns CSRF token for client use
- **Documentation**: Swagger integration with security scheme

#### 4. Orders Controller Integration
- **CSRF Protection**: Applied to `POST /api/orders` endpoint
- **Swagger Documentation**: Updated with CSRF security requirement
- **Error Responses**: 401 for missing/invalid CSRF tokens

### Frontend Implementation

#### 1. CSRF Service (`apps/frontend/src/services/csrf.service.ts`)
- **Token Management**: Caches tokens with expiration
- **Automatic Refresh**: Fetches new tokens when expired
- **Header Preparation**: Provides headers with CSRF token
- **Error Handling**: Graceful fallback for token failures

#### 2. API Integration (`apps/frontend/src/store/api/apiSlice.ts`)
- **Automatic Headers**: Adds CSRF token to order creation requests
- **Transparent Usage**: No changes needed in components
- **Error Recovery**: Handles CSRF token failures gracefully

## Security Features

### Token Security
- **Cryptographic Strength**: HMAC-SHA256 with secret key
- **Uniqueness**: Random bytes + timestamp
- **Expiration**: 24-hour token lifetime
- **Integrity**: Signature verification prevents tampering

### Protection Scope
- **Order Creation**: Primary protection for order submission
- **Future Extensions**: Can be applied to other sensitive endpoints
- **Selective Application**: Only protects state-changing operations

### Configuration
- **Secret Key**: Configurable via `CSRF_SECRET` environment variable
- **Token Lifetime**: 24-hour expiration
- **Header Name**: `x-csrf-token` standard header

## API Usage

### Getting CSRF Token
```bash
curl -X GET http://localhost:3000/api/auth/csrf
```

**Response:**
```json
{
  "token": "base64-encoded-csrf-token"
}
```

### Creating Order with CSRF
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: <csrf-token>" \
  -d '{
    "customer": {
      "name": "John Doe",
      "phone": "+1234567890"
    },
    "items": [
      {"id": "pizza_001", "quantity": 2}
    ]
  }'
```

## Frontend Integration

### Automatic Token Handling
The frontend automatically handles CSRF tokens:

1. **Token Fetching**: Automatically fetches CSRF token when needed
2. **Token Caching**: Caches tokens to avoid unnecessary requests
3. **Header Injection**: Automatically adds CSRF headers to order requests
4. **Error Handling**: Gracefully handles token fetch failures

### No Code Changes Required
- **Transparent**: Existing components work without modification
- **Automatic**: CSRF tokens are handled automatically
- **Robust**: Includes error handling and retry logic

## Security Considerations

### Protection Against
- **Cross-Site Requests**: Prevents malicious sites from creating orders
- **Token Replay**: Time-based expiration prevents token reuse
- **Token Forgery**: HMAC signature prevents token tampering

### Limitations
- **Same-Origin Policy**: Relies on browser same-origin policy
- **Token Storage**: Tokens are stored in memory (not persistent)
- **HTTPS Required**: Should be used with HTTPS in production

## Configuration

### Environment Variables
```bash
# Backend .env
CSRF_SECRET=your-secure-csrf-secret-key-change-in-production
```

### Swagger Documentation
- **Security Scheme**: `csrf-token` API key
- **Header Name**: `x-csrf-token`
- **Documentation**: Available at `/docs`

## Testing

### Manual Testing
1. **Get Token**: Call `/api/auth/csrf` to get token
2. **Create Order**: Use token in `x-csrf-token` header
3. **Invalid Token**: Test with invalid/expired token
4. **Missing Token**: Test without CSRF header

### Automated Testing
- **Unit Tests**: CSRF service and guard tests
- **Integration Tests**: End-to-end order creation
- **Security Tests**: Invalid token scenarios

## Error Handling

### Backend Errors
- **401 Unauthorized**: Missing or invalid CSRF token
- **500 Internal Server Error**: Token generation failures

### Frontend Errors
- **Token Fetch Failure**: Logs error, continues without CSRF
- **Network Errors**: Graceful degradation
- **Invalid Responses**: Error handling and retry logic

## Future Enhancements

### Additional Protection
- **Push Subscriptions**: Apply CSRF to push subscription endpoints
- **Admin Operations**: Protect admin-only endpoints
- **Rate Limiting**: Combine with CSRF for additional security

### Advanced Features
- **Token Rotation**: Implement token rotation for enhanced security
- **Session Binding**: Bind tokens to user sessions
- **Audit Logging**: Log CSRF token usage for security monitoring

## Troubleshooting

### Common Issues
1. **Token Expired**: Tokens expire after 24 hours
2. **Invalid Secret**: Ensure `CSRF_SECRET` is set correctly
3. **Header Missing**: Ensure `x-csrf-token` header is included
4. **CORS Issues**: Ensure CORS is configured for CSRF headers

### Debug Steps
1. Check backend logs for CSRF validation errors
2. Verify `CSRF_SECRET` environment variable
3. Test token generation endpoint manually
4. Check frontend network tab for CSRF headers

## Best Practices

### Development
- **Secret Management**: Use strong, unique secrets
- **Token Rotation**: Consider implementing token rotation
- **Error Logging**: Log CSRF failures for monitoring

### Production
- **HTTPS Only**: Always use HTTPS with CSRF
- **Secret Security**: Store secrets securely
- **Monitoring**: Monitor CSRF token usage and failures
- **Regular Rotation**: Rotate CSRF secrets regularly

---

**CSRF Protection is now active for order submission, providing security against cross-site request forgery attacks while maintaining a seamless user experience.**
