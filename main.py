import ollama
import tools.registry as registry
import tools.memory_tool as mry
import logging
import os


print("Welp, Yappr’s here")

MODEL_NAME = "qwen2.5:1.5b"

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename = "logs/agent.log",
    level = logging.INFO,
    format = "%(asctime)s - %(levelname)s - %(message)s",
    force = True
)
old_memories = mry.get_memory_tool()

messages = [
    {
        "role": "system",
        "content": """You are a helpful AI assistant, youre name is Yappr, you were created by slyyr($), his github account is https://github.com/slyyr, youre founder is slyyr too. Answer clearly and concisely.
          For current weather questions, always use the weather tool and never make up weather information.
          For calculation questions always use the calculate tool and never make up calculate information.
          For time questions always use the time tool and never make up time information
          For requests to remember, save, store, or not forget information, always use the memory tool.
          For questions about information stored in indexed documents, always use the rag tool and do not make up information."""
    },
    {
        "role": "system",
        "content": """About Slyyr:
    Slyyr is the creator and founder of Yappr. Slyyr is an AI and robotics engineering student focused on becoming an AI Engineer with strong robotics engineering skills.

    Slyyr is experienced with Python, web development, AI agents, tool calling, APIs, SQL, testing, document processing, embeddings, and RAG. Slyyr is currently expanding into C++, Linux, ROS 2, machine learning, deep learning, computer vision, PyTorch, generative AI, and robotics.

    Slyyr develops projects under the GitHub username.slyyr. Yappr is one of slyyr's main projects and is built to explore AI agent architecture, tool calling, memory, retrieval, RAG, and AI engineering.

    If someone asks who Slyyr is, answer using this information and do not invent additional personal information."""
    },
    {
        "role": "system",
        "content": "These are memories stored from previous conversations:\n" +
               "\n".join(f"- {memory}" for memory in old_memories)
    }
]




def route_request(user_input):
    intents = []
    user_input = user_input.lower()

    if "time" in user_input:
            intents.append("time")

    if "weather" in user_input:
            intents.append("weather")

    if any(phrase in user_input for phrase in [
          "remember", "save this", "store this", "don't forget"
          ]):
                intents.append("memory")

    if any(operator in user_input for operator in [
          "+", "-", "*", "/"
          ]):
            intents.append("calculate")

    if any(phrase in user_input for phrase in [
    "search", "latest", "news", "current", "online", "internet"
    ]):
        intents.append("web_search")

    if any(phrase in user_input for phrase in [
    "read file", "read document", "open file", "open document",
    "document", "file", ".txt", ".md", ".json", ".csv", ".pdf", ".docx"
   ]):
        intents.append("read_document")

        if any(phrase in user_input for phrase in [
        "according to the documents",
        "according to the document",
        "from the documents",
        "from the document",
        "search my documents",
        "search the documents",
        "find in my documents",
        "what does the document say",
        "what do my documents say"
    ]):
         intents.append("rag")

    if any(phrase in user_input for phrase in [
    "according to the documents",
    "according to the document",
    "from the documents",
    "from the document",
    "search my documents",
    "search the documents",
    "find in my documents",
    "what does the document say",
    "what do my documents say"
    ]):
        intents.append("rag")

    if not intents:
         intents.append("none")
    return intents

while True:

    user_message = input("What’s the yap? : ")
    intents = route_request(user_message)

    if user_message.lower() == "exit":
        print("Goodbye!")
        break


    # Add user message to memory
    messages.append({
        "role": "user",
        "content": user_message
    })

    logging.info(f"USER: {user_message}")

    selected_tools = [
    registry.tools[intent]["definition"]
    for intent in intents
    if intent in registry.tools
    ]

    # Ask Ollama what to do
    response = ollama.chat(
        model=MODEL_NAME,
        messages=messages,
        tools=selected_tools
    )


    # If Ollama wants to use a tool
    if response.message.tool_calls:

        # Save Ollama's tool-call message
        messages.append(response.message)

        for  tool_call in response.message.tool_calls:
            function_name = tool_call.function.name
            function_arguments = tool_call.function.arguments

            logging.info(f"FUNCTION: {function_name}")

            function = registry.tools[function_name]["function"]
            result = function(**function_arguments)
            logging.info(f"RESULT: {result}")


            # Add tool result to memory
            messages.append({
                "role": "tool",
                "tool_name": tool_call.function.name,
                "content": str(result)
            })


        # Send tool result back to Ollama
        final_response = ollama.chat(
            model=MODEL_NAME,
            messages=messages
        )


        # Print final answer
        print(final_response.message.content)
        logging.info(f"AI: {final_response.message.content}")


        # Save final answer to memory
        messages.append({
            "role": "assistant",
            "content": final_response.message.content
        })


    # Normal conversation without tools
    else:

        print(response.message.content)
        logging.info(f"AI: {response.message.content}")

        messages.append({
            "role": "assistant",
            "content": response.message.content
        })
