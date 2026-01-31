# ScopeGuard API Testing Guide

Complete guide to testing all ScopeGuard API endpoints with curl examples.

## Prerequisites

```bash
# 1. Start server
npm start

# 2. Set base URL
export API_URL="http://localhost:3000"

# 3. Initialize database (if not done)
npm run db:init
```

---

## Authentication

### Register New User

```bash
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freelancer@example.com",
    "password": "secure123",
    "full_name": "Jane Freelancer"
  }'

# Response:
# {
#   "user": { "id": 2, "email": "freelancer@example.com", "full_name": "Jane Freelancer" },
#   "token": "eyJhbGc..."
# }
```

### Login

```bash
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@scopeguard.app",
    "password": "password123"
  }'

# Save token for subsequent requests
export TOKEN="eyJhbGc..."
```

### Get Current User

```bash
curl -X GET $API_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Projects

### List All Projects

```bash
curl -X GET $API_URL/api/projects \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "$API_URL/api/projects?status=active" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Project

```bash
curl -X POST $API_URL/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "TechCorp",
    "project_name": "E-commerce Platform",
    "description": "Build complete online store with 20 products"
  }'

# Save project ID
export PROJECT_ID=2
```

### Get Project Details

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Includes overview stats, scope items count, requests summary
```

### Update Project

```bash
curl -X PUT $API_URL/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "description": "Completed e-commerce platform with payment integration"
  }'
```

### Delete Project

```bash
curl -X DELETE $API_URL/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Scope Items

### List Scope Items

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID/scope-items \
  -H "Authorization: Bearer $TOKEN"

# Returns items with usage stats (used, remaining, percentage, warnings)
```

### Create Scope Item

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/scope-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Product pages",
    "limit_value": 20,
    "limit_type": "count"
  }'

export SCOPE_ITEM_ID=1
```

### Create Hour-Based Scope Item

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/scope-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Consulting hours",
    "limit_value": 10,
    "limit_type": "hours"
  }'
```

### Get Scope Item with Stats

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID/scope-items/$SCOPE_ITEM_ID \
  -H "Authorization: Bearer $TOKEN"

# Returns:
# - remaining capacity
# - usage percentage
# - is_exceeded flag
# - is_warning flag (>80% usage)
```

### Update Scope Item

```bash
curl -X PUT $API_URL/api/projects/$PROJECT_ID/scope-items/$SCOPE_ITEM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limit_value": 25,
    "description": "Product pages (increased to 25)"
  }'
```

---

## Requests

### List Requests

```bash
# All requests
curl -X GET $API_URL/api/projects/$PROJECT_ID/requests \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "$API_URL/api/projects/$PROJECT_ID/requests?status=out-of-scope" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Request

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Add size variations for each product",
    "source": "email",
    "status": "pending",
    "notes": "Client emailed this request on Jan 30"
  }'

export REQUEST_ID=1
```

### Categorize Request as In-Scope

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/requests/$REQUEST_ID/categorize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-scope",
    "scope_item_id": 1
  }'

# This increments the scope item usage count
```

### Categorize Request as Out-of-Scope

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/requests/2/categorize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "out-of-scope"
  }'
```

### Update Request

```bash
curl -X PUT $API_URL/api/projects/$PROJECT_ID/requests/$REQUEST_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Client confirmed this is urgent",
    "source": "call"
  }'
```

---

## Dashboard & Status

### Get Project Status Dashboard

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID/status \
  -H "Authorization: Bearer $TOKEN"

# Comprehensive response:
# - project info + overview
# - status (overall, healthScore, warnings, exceeded)
# - all scope items with stats
# - request statistics
# - recent requests (last 10)
# - alerts (warnings, exceeded items)
```

---

## Change Orders

### List Change Orders

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID/change-orders \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "$API_URL/api/projects/$PROJECT_ID/change-orders?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Change Order

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/change-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Additional Features Package",
    "description": "Product reviews and wishlist functionality",
    "price": 500,
    "request_ids": [2, 3, 4]
  }'

export CHANGE_ORDER_ID=1
```

### Generate Change Order from Out-of-Scope Requests

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/change-orders/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_ids": [5, 6],
    "title": "Mobile App Integration",
    "price": 750
  }'

# Auto-generates description from request descriptions
# Marks all requests as "change-order-sent"
```

### Approve Change Order

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/change-orders/$CHANGE_ORDER_ID/approve \
  -H "Authorization: Bearer $TOKEN"
```

