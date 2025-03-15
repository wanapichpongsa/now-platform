import pdfplumber
import os
import time
import logging

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')


def get_pdf_pages(path: str) -> list:
    pages = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text())
    return pages

def run_agent(prompt: str = None, attachment: str = None, context_messages: list[any] = []) -> None:
    from agent import ConversationalAgent
    agent = ConversationalAgent(context_messages = context_messages)
    while True:
        if not prompt:
            user_input = input(
                "You (exit to exit, new agent to start new agent): ")
            if user_input == "exit":
                break # BUG: Need to key in exit twice. 
            elif user_input == "new agent":
                last_context: list[dict[str, str]] = agent.get_latest_response()
                if type(last_context) != list:
                    last_context = [last_context]
                logging.info(f"Creating new agent with context:\n{last_context}")
                run_agent(context_messages = last_context)
            else:
              agent.conversation(user_input, attachment)
        else:
            agent.conversation(prompt, attachment)
            prompt, attachment = None, None


def test():
    try:
        start_time = time.time()

        data_dir = "../database/documents/bank_statements"
        first_file = os.listdir(data_dir)[0]
        pages = get_pdf_pages(data_dir + "/" + first_file)
        prompt = "Output the first and last line of the invoice table in this bank statement document and explain why you chose them:"
        run_agent(prompt, pages[0])

    finally:
        end_time = time.time()
        logging.info(f"Time taken: {end_time - start_time} seconds")


def main():
    try:
        start_time = time.time()

        data_dir = "../database/documents/bank_statements"
        first_file = os.listdir(data_dir)[0]
        pages = get_pdf_pages(data_dir + "/" + first_file)
        print(pages) # First step: user filters content with 0 LLM to avoid hallucination.
    finally:
        end_time = time.time()
        logging.info(f"Time taken: {end_time - start_time} seconds")


if __name__ == "__main__":
    test()
