# Admin User Creation API - JSON Format Examples

## Endpoint Information

**URL:** `POST /api/admin/create`
**Authentication:** Required (Admin role only)
**Content-Type:** `application/json`

## JSON Format Examples

### 1. Basic Admin Creation (Minimal Required Fields)

```json
{
  "name": "System Administrator",
  "email": "admin@civic.com", 
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Administrator user created successfully",
  "data": {
    "user": {
      "_id": "64f8b1c2d4e5f6a7b8c9d0e1",
      "name": "System Administrator",
      "email": "admin@civic.com",
      "role": "admin",
      "isVerified": true,
      "isActive": true,
      "gamification": {
        "points": 1000,
        "level": "Platinum",
        "badges": [{
          "name": "Administrator",
          "description": "System Administrator Badge",
          "earnedAt": "2025-09-19T10:30:00.000Z"
        }]
      },
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        },
        "language": "en"
      },
      "createdAt": "2025-09-19T10:30:00.000Z"
    },
    "credentials": {
      "email": "admin@civic.com",
      "temporaryPassword": "SecurePass123",
      "note": "Please ask the user to change this password on first login"
    }
  }
}
```

### 2. Complete Admin Creation (All Fields)

```json
{
  "name": "John Doe Administrator",
  "email": "john.admin@civic.com",
  "password": "AdminSecure456",
  "phone": "+1234567890",
  "role": "admin",
  "location": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139]
  },
  "address": "123 Admin Street, New Delhi, India",
  "preferences": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": true
    },
    "language": "en"
  },
  "sendWelcomeEmail": true
}
```

### 3. Field Worker Creation

```json
{
  "name": "Jane Smith Field Worker",
  "email": "jane.fieldworker@civic.com",
  "password": "FieldWork789",
  "phone": "+9876543210",
  "role": "field_worker",
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  },
  "address": "456 Field Office Lane, Gurgaon, India"
}
```

**Response for Field Worker:**
```json
{
  "success": true,
  "message": "Field worker user created successfully",
  "data": {
    "user": {
      "_id": "64f8b1c2d4e5f6a7b8c9d0e2",
      "name": "Jane Smith Field Worker",
      "email": "jane.fieldworker@civic.com",
      "role": "field_worker",
      "gamification": {
        "points": 500,
        "level": "Gold",
        "badges": [{
          "name": "Field Worker",
          "description": "Field Worker Badge"
        }]
      }
    }
  }
}
```

### 4. Multiple Admin Creation (Batch)

```json
[
  {
    "name": "Admin One",
    "email": "admin1@civic.com",
    "password": "Admin123Pass",
    "role": "admin"
  },
  {
    "name": "Field Worker One", 
    "email": "field1@civic.com",
    "password": "Field456Pass",
    "role": "field_worker",
    "phone": "+1111111111"
  },
  {
    "name": "Field Worker Two",
    "email": "field2@civic.com", 
    "password": "Field789Pass",
    "role": "field_worker",
    "location": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    }
  }
]
```

### 5. Admin with Custom Preferences

```json
{
  "name": "Regional Admin",
  "email": "regional.admin@civic.com",
  "password": "RegionalAdmin2025",
  "phone": "+91-11-12345678",
  "role": "admin",
  "location": {
    "type": "Point",
    "coordinates": [77.5946, 12.9716]
  },
  "address": "Regional Office, Bangalore, Karnataka, India",
  "preferences": {
    "notifications": {
      "email": true,
      "push": false,
      "sms": true
    },
    "language": "hi"
  },
  "sendWelcomeEmail": false
}
```

## Error Response Examples

### 1. Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    },
    {
      "type": "field", 
      "msg": "Please provide a valid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### 2. Duplicate User Error

```json
{
  "success": false,
  "message": "User with this email already exists",
  "data": {
    "email": "admin@civic.com",
    "role": "admin",
    "isActive": true
  }
}
```

### 3. Unauthorized Access

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### 4. Invalid Role Error

```json
{
  "success": false,
  "message": "Invalid role. Allowed roles: admin, field_worker"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Full name (2-50 characters) |
| `email` | String | Yes | Valid email address (unique) |
| `password` | String | Yes | Password (min 6 chars, must contain uppercase, lowercase, number) |
| `phone` | String | No | Valid phone number |
| `role` | String | No | Either "admin" or "field_worker" (default: "admin") |
| `location.type` | String | No | Must be "Point" |
| `location.coordinates` | Array | No | [longitude, latitude] |
| `address` | String | No | Physical address (max 200 chars) |
| `preferences.notifications.email` | Boolean | No | Email notifications (default: true) |
| `preferences.notifications.push` | Boolean | No | Push notifications (default: true) |
| `preferences.notifications.sms` | Boolean | No | SMS notifications (default: false) |
| `preferences.language` | String | No | Language code: "en", "hi", "es", "fr", "de" |
| `sendWelcomeEmail` | Boolean | No | Send welcome email (default: true) |

## Authentication Header

You need to include the admin user's JWT token in the Authorization header:

```
Authorization: Bearer <your_admin_jwt_token>
```

## Complete cURL Example

```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "New Administrator",
    "email": "newadmin@civic.com",
    "password": "NewAdmin123",
    "phone": "+1234567890",
    "role": "admin",
    "location": {
      "type": "Point", 
      "coordinates": [77.2090, 28.6139]
    },
    "address": "New Admin Office, Delhi, India"
  }'
```

## Postman Collection Example

```json
{
  "name": "Create Admin User",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "Authorization",
        "value": "Bearer {{admin_token}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"name\": \"{{admin_name}}\",\n  \"email\": \"{{admin_email}}\",\n  \"password\": \"{{admin_password}}\",\n  \"role\": \"admin\"\n}"
    },
    "url": {
      "raw": "{{base_url}}/api/admin/create",
      "host": ["{{base_url}}"],
      "path": ["api", "admin", "create"]
    }
  }
}
```

## Testing with Different Tools

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:5000/api/admin/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    name: 'Test Administrator',
    email: 'test.admin@civic.com',
    password: 'TestAdmin123',
    role: 'admin'
  })
});

const result = await response.json();
console.log(result);
```

### Python/Requests
```python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {admin_token}'
}

data = {
    'name': 'Python Admin',
    'email': 'python.admin@civic.com', 
    'password': 'PythonAdmin123',
    'role': 'admin'
}

response = requests.post(
    'http://localhost:5000/api/admin/create',
    json=data,
    headers=headers
)

print(response.json())
```