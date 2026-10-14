
from main import clear_conversation


def test_clear_conversation_preserves_initial_messages():
    initial_messages = [
        {"role": "system", "content": "System instructions"},
        {"role": "system", "content": "Persistent memory context"},
    ]

    messages = initial_messages.copy()
    messages.extend([
        {"role": "user", "content": "My previous question"},
        {"role": "assistant", "content": "My previous answer"},
    ])

    result = clear_conversation(messages, initial_messages)

    assert messages == initial_messages
    assert result == (
        "Conversation cleared. Persistent memories and documents are preserved."
    )


def test_clear_conversation_removes_tool_messages():
    initial_messages = [
        {"role": "system", "content": "System instructions"}
    ]

    messages = initial_messages.copy()
    messages.extend([
        {"role": "user", "content": "Find this document"},
        {"role": "tool", "content": "Document contents"},
    ])

    clear_conversation(messages, initial_messages)

    assert messages == initial_messages
    assert all(message["role"] == "system" for message in messages)
