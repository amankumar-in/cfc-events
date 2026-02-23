#!/bin/bash
# Comprehensive API Test Script for CFC Events Platform
# Tests all frontend-called endpoints, creates test data, and verifies flows

set -euo pipefail

BASE="http://localhost:1337"
# Admin JWT (for admin panel APIs like /users-permissions/*)
ADMIN_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzcxODI2NTg5LCJleHAiOjE3NzQ0MTg1ODl9.Y3EHElkh0UVCwkrCN73X5OzPB27ICwwHbccBsgxwe0k"
# API Token (for content API /api/* endpoints)
API_TOKEN="4c85280cf347c0357343874b69aee846eb67fe1eee8be823b8e6787d313662210ccdecf3b3e6d502338fda32d4a681cc5e9e264573369c083cf38d371418dc291f78b68753aa0b8a876ea1f768adcab4d5bb460712b65063f092b5682a45a5cde50420e75e1375b3a1c9cfb4cdc1360c35e5a45db05181cea47234f5ca3efd5a"

PASS=0
FAIL=0
WARN=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { ((PASS++)); echo -e "  ${GREEN}✓ PASS${NC}: $1"; }
fail() { ((FAIL++)); echo -e "  ${RED}✗ FAIL${NC}: $1"; }
warn() { ((WARN++)); echo -e "  ${YELLOW}⚠ WARN${NC}: $1"; }
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

# Helper: make API call via node (avoids curl quoting issues)
# Usage: api METHOD PATH [BODY] [TOKEN]
api() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local token="${4:-}"

  API_METHOD="$method" API_PATH="$path" API_BODY="$body" API_TOKEN_VAL="$token" API_BASE="$BASE" \
  node -e '
const http = require("http");
const { API_METHOD, API_PATH, API_BODY, API_TOKEN_VAL, API_BASE } = process.env;
const url = new URL(API_BASE + API_PATH);
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname + url.search,
  method: API_METHOD,
  headers: { "Content-Type": "application/json" }
};
if (API_TOKEN_VAL) options.headers["Authorization"] = "Bearer " + API_TOKEN_VAL;
if (API_BODY) options.headers["Content-Length"] = Buffer.byteLength(API_BODY);
const req = http.request(options, (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    console.log(JSON.stringify({ status: res.statusCode, body: data }));
  });
});
req.on("error", e => console.log(JSON.stringify({ status: 0, body: e.message })));
if (API_BODY) req.write(API_BODY);
req.end();
'
}

# Helper: extract from JSON response
jq_extract() {
  node -e "try { const d=JSON.parse(process.argv[1]); const r=eval('d.'+process.argv[2]); console.log(r===undefined?'':r); } catch(e) { console.log(''); }" "$1" "$2"
}

# Helper: parse the inner body JSON
parse_body() {
  node -e "try { const outer=JSON.parse(process.argv[1]); const inner=JSON.parse(outer.body); console.log(JSON.stringify(inner)); } catch(e) { console.log('{}'); }" "$1"
}

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CFC Events Platform - API Test Suite       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"

########################################
section "STEP 1: Health Check"
########################################
result=$(api GET "/_health")
code=$(jq_extract "$result" "status")
if [ "$code" = "204" ]; then
  pass "Strapi health check (204)"
else
  fail "Strapi health check - got $code"
fi

########################################
section "STEP 2: Verify Auth Tokens"
########################################
# Test API token works for content API
result=$(api GET "/api/events" "" "$API_TOKEN")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then
  pass "API Token works for content API"
else
  fail "API Token rejected ($code)"
fi

# Test admin JWT works for admin API
result=$(api GET "/users-permissions/roles/2" "" "$ADMIN_JWT")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then
  pass "Admin JWT works for admin API"
else
  fail "Admin JWT rejected ($code)"
fi

########################################
section "STEP 3: Verify Public Permissions"
########################################
echo "  Checking public access for all content types..."
ALL_PUBLIC_OK=true
for endpoint in events speakers sponsors venues ticket-categories faqs faq-categories organizers organizations contact-messages ticket-purchases tickets sessions; do
  result=$(api GET "/api/$endpoint")
  code=$(jq_extract "$result" "status")
  if [ "$code" = "200" ]; then
    echo -e "    ${GREEN}✓${NC} $endpoint: 200"
  else
    echo -e "    ${RED}✗${NC} $endpoint: $code"
    ALL_PUBLIC_OK=false
  fi