### Reject Change Order

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/change-orders/$CHANGE_ORDER_ID/reject \
  -H "Authorization: Bearer $TOKEN"
```

---

## Client Portal

### Generate Portal Token

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/portal/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expires_in_days": 30
  }'

# Response:
# {
#   "portalToken": { "id": 1, "token": "a1b2c3...", "expires_at": ... },
#   "url": "http://localhost:3000/portal/a1b2c3..."
# }

export PORTAL_TOKEN="a1b2c3..."
```

### List Portal Tokens

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID/portal/tokens \
  -H "Authorization: Bearer $TOKEN"
```

### Access Portal (Public, No Auth)

```bash
curl -X GET $API_URL/portal/$PORTAL_TOKEN

# Returns client-friendly view:
# - project name, client name, description
# - scope items with usage stats
# - activity summary (request counts)
```

### Revoke Portal Token

```bash
curl -X DELETE $API_URL/api/projects/$PROJECT_ID/portal/tokens/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Templates

### List Available Templates

```bash
curl -X GET $API_URL/api/templates \
  -H "Authorization: Bearer $TOKEN"

# Returns 8 pre-built templates:
# - website-redesign-5-pages
# - logo-design-package
# - content-writing-blog-posts
# - app-development-mvp
# - social-media-management
# - video-editing-project
# - consulting-hours-package
# - ecommerce-setup
```

### Get Template Details

```bash
curl -X GET $API_URL/api/templates/website-redesign-5-pages \
  -H "Authorization: Bearer $TOKEN"
```

### Create Project from Template

```bash
curl -X POST $API_URL/api/templates/logo-design-package/create-project \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "StartupCo",
    "project_name": "Logo Design"
  }'

# Automatically creates project with pre-populated scope items
```

---

## Analytics

### Overall Analytics

```bash
curl -X GET $API_URL/api/analytics/overview \
  -H "Authorization: Bearer $TOKEN"

# Returns:
# - Total/active projects
# - Request stats (total, in/out-of-scope, scope creep rate)
# - Revenue (change orders, approved/potential)
```

### Client-Level Analytics

```bash
curl -X GET $API_URL/api/analytics/clients \
  -H "Authorization: Bearer $TOKEN"

# Returns per-client:
# - Project count
# - Total requests
# - Out-of-scope request count
# - Scope creep rate (%)
# - Revenue from overages
# Sorted by scope creep rate (worst clients first)
```

### Trend Analytics

```bash
# Default: 30 days
curl -X GET $API_URL/api/analytics/trends \
  -H "Authorization: Bearer $TOKEN"

# Custom period
curl -X GET "$API_URL/api/analytics/trends?period=90" \
  -H "Authorization: Bearer $TOKEN"

# Returns daily data:
# - Requests (total, in-scope, out-of-scope)
# - Revenue (change orders created, revenue)
```

### Scope Health

```bash
curl -X GET $API_URL/api/analytics/scope-health \
  -H "Authorization: Bearer $TOKEN"

# Returns:
# - Exceeded projects (scope items over limit)
# - At-risk projects (>80% usage)
# - Summary counts
```

---

## Export

### Export Project Report (Markdown)

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID/export/markdown \
  -H "Authorization: Bearer $TOKEN" \
  -o project_report.md

# Downloads comprehensive Markdown report:
# - Project info
# - Executive summary
# - Scope items with status
# - Full request log
# - Change orders
# - Health analysis
# - Revenue impact
```

### Export Requests (CSV)

```bash
curl -X GET $API_URL/api/projects/$PROJECT_ID/export/csv \
  -H "Authorization: Bearer $TOKEN" \
  -o requests.csv

# CSV columns:
# Date, Description, Source, Status, Scope Item, Notes
```

---

## Bulk Operations

### Bulk Categorize Requests

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/bulk/categorize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_ids": [7, 8, 9],
    "status": "out-of-scope"
  }'

# Returns success/failure count
```

### Bulk Create Change Order

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/bulk/create-change-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_ids": [10, 11, 12, 13],
    "title": "Sprint 2 Additions",
    "price": 1200
  }'
```

### Bulk Update Requests

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/bulk/update-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_ids": [14, 15, 16],
    "updates": {
      "source": "meeting",
      "notes": "Discussed in Sprint Planning"
    }
  }'
```

### Bulk Delete Requests

```bash
curl -X POST $API_URL/api/projects/$PROJECT_ID/bulk/delete-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_ids": [17, 18]
  }'
```

---

## Stripe (Subscriptions)

### Get Pricing Plans

