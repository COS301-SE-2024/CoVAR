from flask import Flask, request, jsonify
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv, find_dotenv
import jwt
import traceback
import os
import openai

app = Flask(__name__)

# Load the public key from the .pem file
with open('public.pem', 'r') as pem_file:
    public_key = pem_file.read()

def verify_jwt(token):
    try:
        # Decode the token using the public key
        decoded_token = jwt.decode(token, public_key, algorithms=["RS256"])
        return decoded_token
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/run_test', methods=['POST'])
def run_test():
    # Get the JWT from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({'error': 'Missing or invalid JWT'}), 401

    token = auth_header.split(" ")[1]
    decoded_token = verify_jwt(token)

    if not decoded_token:
        return jsonify({'error': 'Invalid or expired JWT'}), 401

    print("Running test")
    template = """Question {question}\nAnswer Let's think step by step."""
    prompt = ChatPromptTemplate.from_template(template)

    try:
        load_dotenv(find_dotenv())
        model_type = os.environ['MODEL_TYPE']
        
        if model_type == 'openai':
            openai.api_key = os.environ['API_KEY']
            model = ChatOpenAI()
        
        elif model_type == 'ollama':
            model = ChatOllama(model="llama3.1:8b", base_url="http://host.docker.internal:11434")
        
        elif model_type == 'gemini':
            if "GOOGLE_API_KEY" not in os.environ:
                os.environ["GOOGLE_API_KEY"]=os.environ['API_KEY']
            model = ChatGoogleGenerativeAI(model="gemini-pro")
        
        else:
            raise ValueError(f"Invalid model type: {model_type}")
        
        chain = prompt | model
        result = chain.invoke({"question": "What are CVE's and should issues be stored by that category in networks?"})
        print(f"Model invocation result: {result}")
        return jsonify({'result': result.content})
    
    except Exception as e:
        print(f"Error invoking model: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Error invoking model: {e}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)
