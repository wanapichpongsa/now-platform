
import ollama
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.context_manager import get_db_connection
import logging

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

"""
Global database insert functions
"""

def log_category(category: str) -> tuple[str]:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM document_categories WHERE name = %s", (category,))
            category_data = cursor.fetchone()
            if not category_data:
                cursor.execute(
                    "INSERT INTO document_categories (name) VALUES (%s)", (category,))
                conn.commit()
            cursor.execute(
                "SELECT name FROM document_categories WHERE name = %s", (category,))
            category_name = cursor.fetchone()[0]
            return category_name


def log_conversation(model: str, model_type: str, document_category: str) -> tuple[str]:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM models WHERE name = %s", (model,))
            # Is this constrained that there can only be 1 result?
            model_data = cursor.fetchone()
            if not model_data:
                cursor.execute(
                    "INSERT INTO models (name, type) VALUES (%s, %s)", (model, model_type))
                conn.commit()
            cursor.execute("SELECT id FROM models WHERE name = %s", (model,))
            model_id = cursor.fetchone()[0]
            # We just need to insert value that aligns with foreign key (no need to be direct insertion from table)
            cursor.execute(
                "INSERT INTO conversations (model_id, document_category) VALUES (%s, %s) RETURNING id", (model_id, document_category))
            conversation_id = cursor.fetchone()[0]
            conn.commit()
            return conversation_id


def log_conversation_messages(conversation_id: str, user_query: str, response: str) -> None:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO conversation_messages (conversation_id, query, response) VALUES (%s, %s, %s)",
                           (conversation_id, user_query, response))
            conn.commit()

"""
Agent class which uses insert functions to log conversation messages. <- Gradient boosting. <- Decision tree, random forest?
Classifier model first (for each document) -> What case it belongs to. <- XG Boost, Random Forest, etc.
2 smaller models?
Class grouping?
Clustering algorithm: Unsupervised learning? <- for seeing <- Don't do...
Huggingface zero shot leearning model?

Brainstorm types of documents -> Create classifiers, create classes seperately or group together use same model.
"""

class ConversationalAgent:
    def __init__(self, 
                 model: str = "llama3.2:latest", 
                 model_type: str = "LLM", 
                 document_category: str = "bank statement", 
                 context_messages: list[dict[str, str]] = []
                 ):
        self.document_category = document_category
        log_category(self.document_category)
        self.client = ollama.Client()
        self.model = model  # Try deepseekr-1 later.
        self.model_type = model_type
        self.messages = context_messages
        self.conversation_id = log_conversation(
            self.model, self.model_type, self.document_category)
        self.conversation_instances = 0

    def system_prompt(self, system_prompt: str) -> None:
        self.messages.append({"role": "system", "content": system_prompt})

    # TODO: return response for chatbot?
    def conversation(self, user_query: str, attachment: str = None) -> None:
        if attachment:
            user_query += f"\nAttachment: {attachment}"
        else:
            logging.info(f"No attachment provided.")

        self.messages.append({"role": "user", "content": user_query})

        # ChatGPT and Claude are never the same instances by the way. They basically operate as RAGs.
        # to give ST memory within a conversation, we have input previous messages.
        response = self.client.chat(model=self.model, messages=self.messages)

        self.messages.append({"role": "assistant", "content": response.message.content})

        log_conversation_messages(self.conversation_id, user_query, response.message.content)

        print(f"Agent: {response.message.content}\n")

        self.conversation_instances += 1
        logging.info(f"Conversation instances: {self.conversation_instances}")

    # When GUI, can do this for any message in conversation.
    def get_latest_response(self) -> list[dict[str, str]]:
        return self.messages[-1] # [-2:] || [(len(self.messages) - 2):] if you want to provide context of user query as well.