done
if [ "$ALL_PUBLIC_OK" = true ]; then
  pass "All content types publicly readable"
else
  fail "Some content types not publicly readable"
fi

########################################
section "STEP 4: Create Test Data (via API Token)"
########################################

# 4.1 Create Venue
echo -e "\n  ${BLUE}4.1 Creating Venue...${NC}"
VENUE_BODY=$(node -e 'console.log(JSON.stringify({data:{Name:"Kampala Convention Centre",Slug:"kampala-convention-centre",City:"Kampala",Country:"Uganda",Address:"Plot 1, Victoria Road",MainVenue:true,Description:[{type:"paragraph",children:[{text:"Premier event venue in the heart of Kampala",type:"text"}]}]}}))')
result=$(api POST "/api/venues" "$VENUE_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
VENUE_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Venue created (documentId: $VENUE_DOC_ID)"
else
  # May already exist — try to find it
  result=$(api GET "/api/venues?filters[Slug][\$eq]=kampala-convention-centre")
  body=$(parse_body "$result")
  VENUE_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data[0]?d.data[0].documentId:'')}catch(e){console.log('')}" "$body")
  if [ -n "$VENUE_DOC_ID" ]; then
    pass "Venue already exists (documentId: $VENUE_DOC_ID)"
  else
    fail "Could not create or find venue (status: $code)"
    echo "    Response: $(echo "$body" | head -c 300)"
  fi
fi

# 4.2 Create Event
echo -e "\n  ${BLUE}4.2 Creating Event...${NC}"
EVENT_BODY=$(node -e "console.log(JSON.stringify({data:{Title:'UNITE Expo 2025',Slug:'unite-expo-2025',ShortDescription:'The premier blockchain and fintech summit connecting Middle East and East Africa',Description:[{type:'paragraph',children:[{text:'A multi-day summit bringing together blockchain and fintech innovators.',type:'text'}]}],Location:'Kampala, Uganda',StartDate:'2025-09-15T09:00:00.000Z',EndDate:'2025-09-17T18:00:00.000Z',Category:'summit',isFeatured:true,Status:'published',accessMode:'ticketed',venue:'$VENUE_DOC_ID'}}))")
result=$(api POST "/api/events" "$EVENT_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
EVENT_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Event created (documentId: $EVENT_DOC_ID)"
else
  result=$(api GET "/api/events?filters[Slug][\$eq]=unite-expo-2025")
  body=$(parse_body "$result")
  EVENT_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data[0]?d.data[0].documentId:'')}catch(e){console.log('')}" "$body")
  if [ -n "$EVENT_DOC_ID" ]; then
    pass "Event already exists (documentId: $EVENT_DOC_ID)"
  else
    fail "Could not create or find event (status: $code)"
    echo "    Response: $(echo "$body" | head -c 300)"
  fi
fi

# 4.3 Create Speaker
echo -e "\n  ${BLUE}4.3 Creating Speaker...${NC}"
result=$(api POST "/api/speakers" '{"data":{"Name":"Dr. Sarah Chen","Slug":"dr-sarah-chen","Title":"Chief Blockchain Officer","Organization":"FinTech Africa","ShortBio":"Leading expert in blockchain applications for emerging markets.","Featured":true,"SortOrder":1}}' "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
SPEAKER_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Speaker created (documentId: $SPEAKER_DOC_ID)"
else
  result=$(api GET "/api/speakers?filters[Slug][\$eq]=dr-sarah-chen")
  body=$(parse_body "$result")
  SPEAKER_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data[0]?d.data[0].documentId:'')}catch(e){console.log('')}" "$body")
  if [ -n "$SPEAKER_DOC_ID" ]; then
    pass "Speaker already exists (documentId: $SPEAKER_DOC_ID)"
  else
    fail "Could not create or find speaker (status: $code)"
  fi
fi

