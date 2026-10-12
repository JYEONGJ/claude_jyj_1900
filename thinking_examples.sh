#!/bin/bash

# Claude API - Extended Thinking 예제 (cURL/HTTP)

API_KEY=${ANTHROPIC_API_KEY}
MODEL="claude-opus-5-5"
API_URL="https://api.anthropic.com/v1/messages"

echo "Claude API - Extended Thinking 예제"
echo ""

# 1. 기본 thinking 사용
echo "=== 1. 기본 Thinking ==="
curl -X POST "$API_URL" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "'"$MODEL"'",
    "max_tokens": 16000,
    "thinking": {
      "type": "adaptive"
    },
    "messages": [
      {
        "role": "user",
        "content": "1부터 100까지의 수 중에서 소수를 모두 찾아줘"
      }
    ]
  }' | jq '.content[] | select(.type=="thinking" or .type=="text")'

echo ""
echo ""

# 2. Effort 레벨로 thinking 깊이 제어
echo "=== 2. Effort: low ==="
curl -s -X POST "$API_URL" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "'"$MODEL"'",
    "max_tokens": 16000,
    "output_config": {
      "effort": "low"
    },
    "thinking": {
      "type": "adaptive"
    },
    "messages": [
      {
        "role": "user",
        "content": "이진 탐색 알고리즘을 설명해줘"
      }
    ]
  }' | jq '.content[0] | {type, length: (.text // .thinking | length)}'

echo ""
echo "=== 3. Effort: high ==="
curl -s -X POST "$API_URL" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "'"$MODEL"'",
    "max_tokens": 16000,
    "output_config": {
      "effort": "high"
    },
    "thinking": {
      "type": "adaptive"
    },
    "messages": [
      {
        "role": "user",
        "content": "이진 탐색 알고리즘을 설명해줘"
      }
    ]
  }' | jq '.content[0] | {type, length: (.text // .thinking | length)}'

echo ""
echo ""

# 4. Thinking 결과 표시 방식 제어 (omitted)
echo "=== 4. Display: omitted (기본값) ==="
curl -s -X POST "$API_URL" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "'"$MODEL"'",
    "max_tokens": 16000,
    "thinking": {
      "type": "adaptive",
      "display": "omitted"
    },
    "messages": [
      {
        "role": "user",
        "content": "동적 프로그래밍이란?"
      }
    ]
  }' | jq '.content[] | select(.type=="text") | .text' | head -c 200

echo ""
echo ""

# 5. Thinking 결과 표시 방식 제어 (summarized)
echo "=== 5. Display: summarized ==="
curl -s -X POST "$API_URL" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "'"$MODEL"'",
    "max_tokens": 16000,
    "thinking": {
      "type": "adaptive",
      "display": "summarized"
    },
    "messages": [
      {
        "role": "user",
        "content": "동적 프로그래밍이란?"
      }
    ]
  }' | jq '.content[] | {type, content: ((.text // .thinking) | .[0:200] + "...")}'

echo ""
echo ""

# 6. Tool use와 함께 thinking 사용
echo "=== 6. Thinking with Tools ==="
curl -s -X POST "$API_URL" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "'"$MODEL"'",
    "max_tokens": 16000,
    "thinking": {
      "type": "adaptive"
    },
    "tools": [
      {
        "name": "calculator",
        "description": "간단한 계산을 수행합니다",
        "input_schema": {
          "type": "object",
          "properties": {
            "operation": {
              "type": "string",
              "enum": ["add", "subtract", "multiply", "divide"],
              "description": "수행할 연산"
            },
            "a": {"type": "number", "description": "첫 번째 숫자"},
            "b": {"type": "number", "description": "두 번째 숫자"}
          },
          "required": ["operation", "a", "b"]
        }
      }
    ],
    "messages": [
      {
        "role": "user",
        "content": "345 × 67의 결과에 89를 더한 값은?"
      }
    ]
  }' | jq '.content[] | {type, content: (.text // .thinking // .input)}'
