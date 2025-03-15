from context_manager import get_db_connection
from tabulate import tabulate
import os

import logging
import psycopg2
import hashlib

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def init_database(db_name: str):
  conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT")
  )
  conn.autocommit=True # So CREATE DATABASE not in transaction block
  cur = conn.cursor()
  # Check if database already exists
  cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
  if cur.fetchone():
      print(f"Database {db_name} already exists")
      return

  cur = conn.cursor()
  cur.execute(f"CREATE DATABASE {db_name}")
  logging.info(f"Database {db_name} created successfully")

def drop_tables():
  """Drop all tables if they exist"""
  with get_db_connection() as conn:
      cur = conn.cursor()
      # drop tables in descending hierarchical order.
      cur.execute("""
          DROP TABLE IF EXISTS table_format_edge_cases;
          DROP TABLE IF EXISTS table_formats;
          DROP TABLE IF EXISTS documents;
          
          DROP TABLE IF EXISTS conversation_messages;
          DROP TABLE IF EXISTS conversations;
          DROP TABLE IF EXISTS models;
                  
          DROP TABLE IF EXISTS document_categories;
      """)
      conn.commit()
      logging.info("Tables dropped successfully")

def init_extensions():
  with get_db_connection() as conn:
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    conn.commit()
    logging.info("UUID extension created successfully")

def init_dataformats_tables():
  """Initialize tables if they don't exist"""
  with get_db_connection() as conn:
    cur = conn.cursor()
    cur.execute("""
      CREATE TABLE IF NOT EXISTS document_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      """)
    cur.execute("""
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        index BIGSERIAL,
        category VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        filetype VARCHAR(50) NOT NULL,
        byte_encoding BYTEA NOT NULL,
        sha256_hash VARCHAR(128) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category) REFERENCES document_categories(name)
      );
      """)
    cur.execute("""
      CREATE TABLE IF NOT EXISTS table_formats(
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        index BIGSERIAL,
        document_category VARCHAR(255) NOT NULL,
        column_name VARCHAR(255) NOT NULL,
        column_type VARCHAR(50) NOT NULL,
        default_value VARCHAR(255) NOT NULL,
        edge_case VARCHAR(255) NOT NULL,
        edge_case_response VARCHAR(255) NOT NULL,       
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_category) REFERENCES document_categories(name)
      );
      """)
    
    conn.commit()
    logging.info("Data Formats Tables created successfully")

def migrate_documents():
  """Migrate fs documents to database"""
  with get_db_connection() as conn:
    cur = conn.cursor()
    documents_dir = "./documents"
    
    # Create document category first
    for category_dir in os.listdir(documents_dir):
      cur.execute("""
        INSERT INTO document_categories (name)
        VALUES (%s)
        ON CONFLICT (name) DO NOTHING
      """, (category_dir,))
    
      for file in os.listdir(f"{documents_dir}/{category_dir}"):
        split = file.split(".")
        filename = "".join(split[:-1])
        filetype = split[-1]
        byte_encoding = open(f"{documents_dir}/{category_dir}/{file}", "rb").read()
        sha256_hash = hashlib.sha256(byte_encoding).hexdigest()
      
      cur.execute("""
        INSERT INTO documents (category, filename, filetype, byte_encoding, sha256_hash)
        VALUES (%s, %s, %s, %s, %s)
        """, (category_dir, filename, filetype, byte_encoding, sha256_hash))
    
    conn.commit()
    logging.info("Documents migrated successfully")

def show_documents_table():
   with get_db_connection() as conn:
        cur = conn.cursor()
        
        # Show documents table
        print("\n=== Documents Table ===")
        cur.execute("""
            SELECT id, index, filename, filetype, 
                   LEFT(sha256_hash, 8) as hash_preview, 
                   created_at 
            FROM documents 
            ORDER BY index
        """)
        columns = [desc[0] for desc in cur.description]
        results = cur.fetchall()
        print(tabulate(results, headers=columns, tablefmt='psql'))

def init_conversations_tables():
  with get_db_connection() as conn:
    cur = conn.cursor()
    # Using UUID PK gives freedom to change name and also allow multiple language versions under 1 id.
    cur.execute("""
        CREATE TABLE IF NOT EXISTS models (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL UNIQUE,
          type VARCHAR(255) NOT NULL        
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          index BIGSERIAL,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          model_id UUID NOT NULL,
          document_category VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (model_id) REFERENCES models(id),
          FOREIGN KEY (document_category) REFERENCES document_categories(name)
        );  
    """)
    # Lecturers might have gotten into my head (use composite keys?)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversation_messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          conversation_id UUID NOT NULL,
          relative_index INTEGER NOT NULL,
          query TEXT NOT NULL,
          response TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        );
    """)
    # relative_index function. COALESCE(not-null, default)
    cur.execute("""
        CREATE OR REPLACE FUNCTION set_relative_index()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.relative_index = (
                SELECT COALESCE(MAX(relative_index), 0) + 1
                FROM conversation_messages
                WHERE conversation_id = NEW.conversation_id
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    # Before so inserted value is adjusted properly
    cur.execute("""
        CREATE TRIGGER set_message_relative_index
        BEFORE INSERT ON conversation_messages
        FOR EACH ROW
        EXECUTE FUNCTION set_relative_index();
    """)
    conn.commit()
    logging.info("Conversations Tables created successfully")

def main():
  try:
    init_database("now")
    drop_tables()
    init_extensions()
    init_dataformats_tables()
    migrate_documents()
    init_conversations_tables()
  except psycopg2.Error as e:
    logging.error(f"DB ERROR: {e}")

if __name__ == "__main__":
  main()