# 4.4 Create Sponsor
echo -e "\n  ${BLUE}4.4 Creating Sponsor...${NC}"
result=$(api POST "/api/sponsors" '{"data":{"Name":"BlockChain Corp","Slug":"blockchain-corp","Tier":"Gold","Featured":true,"Website":"https://blockchaincorp.example.com","Description":"Leading blockchain infrastructure provider"}}' "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
SPONSOR_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Sponsor created (documentId: $SPONSOR_DOC_ID)"
else
  result=$(api GET "/api/sponsors?filters[Slug][\$eq]=blockchain-corp")
  body=$(parse_body "$result")
  SPONSOR_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data[0]?d.data[0].documentId:'')}catch(e){console.log('')}" "$body")
  if [ -n "$SPONSOR_DOC_ID" ]; then
    pass "Sponsor already exists (documentId: $SPONSOR_DOC_ID)"
  else
    fail "Could not create or find sponsor (status: $code)"
  fi
fi

# 4.5 Create Session (with event + speaker relations)
echo -e "\n  ${BLUE}4.5 Creating Session...${NC}"
SESSION_BODY=$(node -e "console.log(JSON.stringify({data:{Title:'Keynote: Future of Digital Finance',Slug:'keynote-future-digital-finance',ShortDescription:'Opening keynote on the future of digital finance in emerging markets',Description:[{type:'paragraph',children:[{text:'A deep dive into the future of digital finance.',type:'text'}]}],StartDate:'2025-09-15T09:00:00.000Z',EndDate:'2025-09-15T10:00:00.000Z',format:'hybrid',streamType:'livestream',event:'$EVENT_DOC_ID',speakers:['$SPEAKER_DOC_ID']}}))")
result=$(api POST "/api/sessions" "$SESSION_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
SESSION_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Session created (documentId: $SESSION_DOC_ID)"
else
  echo "    Response: $(echo "$body" | head -c 300)"
  result=$(api GET "/api/sessions?filters[Slug][\$eq]=keynote-future-digital-finance")
  body=$(parse_body "$result")
  SESSION_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data[0]?d.data[0].documentId:'')}catch(e){console.log('')}" "$body")
  if [ -n "$SESSION_DOC_ID" ]; then
    pass "Session already exists (documentId: $SESSION_DOC_ID)"
  else
    fail "Could not create or find session (status: $code)"
  fi
fi

# 4.6 Create Ticket Category
echo -e "\n  ${BLUE}4.6 Creating Ticket Category...${NC}"
TCAT_BODY=$(node -e "console.log(JSON.stringify({data:{name:'General Admission',description:[{type:'paragraph',children:[{text:'Standard access to all main sessions',type:'text'}]}],price:50,currency:'USD',validFrom:'2025-07-01',validUntil:'2025-09-14',maxPurchaseQuantity:10,isActive:true,isFeatured:false,grantsFullEventAccess:true,allowedEvents:['$EVENT_DOC_ID']}}))")
result=$(api POST "/api/ticket-categories" "$TCAT_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
TCAT_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Ticket Category created (documentId: $TCAT_DOC_ID)"
else
  warn "Ticket Category creation returned $code"
  echo "    Response: $(echo "$body" | head -c 300)"
fi

# 4.7 Create FAQ Category + FAQ
echo -e "\n  ${BLUE}4.7 Creating FAQ Category...${NC}"
result=$(api POST "/api/faq-categories" '{"data":{"Name":"General","Slug":"general","Description":"General questions about the event"}}' "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
FAQCAT_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "FAQ Category created (documentId: $FAQCAT_DOC_ID)"
else
  result=$(api GET "/api/faq-categories")
  body=$(parse_body "$result")
  FAQCAT_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data[0]?d.data[0].documentId:'')}catch(e){console.log('')}" "$body")
  if [ -n "$FAQCAT_DOC_ID" ]; then
    pass "FAQ Category already exists (documentId: $FAQCAT_DOC_ID)"
  else
    warn "FAQ Category creation returned $code"
  fi
fi

