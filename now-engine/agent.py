import ollama

class ConversationalAgent:
  def __init__(self, model: str = "llama3.2:latest"):
    self.client = ollama.Client()
    self.model = model # Try deepseekr-1 later.
    self.messages = []

  # to give ST memory within a conversation, we have input previous messages.
  def system_prompt(self, system_prompt: str):
    self.messages.append({"role": "system", "content": system_prompt})

  def conversation(self, attachment: str = None):
    user_query = input("You: ")
    if attachment:
      user_query += f"\nAttachment: {attachment}"
    self.messages.append({"role": "user", "content": user_query})
    
    # ChatGPT and Claude are never the same instances by the way. They basically operate as RAGs.
    # TODO: Only use entire chat history when referred to it...
    response = self.client.chat(model=self.model, messages=self.messages)
    self.messages.append({"role": "assistant", "content": response.message.content})
      
    print(f"Agent: {response.message.content}")

  # When GUI, can do this for any message in conversation.
  def get_latest_response(self):
    return self.messages[-1]["content"]