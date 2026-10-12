/**
 * Claude API - Extended Thinking 예제 (TypeScript)
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 1. 기본 thinking 사용
async function basicThinking() {
  const response = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: {
      type: "adaptive", // Claude가 자동으로 thinking 깊이 결정
    },
    messages: [
      {
        role: "user",
        content: "1부터 100까지의 수 중에서 소수를 모두 찾아줘",
      },
    ],
  });

  console.log("=== 기본 Thinking ===");
  for (const block of response.content) {
    if (block.type === "thinking") {
      console.log(`[Thinking] ${block.thinking.substring(0, 200)}...`);
    } else if (block.type === "text") {
      console.log(`[답변] ${block.text}`);
    }
  }
  console.log();
}

// 2. Effort 레벨로 thinking 깊이 제어
async function thinkingWithEffort() {
  const efforts = ["low", "medium", "high", "xhigh"] as const;

  for (const effort of efforts) {
    const response = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort },
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: "이진 탐색 알고리즘을 설명해줘",
        },
      ],
    });

    console.log(`=== Effort: ${effort.toUpperCase()} ===`);
    for (const block of response.content) {
      if (block.type === "thinking") {
        const wordCount = block.thinking.split(" ").length;
        console.log(`Thinking 길이: ~${wordCount}단어`);
      } else if (block.type === "text") {
        console.log(`답변: ${block.text.substring(0, 150)}...`);
      }
    }
    console.log();
  }
}

// 3. Thinking 결과 표시 방식 제어
async function thinkingWithDisplay() {
  // 1. thinking 숨기기 (기본값)
  console.log("=== Display: omitted (기본값) ===");
  const response1 = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive", display: "omitted" },
    messages: [{ role: "user", content: "동적 프로그래밍이란?" }],
  });

  for (const block of response1.content) {
    if (block.type === "thinking") {
      console.log(`Thinking: (비어있음 - display: omitted)`);
    } else if (block.type === "text") {
      console.log(`답변: ${block.text.substring(0, 200)}...`);
    }
  }
  console.log();

  // 2. thinking 요약 표시
  console.log("=== Display: summarized ===");
  const response2 = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive", display: "summarized" },
    messages: [{ role: "user", content: "동적 프로그래밍이란?" }],
  });

  for (const block of response2.content) {
    if (block.type === "thinking") {
      console.log(`Thinking 요약: ${block.thinking.substring(0, 200)}...`);
    } else if (block.type === "text") {
      console.log(`답변: ${block.text.substring(0, 200)}...`);
    }
  }
  console.log();
}

// 4. Thinking을 스트리밍으로 처리
async function thinkingStreaming() {
  console.log("=== Thinking with Streaming ===");

  const stream = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    stream: true,
    thinking: { type: "adaptive", display: "summarized" },
    messages: [
      {
        role: "user",
        content: "피보나치 수열을 재귀로 구현하면 왜 느릴까?",
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }
  console.log("\n");
}

// 5. Tool use와 함께 thinking 사용
async function thinkingWithTools() {
  const tools = [
    {
      name: "calculator",
      description: "간단한 계산을 수행합니다",
      input_schema: {
        type: "object" as const,
        properties: {
          operation: {
            type: "string" as const,
            enum: ["add", "subtract", "multiply", "divide"],
            description: "수행할 연산",
          },
          a: { type: "number" as const, description: "첫 번째 숫자" },
          b: { type: "number" as const, description: "두 번째 숫자" },
        },
        required: ["operation", "a", "b"],
      },
    },
  ];

  const response = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    tools,
    messages: [
      {
        role: "user",
        content: "345 × 67의 결과에 89를 더한 값은?",
      },
    ],
  });

  console.log("=== Thinking with Tools ===");
  for (const block of response.content) {
    if (block.type === "thinking") {
      console.log(`[Thinking] ${block.thinking.substring(0, 300)}...`);
    } else if (block.type === "tool_use") {
      console.log(`[Tool Call] ${block.name}(${JSON.stringify(block.input)})`);
    } else if (block.type === "text") {
      console.log(`[Text] ${block.text}`);
    }
  }
  console.log();
}

// 메인 함수
async function main() {
  console.log("Claude API - Extended Thinking 예제\n");

  try {
    // 1. 기본 thinking
    await basicThinking();

    // 2. Effort 레벨 제어
    await thinkingWithEffort();

    // 3. Display 옵션
    await thinkingWithDisplay();

    // 4. Streaming
    await thinkingStreaming();

    // 5. Tool과 함께 사용
    await thinkingWithTools();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

main();