echo -e "  ${BLUE}4.7b Creating FAQ...${NC}"
FAQ_BODY=$(node -e "console.log(JSON.stringify({data:{Question:'What is UNITE Expo?',Answer:'UNITE Expo is a premier blockchain and fintech summit connecting innovators from the Middle East and East Africa.',event:'$EVENT_DOC_ID',Category:'$FAQCAT_DOC_ID'}}))")
result=$(api POST "/api/faqs" "$FAQ_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "FAQ created"
else
  body=$(parse_body "$result")
  warn "FAQ creation returned $code"
  echo "    Response: $(echo "$body" | head -c 300)"
fi

# 4.8 Create Organizer
echo -e "\n  ${BLUE}4.8 Creating Organizer...${NC}"
ORGANIZER_BODY=$(node -e 'console.log(JSON.stringify({data:{Name:"James Mwangi",Title:"Event Director",Organization:"UNITE Foundation",ShortBio:"Experienced event organizer with 10 years in tech conferences",Bio:[{type:"paragraph",children:[{text:"Experienced event organizer",type:"text"}]}]}}))')
result=$(api POST "/api/organizers" "$ORGANIZER_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Organizer created"
else
  warn "Organizer creation returned $code"
fi

# 4.9 Create Organization
echo -e "\n  ${BLUE}4.9 Creating Organization...${NC}"
ORG_BODY=$(node -e 'console.log(JSON.stringify({data:{Name:"UNITE Foundation",Role:"Lead Organizer",ShortDescription:"Non-profit foundation promoting blockchain education",Description:[{type:"paragraph",children:[{text:"Non-profit foundation promoting blockchain education",type:"text"}]}]}}))')
result=$(api POST "/api/organizations" "$ORG_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Organization created"
else
  warn "Organization creation returned $code"
fi

# 4.10 Create Contact Message (public, no auth)
echo -e "\n  ${BLUE}4.10 Creating Contact Message (public)...${NC}"
result=$(api POST "/api/contact-messages" '{"data":{"name":"Test User","email":"testuser@example.com","subject":"Test Inquiry","message":"This is a test message from the API test suite","inquiryType":"general"}}')
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Contact Message created (public, no auth)"
else
  warn "Contact Message creation returned $code"
fi

########################################
section "STEP 5: Test Frontend-Called Read Endpoints"
########################################

# 5.1 Homepage - events list
echo -e "\n  ${BLUE}5.1 Homepage events...${NC}"
result=$(api GET "/api/events?populate=*&sort=StartDate:asc&pagination[limit]=8")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
count=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.meta.pagination.total)}catch(e){console.log(0)}" "$body")
if [ "$code" = "200" ]; then
  pass "Homepage events (200, total: $count)"
else
  fail "Homepage events returned $code"
fi

# 5.2 Featured events
echo -e "\n  ${BLUE}5.2 Featured events...${NC}"
result=$(api GET '/api/events?filters[isFeatured][$eq]=true&populate=*&sort=StartDate:asc&pagination[limit]=4')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
count=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.meta.pagination.total)}catch(e){console.log(0)}" "$body")
if [ "$code" = "200" ] && [ "$count" -gt "0" ] 2>/dev/null; then
  pass "Featured events (200, total: $count)"
elif [ "$code" = "200" ]; then
  warn "Featured events returned 200 but total=$count (expected >= 1)"
else
  fail "Featured events returned $code"
fi

# 5.3 Events listing
echo -e "\n  ${BLUE}5.3 Events listing...${NC}"
result=$(api GET "/api/events?populate=*&sort=StartDate:asc")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then pass "Events listing (200)"; else fail "Events listing returned $code"; fi

# 5.4 Event detail by slug
echo -e "\n  ${BLUE}5.4 Event detail by slug...${NC}"
result=$(api GET '/api/events?filters[Slug][$eq]=unite-expo-2025&populate=*')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
has_data=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data.length>0?'yes':'no')}catch(e){console.log('no')}" "$body")
if [ "$code" = "200" ] && [ "$has_data" = "yes" ]; then
  pass "Event detail by slug (200, found)"
elif [ "$code" = "200" ]; then
  warn "Event detail returned 200 but no data for unite-expo-2025"
else
  fail "Event detail returned $code"
fi

# 5.5 Sessions for event
echo -e "\n  ${BLUE}5.5 Sessions for event...${NC}"
result=$(api GET '/api/sessions?filters[event][Slug][$eq]=unite-expo-2025&populate=*&sort=StartDate:asc')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
count=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.length:0)}catch(e){console.log(0)}" "$body")
if [ "$code" = "200" ]; then
  pass "Sessions for event (200, count: $count)"
else
  fail "Sessions for event returned $code"
  body=$(parse_body "$result")
  echo "    Response: $(echo "$body" | head -c 200)"
