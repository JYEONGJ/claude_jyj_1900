"""
Claude API - Extended Thinking 예제 (Python)
"""

from anthropic import Anthropic

client = Anthropic()

def basic_thinking():
    """기본 thinking 사용"""
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        thinking={
            "type": "adaptive"  # Claude가 자동으로 thinking 깊이 결정
        },
        messages=[
            {
                "role": "user",
                "content": "1부터 100까지의 수 중에서 소수를 모두 찾아줘"
            }
        ]
    )

    print("=== 기본 Thinking ===")
    for block in response.content:
        if block.type == "thinking":
            print(f"[Thinking] {block.thinking[:200]}...")
        elif block.type == "text":
            print(f"[답변] {block.text}")
    print()


def thinking_with_effort():
    """Effort 레벨로 thinking 깊이 제어"""
    for effort in ["low", "medium", "high", "xhigh"]:
        response = client.messages.create(
            model="claude-opus-5-5",
            max_tokens=16000,
            output_config={"effort": effort},
            thinking={"type": "adaptive"},
            messages=[
                {
                    "role": "user",
                    "content": "이진 탐색 알고리즘을 설명해줘"
                }
            ]
        )

        print(f"=== Effort: {effort.upper()} ===")
        thinking_tokens = 0
        for block in response.content:
            if block.type == "thinking":
                thinking_tokens = len(block.thinking.split())
                print(f"Thinking 길이: ~{thinking_tokens}단어")
            elif block.type == "text":
                print(f"답변: {block.text[:150]}...")
        print()


def thinking_with_display():
    """Thinking 결과 표시 방식 제어"""
    # 1. thinking 숨기기 (기본값)
    response1 = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        thinking={"type": "adaptive", "display": "omitted"},
        messages=[{"role": "user", "content": "동적 프로그래밍이란?"}]
    )

    print("=== Display: omitted (기본값) ===")
    for block in response1.content:
        if block.type == "thinking":
            print(f"Thinking: (비어있음)")
        elif block.type == "text":
            print(f"답변: {block.text[:200]}...")
    print()

    # 2. thinking 요약 표시
    response2 = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        thinking={"type": "adaptive", "display": "summarized"},
        messages=[{"role": "user", "content": "동적 프로그래밍이란?"}]
    )

    print("=== Display: summarized ===")
    for block in response2.content:
        if block.type == "thinking":
            print(f"Thinking 요약: {block.thinking[:200]}...")
        elif block.type == "text":
            print(f"답변: {block.text[:200]}...")
    print()


def thinking_streaming():
    """Thinking을 스트리밍으로 처리"""
    print("=== Thinking with Streaming ===")

    with client.messages.stream(
        model="claude-opus-5-5",
        max_tokens=16000,
        thinking={"type": "adaptive", "display": "summarized"},
        messages=[
            {
                "role": "user",
                "content": "피보나치 수열을 재귀로 구현하면 왜 느릴까?"
            }
        ]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)

    # 최종 메시지 가져오기
    final_message = stream.get_final_message()
    print("\n")
    print(f"최종 사용량: {final_message.usage}")
    print()


def thinking_with_tools():
    """Tool use와 함께 thinking 사용"""
    tools = [
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
    ]

    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        thinking={"type": "adaptive"},
        tools=tools,
        messages=[
            {
                "role": "user",
                "content": "345 × 67의 결과에 89를 더한 값은?"
            }
        ]
    )

    print("=== Thinking with Tools ===")
    for block in response.content:
        if block.type == "thinking":
            print(f"[Thinking] {block.thinking[:300]}...")
        elif block.type == "tool_use":
            print(f"[Tool Call] {block.name}({block.input})")
        elif block.type == "text":
            print(f"[Text] {block.text}")
    print()


if __name__ == "__main__":
    print("Claude API - Extended Thinking 예제\n")

    # 1. 기본 thinking
    basic_thinking()

    # 2. Effort 레벨 제어
    thinking_with_effort()

    # 3. Display 옵션
    thinking_with_display()

    # 4. Streaming
    thinking_streaming()

    # 5. Tool과 함께 사용
    thinking_with_tools()