```bash
curl -X GET $API_URL/api/stripe/plans
```

### Create Checkout Session

```bash
curl -X POST $API_URL/api/stripe/create-checkout-session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "pro"
  }'

# Response: { sessionId, url }
# Redirect user to url for payment
```

### Access Customer Portal

```bash
curl -X GET $API_URL/api/stripe/portal \
  -H "Authorization: Bearer $TOKEN"

# Response: { url }
# Redirect user to manage subscription
```

---

## Complete End-to-End Test

```bash
#!/bin/bash
# Complete workflow test

export API_URL="http://localhost:3000"

# 1. Register & login
TOKEN=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@scopeguard.app", "password": "password123"}' \
  | jq -r '.token')

# 2. Create project from template
PROJECT=$(curl -s -X POST $API_URL/api/templates/website-redesign-5-pages/create-project \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"client_name": "TestClient", "project_name": "Test Website"}' \
  | jq -r '.project.id')

# 3. Log client requests
curl -s -X POST $API_URL/api/projects/$PROJECT/requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Update homepage hero", "source": "email"}' > /dev/null

curl -s -X POST $API_URL/api/projects/$PROJECT/requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Add blog section (out of scope)", "source": "call"}' > /dev/null

# 4. Categorize requests
curl -s -X POST $API_URL/api/projects/$PROJECT/requests/1/categorize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in-scope", "scope_item_id": 1}' > /dev/null

curl -s -X POST $API_URL/api/projects/$PROJECT/requests/2/categorize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "out-of-scope"}' > /dev/null

# 5. Create change order
curl -s -X POST $API_URL/api/projects/$PROJECT/change-orders/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"request_ids": [2], "title": "Blog Addition", "price": 300}' > /dev/null

# 6. Get dashboard
curl -s -X GET $API_URL/api/projects/$PROJECT/status \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.status'

# 7. Export report
curl -s -X GET $API_URL/api/projects/$PROJECT/export/markdown \
  -H "Authorization: Bearer $TOKEN" \
  -o test_report.md

echo "✅ Complete workflow test passed!"
echo "Report saved to: test_report.md"
```

---

## Testing Tips

**1. Use jq for JSON parsing:**
```bash
# Pretty-print response
curl ... | jq

# Extract specific field
curl ... | jq -r '.token'

# Filter arrays
curl ... | jq '.projects[] | select(.status == "active")'
```

**2. Save common values:**
```bash
export TOKEN="..."
export PROJECT_ID=1
export SCOPE_ITEM_ID=1
```

**3. Test error cases:**
```bash
# Missing auth
curl -X GET $API_URL/api/projects
# Expected: 401 Unauthorized

# Invalid data
curl -X POST $API_URL/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"client_name": ""}'
# Expected: 400 Bad Request
```

**4. Monitor server logs:**
```bash
# In separate terminal
npm run dev

# Watch for errors and SQL queries
```

---

## Automated Testing Script

Save as `test-api.sh`:

```bash
#!/bin/bash
set -e

API_URL="http://localhost:3000"
TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
  local name="$1"
  local cmd="$2"
  local expected_code="$3"
  
  echo -n "Testing $name... "
  
  http_code=$(eval "$cmd" -w "%{http_code}" -o /dev/null -s)
  
  if [ "$http_code" = "$expected_code" ]; then
    echo "✅ PASS"
    ((TESTS_PASSED++))
  else
    echo "❌ FAIL (expected $expected_code, got $http_code)"
    ((TESTS_FAILED++))
  fi
}

# Login
TOKEN=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@scopeguard.app", "password": "password123"}' \
  | jq -r '.token')

# Run tests
test_endpoint "Health Check" "curl -X GET $API_URL/api/health" "200"
test_endpoint "List Projects" "curl -X GET $API_URL/api/projects -H 'Authorization: Bearer $TOKEN'" "200"
test_endpoint "Create Project" "curl -X POST $API_URL/api/projects -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"client_name\": \"Test\", \"project_name\": \"Test\"}'" "201"
test_endpoint "Get Analytics" "curl -X GET $API_URL/api/analytics/overview -H 'Authorization: Bearer $TOKEN'" "200"
test_endpoint "List Templates" "curl -X GET $API_URL/api/templates -H 'Authorization: Bearer $TOKEN'" "200"

echo ""
echo "Results: $TESTS_PASSED passed, $TESTS_FAILED failed"
```

---

**Happy Testing!** 🚀

For issues or questions, see the main [README](README.md) or create a GitHub issue.