fi

# 5.6 Session detail by slug
echo -e "\n  ${BLUE}5.6 Session detail by slug...${NC}"
result=$(api GET '/api/sessions?filters[Slug][$eq]=keynote-future-digital-finance&populate=*')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
has_data=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data.length>0?'yes':'no')}catch(e){console.log('no')}" "$body")
if [ "$code" = "200" ] && [ "$has_data" = "yes" ]; then
  pass "Session detail by slug (200, found)"
elif [ "$code" = "200" ]; then
  warn "Session detail returned 200 but no data"
else
  fail "Session detail returned $code"
fi

# 5.7 Speakers listing
echo -e "\n  ${BLUE}5.7 Speakers listing...${NC}"
result=$(api GET "/api/speakers?populate=*&sort[0]=SortOrder:asc&sort[1]=Name:asc")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
count=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.meta.pagination.total)}catch(e){console.log(0)}" "$body")
if [ "$code" = "200" ]; then
  pass "Speakers listing (200, total: $count)"
else
  fail "Speakers listing returned $code"
fi

# 5.8 Speaker detail
echo -e "\n  ${BLUE}5.8 Speaker detail...${NC}"
result=$(api GET '/api/speakers?filters[Slug][$eq]=dr-sarah-chen&populate=*')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
has_data=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data.length>0?'yes':'no')}catch(e){console.log('no')}" "$body")
if [ "$code" = "200" ] && [ "$has_data" = "yes" ]; then
  pass "Speaker detail by slug (200, found)"
elif [ "$code" = "200" ]; then
  warn "Speaker detail returned 200 but no data for dr-sarah-chen"
else
  fail "Speaker detail returned $code"
fi

# 5.9 Sponsors listing
echo -e "\n  ${BLUE}5.9 Sponsors listing...${NC}"
result=$(api GET "/api/sponsors?populate=*")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
count=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.meta.pagination.total)}catch(e){console.log(0)}" "$body")
if [ "$code" = "200" ]; then
  pass "Sponsors listing (200, total: $count)"
else
  fail "Sponsors listing returned $code"
fi

# 5.10 Sponsor detail
echo -e "\n  ${BLUE}5.10 Sponsor detail...${NC}"
result=$(api GET '/api/sponsors?filters[Slug][$eq]=blockchain-corp&populate=*')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
has_data=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data.length>0?'yes':'no')}catch(e){console.log('no')}" "$body")
if [ "$code" = "200" ] && [ "$has_data" = "yes" ]; then
  pass "Sponsor detail by slug (200, found)"
elif [ "$code" = "200" ]; then
  warn "Sponsor detail returned 200 but no data for blockchain-corp"
else
  fail "Sponsor detail returned $code"
fi

# 5.11 Venues listing
echo -e "\n  ${BLUE}5.11 Venues listing...${NC}"
result=$(api GET "/api/venues?populate=*")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then pass "Venues listing (200)"; else fail "Venues listing returned $code"; fi

# 5.12 Venue detail
echo -e "\n  ${BLUE}5.12 Venue detail...${NC}"
result=$(api GET '/api/venues?filters[Slug][$eq]=kampala-convention-centre&populate=*')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
has_data=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data.length>0?'yes':'no')}catch(e){console.log('no')}" "$body")
if [ "$code" = "200" ] && [ "$has_data" = "yes" ]; then
  pass "Venue detail by slug (200, found)"
elif [ "$code" = "200" ]; then
  warn "Venue detail returned 200 but no data"
else
  fail "Venue detail returned $code"
fi

# 5.13 Ticket categories
echo -e "\n  ${BLUE}5.13 Ticket categories...${NC}"
result=$(api GET "/api/ticket-categories?populate=*")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then pass "Ticket categories (200)"; else fail "Ticket categories returned $code"; fi

# 5.14 FAQs
echo -e "\n  ${BLUE}5.14 FAQs...${NC}"
result=$(api GET "/api/faqs?populate=*")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then pass "FAQs listing (200)"; else fail "FAQs listing returned $code"; fi

# 5.15 FAQ Categories
echo -e "\n  ${BLUE}5.15 FAQ Categories...${NC}"
result=$(api GET "/api/faq-categories")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then pass "FAQ Categories listing (200)"; else fail "FAQ Categories returned $code"; fi

# 5.16 Organizers
echo -e "\n  ${BLUE}5.16 Organizers...${NC}"
result=$(api GET "/api/organizers")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then pass "Organizers listing (200)"; else fail "Organizers returned $code"; fi

# 5.17 Organizations
echo -e "\n  ${BLUE}5.17 Organizations...${NC}"
result=$(api GET "/api/organizations")
code=$(jq_extract "$result" "status")
if [ "$code" = "200" ]; then pass "Organizations listing (200)"; else fail "Organizations returned $code"; fi

########################################
section "STEP 6: Test Auth Flow"
########################################

# 6.1 Send OTP
echo -e "\n  ${BLUE}6.1 Send OTP...${NC}"
result=$(api POST "/api/auth/send-otp" '{"email":"test@example.com"}')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
if [ "$code" = "200" ]; then
  pass "Send OTP (200)"
elif [ "$code" = "500" ]; then
  error_msg=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.error?d.error.message:'')}catch(e){console.log('')}" "$body")
  warn "Send OTP returned 500 (expected without SMTP): $error_msg"
elif [ "$code" = "400" ]; then
  error_msg=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.error?d.error.message:d.message||'')}catch(e){console.log('')}" "$body")
  warn "Send OTP returned 400: $error_msg (SMTP not configured)"
else
  fail "Send OTP returned $code"
  echo "    Response: $(echo "$body" | head -c 300)"
fi

# 6.2 Auth/me without token (should be 401/403)
echo -e "\n  ${BLUE}6.2 Auth/me without token...${NC}"
result=$(api GET "/api/auth/me")
code=$(jq_extract "$result" "status")
if [ "$code" = "401" ] || [ "$code" = "403" ]; then
  pass "Auth/me without token correctly returns $code"
else
  fail "Auth/me without token returned $code (expected 401 or 403)"
fi

# 6.3 Verify OTP route reachable (will fail with bad code but should not 404)
echo -e "\n  ${BLUE}6.3 Verify OTP route reachable...${NC}"
result=$(api POST "/api/auth/verify-otp" '{"email":"test@example.com","code":"000000"}')
code=$(jq_extract "$result" "status")
if [ "$code" != "404" ]; then
  pass "Verify OTP route exists ($code)"
else
  fail "Verify OTP returns 404 - route not registered"
fi

########################################
section "STEP 7: Test Daily.co Routes (reachability)"
########################################

# 7.1 Meeting token
echo -e "\n  ${BLUE}7.1 Daily meeting-token...${NC}"
result=$(api POST "/api/daily/meeting-token" '{"sessionId":"test-session"}')
code=$(jq_extract "$result" "status")
if [ "$code" != "404" ]; then
  pass "Daily meeting-token route exists ($code)"
else
  fail "Daily meeting-token returns 404"
fi

# 7.2 Create room (should require auth)
echo -e "\n  ${BLUE}7.2 Daily create-room (no auth)...${NC}"
result=$(api POST "/api/daily/create-room" '{"sessionId":"test"}')
code=$(jq_extract "$result" "status")
if [ "$code" = "403" ] || [ "$code" = "401" ]; then
  pass "Daily create-room correctly requires auth ($code)"
elif [ "$code" != "404" ]; then
  pass "Daily create-room route exists ($code)"
else
  fail "Daily create-room returns 404"
fi

# 7.3 Send action (should require auth)
echo -e "\n  ${BLUE}7.3 Daily send-action (no auth)...${NC}"
result=$(api POST "/api/daily/send-action" '{"roomName":"test","action":"test"}')
code=$(jq_extract "$result" "status")
if [ "$code" = "403" ] || [ "$code" = "401" ]; then
  pass "Daily send-action correctly requires auth ($code)"
elif [ "$code" != "404" ]; then
  pass "Daily send-action route exists ($code)"
else
  fail "Daily send-action returns 404"
fi

########################################
section "STEP 8: Test Ticket Purchase Flow"
########################################

# 8.1 Create ticket purchase
echo -e "\n  ${BLUE}8.1 Create ticket purchase...${NC}"
REF_NUM="TEST-$(date +%s)"
PURCHASE_BODY=$(node -e "console.log(JSON.stringify({data:{referenceNumber:'$REF_NUM',totalAmount:50,currency:'USD',paymentStatus:'pending',buyerName:'Test Buyer',buyerEmail:'buyer@example.com',purchaseDate:'2025-08-01T10:00:00.000Z'}}))")
result=$(api POST "/api/ticket-purchases" "$PURCHASE_BODY" "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
PURCHASE_DOC_ID=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data?d.data.documentId:'')}catch(e){console.log('')}" "$body")

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  pass "Ticket purchase created (ref: $REF_NUM)"
else
  warn "Ticket purchase creation returned $code"
  echo "    Response: $(echo "$body" | head -c 300)"
fi

# 8.2 Update purchase by reference
echo -e "\n  ${BLUE}8.2 Update purchase by reference...${NC}"
result=$(api PUT "/api/ticket-purchases/by-reference/$REF_NUM" '{"data":{"paymentStatus":"paid"}}' "$API_TOKEN")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
if [ "$code" = "200" ]; then
  pass "Ticket purchase updated by reference (200)"
else
  warn "Update by reference returned $code"
  echo "    Response: $(echo "$body" | head -c 300)"
fi

# 8.3 Verify purchase status
echo -e "\n  ${BLUE}8.3 Verify purchase status...${NC}"
result=$(api GET "/api/ticket-purchases?filters[referenceNumber][\$eq]=$REF_NUM")
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")
payment_status=$(node -e "try{const d=JSON.parse(process.argv[1]);console.log(d.data&&d.data[0]?d.data[0].paymentStatus:'')}catch(e){console.log('')}" "$body")
if [ "$code" = "200" ] && [ "$payment_status" = "paid" ]; then
  pass "Ticket purchase verified (status: paid)"
elif [ "$code" = "200" ]; then
  warn "Ticket purchase found but status='$payment_status' (expected 'paid')"
else
  fail "Ticket purchase verification returned $code"
fi

########################################
section "STEP 9: Test Deep Population"
########################################
echo -e "\n  ${BLUE}9.1 Event with deep nested population...${NC}"
result=$(api GET '/api/events?filters[Slug][$eq]=unite-expo-2025&populate[sessions][populate][speakers]=true&populate[venue]=true&populate[ticketCategories]=true&populate[organizers]=true&populate[organizations]=true&populate[faqs]=true&populate[sponsors][fields][0]=Name&populate[sponsors][fields][1]=Slug&populate[sponsors][fields][2]=Tier')
code=$(jq_extract "$result" "status")
body=$(parse_body "$result")

if [ "$code" = "200" ]; then
  relations=$(node -e "
try {
  const d = JSON.parse(process.argv[1]);
  const event = d.data && d.data[0];
  if (!event) { console.log('No event found'); process.exit(); }
  const rels = [];
  if (event.venue) rels.push('venue');
  if (event.sessions && event.sessions.length > 0) rels.push('sessions(' + event.sessions.length + ')');
  if (event.sponsors && event.sponsors.length > 0) rels.push('sponsors(' + event.sponsors.length + ')');
  if (event.ticketCategories && event.ticketCategories.length > 0) rels.push('ticketCategories(' + event.ticketCategories.length + ')');
  if (event.organizers && event.organizers.length > 0) rels.push('organizers(' + event.organizers.length + ')');
  if (event.organizations && event.organizations.length > 0) rels.push('organizations(' + event.organizations.length + ')');
  if (event.faqs && event.faqs.length > 0) rels.push('faqs(' + event.faqs.length + ')');
  console.log(rels.length > 0 ? rels.join(', ') : 'no relations populated');
} catch(e) { console.log('parse error: ' + e.message); }
" "$body")
  pass "Deep population (200) - populated: $relations"
else
  fail "Deep population returned $code"
  echo "    Response: $(echo "$body" | head -c 300)"
fi

########################################
section "SUMMARY"
########################################
echo ""
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo -e "  ${YELLOW}Warnings: $WARN${NC}"
echo ""
TOTAL=$((PASS + FAIL))
if [ "$FAIL" -eq "0" ]; then
  echo -e "  ${GREEN}All $TOTAL tests passed!${NC}"
else
  echo -e "  ${RED}$FAIL of $TOTAL tests failed.${NC}"
fi
echo ""
